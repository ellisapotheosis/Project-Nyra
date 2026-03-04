# 01 - Inventory Matrix

## Agent handoff summary
- **Agent A (Inventory + Compose Sync)** executed via repo scans over `/apps`, `/services`, `/infra`, plus compose parsing.

## Runtime matrix (current canonical compose: `infra/docker-compose.yml`)

| Unit | Type | Dockerized? | Compose wired? | Ports | Key envs (required) | Healthcheck | Exposure | Owner folder |
|---|---|---:|---:|---|---|---:|---|---|
| postgres | service | yes | yes | 5432 | `POSTGRES_PASSWORD` | yes | private | `infra/` |
| redis | service | yes | yes | 6379 | `REDIS_PASSWORD` | yes | private | `infra/` |
| mongo | service | yes | yes | 27017 | `MONGO_ROOT_PASSWORD` | yes | private | `infra/` |
| litellm | service | yes | yes | 4000 | `LITELLM_MASTER_KEY` | no | private | `infra/configs/litellm` |
| nexus-router | service | yes | yes | 7000/8080/9091 | `REDIS_PASSWORD` | yes | public edge entrypoint | `services/nexus-router` |
| n8n | app/service | yes | yes | 5678 | `N8N_ENCRYPTION_KEY` | no | public (auth-gated) | `infra/n8n-workflows` |
| activepieces | app/service | yes | yes | 8082 | `ACTIVEPIECES_JWT_SECRET`, `ACTIVEPIECES_ENCRYPTION_KEY` | no | private | `services/activepieces-flows` |
| twentycrm | app | yes | yes | 3000 | `TWENTY_ENCRYPTION_SECRET`, `TWENTY_JWT_SECRET`, `TWENTY_PASSWORD_SALT` | no | private | `services/twentycrm-integration` |
| twentycrm-mcp | service | yes | yes | 8082 (collision risk) | none hard-required | no | private | `infra/` |
| archon-os | app | yes | yes | 9001 | `POSTGRES_PASSWORD`, `REDIS_PASSWORD` | no | private | `services/archon-os` |
| moltbot-web (Openclaw UI) | app | image-only | yes | 3030 | optional only | no | public candidate | `infra/openclaw` |
| openwebui | app | image-only | yes | 8088 | `NEXUS_ADMIN_TOKEN` (recommended) | no | private | `infra/` |
| prometheus/loki/grafana | observability | yes | yes | 9090/3100/3003 | `GRAFANA_ADMIN_PASSWORD` | partial | private (grafana optionally public) | `infra/configs` |
| cloudflared | edge | yes | yes | none | `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` | no | public tunnel broker | `infra/compose` |
| worker-3060-ollama | worker | yes | yes(profile) | 11434 | none | no | private (tailscale) | `infra/workers/worker-3060` |
| worker-3090ti-vllm | worker | yes | yes(profile) | 8000 | model var optional | no | private (tailscale) | `infra/workers/worker-3090` |
| worker-5090-vllm | worker | yes | yes(profile) | 8001->8000 | model var optional | no | private (tailscale) | `infra/workers/worker-5090` |
| ruvector-postgres | service | yes | yes | 5436 | `RUVECTOR_POSTGRES_PASSWORD` | yes | private | `infra/ruvector` |

## Initial directory inventory
- `/apps`: `claude-flow-dashboard`, `ingestion`, `landing`, `nexus-dashboard`, `shared`, `utilities`, `web`.
- `/services`: 36 service folders discovered (auth, campaign-engine, litellm-proxy, nexus-router, nyra-orchestrator, etc.).
- `/infra`: compose/config/worker/cloud and multiple legacy scaffolds.
- `/_archived`: **missing** at repo root; nearest archived tree is `infra-archived/infra-20260206-1551`.

## Evidence commands
- `find apps/services/infra -mindepth 1 -maxdepth 1 -type d`
- `python` parse of `infra/docker-compose.yml` services/profiles/ports/healthcheck.
