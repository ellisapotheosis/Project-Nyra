# 06 Cloudflared Tunnels and DNS

## Template files
- `infra/cloudflared/config.yml`
- `infra/compose/docker-compose.cloudflared.yml`

## DNS map
- `mcp.${NYRA_DOMAIN_ROOT}` -> `nexus-router:7000`
- `api.${NYRA_DOMAIN_ROOT}` -> `litellm:4000`
- `n8n.${NYRA_DOMAIN_ROOT}` -> `n8n:5678`
- `chat.${NYRA_DOMAIN_ROOT}` -> `moltbot-web:3030`
- `grafana.${NYRA_DOMAIN_ROOT}` -> `grafana:3000` (Access-gated)

## Access policy recommendations
- Require Cloudflare Access for `n8n`, `grafana`, and admin surfaces.
- Never map database ports to public hostnames.

## How to verify
```bash
docker compose -f infra/compose/docker-compose.cloudflared.yml config
sed -n '1,120p' infra/cloudflared/config.yml
```
