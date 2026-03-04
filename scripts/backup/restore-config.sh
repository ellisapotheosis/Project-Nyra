#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${1:?Usage: $0 <backup-directory>}"

echo "[RESTORE] Restoring configuration files..."

# Restore environment files
[ -f "$BACKUP_DIR/.env.backup" ] && cp "$BACKUP_DIR/.env.backup" "$PROJECT_ROOT/.env"
[ -f "$BACKUP_DIR/.env.local.backup" ] && cp "$BACKUP_DIR/.env.local.backup" "$PROJECT_ROOT/.env.local"

# Restore docker-compose files
cp "$BACKUP_DIR"/*.yml "$PROJECT_ROOT/infra/" 2>/dev/null || true

# Restore Claude Flow config
[ -f "$BACKUP_DIR/claude-flow.config.json" ] && cp "$BACKUP_DIR/claude-flow.config.json" "$PROJECT_ROOT/"

echo "[SUCCESS] Configuration restored from $BACKUP_DIR"
