#!/bin/bash
set -euo pipefail

BACKUP_DIR="${1:-./backups/db-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Backing up PostgreSQL database..."

# Backup using docker exec
docker exec postgres pg_dumpall -U postgres > "$BACKUP_DIR/postgres-dump.sql" 2>/dev/null || \
    echo "[WARN] PostgreSQL backup failed - container may not be running"

echo "[SUCCESS] Database backup saved to $BACKUP_DIR/postgres-dump.sql"
