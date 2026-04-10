#!/bin/bash

###############################################################################
# Project Nyra - Complete Restore
# Restores database, volumes, and configuration from backup
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${1:?Usage: $0 <backup-directory>}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[RESTORE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

[ ! -d "$BACKUP_DIR" ] && error "Backup directory not found: $BACKUP_DIR"

log "Starting restore from $BACKUP_DIR"

# Confirm restore operation
warn "This will restore from backup and may overwrite current data!"
read -p "Continue? (yes/no): " confirm
[[ "$confirm" != "yes" ]] && { log "Restore cancelled"; exit 0; }

# Stop services
log "Stopping services..."
npm run stop:all 2>/dev/null || true

# Restore configuration
log "Restoring configuration..."
bash "$SCRIPT_DIR/restore-config.sh" "$BACKUP_DIR" || warn "Config restore had warnings"

# Restore database
log "Restoring database..."
bash "$SCRIPT_DIR/restore-database.sh" "$BACKUP_DIR" || warn "Database restore had warnings"

# Restore volumes
log "Restoring Docker volumes..."
bash "$SCRIPT_DIR/restore-volumes.sh" "$BACKUP_DIR" || warn "Volume restore had warnings"

# Restore Claude Flow memory
if [ -f "$BACKUP_DIR/memory-backup.json" ]; then
    log "Restoring Claude Flow memory..."
    npx @archon-os/cli@latest memory import --input "$BACKUP_DIR/memory-backup.json" 2>/dev/null || warn "Memory restore failed"
fi

# Restart services
log "Restarting services..."
npm run start:all || warn "Some services failed to start"

success "Restore completed from $BACKUP_DIR"
log "Run 'npm run health:check' to verify system health"
