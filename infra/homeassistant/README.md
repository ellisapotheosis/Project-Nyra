# HomeAssistant Bootstrap Kit (Linkwarden + StarWarden + Dashboard)

This package deploys Linkwarden + StarWarden + Homepage dashboard with one `.env.homeassistant` file.

## Files

- `.env.homeassistant.example` - template for all required variables
- `.env.homeassistant` - working local env file (placeholder-safe, commit-safe)
- `docker-compose.homeassistant-linkwarden.yml`
- `docker-compose.homeassistant-dashboard.yml`
- `scripts/bootstrap-homeassistant.sh`
- `scripts/check-homeassistant-stack.sh`
- `scripts/backup-homeassistant-stack.sh`

## Secrets vs non-secrets

### Put in Infisical (secrets)
- `NEXTAUTH_SECRET`
- `POSTGRES_PASSWORD`
- `MEILI_MASTER_KEY`
- `LINKWARDEN_TOKEN`
- `GITHUB_TOKEN`
- `APPRISE_URLS` (if it includes secret webhook tokens)

### Keep local/non-secret config
- `HA_STACK_ROOT`, `HOMEASSISTANT_IP`, `HOMEPAGE_PORT`, `LINKWARDEN_PORT`
- `NEXTAUTH_URL`, `LINKWARDEN_INTERNAL_URL`
- `POSTGRES_USER`, `POSTGRES_DB`
- `GITHUB_USERNAME`, `COLLECTION_ID`, `CRON_SCHEDULE`, `OPT_TAG*`
- `PORTAINER_URL`, `ARCHON_URL`, `WEBAPP_URL`, `LANDING_URL`, `GRAFANA_URL`, `NEXUS_URL`, `LINKWARDEN_URL`

## Quick start

```bash
cd /workspace/Project-Nyra/infra/homeassistant
cp .env.homeassistant.example .env.homeassistant

# Edit .env.homeassistant placeholders before first run
./scripts/bootstrap-homeassistant.sh
```

## Why auto-install failed previously

Most first-runs do not yet have `LINKWARDEN_TOKEN` (created only after first Linkwarden login). The bootstrap now starts base services first and only starts StarWarden when both `GITHUB_TOKEN` and `LINKWARDEN_TOKEN` are real values.

## SyncThing guidance

- Sync only: `${HA_STACK_ROOT}/synced`
- Exclude from sync: `${HA_STACK_ROOT}/live-data`

This avoids syncing live Postgres/Meilisearch database files.

## Operations

```bash
# check status
./scripts/check-homeassistant-stack.sh

# backup to sync-safe folder
./scripts/backup-homeassistant-stack.sh

# manual StarWarden start after token setup
docker compose --env-file .env.homeassistant -f docker-compose.homeassistant-linkwarden.yml up -d starwarden
```
