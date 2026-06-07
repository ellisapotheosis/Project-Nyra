# Nyra Status Bridge

Local scaffold: `services/status-bridge/`. Compose overlay: `infra/hosts/orchestrator/docker-compose.status-bridge.yml`.

Endpoints:

- `GET /health` public liveness
- `GET /api/status` token required
- `GET /api/status/services` token required
- `GET /api/status/hosts` token required
- `GET /api/status/tunnels` token required
- `GET /api/status/workers` token required

Set `NYRA_STATUS_BRIDGE_TOKEN` before exposing any non-health endpoint. Bind to tailnet/local or protect with Cloudflare Access.
