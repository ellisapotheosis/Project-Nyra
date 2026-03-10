# Nyra service placement: Oracle vs Orchestrator vs GPU Workers

Generated: 2026-03-03 10:01:14

## Goal
Keep orchestrator (16GB RAM) cool, keep Oracle Always Free A1 (4 OCPU/24GB) inside free limits, and keep GPU workers disposable.

## Recommended placement (v1)

### Oracle A1 (Always-on production plane)
Run these **24/7**:
- Postgres (twenty + nyra_ai databases)
- Redis (cache + optional FalkorDB module if Graphiti requires it)
- RuVector services (if you run a server) and/or pgvector storage
- n8n + Activepieces (always-on campaign scheduler + webhooks)
- TwentyCRM app (if you’re ok hosting CRM in Oracle)
- Quote API
- Public-facing webapp / landing page (or static assets)
- Cloudflared tunnel(s) for: crm/admin/app/n8n/webhooks

### Orchestrator (control plane + dev)
Run these **24/7**:
- Nexus Router (MCP aggregator) + mcproxy/tool-fuzz layer
- LiteLLM/OpenRouter routing
- Infisical + secrets tooling
- Archon OS UI (admin shell)
- Claude-flow (dev-only) + dashboards
- Gitea (optional): If RAM is tight, move Gitea to Oracle; otherwise keep local.

### GPU workers (compute plane, disposable)
- vLLM servers (port 8000)
- Ollama (port 11434)
- Embedding generation jobs
- Gitea runners / CI heavy jobs

## Cloud topology tip
Long-term: host a **customer-facing Nexus** on Oracle and route to local/internal tool MCPs over Tailscale.
Short-term: keep Nexus local, expose only admin UI + CRM via Cloudflared.

