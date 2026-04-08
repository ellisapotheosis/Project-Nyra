#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.homeassistant"
ENV_TEMPLATE="${ROOT_DIR}/.env.homeassistant.example"
COMPOSE_LINKWARDEN="${ROOT_DIR}/docker-compose.homeassistant-linkwarden.yml"
COMPOSE_DASHBOARD="${ROOT_DIR}/docker-compose.homeassistant-dashboard.yml"

cd "${ROOT_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker is not installed or not in PATH"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[ERROR] docker compose plugin is required"
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${ENV_TEMPLATE}" "${ENV_FILE}"
  echo "[INFO] Created ${ENV_FILE} from template"
fi

# shellcheck disable=SC1090
source "${ENV_FILE}"

generate_secret_if_placeholder() {
  local key="$1"
  local current
  current="$(grep -E "^${key}=" "${ENV_FILE}" | cut -d'=' -f2- || true)"
  if [[ -z "${current}" || "${current}" == REPLACE_ME_* ]]; then
    if command -v openssl >/dev/null 2>&1; then
      local generated
      generated="$(openssl rand -hex 32)"
      sed -i "s|^${key}=.*|${key}=${generated}|" "${ENV_FILE}"
      echo "[INFO] Auto-generated ${key} in ${ENV_FILE}"
    else
      echo "[WARN] ${key} still uses placeholder and openssl is unavailable"
    fi
  fi
}

generate_secret_if_placeholder "NEXTAUTH_SECRET"
generate_secret_if_placeholder "POSTGRES_PASSWORD"
generate_secret_if_placeholder "MEILI_MASTER_KEY"

# reload env values after possible mutation
# shellcheck disable=SC1090
source "${ENV_FILE}"

if [[ -z "${HA_STACK_ROOT:-}" ]]; then
  echo "[ERROR] HA_STACK_ROOT is missing in ${ENV_FILE}"
  exit 1
fi

for d in \
  "${HA_STACK_ROOT}" \
  "${HA_STACK_ROOT}/live-data/postgres" \
  "${HA_STACK_ROOT}/live-data/meili_data" \
  "${HA_STACK_ROOT}/live-data/linkwarden_data" \
  "${HA_STACK_ROOT}/logs" \
  "${HA_STACK_ROOT}/synced/backups"; do
  mkdir -p "${d}"
done

touch "${HA_STACK_ROOT}/logs/starwarden.log"

echo "[NOTE] Recommended SyncThing setup:"
echo "- Keep live databases out of sync to avoid corruption."
echo "- Sync only: ${HA_STACK_ROOT}/synced"
echo "- Exclude: ${HA_STACK_ROOT}/live-data"

echo "[INFO] Validating compose files..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_LINKWARDEN}" config >/dev/null
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_DASHBOARD}" config >/dev/null

echo "[INFO] Starting Linkwarden base services (postgres + meilisearch + linkwarden)"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_LINKWARDEN}" up -d linkwarden-postgres linkwarden-meilisearch linkwarden

echo "[INFO] Starting homepage dashboard"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_DASHBOARD}" up -d

if [[ -n "${GITHUB_TOKEN:-}" && "${GITHUB_TOKEN}" != REPLACE_ME_* && -n "${LINKWARDEN_TOKEN:-}" && "${LINKWARDEN_TOKEN}" != REPLACE_ME_* ]]; then
  echo "[INFO] Starting StarWarden"
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_LINKWARDEN}" up -d starwarden
else
  echo "[WARN] StarWarden not started yet. Set GITHUB_TOKEN + LINKWARDEN_TOKEN in ${ENV_FILE}, then run:"
  echo "       docker compose --env-file ${ENV_FILE} -f ${COMPOSE_LINKWARDEN} up -d starwarden"
fi

echo "[SUCCESS] Bootstrap complete"
echo "- Linkwarden URL: ${NEXTAUTH_URL:-http://localhost:3010}"
echo "- Dashboard URL: http://$(hostname -I | awk '{print $1}'):${HOMEPAGE_PORT:-3007}"
echo "- Run health check: ${ROOT_DIR}/scripts/check-homeassistant-stack.sh"
