# BACKUP_AND_ARCHIVE_RUNBOOK

Last updated: 2026-05-24

## Backup Targets

| Target                  | Host       | Method                      | Frequency  | Retention   |
| ----------------------- | ---------- | --------------------------- | ---------- | ----------- |
| nyra-postgres (app DB)  | oracle-vps | pg_dump                     | Daily      | 30 days     |
| twenty-db (TwentyCRM)   | oracle-vps | pg_dump                     | Daily      | 30 days     |
| letta-postgres          | oracle-vps | pg_dump                     | Daily      | 30 days     |
| Supabase Postgres       | oracle-vps | pg_dump                     | Daily      | 30 days     |
| Gitea DB + repos        | oracle-vps | gitea dump / git bundle     | Daily      | 90 days     |
| Qdrant vectors          | oracle-vps | qdrant snapshot API         | Weekly     | 4 snapshots |
| FalkorDB graph          | oracle-vps | redis-cli BGSAVE + dump.rdb | Daily      | 14 days     |
| Syncthing-synced files  | all hosts  | Syncthing history           | Continuous | 14 versions |
| Infisical config export | operator   | infisical export            | Weekly     | 4 exports   |

---

## Backup Scripts

### Postgres Databases

```bash
#!/usr/bin/env bash
# Run on oracle-vps; reads credentials from /run/nyra-secrets/
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/data/backups/postgres/$DATE"
mkdir -p "$BACKUP_DIR"

for DB in nyra twenty letta supabase; do
  pg_dump "$(cat /run/nyra-secrets/POSTGRES_URL_${DB^^})" \
    --no-owner --no-acl \
    -f "$BACKUP_DIR/${DB}-${DATE}.sql"
  gzip "$BACKUP_DIR/${DB}-${DATE}.sql"
done
echo "Postgres backups complete: $BACKUP_DIR"
```

### Gitea

```bash
# Gitea admin dump — run as the gitea container user
docker exec nyra-network-nyra-gitea \
  gitea admin dump \
  --file /data/backups/gitea/gitea-dump-$(date +%Y-%m-%d).zip \
  --type zip
```

### Qdrant Snapshot

```bash
curl -X POST "http://100.64.0.3:6333/collections/<collection>/snapshots" \
  -H "Content-Type: application/json"
# Download the snapshot file returned in the response
```

### FalkorDB

```bash
docker exec nyra-falkordb redis-cli BGSAVE
# Copy /data/dump.rdb from the container volume
```

---

## Restore Steps

### Postgres Restore

```bash
gunzip backup-file.sql.gz
psql "$DB_URL" < backup-file.sql
```

### Gitea Restore

```bash
# Stop Gitea container
docker compose stop gitea
# Extract dump and restore per Gitea docs
# https://docs.gitea.com/administration/backup-and-restore
docker compose up -d gitea
```

### Qdrant Restore

```bash
# Upload snapshot file via Qdrant REST API
curl -X POST "http://100.64.0.3:6333/collections/<collection>/snapshots/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "snapshot=@/path/to/snapshot.snapshot"
```

---

## Archive Rule

**Never delete documentation.** Move superseded or historical docs to `docs/archive/`
with a date prefix:

```
docs/archive/2026-05-24_CURRENT_STACK_TRUTH_V2.md
docs/archive/2026-03-10_OPERATIONS_RUNBOOK_OLD.md
```

RAG staging for archived content: `docs/RAG_ANYTHING_ARCHIVE_STAGING.md`
Log the archive action in `docs/RAG_ANYTHING_ARCHIVE_STAGING.md` so the RAG ingestion
pipeline picks up the moved document.

---

## Backup Storage

- Primary: `/data/backups/` on oracle-vps (SSD; 30-day rolling)
- Secondary: Syncthing replication to orchestrator (automatic via persistent stack)
- Cold archive: manual operator export to external storage quarterly

Never store backup files in the git repository. `.gitignore` includes `/data/` and
`/backups/` patterns. Do not commit compressed database dumps.

---

## Alerting

Backup failures trigger a `backup-failed` alert in Grafana (Prometheus alerting rule
on backup job exit status). Operator must investigate within 24 hours of a failed backup.
