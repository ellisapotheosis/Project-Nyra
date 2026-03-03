#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-infra/.env.example}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.yml}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[FAIL] docker command not found"
  exit 1
fi

checks=(
  "nexus-router|${NEXUS_ROUTER_PORT:-7000}|/health"
  "litellm|${LITELLM_PORT:-4000}|/health"
  "n8n|${N8N_PORT:-5678}|/"
  "activepieces|${ACTIVEPIECES_PORT:-8082}|/"
  "twentycrm|${TWENTYCRM_PORT:-3000}|/"
  "archon-os|${ARCHON_OS_PORT:-9001}|/"
  "openwebui|${OPENWEBUI_PORT:-8088}|/"
  "grafana|${GRAFANA_PORT:-3003}|/api/health"
  "prometheus|${PROMETHEUS_PORT:-9090}|/-/healthy"
)

printf "%-20s %-8s %-50s\n" "SERVICE" "RESULT" "URL"
printf "%-20s %-8s %-50s\n" "-------" "------" "---"

failed=0

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps >/dev/null || {
  echo "[FAIL] docker compose ps failed"
  exit 1
}

for row in "${checks[@]}"; do
  service="${row%%|*}"
  rest="${row#*|}"
  port="${rest%%|*}"
  path="${rest#*|}"
  url="http://localhost:${port}${path}"
  if curl -fsS --max-time 8 "$url" >/dev/null; then
    printf "%-20s %-8s %-50s\n" "$service" "PASS" "$url"
  else
    printf "%-20s %-8s %-50s\n" "$service" "FAIL" "$url"
    failed=1
  fi
done

exit "$failed"
