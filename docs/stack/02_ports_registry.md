# 02 - Ports Registry (SSOT)

| Port | Service | Compose source | Public/Private | Notes |
|---:|---|---|---|---|
| 3000 | twentycrm | `infra/docker-compose.yml` | private | CRM UI/API |
| 3003 | grafana | `infra/docker-compose.yml` | private (optional public) | observability UI |
| 3030 | moltbot-web | `infra/docker-compose.yml` | public candidate | Openclaw UI |
| 3100 | loki | `infra/docker-compose.yml` | private | logs backend |
| 4000 | litellm | `infra/docker-compose.yml` | private | LLM proxy |
| 5432 | postgres | `infra/docker-compose.yml` | private | primary DB |
| 5436 | ruvector-postgres | `infra/docker-compose.yml` | private | vector DB |
| 5678 | n8n | `infra/docker-compose.yml` | public (auth+WAF) | workflow webhooks |
| 6379 | redis | `infra/docker-compose.yml` | private | cache |
| 7000 | nexus-router | `infra/docker-compose.yml` | public via tunnel only | primary API gateway |
| 8080 | nexus MCP | `infra/docker-compose.yml` | public via tunnel only | MCP aggregation |
| 8082 | activepieces / twentycrm-mcp | `infra/docker-compose.yml` | private | **collision risk** (same default host port) |
| 8088 | openwebui | `infra/docker-compose.yml` | private | internal chat ui |
| 9001 | archon-os | `infra/docker-compose.yml` | private | archon service |
| 9090 | prometheus | `infra/docker-compose.yml` | private | metrics |
| 9091 | nexus metrics | `infra/docker-compose.yml` | private | scrape endpoint |
| 11434 | worker-3060 ollama | `infra/docker-compose.yml` | private (tailscale) | worker inference |
| 8000 | worker-3090ti vllm | `infra/docker-compose.yml` | private (tailscale) | worker inference |
| 8001 | worker-5090 vllm | `infra/docker-compose.yml` | private (tailscale) | worker inference |

## Port conflict fixes required
1. `ACTIVEPIECES_PORT` and `TWENTYCRM_MCP_PORT` both default to `8082`.
   - Default recommendation: keep Activepieces `8082`, move TwentyCRM MCP to `8182` in env and docs.
