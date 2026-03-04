# 11 Public vs Private Exposure

## Public (Cloudflared)
- `mcp.${NYRA_DOMAIN_ROOT}` -> Nexus Router
- `api.${NYRA_DOMAIN_ROOT}` -> LiteLLM (optional)
- `n8n.${NYRA_DOMAIN_ROOT}` -> n8n webhook ingress
- `chat.${NYRA_DOMAIN_ROOT}` -> Moltbot/OpenClaw

## Private (Tailscale/internal only)
- Postgres, Redis, Mongo, Ruvector Postgres
- Worker inference endpoints (3060/3090ti/5090)
- OpenWebUI, TwentyCRM, Prometheus, Loki

## Rationale
- Limit public blast radius to gateway/chat/webhook ingress.
- Keep data stores and worker endpoints out of public routing.
- Enforce Access on all admin/operator surfaces.

## How to verify
```bash
sed -n '1,120p' docs/02_ports_registry.md
sed -n '1,120p' infra/cloudflared/config.yml
```
