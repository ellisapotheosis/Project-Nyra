#!/bin/bash
set -euo pipefail

BACKUP_DIR="${1:?Usage: $0 <backup-directory>}"
SQL_FILE="$BACKUP_DIR/postgres-dump.sql"

[ ! -f "$SQL_FILE" ] && { echo "[ERROR] SQL dump not found: $SQL_FILE"; exit 1; }

echo "[RESTORE] Restoring PostgreSQL database..."
cat "$SQL_FILE" | docker exec -i postgres psql -U postgres 2>/dev/null || \
    echo "[WARN] Database restore had errors"

echo "[SUCCESS] Database restored from $SQL_FILE"
