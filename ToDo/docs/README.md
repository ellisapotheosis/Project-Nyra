# Nyra — Claude-Flow v3 Alpha Stack Blueprint

This package is a **practical, production-leaning blueprint** for running a Nyra stack with:

- **Claude-Flow v3alpha** (as an MCP server + orchestration runtime)
- **Central memory** on **Postgres + RuVector**
- **Queue/cache** on **Redis**
- **Unified LLM gateway** via **LiteLLM** (works great with Dify + any OpenAI-compatible clients)
- **Remote access** using **Cloudflare Tunnel** (public endpoints) + **Tailscale** (admin/internal)

You’ll get:

- A readable review of what changed in Claude-Flow v3alpha (modules + integrations)
- A recommended memory strategy (what to keep, what to skip)
- A docker-compose baseline you can extend for n8n / Activepieces / Twenty / Dify

> Important: this is intentionally *modular*. Start with the **Core** compose, then add apps one at a time.

## Files

- `docs/claude-flow-v3alpha-review.md` — what’s new, how the v3alpha packages are structured, what to use first
- `docs/nyra-memory-stack.md` — recommended memory stack and decision matrix
- `docs/workflows-and-apps.md` — how n8n + Activepieces + Twenty + Dify fit together for your mortgage flows
- `docker/compose.core.yml` — core infra services (RuVector Postgres, Redis, LiteLLM, Traefik)
- `docker/compose.edge.yml` — Cloudflared + optional Tailscale container pattern
- `docker/configs/litellm/config.yaml` — model routing groups (cheap vs heavy thinking)
- `configs/claude-flow/claude-flow.config.json` — sample claude-flow config to point at your memory + gateway
- `.env.example` — copy to `.env` and fill secrets

## Quick start (Orchestrator Ubuntu)

1) Copy env

```bash
cp .env.example .env
```

2) Start core services

```bash
docker compose -f docker/compose.core.yml --env-file .env up -d
```

3) (Optional) Bring up edge exposure

```bash
docker compose -f docker/compose.edge.yml --env-file .env up -d
```

4) Verify Postgres + RuVector

```bash
docker exec -it ruvector-postgres psql -U claude -d claude_flow -c "SELECT ruvector_version();"
```

5) Start Claude-Flow MCP server (example)

```bash
# inside your repo (Project-Nyra)
# using npx (pin a version/tag you like)

npx @claude-flow/cli@latest mcp start
```

Then add it to Claude Code:

```bash
claude mcp add claude-flow -- npx @claude-flow/cli@latest mcp start
```

## Next steps

- Add n8n + Activepieces (start with webhook ingest + drip campaigns)
- Add TwentyCRM + Dify UI
- Add GPU workers (your Alienware laptops) for local embeddings / models if you want

