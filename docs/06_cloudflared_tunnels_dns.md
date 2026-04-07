# 06 Cloudflared Tunnels + DNS (`ratehunter.net`)

## Guardrails
- Tunnel only HTTP(S) app/admin surfaces.
- Do **not** tunnel datastores or raw MCP internals.
- `ratehunter.net` apex stays on Cloudflare Pages.

## Public hostnames (no Access policy by default)
- `nyra.ratehunter.net`
- `api.ratehunter.net`
- `hooks.ratehunter.net`

## Access-gated hostnames
- `gitea.ratehunter.net`
- `twenty.ratehunter.net`
- `activepieces.ratehunter.net`
- `n8n.ratehunter.net`
- `grafana.ratehunter.net`
- `archon.ratehunter.net`
- `bot.ratehunter.net`

## Config files
- `infra/cloudflared/config.orchestrator.yml`
- `infra/cloudflared/config.oracle.yml`
- `infra/cloudflared/docker-compose.cloudflared.orchestrator.yml`
- `infra/cloudflared/docker-compose.cloudflared.oracle.yml`

## DNS routing
Create proxied CNAMEs per hostname to the corresponding tunnel UUID endpoint:
- `<ORCHESTRATOR_TUNNEL_UUID>.cfargotunnel.com`
- `<ORACLE_TUNNEL_UUID>.cfargotunnel.com`

See `docs/operations/CLOUDFLARED_DNS_RECORDS.md` for exact mapping.
