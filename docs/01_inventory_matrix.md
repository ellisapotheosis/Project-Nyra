# 01 Inventory Matrix

## Canonical runtime matrix (`infra/docker-compose.yml`)

| Name | Path | Compose service | Image/Build | Ports | Health URL | Env keys (required) | Exposure | Notes |
|---|---|---|---|---|---|---|---|---|
| Postgres | infra | postgres | `postgres:16-alpine` | 5432 | `pg_isready` | `POSTGRES_PASSWORD` | Private | Core DB |
| Redis | infra | redis | `redis:7-alpine` | 6379 | `redis ping` | `REDIS_PASSWORD` | Private | Cache/session |
| Mongo | infra | mongo | `mongo:7` | 27017 | `db.ping` | `MONGO_ROOT_PASSWORD` | Private | Doc store |
| LiteLLM | infra/configs/litellm | litellm | `ghcr.io/berriai/litellm` | 4000 | `/health` | `LITELLM_MASTER_KEY` | Private | LLM proxy |
| Nexus Router | services/nexus-router | nexus-router | Docker build | 7000, 8080, 9091 | `/health` | `REDIS_PASSWORD` | Public via tunnel | MCP + LLM gateway |
| n8n | infra/n8n-workflows | n8n | Docker build | 5678 | `/` | `N8N_ENCRYPTION_KEY` | Public (gated) | Webhook automation |
| Activepieces | services/activepieces-flows | activepieces | `activepieces/activepieces` | 8082 | `/` | `ACTIVEPIECES_JWT_SECRET`, `ACTIVEPIECES_ENCRYPTION_KEY` | Private | Workflow builder |
| TwentyCRM | services/twentycrm-integration | twentycrm | `twentycrm/twenty` | 3000 | `/` | `TWENTY_ENCRYPTION_SECRET`, `TWENTY_JWT_SECRET` | Private | CRM system of record |
| Archon | services/archon-os | archon-os | Docker build | 9001 | `/` | `POSTGRES_PASSWORD`, `REDIS_PASSWORD` | Private | Agent runtime |
| Moltbot/OpenClaw | infra/openclaw | moltbot-web | `ghcr.io/openclaw/moltbot-web` | 3030 | `/` | none hard-required | Public candidate | Chat UI |
| OpenWebUI | infra | openwebui | `ghcr.io/open-webui/open-webui` | 8088 | `/` | `NEXUS_ADMIN_TOKEN` | Private | Internal chat UI |
| Cloudflared | infra/compose | cloudflared | `cloudflare/cloudflared` | n/a | tunnel info | `CF_TUNNEL_TOKEN` | Public edge | Zero trust ingress |
| Worker 3060 | infra/workers/worker-3060 | worker-3060-ollama | `ollama/ollama` | 11434 | `/api/tags` | none | Private (tailscale) | Small model lane |
| Worker 3090ti | infra/workers/worker-3090 | worker-3090ti-vllm | `vllm/vllm-openai` | 8000 | `/health` | model var optional | Private (tailscale) | Medium lane |
| Worker 5090 | infra/workers/worker-5090 | worker-5090-vllm | `vllm/vllm-openai` | 8001 | `/health` | model var optional | Private (tailscale) | Large model lane |

## How to verify
```bash
python - <<'PY'
import yaml
obj=yaml.safe_load(open('infra/docker-compose.yml'))
print(sorted(obj['services'].keys()))
PY
```
