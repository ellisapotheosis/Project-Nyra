#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.homeassistant"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

cd "${ROOT_DIR}"

# shellcheck disable=SC1090
source "${ENV_FILE}"

BACKUP_DIR="${HA_STACK_ROOT}/synced/backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"

echo "[INFO] Creating postgres dump..."
docker compose --env-file "${ENV_FILE}" -f docker-compose.homeassistant-linkwarden.yml exec -T linkwarden-postgres \
  pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-postgres}" > "${BACKUP_DIR}/linkwarden-postgres.sql"

echo "[INFO] Archiving Linkwarden data dir..."
tar -C "${HA_STACK_ROOT}/live-data" -czf "${BACKUP_DIR}/linkwarden_data.tar.gz" linkwarden_data

echo "[SUCCESS] Backup completed: ${BACKUP_DIR}"
