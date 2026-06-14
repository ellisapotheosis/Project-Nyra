# Infra And Observability Pass

## Infra Inventory

- Docker Compose CLI is available: `Docker Compose version v5.1.3`.
- Host-scoped compose inventory found 65 compose files under `infra/hosts/`.
- Canonical active source remains `infra/hosts/<host-name>/`.

## Observability/Health Inventory

Observed health endpoints or health tests in:

- `services/crm-api/src/server.ts`: `/health`
- `services/status-bridge/src/server.js`: `/health`
- `services/nexus-router/src/index.ts` and tests: `/health`, `/health/ready`, `/health/live`
- `services/twenty-crm-mcp-server/index.js`: `/health`
- `services/twenty-mcp-jezweb/src/http-server.ts`: `/health`
- `services/lead-capture-api/src/server.js`: `/health`
- `services/gitea-mcp/server.js`: `/health`

## Prompt-Pack Gap

The prompt pack expects a broad smoke/release matrix. Current local evidence is strong for app builds and core TypeScript service tests, but live endpoint smoke checks still require running stacks or authenticated Cloudflare/Tailscale contexts.

## Follow-Up

- Keep adding `/health` or `/ready` endpoints to new services as they move from package logic to runtime HTTP services.
- Add smoke scripts that call service endpoints through local docker compose when stacks are running.
- Mirror owner-only Cloudflare/Tailscale smoke steps into `docs/OWNER_MANUAL_ACTIONS.md` when credentials or dashboards are required.
