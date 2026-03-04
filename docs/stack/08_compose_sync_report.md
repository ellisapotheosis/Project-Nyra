# 08 - Compose Sync Report

## Agent A findings: apps/services/infra vs canonical compose

### Included in canonical runtime (`infra/docker-compose.yml`)
- Core: postgres, redis, mongo
- Gateway: litellm, nexus-router
- Workflow: n8n, activepieces
- CRM: twentycrm, twentycrm-mcp
- Apps: archon-os, moltbot-web, openwebui
- Observability: prometheus, loki, grafana
- Edge: cloudflared
- Worker profiles: ollama/vllm lanes

### Missing compose wiring for active folders
These directories exist but are not represented as direct services in canonical compose:
- `/apps`: `claude-flow-dashboard`, `nexus-dashboard`, `web` subapps (except indirectly via other stack files)
- `/services`: `auth-service`, `doc-management-api`, `lead-capture-api`, `nyra-orchestrator`, `quote-api`, `quote-engine`, `rate-comparison-engine`, `ratehunter-api`, `security-service`, `twilio-integration`, `sendgrid-integration`, `websocket-hub`.

### Misconfiguration / drift detected
1. **Port collision**: `ACTIVEPIECES_PORT` and `TWENTYCRM_MCP_PORT` both default `8082`.
2. **Compose health coverage gap**: most app containers lack healthchecks (n8n, litellm, openwebui, twentycrm, etc.).
3. **Cloudflared drift**: two tunnel definitions (`infra/docker-compose.yml` and `infra/compose/docker-compose.cloudflared.yml`) with different token/env expectations.
4. **Landing deploy doc mismatch**: `apps/landing/ratehunter-landing/CLOUDFLARE-DEPLOY.md` mentions `wrangler.toml`, file missing.

## Recommended next sync actions
- Add `infra/compose/docker-compose.apps-services.yml` for missing services and wire with profiles.
- Add healthcheck blocks to every HTTP service.
- Standardize cloudflared on one compose + one env naming convention.
- Reserve unique host ports in `docs/stack/02_ports_registry.md` before adding services.
