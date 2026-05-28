# SUPABASE_LOCAL_RUNBOOK

Last updated: 2026-05-24

## Overview

Project Nyra uses a **local Supabase instance** (not Supabase cloud) as the backend
and auth layer for the broker-facing web application. TwentyCRM remains the business
system of record for pipeline, contacts, and deals. Supabase provides auth, row-level
security, realtime subscriptions, and webapp-specific API endpoints.

Do not use the Supabase cloud hosted service — the local instance is canonical.

---

## Connection Variables

All connection variables are managed via Infisical. Never hardcode values.

| Variable                    | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `SUPABASE_URL`              | Local Supabase API URL (e.g. `http://100.64.0.3:<kong-port>`) |
| `SUPABASE_ANON_KEY`         | Public anon JWT for client-side requests                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role JWT (never expose to browser)        |
| `SUPABASE_DB_URL`           | Direct Postgres connection string for migrations/admin        |
| `SUPABASE_JWT_SECRET`       | JWT signing secret (Infisical only)                           |

---

## Infrastructure

Supabase local stack runs on oracle-vps as part of the apps compose profile.

| Component         | Port                               | Notes                                   |
| ----------------- | ---------------------------------- | --------------------------------------- |
| Kong API gateway  | varies                             | Supabase API entry point → SUPABASE_URL |
| GoTrue (auth)     | internal                           | JWT auth, magic links, OAuth            |
| PostgREST         | internal                           | Auto-generated REST API                 |
| Realtime          | internal                           | WebSocket subscriptions                 |
| Supabase Postgres | 5432 (separate from nyra-postgres) | App DB                                  |
| Studio            | internal                           | Admin UI (Tailscale access only)        |

---

## Migrations

Migrations are managed with the Supabase CLI and stored in `apps/projectnyra/supabase/migrations/`.

```bash
# Apply pending migrations
supabase db push --db-url "$SUPABASE_DB_URL"

# Create a new migration
supabase migration new <migration-name>

# Reset local DB to clean state (development only — never run in production)
supabase db reset --db-url "$SUPABASE_DB_URL"

# List applied migrations
supabase migration list --db-url "$SUPABASE_DB_URL"
```

Always test migrations against a local dev instance before applying to the oracle-vps
production Supabase stack.

---

## Seed Data

Seed data scripts live in `apps/projectnyra/supabase/seed.sql`.

```bash
# Apply seed data (development only)
psql "$SUPABASE_DB_URL" < apps/projectnyra/supabase/seed.sql
```

Do not seed production with test data. Production seeding (lookup tables, default roles)
is handled by the migrations themselves.

---

## Backup

Supabase Postgres should be included in the regular backup schedule:

```bash
# Manual dump
pg_dump "$SUPABASE_DB_URL" \
  --no-owner --no-acl \
  -f "backups/supabase-$(date +%Y-%m-%d).sql"
```

Automated backups: see `docs/ops/BACKUP_AND_ARCHIVE_RUNBOOK.md`.
Never commit backup files containing real data to git.

---

## Data Boundaries

| Data Type                          | Canonical Store              | Supabase Role                   |
| ---------------------------------- | ---------------------------- | ------------------------------- |
| Borrower pipeline, deals, contacts | TwentyCRM                    | Reference only via twenty_id FK |
| Broker user accounts & auth        | Supabase                     | Authoritative                   |
| Session/realtime state             | Supabase                     | Authoritative                   |
| Quote results                      | quote-engine → nyra-postgres | Read via crm-api                |
| Campaign state                     | Activepieces / n8n           | Referenced via lead_id          |

Do not duplicate CRM pipeline state in Supabase without a mapped `twenty_id` foreign key.
App state sync must be auditable and recoverable from TwentyCRM or Nyra service state.

---

## Auth Configuration

- Magic links and OAuth providers configured in GoTrue via Infisical env vars.
- JWT expiry: 1 hour (access token), 7 days (refresh token) — adjust in GoTrue config.
- Row Level Security (RLS) must be enabled on all broker-accessible tables.
- Service role key must only be used in server-side API routes, never in browser code.

---

## Troubleshooting

| Symptom                 | Check                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| 401 on API calls        | Verify SUPABASE_ANON_KEY and SUPABASE_URL match running instance         |
| Migration fails         | Check SUPABASE_DB_URL connectivity; verify postgres container is healthy |
| Auth emails not sending | Check GoTrue SMTP config in Infisical; verify SendGrid key               |
| Realtime not connecting | Check Kong and Realtime container health on oracle-vps                   |
