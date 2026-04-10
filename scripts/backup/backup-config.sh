#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${1:-./backups/config-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Backing up configuration files..."

# Copy configuration files
[ -f "$PROJECT_ROOT/.env" ] && cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/.env.backup"
[ -f "$PROJECT_ROOT/.env.local" ] && cp "$PROJECT_ROOT/.env.local" "$BACKUP_DIR/.env.local.backup"

# Copy docker-compose files
cp -r "$PROJECT_ROOT/infra"/*.yml "$BACKUP_DIR/" 2>/dev/null || true

# Copy package.json files
find "$PROJECT_ROOT" -name "package.json" -not -path "*/node_modules/*" -exec cp --parents {} "$BACKUP_DIR/" \; 2>/dev/null || true

# Copy Claude Flow config
[ -f "$PROJECT_ROOT/archon-os.config.json" ] && cp "$PROJECT_ROOT/archon-os.config.json" "$BACKUP_DIR/"

echo "[SUCCESS] Configuration backed up to $BACKUP_DIR"
