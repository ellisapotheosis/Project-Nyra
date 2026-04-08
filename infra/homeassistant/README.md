# HomeAssistant Bootstrap Kit (Linkwarden + StarWarden + Dashboard)

This folder now contains a full, reproducible setup kit for running:

- **Linkwarden** (self-hosted bookmark/archive manager)
- **StarWarden** (GitHub starred repos sync into Linkwarden)
- **Homepage dashboard** (quick links for your Home Assistant node)

It is designed for a Home Assistant box using a **Samsung T5 1TB USB SSD**, while avoiding common SyncThing database corruption issues.

## What this kit solves

- Brings up all services with one script.
- Stores persistent data on the USB SSD.
- Separates **live DB data** from **sync-safe backup/export data**.
- Adds health checks and helper scripts for diagnostics and backups.

---

## Folder contents

- `.env.homeassistant-dashboard.example`
- `.env.homeassistant-linkwarden.example`
- `docker-compose.homeassistant-dashboard.yml`
- `docker-compose.homeassistant-linkwarden.yml`
- `homepage/config/bookmarks.yaml`
- `scripts/bootstrap-homeassistant.sh`
- `scripts/check-homeassistant-stack.sh`
- `scripts/backup-homeassistant-stack.sh`

---

## Prerequisites

- Docker + Docker Compose plugin installed on Home Assistant host.
- Samsung T5 mounted (example mount path: `/mnt/samsung_t5`).
- Ports available:
  - `3010` Linkwarden
  - `3007` Homepage dashboard

---

## Quick start

```bash
cd /workspace/Project-Nyra/infra/homeassistant

# Creates missing .env files, validates compose, makes SSD dirs, and starts services
./scripts/bootstrap-homeassistant.sh
```

Then open:

- Linkwarden: `http://<homeassistant-ip>:3010`
- Homepage Dashboard: `http://<homeassistant-ip>:3007`

---

## 1) Configure environment files

### A) Linkwarden/StarWarden env

```bash
cp .env.homeassistant-linkwarden.example .env.homeassistant-linkwarden
```

Update at minimum:

- `HA_STACK_ROOT`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `POSTGRES_PASSWORD`
- `MEILI_MASTER_KEY`
- `GITHUB_USERNAME`
- `GITHUB_TOKEN`

After Linkwarden first login, create an API token in Linkwarden and set:

- `LINKWARDEN_TOKEN`

### B) Dashboard env

```bash
cp .env.homeassistant-dashboard.example .env.homeassistant-dashboard
```

Update URLs as needed, including `LINKWARDEN_URL`.

---

## 2) SyncThing guidance (important)

To reduce risk of database corruption:

- **Do sync:** `${HA_STACK_ROOT}/synced`
- **Do NOT sync:** `${HA_STACK_ROOT}/live-data`

Reason: Postgres + Meilisearch use active database files and locks that should not be bidirectionally synced while containers run.

---

## 3) Operations

### Start / restart

```bash
docker compose --env-file .env.homeassistant-linkwarden -f docker-compose.homeassistant-linkwarden.yml up -d
docker compose --env-file .env.homeassistant-dashboard -f docker-compose.homeassistant-dashboard.yml up -d
```

### Stop

```bash
docker compose --env-file .env.homeassistant-linkwarden -f docker-compose.homeassistant-linkwarden.yml down
docker compose --env-file .env.homeassistant-dashboard -f docker-compose.homeassistant-dashboard.yml down
```

### Health/status checks

```bash
./scripts/check-homeassistant-stack.sh
```

### Backups to sync-safe folder

```bash
./scripts/backup-homeassistant-stack.sh
```

Backups are written to `${HA_STACK_ROOT}/synced/backups/<timestamp>`.

---

## 4) First-run order for StarWarden

1. Bring up stack.
2. Create Linkwarden admin user.
3. Create a Linkwarden API token.
4. Put token in `.env.homeassistant-linkwarden` as `LINKWARDEN_TOKEN`.
5. Optionally set `COLLECTION_ID` to pin updates to a specific Linkwarden collection.
6. Restart `starwarden` container:

```bash
docker compose --env-file .env.homeassistant-linkwarden -f docker-compose.homeassistant-linkwarden.yml up -d starwarden
```

---

## Troubleshooting quick hits

- **Services fail to start:** run `docker compose ... config` to catch env formatting errors.
- **Linkwarden can’t connect DB:** verify `POSTGRES_PASSWORD` matches in env and DB container is healthy.
- **StarWarden doesn’t import stars:** verify GitHub token scopes and valid `LINKWARDEN_TOKEN`.
- **“Auto-install not working”:** use `./scripts/bootstrap-homeassistant.sh` (idempotent and validation-first).

---

## Upstream references

- Linkwarden: `https://github.com/linkwarden/linkwarden`
- StarWarden: `https://github.com/rtuszik/starwarden`
