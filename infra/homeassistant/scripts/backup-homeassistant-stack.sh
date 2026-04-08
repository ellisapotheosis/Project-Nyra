#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

cd "${ROOT_DIR}"

# shellcheck disable=SC1091
source .env.homeassistant-linkwarden

BACKUP_DIR="${HA_STACK_ROOT}/synced/backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"

echo "[INFO] Creating postgres dump..."
docker compose --env-file .env.homeassistant-linkwarden -f docker-compose.homeassistant-linkwarden.yml exec -T linkwarden-postgres \
  pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-postgres}" > "${BACKUP_DIR}/linkwarden-postgres.sql"

echo "[INFO] Archiving Linkwarden data dir..."
tar -C "${HA_STACK_ROOT}/live-data" -czf "${BACKUP_DIR}/linkwarden_data.tar.gz" linkwarden_data

echo "[SUCCESS] Backup completed: ${BACKUP_DIR}"
