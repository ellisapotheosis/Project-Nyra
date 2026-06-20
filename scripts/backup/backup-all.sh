#!/bin/bash

###############################################################################
# Project Nyra - Complete Backup
# Backs up database, volumes, and configuration
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$PROJECT_ROOT/backups/full-backup-$TIMESTAMP"

GREEN='\033[0;32m'
BLUE='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[BACKUP]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

mkdir -p "$BACKUP_DIR"

log "Starting complete backup to $BACKUP_DIR"

# Database backup
log "Backing up database..."
bash "$SCRIPT_DIR/backup-database.sh" "$BACKUP_DIR" || true

# Docker volumes backup
log "Backing up Docker volumes..."
bash "$SCRIPT_DIR/backup-volumes.sh" "$BACKUP_DIR" || true

# Configuration backup
log "Backing up configuration..."
bash "$SCRIPT_DIR/backup-config.sh" "$BACKUP_DIR" || true

# Create backup manifest
cat > "$BACKUP_DIR/MANIFEST.txt" << MANIFEST
Project Nyra Backup
Timestamp: $TIMESTAMP
Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')
Git Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')

Contents:
- Database backup (PostgreSQL)
- Docker volumes
- Configuration files (.env, docker-compose files)
- Claude Flow memory database

Restore Command:
  bash scripts/backup/restore-all.sh "$BACKUP_DIR"
MANIFEST

# Compress backup
log "Compressing backup..."
cd "$PROJECT_ROOT/backups"
tar -czf "full-backup-$TIMESTAMP.tar.gz" "full-backup-$TIMESTAMP" 2>/dev/null || true

success "Backup completed: $BACKUP_DIR"
log "Compressed: full-backup-$TIMESTAMP.tar.gz"
