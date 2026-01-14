#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Gitea Restore Script${NC}"
echo -e "${GREEN}================================${NC}"

# Check for backup name argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup name required${NC}"
    echo -e "Usage: $0 <backup-name>"
    echo -e ""
    echo -e "Available backups:"
    ls -1 backup/gitea-backup-*.zip 2>/dev/null | sed 's/backup\///' | sed 's/\.zip//' || echo "No backups found"
    exit 1
fi

BACKUP_NAME=$1
BACKUP_DIR="./backup"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Check if backup exists
if [ ! -f "${BACKUP_PATH}.zip" ]; then
    echo -e "${RED}Error: Backup not found: ${BACKUP_PATH}.zip${NC}"
    exit 1
fi

# Verify checksums if available
if [ -f "${BACKUP_PATH}-checksums.txt" ]; then
    echo -e "${YELLOW}Verifying backup integrity...${NC}"
    cd "$BACKUP_DIR"
    if sha256sum -c "${BACKUP_NAME}-checksums.txt" 2>&1 | grep -q "FAILED"; then
        echo -e "${RED}Error: Backup integrity check failed${NC}"
        exit 1
    fi
    cd - > /dev/null
    echo -e "${GREEN}Backup integrity verified${NC}"
fi

# Warning
echo -e "${RED}WARNING: This will replace all current Gitea data!${NC}"
echo -e "Backup to restore: ${BACKUP_NAME}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Stop services
echo -e "${YELLOW}Stopping Gitea services...${NC}"
docker-compose down

# 1. Restore configuration files
if [ -f "${BACKUP_PATH}-config.tar.gz" ]; then
    echo -e "${YELLOW}Restoring configuration files...${NC}"
    tar -xzf "${BACKUP_PATH}-config.tar.gz"
    echo -e "${GREEN}Configuration restored${NC}"
fi

# 2. Clear existing data
echo -e "${YELLOW}Clearing existing data...${NC}"
sudo rm -rf data/* postgres/*

# 3. Start PostgreSQL only
echo -e "${YELLOW}Starting PostgreSQL...${NC}"
docker-compose up -d postgres
sleep 10

# 4. Restore PostgreSQL database
if [ -f "${BACKUP_PATH}-postgres.sql" ]; then
    echo -e "${YELLOW}Restoring PostgreSQL database...${NC}"
    docker exec -i gitea-postgres psql -U ${POSTGRES_USER:-gitea} -d ${POSTGRES_DB:-gitea} < "${BACKUP_PATH}-postgres.sql"
    echo -e "${GREEN}Database restored${NC}"
fi

# 5. Start all services
echo -e "${YELLOW}Starting all services...${NC}"
docker-compose up -d
sleep 10

# 6. Restore Gitea dump
echo -e "${YELLOW}Restoring Gitea data...${NC}"
docker cp "${BACKUP_PATH}.zip" gitea:/tmp/gitea-backup.zip
docker exec gitea sh -c "cd /tmp && unzip -o gitea-backup.zip && gitea restore-repo -c /data/gitea/conf/app.ini --repo-dir ./gitea-repo && rm -rf ./gitea-repo gitea-backup.zip"

# 7. Restart services
echo -e "${YELLOW}Restarting services...${NC}"
docker-compose restart

# 8. Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 15

for i in {1..30}; do
    if docker-compose ps | grep -q "healthy"; then
        echo -e "${GREEN}Services are healthy!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# 9. Verify restore
echo -e "${YELLOW}Verifying restore...${NC}"
GITEA_VERSION=$(docker exec gitea gitea --version | head -n1)
REPO_COUNT=$(docker exec gitea-postgres psql -U ${POSTGRES_USER:-gitea} -d ${POSTGRES_DB:-gitea} -t -c "SELECT COUNT(*) FROM repository;" | xargs)

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Restore completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "Gitea Version: ${GITEA_VERSION}"
echo -e "Repository Count: ${REPO_COUNT}"
echo -e ""
echo -e "Access Gitea at: https://${GITEA_DOMAIN}"
echo -e ""
echo -e "Please verify:"
echo -e "1. Login with admin credentials"
echo -e "2. Check repository access"
echo -e "3. Verify SSH access"
echo -e "4. Test Git operations"
echo -e "${GREEN}================================${NC}"

# Display logs
echo -e "${YELLOW}Displaying logs (Ctrl+C to exit)...${NC}"
docker-compose logs -f

exit 0
