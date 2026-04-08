#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker is not installed or not in PATH"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[ERROR] docker compose plugin is required"
  exit 1
fi

if [[ ! -f .env.homeassistant-linkwarden ]]; then
  cp .env.homeassistant-linkwarden.example .env.homeassistant-linkwarden
  echo "[INFO] Created .env.homeassistant-linkwarden from example"
  echo "[ACTION] Edit .env.homeassistant-linkwarden before first run"
fi

if [[ ! -f .env.homeassistant-dashboard ]]; then
  cp .env.homeassistant-dashboard.example .env.homeassistant-dashboard
  echo "[INFO] Created .env.homeassistant-dashboard from example"
fi

# shellcheck disable=SC1091
source .env.homeassistant-linkwarden

if [[ -z "${HA_STACK_ROOT:-}" ]]; then
  echo "[ERROR] HA_STACK_ROOT is missing in .env.homeassistant-linkwarden"
  exit 1
fi

if [[ ! -d "${HA_STACK_ROOT}" ]]; then
  echo "[INFO] Creating Samsung T5 stack root: ${HA_STACK_ROOT}"
  mkdir -p "${HA_STACK_ROOT}"
fi

for d in \
  "${HA_STACK_ROOT}/live-data/postgres" \
  "${HA_STACK_ROOT}/live-data/meili_data" \
  "${HA_STACK_ROOT}/live-data/linkwarden_data" \
  "${HA_STACK_ROOT}/logs" \
  "${HA_STACK_ROOT}/synced/backups"; do
  mkdir -p "${d}"
done

touch "${HA_STACK_ROOT}/logs/starwarden.log"

cat <<'EONOTE'
[NOTE] Recommended SyncThing setup:
- Keep live databases out of sync to avoid corruption.
- Sync only: ${HA_STACK_ROOT}/synced
- Exclude: ${HA_STACK_ROOT}/live-data
EONOTE

echo "[INFO] Validating compose files..."
docker compose --env-file .env.homeassistant-linkwarden -f docker-compose.homeassistant-linkwarden.yml config >/dev/null
docker compose --env-file .env.homeassistant-dashboard -f docker-compose.homeassistant-dashboard.yml config >/dev/null

echo "[INFO] Starting Linkwarden + StarWarden stack"
docker compose --env-file .env.homeassistant-linkwarden -f docker-compose.homeassistant-linkwarden.yml up -d

echo "[INFO] Starting homepage dashboard"
docker compose --env-file .env.homeassistant-dashboard -f docker-compose.homeassistant-dashboard.yml up -d

echo "[SUCCESS] Bootstrap complete"
echo "- Linkwarden URL: ${NEXTAUTH_URL:-http://localhost:3010}"
echo "- Dashboard URL: http://$(hostname -I | awk '{print $1}'):${HOMEPAGE_PORT:-3007}"
echo "- Run health check: ${ROOT_DIR}/scripts/check-homeassistant-stack.sh"
