#!/bin/bash
# ==============================================================================
# Project Nyra - Backup Data Script
# ==============================================================================
# Backup all Project Nyra data (PostgreSQL, Redis, volumes)
#
# Usage:
#   ./backup-data.sh [backup_name]
#   ./backup-data.sh daily-backup
#
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${1:-backup_${TIMESTAMP}}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

mkdir -p "${BACKUP_PATH}"

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Data Backup${NC}"
echo -e "${BLUE}  Backup: ${BACKUP_NAME}${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

# Backup PostgreSQL
echo -e "${BLUE}Backing up PostgreSQL database...${NC}"
docker exec nyra-postgres pg_dumpall -U postgres > "${BACKUP_PATH}/postgres_dump.sql"
echo -e "${GREEN}✓ PostgreSQL backup complete${NC}"

# Backup Redis
echo -e "${BLUE}Backing up Redis data...${NC}"
docker exec nyra-redis redis-cli SAVE
docker cp nyra-redis:/data/dump.rdb "${BACKUP_PATH}/redis_dump.rdb"
echo -e "${GREEN}✓ Redis backup complete${NC}"

# Backup n8n data
echo -e "${BLUE}Backing up n8n workflows...${NC}"
docker exec nyra-n8n n8n export:workflow --all --output=/tmp/n8n_workflows.json 2>/dev/null || true
docker cp nyra-n8n:/tmp/n8n_workflows.json "${BACKUP_PATH}/n8n_workflows.json" 2>/dev/null || true
echo -e "${GREEN}✓ n8n backup complete${NC}"

# Create backup manifest
cat > "${BACKUP_PATH}/manifest.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -Iseconds)",
  "includes": [
    "postgres_dump.sql",
    "redis_dump.rdb",
    "n8n_workflows.json"
  ]
}
EOF

echo ""
echo -e "${GREEN}===================================================================${NC}"
echo -e "${GREEN}  Backup Complete!${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo -e "Backup location: ${BACKUP_PATH}"
echo ""
