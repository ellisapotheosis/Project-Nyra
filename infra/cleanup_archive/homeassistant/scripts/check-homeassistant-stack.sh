#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.homeassistant"

cd "${ROOT_DIR}"

echo "== Compose status: Linkwarden stack =="
docker compose --env-file "${ENV_FILE}" -f docker-compose.homeassistant-linkwarden.yml ps

echo
echo "== Compose status: Dashboard =="
docker compose --env-file "${ENV_FILE}" -f docker-compose.homeassistant-dashboard.yml ps

echo
echo "== Container health summary =="
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | rg 'linkwarden|starwarden|nyra-home-dashboard|postgres|meilisearch' || true
