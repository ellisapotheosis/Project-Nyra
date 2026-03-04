# 02 Ports Registry (SSOT)

| Port | Service | Protocol | Health endpoint | Exposure | Hostname/Subdomain | Cloudflared ingress rule | Notes |
|---:|---|---|---|---|---|---|---|
| 7000 | nexus-router | http | `/health` | Public via tunnel | `mcp.${NYRA_DOMAIN_ROOT}` | `- hostname: mcp.${NYRA_DOMAIN_ROOT}\n  service: http://nexus-router:7000` | Primary API ingress |
| 4000 | litellm | http | `/health` | Public optional | `api.${NYRA_DOMAIN_ROOT}` | `- hostname: api.${NYRA_DOMAIN_ROOT}\n  service: http://litellm:4000` | Prefer private behind Nexus |
| 5678 | n8n | http | `/` | Public (Access-gated) | `n8n.${NYRA_DOMAIN_ROOT}` | `- hostname: n8n.${NYRA_DOMAIN_ROOT}\n  service: http://n8n:5678` | External webhooks |
| 3030 | moltbot-web | http | `/` | Public optional | `chat.${NYRA_DOMAIN_ROOT}` | `- hostname: chat.${NYRA_DOMAIN_ROOT}\n  service: http://moltbot-web:3030` | End-user chat |
| 3003 | grafana | http | `/api/health` | Private preferred | `grafana.${NYRA_DOMAIN_ROOT}` | `- hostname: grafana.${NYRA_DOMAIN_ROOT}\n  service: http://grafana:3000` | Require Cloudflare Access |
| 8080 | nexus-mcp | http | `/health` | Private | *(blank)* | *(blank)* | Internal MCP port |
| 8082 | activepieces | http | `/` | Private | *(blank)* | *(blank)* | Keep internal |
| 8182 | twentycrm-mcp | http | `/` | Private | *(blank)* | *(blank)* | changed from 8082 to avoid conflict |
| 3000 | twentycrm | http | `/` | Private | *(blank)* | *(blank)* | Internal CRM |
| 5432 | postgres | tcp | `pg_isready` | Private | *(blank)* | *(blank)* | Never public |
| 6379 | redis | tcp | `redis ping` | Private | *(blank)* | *(blank)* | Never public |
| 27017 | mongo | tcp | `db.ping` | Private | *(blank)* | *(blank)* | Never public |
| 9090 | prometheus | http | `/-/healthy` | Private | *(blank)* | *(blank)* | Scrape target |
| 3100 | loki | http | `/ready` | Private | *(blank)* | *(blank)* | Logs backend |
| 11434 | worker-3060 ollama | http | `/api/tags` | Private (tailscale) | *(blank)* | *(blank)* | Worker endpoint |
| 8000 | worker-3090ti vllm | http | `/health` | Private (tailscale) | *(blank)* | *(blank)* | Worker endpoint |
| 8001 | worker-5090 vllm | http | `/health` | Private (tailscale) | *(blank)* | *(blank)* | Worker endpoint |

## How to verify
```bash
docker compose -f infra/docker-compose.yml config | rg 'ports:' -n
```
