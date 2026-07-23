#!/usr/bin/env bash
set -Eeuo pipefail

MODE=${1:---check}
SSH_ALIAS=${SSH_ALIAS:-oracle-vps}
BACKUP_ROOT=${BACKUP_ROOT:-/var/backups/projectnyra/gitea}
COMPOSE_FILE=${COMPOSE_FILE:-infra/hosts/oracle-vps/docker-compose.forgejo.yml}

die() { printf '[forgejo-migration] ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '[forgejo-migration] %s\n' "$*"; }

case "$MODE" in
  --check)
    ssh "$SSH_ALIAS" 'docker inspect oracle-vps-gitea --format "{{.Config.Image}} {{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}"' || die 'Gitea container is not inspectable'
    ssh "$SSH_ALIAS" 'docker volume inspect nyra-gitea_gitea_db_data nyra-gitea_gitea_data >/dev/null' || log 'WARN: expected volume names differ; inspect remote compose before backup'
    test -f "$COMPOSE_FILE" || die "missing $COMPOSE_FILE"
    FORGEJO_DB_PASSWORD=check FORGEJO_SECRET_KEY=check FORGEJO_INTERNAL_TOKEN=check FORGEJO_JWT_SECRET=check FORGEJO_RUNNER_REGISTRATION_TOKEN=check docker compose -f "$COMPOSE_FILE" config --quiet
    log 'Check passed: no services were changed. Gitea health and backup readiness still require repair/verification.'
    ;;
  --prepare)
    latest=$(ssh "$SSH_ALIAS" "find '$BACKUP_ROOT' -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-" || true)
    test -n "$latest" || die 'create a Gitea backup first with scripts/forgejo/backup-gitea.sh'
    log "Preparing is intentionally gated: restore a COPY of $latest into Forgejo staging, never the live volumes."
    log "After restoring the copy, run: docker compose --env-file /etc/projectnyra/secrets/forgejo.env -f $COMPOSE_FILE up -d forgejo-db forgejo"
    ;;
  --cutover)
    [[ ${CONFIRM_FORGEJO_CUTOVER:-} == I_UNDERSTAND ]] || die 'cutover is destructive; set CONFIRM_FORGEJO_CUTOVER=I_UNDERSTAND after staging verification'
    latest=$(ssh "$SSH_ALIAS" "find '$BACKUP_ROOT' -mindepth 1 -maxdepth 1 -type d -mmin -1440 -printf '%p\n' 2>/dev/null | sort | tail -1" || true)
    test -n "$latest" || die 'no backup newer than 24 hours exists'
    die 'live cutover remains blocked until the unhealthy Gitea DB credential is repaired and Forgejo staging passes the migration checklist'
    ;;
  *) die "usage: $0 [--check|--prepare|--cutover]" ;;
esac
