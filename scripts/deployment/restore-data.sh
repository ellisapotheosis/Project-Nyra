#!/bin/bash
# ==============================================================================
# Project Nyra - Restore Data Script
# ==============================================================================
# Restore Project Nyra data from backup
#
# Usage:
#   ./restore-data.sh <backup_name>
#   ./restore-data.sh backup_20240115_120000
#
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="./backups"

if [ $# -eq 0 ]; then
    echo -e "${RED}ERROR: Backup name required${NC}"
    echo "Usage: $0 <backup_name>"
    echo ""
    echo "Available backups:"
    ls -1 "${BACKUP_DIR}" 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

if [ ! -d "${BACKUP_PATH}" ]; then
    echo -e "${RED}ERROR: Backup not found: ${BACKUP_PATH}${NC}"
    exit 1
fi

echo -e "${YELLOW}WARNING: This will overwrite existing data!${NC}"
read -p "Continue with restore? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Data Restore${NC}"
echo -e "${BLUE}  Backup: ${BACKUP_NAME}${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

# Restore PostgreSQL
if [ -f "${BACKUP_PATH}/postgres_dump.sql" ]; then
    echo -e "${BLUE}Restoring PostgreSQL database...${NC}"
    cat "${BACKUP_PATH}/postgres_dump.sql" | docker exec -i nyra-postgres psql -U postgres
    echo -e "${GREEN}✓ PostgreSQL restore complete${NC}"
fi

# Restore Redis
if [ -f "${BACKUP_PATH}/redis_dump.rdb" ]; then
    echo -e "${BLUE}Restoring Redis data...${NC}"
    docker exec nyra-redis redis-cli FLUSHALL
    docker cp "${BACKUP_PATH}/redis_dump.rdb" nyra-redis:/data/dump.rdb
    docker restart nyra-redis
    sleep 5
    echo -e "${GREEN}✓ Redis restore complete${NC}"
fi

# Restore n8n
if [ -f "${BACKUP_PATH}/n8n_workflows.json" ]; then
    echo -e "${BLUE}Restoring n8n workflows...${NC}"
    docker cp "${BACKUP_PATH}/n8n_workflows.json" nyra-n8n:/tmp/n8n_workflows.json
    docker exec nyra-n8n n8n import:workflow --input=/tmp/n8n_workflows.json 2>/dev/null || true
    echo -e "${GREEN}✓ n8n restore complete${NC}"
fi

echo ""
echo -e "${GREEN}===================================================================${NC}"
echo -e "${GREEN}  Restore Complete!${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo ""
