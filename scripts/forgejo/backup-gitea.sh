#!/usr/bin/env bash
set -Eeuo pipefail

SSH_ALIAS=${SSH_ALIAS:-oracle-vps}
REMOTE_ENV_FILE=${REMOTE_ENV_FILE:-/home/ubuntu/project-nyra/.env.gitea}
BACKUP_ROOT=${BACKUP_ROOT:-/var/backups/projectnyra/gitea}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

log() { printf '[forgejo-backup] %s\n' "$*"; }
die() { printf '[forgejo-backup] ERROR: %s\n' "$*" >&2; exit 1; }

ssh "$SSH_ALIAS" "test -f '$REMOTE_ENV_FILE'" || die "remote Gitea env file is missing: $REMOTE_ENV_FILE"
log "Creating remote backup $BACKUP_ROOT/$STAMP"
ssh "$SSH_ALIAS" "sudo -n env BACKUP_DIR='$BACKUP_ROOT/$STAMP' ENV_FILE='$REMOTE_ENV_FILE' bash -s" <<'REMOTE'
set -Eeuo pipefail
umask 077
mkdir -p "$BACKUP_DIR"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}' | grep -E 'gitea|gitea-db' >"$BACKUP_DIR/containers.tsv" || true
docker inspect oracle-vps-gitea oracle-vps-gitea-db >"$BACKUP_DIR/container-inspect.json" 2>"$BACKUP_DIR/inspect-errors.log" || true
if docker exec oracle-vps-gitea-db pg_dump -U "${GITEA_DB_USER:-gitea}" -d "${GITEA_DB_NAME:-gitea}" --format=custom >"$BACKUP_DIR/gitea-db.dump" 2>"$BACKUP_DIR/pg_dump.error"; then
  printf 'database_dump=ok\n' >"$BACKUP_DIR/backup-status.txt"
else
  printf 'database_dump=failed\n' >"$BACKUP_DIR/backup-status.txt"
  # Volume archives remain valuable for credential repair and manual recovery.
  rm -f "$BACKUP_DIR/gitea-db.dump"
fi
docker run --rm -v nyra-gitea_gitea_data:/data:ro -v "$BACKUP_DIR":/backup alpine:3.20 tar czf /backup/gitea-data.tgz -C /data .
docker run --rm -v nyra-gitea_gitea_config:/data:ro -v "$BACKUP_DIR":/backup alpine:3.20 tar czf /backup/gitea-config.tgz -C /data .
docker volume inspect nyra-gitea_gitea_db_data >"$BACKUP_DIR/db-volume-inspect.json" 2>"$BACKUP_DIR/db-volume-inspect.error" || true
sha256sum "$BACKUP_DIR"/* >"$BACKUP_DIR/SHA256SUMS"
printf '%s\n' "$BACKUP_DIR"
REMOTE
log "Backup complete; contents remain on Oracle with mode 0700"
