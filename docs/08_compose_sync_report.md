# 08 Compose Sync Report

## Canonical compose
- `infra/docker-compose.yml` is the selected runtime baseline.

## Missing/wiring gaps
- Services with folders but not represented directly in canonical compose include:
  - `auth-service`, `doc-management-api`, `lead-capture-api`, `quote-api`, `quote-engine`,
    `rate-comparison-engine`, `ratehunter-api`, `security-service`, `twilio-integration`,
    `sendgrid-integration`, `websocket-hub`.

## Misconfiguration found
- Host port conflict risk: `ACTIVEPIECES_PORT=8082` and `TWENTYCRM_MCP_PORT=8082`.
- Healthcheck coverage missing for multiple HTTP services.
- Cloudflared env naming drift (`CF_TUNNEL_TOKEN` vs `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`).

## Fixes implemented in this patch
- Canonical env now sets `TWENTYCRM_MCP_PORT=8182` in `infra/.env.example`.
- Added stack verification scripts and wired `make health`.
- Added cloudflared template under `infra/cloudflared/config.yml`.

## How to verify
```bash
rg -n 'TWENTYCRM_MCP_PORT|ACTIVEPIECES_PORT' infra/.env.example infra/docker-compose.yml
make -n health
```
