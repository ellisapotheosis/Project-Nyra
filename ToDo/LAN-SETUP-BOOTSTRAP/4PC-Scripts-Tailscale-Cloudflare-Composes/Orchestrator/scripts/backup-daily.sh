#!/bin/bash
# Project Nyra - Daily Backup Script
# Automated backup of all critical data and configurations

set -e

BACKUP_DIR="${1:-./backups}"
COMPRESS_BACKUPS=true
RETENTION_DAYS=7
INCLUDE_DOCKER_VOLUMES=true

timestamp=$(date +%Y%m%d-%H%M%S)
date_folder=$(date +%Y%m%d)
backup_path="$BACKUP_DIR/$date_folder"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=================================="
echo "  Project Nyra Daily Backup"
echo "  Timestamp: $timestamp"
echo -e "==================================${NC}"
echo ""

# Create backup directory
mkdir -p "$backup_path"
echo -e "${GREEN}Created backup directory: $backup_path${NC}"

log() {
    local level="$1"
    local message="$2"
    local ts=$(date +%H:%M:%S)
    local color="${NC}"

    case "$level" in
        ERROR) color="${RED}" ;;
        SUCCESS) color="${GREEN}" ;;
        WARNING) color="${YELLOW}" ;;
        INFO) color="${NC}" ;;
    esac

    echo -e "${color}[$ts] $message${NC}"
}

# 1. Backup PostgreSQL Databases
log "INFO" "Backing up PostgreSQL databases..."

declare -A databases=(
    [postgres-twentycrm]="twentycrm"
    [postgres-n8n]="n8n"
    [postgres-dify]="dify"
)

for container in "${!databases[@]}"; do
    db="${databases[$container]}"
    dump_file="$backup_path/$container-$timestamp.sql"

    log "INFO" "  Dumping $db..."
    if docker exec "$container" pg_dump -U "$db" "$db" > "$dump_file"; then
        size=$(du -h "$dump_file" | cut -f1)
        log "SUCCESS" "  ✓ $db backed up ($size)"
    else
        log "ERROR" "  ✗ Failed to backup $db"
    fi
done

# 2. Backup Redis Data
log "INFO" "Backing up Redis data..."

for container in redis-orchestrator redis-worker; do
    rdb_file="$backup_path/$container-$timestamp.rdb"

    if docker exec "$container" redis-cli SAVE && \
       docker cp "$container:/data/dump.rdb" "$rdb_file"; then
        log "SUCCESS" "  ✓ $container backed up"
    else
        log "WARNING" "  ✗ Failed to backup $container"
    fi
done

# 3. Backup AgentDB
log "INFO" "Backing up AgentDB..."

agentdb_backup="$backup_path/agentdb-$timestamp.tar.gz"
if docker exec agentdb tar czf /tmp/backup.tar.gz /app/data && \
   docker cp agentdb:/tmp/backup.tar.gz "$agentdb_backup"; then
    log "SUCCESS" "  ✓ AgentDB backed up"
else
    log "WARNING" "  ✗ Failed to backup AgentDB"
fi

# 4. Backup Environment Configuration
log "INFO" "Backing up environment configuration..."

config_backup="$backup_path/config-$timestamp"
mkdir -p "$config_backup"

config_files=(
    ".env"
    "master-.env.example"
    ".mcp.json"
    ".claude/settings.json"
    "infra/docker-compose.orchestrator.yml"
    "infra/docker-compose.worker.yml"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$config_backup/"
        log "SUCCESS" "  ✓ Backed up $file"
    fi
done

# 5. Backup n8n Workflows
log "INFO" "Backing up n8n workflows..."

n8n_backup="$backup_path/n8n-workflows-$timestamp.json"
if docker exec n8n n8n export:workflow --all --output=/tmp/workflows.json && \
   docker cp n8n:/tmp/workflows.json "$n8n_backup"; then
    log "SUCCESS" "  ✓ n8n workflows backed up"
else
    log "WARNING" "  ✗ Failed to backup n8n workflows"
fi

# 6. Backup Docker Volumes
if [ "$INCLUDE_DOCKER_VOLUMES" = true ]; then
    log "INFO" "Backing up Docker volumes..."

    volumes=(
        "letta-data"
        "mem0-data"
        "ollama-data"
        "neo4j-data"
        "grafana-data"
        "prometheus-data"
    )

    for volume in "${volumes[@]}"; do
        volume_backup="$backup_path/$volume-$timestamp.tar.gz"

        if docker run --rm -v "$volume:/data" -v "$backup_path:/backup" alpine \
           tar czf "/backup/$(basename "$volume_backup")" /data; then
            log "SUCCESS" "  ✓ Backed up volume: $volume"
        else
            log "WARNING" "  ✗ Failed to backup volume $volume"
        fi
    done
fi

# 7. Compress Backups
if [ "$COMPRESS_BACKUPS" = true ]; then
    log "INFO" "Compressing backup archive..."

    archive_name="nyra-backup-$timestamp.tar.gz"
    archive_path="$BACKUP_DIR/$archive_name"

    if tar czf "$archive_path" -C "$BACKUP_DIR" "$date_folder"; then
        archive_size=$(du -h "$archive_path" | cut -f1)
        log "SUCCESS" "  ✓ Backup compressed: $archive_name ($archive_size)"

        # Remove uncompressed backup
        rm -rf "$backup_path"
        log "SUCCESS" "  ✓ Cleaned up uncompressed backup"
    else
        log "ERROR" "  ✗ Failed to compress backup"
    fi
fi

# 8. Cleanup Old Backups
log "INFO" "Cleaning up old backups (retention: $RETENTION_DAYS days)..."

find "$BACKUP_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -exec rm -f {} \; 2>/dev/null || true

log "SUCCESS" "  ✓ Old backups cleaned up"

# 9. Summary
echo ""
echo -e "${CYAN}=================================="
echo "  Backup Complete!"
echo -e "==================================${NC}"
echo ""

if [ "$COMPRESS_BACKUPS" = true ]; then
    echo -e "${GREEN}Backup Archive: $archive_path${NC}"
    total_size=$(du -h "$archive_path" | cut -f1)
else
    echo -e "${GREEN}Backup Directory: $backup_path${NC}"
    total_size=$(du -sh "$backup_path" | cut -f1)
fi

echo "Total Backup Size: $total_size"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Store backup in remote location (cloud storage, NAS)"
echo "  2. Test restore procedure regularly"
echo "  3. Verify backup integrity"
echo ""
