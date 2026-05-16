# BACKUP_AND_ARCHIVE_RUNBOOK.md

## 1. Database Backups
### Postgres (Oracle-VPS)
- **Schedule**: Daily at 02:00 UTC.
- **Method**: `pg_dump` to a mounted volume.
- **Retention**: 30 days local, permanent in S3/Backblaze.

### Redis/FalkorDB
- **Method**: RDB snapshots stored in the respective data volumes.

## 2. Document Archiving (RAG Staging)
Superseded documents must be moved to `docs/archive/` rather than deleted.

### Categorization
- `infra/`: Old compose files and hardware notes.
- `prompts/`: Previous system prompts.
- `research/`: Completed investigations.

## 3. Configuration Sync
**Syncthing** is used to keep the `~/` folder in sync across the local cluster.
- **Rule**: Never sync `.env` files or `node_modules`.
- **Rule**: Orchestrator is the "Introducer" node.
