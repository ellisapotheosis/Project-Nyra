#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/infra/env/nyra.env}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/infra/data/backups}"
mkdir -p "$BACKUP_DIR"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

: "${RESTIC_REPOSITORY:?set RESTIC_REPOSITORY}"
: "${RESTIC_PASSWORD:?set RESTIC_PASSWORD}"

STAMP="$(date +%Y%m%d-%H%M%S)"
DUMP_PATH="$BACKUP_DIR/postgres-$STAMP.sql.gz"

docker compose -f "$ROOT_DIR/infra/compose/nyra.compose.yaml" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-nyra}" "${POSTGRES_DB:-nyra}" | gzip > "$DUMP_PATH"

restic backup \
  "$DUMP_PATH" \
  "$ROOT_DIR/infra/data/openclaw/config" \
  "$ROOT_DIR/infra/data/openclaw/workspace"

restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
echo "Backup complete: $DUMP_PATH"
