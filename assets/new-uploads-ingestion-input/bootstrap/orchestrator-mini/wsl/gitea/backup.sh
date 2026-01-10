#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Gitea Backup Script${NC}"
echo -e "${GREEN}================================${NC}"

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Configuration
BACKUP_DIR="./backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="gitea-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting backup: ${BACKUP_NAME}${NC}"

# 1. Backup Gitea data
echo -e "${YELLOW}Backing up Gitea data...${NC}"
docker exec gitea sh -c "gitea dump -c /data/gitea/conf/app.ini -f /data/${BACKUP_NAME}.zip"
docker cp gitea:/data/${BACKUP_NAME}.zip "${BACKUP_PATH}.zip"
docker exec gitea rm /data/${BACKUP_NAME}.zip

# 2. Backup PostgreSQL database
echo -e "${YELLOW}Backing up PostgreSQL database...${NC}"
docker exec gitea-postgres pg_dump -U ${POSTGRES_USER:-gitea} -d ${POSTGRES_DB:-gitea} > "${BACKUP_PATH}-postgres.sql"

# 3. Backup configuration files
echo -e "${YELLOW}Backing up configuration files...${NC}"
tar -czf "${BACKUP_PATH}-config.tar.gz" \
    docker-compose.yml \
    gitea-config.ini \
    .env \
    nginx/ \
    2>/dev/null || true

# 4. Create backup manifest
echo -e "${YELLOW}Creating backup manifest...${NC}"
cat > "${BACKUP_PATH}-manifest.txt" <<EOF
Gitea Backup Manifest
====================
Backup Date: $(date)
Hostname: $(hostname)
Gitea Version: $(docker exec gitea gitea --version | head -n1)
PostgreSQL Version: $(docker exec gitea-postgres psql --version)

Files:
- ${BACKUP_NAME}.zip (Gitea dump)
- ${BACKUP_NAME}-postgres.sql (Database dump)
- ${BACKUP_NAME}-config.tar.gz (Configuration files)

Docker Volumes:
$(docker-compose ps -q | xargs docker inspect --format='{{.Name}}: {{range .Mounts}}{{.Source}}:{{.Destination}} {{end}}')

Environment:
POSTGRES_DB=${POSTGRES_DB:-gitea}
POSTGRES_USER=${POSTGRES_USER:-gitea}
GITEA_DOMAIN=${GITEA_DOMAIN}
EOF

# 5. Calculate checksums
echo -e "${YELLOW}Calculating checksums...${NC}"
cd "$BACKUP_DIR"
sha256sum "${BACKUP_NAME}"* > "${BACKUP_NAME}-checksums.txt"
cd - > /dev/null

# 6. Upload to MinIO (if configured)
if [ -n "$MINIO_ENDPOINT" ] && [ "$MINIO_ENDPOINT" != "http://minio.orchestrator-mini.local:9000" ]; then
    echo -e "${YELLOW}Uploading to MinIO...${NC}"

    # Install mc (MinIO Client) if not present
    if ! command -v mc &> /dev/null; then
        echo -e "${YELLOW}Installing MinIO Client...${NC}"
        wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /tmp/mc
        chmod +x /tmp/mc
        sudo mv /tmp/mc /usr/local/bin/
    fi

    # Configure MinIO client
    mc alias set gitea-backup "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

    # Create bucket if not exists
    mc mb gitea-backup/${MINIO_BUCKET} --ignore-existing

    # Upload backup files
    mc cp "${BACKUP_PATH}"* "gitea-backup/${MINIO_BUCKET}/"

    echo -e "${GREEN}Backup uploaded to MinIO${NC}"
fi

# 7. Cleanup old backups
if [ -n "$BACKUP_RETENTION_DAYS" ] && [ "$BACKUP_RETENTION_DAYS" != "30" ]; then
    echo -e "${YELLOW}Cleaning up old backups (older than ${BACKUP_RETENTION_DAYS} days)...${NC}"
    find "$BACKUP_DIR" -name "gitea-backup-*" -mtime "+${BACKUP_RETENTION_DAYS}" -delete

    # Cleanup MinIO backups if configured
    if [ -n "$MINIO_ENDPOINT" ]; then
        mc rm --recursive --force --older-than "${BACKUP_RETENTION_DAYS}d" "gitea-backup/${MINIO_BUCKET}/"
    fi
fi

# 8. Display backup information
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}"* | awk '{sum+=$1} END {print sum}')

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "Backup location: ${BACKUP_PATH}*"
echo -e "Backup size: ${BACKUP_SIZE}"
echo -e ""
echo -e "Files created:"
ls -lh "${BACKUP_PATH}"*
echo -e ""
echo -e "To restore this backup, run:"
echo -e "./restore.sh ${BACKUP_NAME}"
echo -e "${GREEN}================================${NC}"

# Create latest symlink
ln -sf "${BACKUP_NAME}" "${BACKUP_DIR}/latest"

exit 0
