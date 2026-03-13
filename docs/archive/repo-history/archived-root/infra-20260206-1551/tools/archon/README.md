# Archon OS Tool Stack (Standalone)

**Purpose**: Run Archon OS + MCP + UI as an independent tool stack, separate from the main Nyra orchestrator.

## Layout

- `tools/archon/` – Archon upstream source (Python backend + React UI)
- `infra/tools/archon/docker-compose.yml` – Standalone Docker stack for Archon

## Quick Start

```powershell
cd infra/tools/archon

# Start Archon OS + Postgres + MCP + UI
docker-compose up -d

# Stop stack
docker-compose down
```

Services:
- `nyra-archon-postgres` – Local Postgres DB for Archon (db: `nyra_archon`)
- `nyra-archon-server` – Archon API backend (port 8181)
- `nyra-archon-mcp` – Archon MCP server (port 8051)
- `nyra-archon-ui` – Archon UI (port 3737)
- `nyra-archon-agents` – Optional agents service (port 8052, profile `agents`)

## Nexus Router Integration (Optional)

By default, Archon is configured to talk to Nexus Router via:

- `NEXUS_ROUTER_URL=http://host.docker.internal:6000`

Start Nexus separately (e.g. `make nexus-start`) and Archon will route LLM calls through it.

## Local Database (Supabase-Style)

Archon uses a dedicated local Postgres instance:

- Host: `archon-postgres`
- Port: `5442` (exposed on host)
- User: `nyra`
- DB: `nyra_archon`

Connection strings:
- `SUPABASE_URL=postgresql://nyra:${ARCHON_POSTGRES_PASSWORD}@archon-postgres:5432/nyra_archon`
- `DATABASE_URL=postgresql://nyra:${ARCHON_POSTGRES_PASSWORD}@archon-postgres:5432/nyra_archon`

## Environment Variables

Optional overrides (with defaults):

- `ARCHON_POSTGRES_PASSWORD` – Postgres password (default `nyra-archon-password`)
- `SUPABASE_SERVICE_KEY` – Dummy local key (`local-postgres-no-jwt` by default)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` – LLM providers
- `LOG_LEVEL` – Default `INFO`

## Notes

- This stack is **independent** of `docker-compose.orchestration.yml`.
- It does **not** start with `make infra-up`; use `docker-compose` commands above or new Make targets.
- MCP endpoint for Claude Code / Nexus Router: `http://localhost:8051`.