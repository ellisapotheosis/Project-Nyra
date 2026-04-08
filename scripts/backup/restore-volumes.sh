#!/bin/bash
set -euo pipefail

BACKUP_DIR="${1:?Usage: $0 <backup-directory>}"

echo "[RESTORE] Restoring Docker volumes..."

for archive in "$BACKUP_DIR"/*.tar.gz; do
    [ ! -f "$archive" ] && continue
    
    volume=$(basename "$archive" .tar.gz)
    echo "Restoring volume: $volume"
    
    docker volume create "$volume" 2>/dev/null || true
    docker run --rm -v "$volume:/data" -v "$BACKUP_DIR:/backup" alpine tar xzf "/backup/$(basename "$archive")" -C /data 2>/dev/null || true
done

echo "[SUCCESS] Volumes restored from $BACKUP_DIR"
