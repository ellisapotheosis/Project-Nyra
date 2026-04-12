# Nyra Stack (local dev / single-node)

This repo is a **batteries-included** Docker Compose stack for Project Nyra:
- Twenty CRM (self-hosted)
- Graph memory: FalkorDB + letta (GraphRAG-friendly)
- Agent state manager: Letta
- Universal memory: Mem0 (REST) + optional OpenMemory MCP server
- AI routing + MCP aggregation: Grafbase Nexus
- LLM gateway (optional but recommended): LiteLLM (OpenRouter + direct providers)
- Observability: Prometheus + Loki + Grafana + Alertmanager
- UI: Open WebUI (optional)

> ⚠️ Compliance: this stack includes **technical guardrails** but does **not** replace legal/compliance review.

## Quick start (Windows PowerShell)

1. Install Docker Desktop (Compose v2).
2. Open PowerShell in this folder:
   ```powershell
   .\scripts\dev.ps1
   ```

## Quick start (macOS/Linux)

```bash
./scripts/dev.sh
```

## URLs (defaults)
- Nexus (LLM + MCP router): http://localhost:4001
- Nyra Orchestrator API:    http://localhost:8010
- Twenty CRM:               http://localhost:3000
- Grafana:                  http://localhost:3005
- Prometheus:               http://localhost:9090
- Open WebUI:               http://localhost:8080
- FalkorDB:                 redis://localhost:6379

## Environment variables you MUST set
Copy `.env.example` -> `.env` and fill:
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY` (if using OpenRouter via LiteLLM)
- `TWILIO_*` (only if you enable SMS/voice)
- `SENDGRID_API_KEY` or `SMTP_*` (only if you enable email)
- `TWENTY_*` secrets (minimal set is already included for dev; rotate for prod)

## What’s running
See `docker-compose.yml` and `docs/ARCHITECTURE.md`.

## Next steps (real-world deployment)
- Put this behind **Cloudflare Tunnel** or **Tailscale** (or both).
- Move secrets into a proper manager (1Password/Bitwarden/Vault).
- Add encryption-at-rest for Postgres volumes.
- Add a consent ledger + DNC checks before any outbound messaging.
