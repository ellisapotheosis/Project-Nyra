#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${1:-infra/docker-compose.yml}"
PROFILE_CSV="${2:-}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "[stack-doctor] compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

declare -a profile_args=()
if [[ -n "$PROFILE_CSV" ]]; then
  IFS=',' read -r -a profiles <<<"$PROFILE_CSV"
  for profile in "${profiles[@]}"; do
    trimmed="$(echo "$profile" | xargs)"
    [[ -n "$trimmed" ]] && profile_args+=(--profile "$trimmed")
  done
fi

compose_cmd=(docker compose -f "$COMPOSE_FILE")

if (( ${#profile_args[@]} > 0 )); then
  echo "[stack-doctor] compose file: $COMPOSE_FILE"
  echo "[stack-doctor] profiles: $PROFILE_CSV"
else
  echo "[stack-doctor] compose file: $COMPOSE_FILE"
  echo "[stack-doctor] profiles: (none specified; checking all services)"
fi

echo "\n== compose config check =="
"${compose_cmd[@]}" "${profile_args[@]}" config >/dev/null

echo "\n== compose ps =="
"${compose_cmd[@]}" "${profile_args[@]}" ps || true

echo "\n== docker info =="
docker info --format 'ServerVersion={{.ServerVersion}} StorageDriver={{.Driver}} CgroupVersion={{.CgroupVersion}}' || true

echo "\n== docker system df =="
docker system df || true

echo "\n== recent health states =="
if command -v jq >/dev/null 2>&1; then
  docker ps --format '{{.Names}}' | while read -r name; do
    [[ -z "$name" ]] && continue
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$name" 2>/dev/null || echo unknown)"
    status="$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null || echo unknown)"
    echo "$name status=$status health=$health"
  done | sort
else
  echo "jq not installed; skipping JSON-based health summary"
  docker ps --format 'table {{.Names}}\t{{.Status}}'
fi
