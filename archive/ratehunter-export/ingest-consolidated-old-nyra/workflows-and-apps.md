# Mortgage lead drip + Nyra assistant — how the apps fit together

You’re trying to run:

- **Activepieces MCP** + **n8n** for workflows
- **Nyra mortgage assistant** webapp (multi-agent)
- **TwentyCRM** custom build
- **Dify** (chat UI + flows)
- **Composio** (actions/integrations)
- **ratehunter.net** landing pages (lead capture)
- 4-PC LAN: orchestrator-mini + 3 GPU workers
- optional **Oracle VPS** VPS

## The “clean” architecture

### 1) Ingest

- `ratehunter.net` forms → **HTTPS webhook**
- webhook terminates on **Cloudflare Tunnel** (public, stable URL)
- request forwarded to `ingest-api` (tiny service) on orchestrator

### 2) Normalize + store

- `ingest-api` writes lead + consent + source into **RuVector Postgres**
- publishes a job onto **Redis** (stream/queue)

### 3) Automate (n8n/Activepieces)

- n8n is your *automation brain*:
  - initial email/SMS
  - wait/sleep patterns
  - lead scoring
  - appointment booking
  - syncing to TwentyCRM

Activepieces is nice when:

- you want faster “component” dev
- you want a simple UI for teammates

But don’t run two automation brains fighting each other.

**Suggestion:**

- Use **n8n** as the primary orchestrator
- Use Activepieces for “team-friendly” workflows later

### 4) Assist (Nyra + Claude-Flow)

- Nyra webapp calls Claude-Flow’s MCP server (internal only)
- Claude-Flow reads/writes memory via RuVector Postgres
- Claude-Flow calls the LLM gateway (LiteLLM)

### 5) Chat UI

If you want Dify UI:

- Dify talks to LiteLLM (OpenAI-compatible)
- Dify tool calls can hit your own API endpoints (or MCP proxies)

### 6) CRM

- TwentyCRM is the system of record for pipeline views
- n8n syncs `leads` → `contacts/opportunities`

## LAN + Oracle VPS split

### What stays on orchestrator-mini (24/7)

- RuVector Postgres
- Redis
- LiteLLM
- Cloudflared tunnel
- n8n (or Activepieces)
- Traefik (reverse proxy)

### What can live on GPU workers (only when needed)

- local model servers
- embedding generation jobs
- expensive batch tasks (doc ingestion, summarization)

### What can live on Oracle VPS

- public frontend for Nyra
- webhook edge proxy (if you don’t want tunnels)
- Dify UI (if you want it always-on)

## Key: access strategy

- **Cloudflared**: public endpoints (your landing page webhooks, Dify UI, teammate access)
- **Tailscale**: admin endpoints (DB, dashboards, internal services)

They’re not alternatives; they’re complementary.
