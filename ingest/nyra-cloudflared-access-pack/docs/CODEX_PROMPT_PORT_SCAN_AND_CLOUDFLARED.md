# Codex CLI Prompt — Repo-wide port scan + Cloudflared plan
Generated: 2026-03-06 04:39:15

You are Codex CLI inside the Project-Nyra repo.

Goal:
- Enumerate all apps/services/infra stacks
- Discover all ports (compose ports, Dockerfile EXPOSE, code listen ports, env PORT vars)
- Produce:
  - docs/cloudflared/PORT_REGISTRY.md
  - docs/cloudflared/INGRESS_PLAN.md
  - docs/cloudflared/ports.json
  - infra/cloudflared/config.yml.template (ingress rules + catch-all http_status:404)
  - infra/cloudflared/ingress-map.yml (single source of truth)
  - scripts/scan_ports.py
  - scripts/gen_cloudflared_config.py

Auth rules:
- Public: landing page, checkout
- Access-protected: admin/crm/bot/nexus/grafana/n8n UI
- Service-token or HMAC: webhook endpoints (Twilio/lead sources)
- Tailnet-only: databases, redis, worker inference

Do not commit secrets. Create/update .env.example files. Generate PR-ready commits.
