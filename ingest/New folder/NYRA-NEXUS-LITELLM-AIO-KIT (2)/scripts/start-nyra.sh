#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${1:-docker-compose.nyra.yml}"

shift || true
PROFILES=("$@")

if [ "${#PROFILES[@]}" -eq 0 ]; then
  PROFILES=("core" "graph-neo4j")
fi

args=()
for p in "${PROFILES[@]}"; do
  args+=(--profile "$p")
done

echo "Starting NYRA stack: ${COMPOSE_FILE}"
echo "Profiles: ${PROFILES[*]}"

docker compose -f "${COMPOSE_FILE}" "${args[@]}" up -d
docker compose -f "${COMPOSE_FILE}" ps
