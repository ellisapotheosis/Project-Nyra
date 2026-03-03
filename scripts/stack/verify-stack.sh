#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.stack}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.yml}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[verify-stack] missing env file: $ENV_FILE" >&2
  exit 1
fi

services=(
  "nexus-router:${NEXUS_ROUTER_PORT:-7000}:/health"
  "litellm:${LITELLM_PORT:-4000}:/health"
  "n8n:${N8N_PORT:-5678}:/"
  "activepieces:${ACTIVEPIECES_PORT:-8082}:/"
  "twentycrm:${TWENTYCRM_PORT:-3000}:/"
  "openwebui:${OPENWEBUI_PORT:-8088}:/"
  "grafana:${GRAFANA_PORT:-3003}:/api/health"
)

failed=0

echo "[verify-stack] docker compose ps"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps || failed=1

for check in "${services[@]}"; do
  name="${check%%:*}"
  rest="${check#*:}"
  port="${rest%%:*}"
  path="${rest#*:}"
  url="http://localhost:${port}${path}"
  if curl -fsS --max-time 8 "$url" >/dev/null; then
    echo "[verify-stack] PASS $name -> $url"
  else
    echo "[verify-stack] FAIL $name -> $url" >&2
    failed=1
  fi
done

if [[ "$failed" -ne 0 ]]; then
  echo "[verify-stack] one or more checks failed" >&2
  exit 1
fi

echo "[verify-stack] all checks passed"
