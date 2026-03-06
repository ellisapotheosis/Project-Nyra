#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.stack}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.yml}"
CHECK_MATRIX="${CHECK_MATRIX:-scripts/health-checks.csv}"

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
if [[ ! -f "$CHECK_MATRIX" ]]; then
  echo "[FAIL] check matrix not found: $CHECK_MATRIX"
  exit 1
fi

get_env_from_file() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 1
  local line
  line=$(awk -F= -v k="$key" '$1==k {print substr($0, index($0, "=")+1); exit}' "$file") || true
  [[ -n "$line" ]] || return 1
  line="${line%%#*}"
  line="${line%\"}"
  line="${line#\"}"
  line="${line%\'}"
  line="${line#\'}"
  printf "%s" "$line"
}

resolve_port() {
  local env_key="$1"
  local default_port="$2"
  local value=""

  if [[ -f "$ENV_FILE" ]]; then
    value="$(get_env_from_file "$env_key" "$ENV_FILE" || true)"
  fi

  if [[ -z "$value" ]]; then
    value="${!env_key:-}"
  fi

  if [[ -z "$value" ]]; then
    value="$default_port"
  fi

  printf "%s" "$value"
}

printf "%-20s %-8s %-50s\n" "SERVICE" "RESULT" "URL"
printf "%-20s %-8s %-50s\n" "-------" "------" "---"

if [[ -f "$ENV_FILE" ]]; then
  if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
    echo "[WARN] docker compose ps failed with env file ($ENV_FILE); continuing HTTP probes"
  fi
else
  echo "[WARN] env file not found: $ENV_FILE (probing using shell/default ports)"
  if ! docker compose -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
    echo "[WARN] docker compose ps failed without env file; continuing HTTP probes"
  fi
fi

failed=0
while IFS=, read -r service port_env default_port path; do
  [[ "$service" == "service" ]] && continue
  [[ -z "$service" ]] && continue
  port="$(resolve_port "$port_env" "$default_port")"
  url="http://localhost:${port}${path}"
  if curl -fsS --max-time 8 "$url" >/dev/null; then
    printf "%-20s %-8s %-50s\n" "$service" "PASS" "$url"
  else
    printf "%-20s %-8s %-50s\n" "$service" "FAIL" "$url"
    failed=1
  fi
done < "$CHECK_MATRIX"

exit "$failed"
