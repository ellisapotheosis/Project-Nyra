#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/infra/compose/distributed/nyra-distributed-compose.yml"

resolve_role_path() {
  case "$1" in
    orchestrator) printf '/hosts/orchestrator\n' ;;
    oracle) printf '/hosts/oracle-vps\n' ;;
    worker) printf '/hosts/%s\n' "${NYRA_NODE_ROLE:-worker-rtx5090}" ;;
    homeassistant) printf '/hosts/homeassistant\n' ;;
    *)
      echo "unsupported role: $1" >&2
      return 1
      ;;
  esac
}

ROLE="${1:-orchestrator}"
ROLE="${ROLE#--role=}"

case "$ROLE" in
  orchestrator|oracle|worker|homeassistant) ;;
  *)
    echo "Usage: $0 [orchestrator|oracle|worker|homeassistant]" >&2
    exit 1
    ;;
esac

if ! command -v infisical >/dev/null 2>&1; then
  echo "infisical CLI not found; run scripts/setup/infisical-setup.sh first." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

: "${INFISICAL_TOKEN:?set INFISICAL_TOKEN}"
: "${INFISICAL_PROJECT_ID:?set INFISICAL_PROJECT_ID}"

export INFISICAL_ENV="${INFISICAL_ENV:-prod}"
export INFISICAL_PATH="${INFISICAL_PATH:-/shared}"

if [[ "$ROLE" == "worker" ]]; then
  export NYRA_NODE_ROLE="${NYRA_NODE_ROLE:-worker-rtx5090}"
fi

ROLE_INFISICAL_PATH="$(resolve_role_path "$ROLE")"
TMP_ENV_FILE="$(mktemp)"
cleanup() {
  rm -f "$TMP_ENV_FILE"
}
trap cleanup EXIT

echo "Exporting shared secrets from '$INFISICAL_PATH' and role secrets from '$ROLE_INFISICAL_PATH'"
infisical export \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --path="$INFISICAL_PATH" \
  --format=dotenv > "$TMP_ENV_FILE"
printf '\n' >> "$TMP_ENV_FILE"
infisical export \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --path="$ROLE_INFISICAL_PATH" \
  --format=dotenv >> "$TMP_ENV_FILE"

echo "Starting role '$ROLE' with Infisical injection using compose: $COMPOSE_FILE"
docker compose --env-file "$TMP_ENV_FILE" -f "$COMPOSE_FILE" --profile "$ROLE" up -d

echo "Validating role '$ROLE' containers"
docker compose --env-file "$TMP_ENV_FILE" -f "$COMPOSE_FILE" --profile "$ROLE" ps
