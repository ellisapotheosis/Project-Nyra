# 19 Cloud Offload Recommendations

## Keep local/private
- Datastores (Postgres, Redis, Mongo, FalkorDB).
- Worker GPU inference endpoints (Ollama/vLLM).
- MCP ports and internal control APIs.

## Offload to Cloudflare edge (with Access)
- Gitea web UI
- Infisical UI/API
- Archon UI
- n8n and Activepieces operator UIs
- Twenty CRM UI
- Grafana
- Open WebUI

## Public surface (no Access)
- Marketing landing only (Cloudflare Pages).

## Drift controls
1. Block PRs that add datastore service names under `infra/cloudflared/config.yml` ingress.
2. Require final `http_status:404` route.
3. Require matching entry between `docs/02_ports_registry.md` and `infra/cloudflared/hostname-map.md` for new hostname routes.
