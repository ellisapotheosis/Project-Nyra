# HomeAssistant Bootstrap Kit (Linkwarden + StarWarden + Full Dashboard UI)

This package deploys:
- Linkwarden stack (Postgres + Meilisearch + Linkwarden)
- StarWarden sync worker
- Homepage dashboard UI with links for Nyra apps/UIs (landing, webapp, CRM, Archon OS UI, Nexus Admin, Open WebUI, Dify, n8n, Activepieces, observability, memory services)

## File tree

```text
infra/homeassistant/
├── .env.homeassistant
├── .env.homeassistant.example
├── docker-compose.homeassistant-linkwarden.yml
├── docker-compose.homeassistant-dashboard.yml
├── homepage/config/
│   ├── bookmarks.yaml
│   ├── services.yaml
│   ├── settings.yaml
│   └── widgets.yaml
└── scripts/
    ├── bootstrap-homeassistant.sh
    ├── check-homeassistant-stack.sh
    └── backup-homeassistant-stack.sh
```

## Secrets vs non-secrets

### Put in Infisical (secrets)
- `NEXTAUTH_SECRET`
- `POSTGRES_PASSWORD`
- `MEILI_MASTER_KEY`
- `LINKWARDEN_TOKEN`
- `GITHUB_TOKEN`
- `APPRISE_URLS` (if webhook includes credentials)

### Keep local/non-secret config
All other URL/port/hostname and scheduler/tag variables in `.env.homeassistant`.

## Quick start

```bash
cd /workspace/Project-Nyra/infra/homeassistant
cp .env.homeassistant.example .env.homeassistant

# edit placeholders in .env.homeassistant
./scripts/bootstrap-homeassistant.sh
```

## Why auto-install failed previously

On first run, `LINKWARDEN_TOKEN` usually does not exist yet. Bootstrap now:
1. Starts core services first (postgres + meilisearch + linkwarden + dashboard)
2. Starts StarWarden only when both `GITHUB_TOKEN` and `LINKWARDEN_TOKEN` are set to non-placeholder values

## Operations

```bash
# health/status
./scripts/check-homeassistant-stack.sh

# backup to sync-safe path
./scripts/backup-homeassistant-stack.sh

# start StarWarden after token setup
docker compose --env-file .env.homeassistant -f docker-compose.homeassistant-linkwarden.yml up -d starwarden
```

## SyncThing safety

- Sync only: `${HA_STACK_ROOT}/synced`
- Exclude: `${HA_STACK_ROOT}/live-data`

Never sync live Postgres/Meilisearch data directories.
