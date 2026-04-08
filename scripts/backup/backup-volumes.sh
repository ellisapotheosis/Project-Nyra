#!/bin/bash
set -euo pipefail

BACKUP_DIR="${1:-./backups/volumes-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Backing up Docker volumes..."

# List volumes and backup each one
docker volume ls -q | while read volume; do
    echo "Backing up volume: $volume"
    docker run --rm -v "$volume:/data" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null || true
done

echo "[SUCCESS] Volumes backed up to $BACKUP_DIR"
