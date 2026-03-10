# Codex CLI Master Prompt: Finish bootstrapping Project Nyra

You are Codex CLI operating in the Project-Nyra repo. Goal: take the repo from “mostly stood up” to “flawless boot.”

## Non-negotiable style
- Make changes as commits on a feature branch.
- Add/update .env.example files; do not commit secrets.
- Fix failing compose stacks; provide a working `make up` / `make health`.
- Produce a final runbook.

## Work plan
1) Run an env inventory scan across /infra /apps /services /packages and generate:
   - docs/env/ENV_INVENTORY.md
   - docs/env/MISSING_ENV.md
   - infra/.env.example
   - apps/**/.env.example where needed
   - services/**/.env.example where needed
2) Fix the monitoring stack:
   - Identify why grafana/loki/prometheus/alertmanager fail
   - Patch config mounts & env vars
   - Add healthchecks
3) Stand up TwentyCRM + Twenty MCP:
   - Add required vars like APP_URL (internal + public)
   - Ensure postgres + redis dependencies
   - Add smoke tests that create a MortgageLead record
4) Add the mortgage campaign pipeline (n8n/Activepieces):
   - Provide importable workflow JSONs for lead ingest + drip + STOP
5) OpenClaw/Clawdbot:
   - Containerize OpenClaw (aka Moltbot)
   - Add Mem0 OpenClaw plugin wiring (MEM0_API_KEY optional)
6) Oracle deployment prep:
   - Create infra/oracle/compose.oracle.yml
   - Ensure all services support running behind Cloudflared + Tailscale
   - Provide migration scripts (pg_dump/restore) and config docs

## Outputs
- PR-ready commits
- docs/BOOTSTRAP_RUNBOOK.md with exact commands
- docs/ORACLE_DEPLOYMENT.md with exact commands
