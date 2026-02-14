# Project Nyra — Infra Package (v2)

This package gives you a **single, modular Docker Compose stack** with:
- **Profiles** so each machine only pulls/runs what it needs
- **4 node env files** + **4 node override files**
- **RuVector Postgres** integrated as an optional profile
- n8n workflows + Koyeb manifests included

## Where to put this

Put the `infra/` folder at the **repo root** so paths resolve correctly:
```
Project-Nyra/
  infra/
  services/
  apps/
  configs/
  ...
```

## Should you rename your current infra?

Yes — safest workflow:
1. Create a branch and commit your current state.
2. Archive the existing folder **without deleting** it:
   ```bash
   git mv infra infra-archived/infra-$(date +%Y%m%d)
   ```
3. Copy this new `infra/` in its place.
4. Run a quick diff check (the agent prompts below include a verification checklist).

If you *don’t* want to move it, you can also drop this as `infra-next/` and migrate gradually.

## Quick start

### Orchestrator
```bash
cd infra
./scripts/node-up.sh orchestrator
```

### Worker nodes
```bash
cd infra
./scripts/node-up.sh worker-rtx3060
./scripts/node-up.sh worker-rtx5090
./scripts/node-up.sh worker-rtx3090ti
```

### Turn on additional service groups
Edit the node env file and adjust `COMPOSE_PROFILES` (comma-separated).
Profiles available in this v2 compose:
- `core` (postgres, redis, mongo)
- `secrets` (infisical)
- `workflow` (n8n, activepieces)
- `observability` (prometheus, loki, grafana, cadvisor)
- `edge` (cloudflared)
- `vector` (ruvector-postgres, pgadmin)
- `gui` (pgadmin)
- `archon` (archon-os, archon-server, archon-mcp, archon-ui)
- `archon-agents` (archon-agents - PydanticAI agents, optional)

Example:
```env
COMPOSE_PROFILES=core,secrets,workflow,edge,vector
```

## Archon OS

Archon is the multi-agent orchestration system with RAG, MCP, and PydanticAI agents.

Bring it up:
```bash
cd infra
docker compose -f docker-compose.yml -f compose/docker-compose.archon.yml --profile core --profile archon up -d
```

With optional agents service (requires more resources):
```bash
cd infra
docker compose -f docker-compose.yml -f compose/docker-compose.archon.yml --profile core --profile archon --profile archon-agents up -d
```

Services:
- **archon-os** (port 9001): Core orchestration service
- **archon-server** (port 8181): RAG backend with web crawling
- **archon-mcp** (port 8051): MCP protocol server
- **archon-ui** (port 3737): React dashboard
- **archon-agents** (port 8052): PydanticAI agents (optional)

## RuVector

Bring it up:
```bash
cd infra
COMPOSE_PROFILES=vector ./scripts/node-up.sh orchestrator
```

Test:
```bash
docker exec ruvector-postgres psql -U claude -d claude_flow -c "SELECT ruvector_version();"
```

## n8n workflows

JSON exports are in `infra/n8n-workflows/`:
- `mortgage-lead-intake.json`
- `sms-campaign.json`

Import them via n8n UI (Settings → Import) or the n8n API.

