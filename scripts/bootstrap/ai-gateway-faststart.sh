#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
COMPOSE="$ROOT/infra/hosts/orchestrator/docker-compose.ai-gateway-faststart.yml"
SECRETS="${NYRA_AI_GATEWAY_ENV:-/etc/projectnyra/secrets/ai-gateway.env}"
PROFILE_ARGS=()

usage() {
  cat <<'EOF'
Usage: ai-gateway-faststart.sh [--with-omniroute] [--with-mesh]
Starts the additive LiteLLM fast-start stack without replacing the current
Oracle-VPS gateway. Requires /etc/projectnyra/secrets/ai-gateway.env.
EOF
}

while (($#)); do
  case "$1" in
    --with-omniroute) PROFILE_ARGS+=(--profile omniroute);;
    --with-mesh) PROFILE_ARGS+=(--profile mesh);;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option: $1" >&2; usage; exit 2;;
  esac
  shift
done

[[ -f "$SECRETS" ]] || { echo "Missing $SECRETS. Copy ai-gateway.env.example and populate it from Infisical." >&2; exit 1; }
[[ "$(stat -c '%a' "$SECRETS")" =~ ^(600|400)$ ]] || echo "WARNING: set $SECRETS to mode 0600" >&2

bash "$ROOT/scripts/infra/assert-compose-source-of-truth.sh"
docker network inspect "${NYRA_DOCKER_NETWORK:-nyra-network_nyra-network}" >/dev/null 2>&1 || {
  echo "Required shared Docker network is missing. Start the base orchestrator stack first." >&2
  exit 1
}

docker compose --env-file "$SECRETS" -f "$COMPOSE" "${PROFILE_ARGS[@]}" config >/dev/null
docker compose --env-file "$SECRETS" -f "$COMPOSE" "${PROFILE_ARGS[@]}" up -d

for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:${LITELLM_PORT:-4000}/health >/dev/null; then
    echo "LiteLLM is healthy: http://127.0.0.1:${LITELLM_PORT:-4000}"
    echo "Next: bash scripts/litellm/bootstrap-faststart-access.sh"
    exit 0
  fi
  sleep 3
done

docker compose --env-file "$SECRETS" -f "$COMPOSE" logs --tail=200 litellm ai-gateway-db >&2
exit 1
