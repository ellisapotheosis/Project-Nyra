# 18 UI Registry (Active Surfaces)

| UI Service | Source compose | Host port(s) | Access stance | Proposed hostname |
|---|---|---|---|---|
| `activepieces` | `infra/docker-compose.oracle.yml` | `3001` | Cloudflare Access required | `activepieces.nyra.example.com` |
| `archon-ui` | `docker-compose.archon.yml` | `3737` | Cloudflare Access required | `archon.nyra.example.com` |
| `gitea` | `docker-compose.gitea.yml` | `3100, 2222` | Cloudflare Access required | `gitea.nyra.example.com` |
| `grafana` | `infra/docker-compose.yml` | `3003` | Cloudflare Access required | `grafana.nyra.example.com` |
| `infisical` | `docker-compose.infisical.yml` | `3201` | Cloudflare Access required | `infisical.nyra.example.com` |
| `n8n` | `infra/docker-compose.yml` | `5678` | Cloudflare Access required | `n8n.nyra.example.com` |
| `twentycrm` | `infra/docker-compose.yml` | `3000` | Cloudflare Access required | `twentycrm.nyra.example.com` |

Marketing landing remains on Cloudflare Pages and is the only intended public unauthenticated surface.

## Exposure classes

- **Public (no Access):** marketing landing only.
- **Protected via Access:** operator UIs listed in the table.
- **Private-only:** internal APIs, datastores, MCP adapters, and worker runtimes.

## Change-control checklist for new UIs

1. Verify service is HTTP(S) and not datastore/queue.
2. Add hostname + ingress mapping with Access required.
3. Add DNS CNAME target to tunnel UUID.
4. Add rollback entry by removing hostname + DNS and re-validating ingress.

## Evidence pointers

- UI host/port declarations: `infra/docker-compose.yml`, `docker-compose.gitea.yml`, `docker-compose.infisical.yml`.
- Access-protected ingress list: `infra/cloudflared/config.yml`.
- DNS CNAME plan: `infra/cloudflared/hostname-map.md`.
- Active-only registry cross-check: `docs/02_ports_registry.md`.

## Monitoring recommendations

- Add uptime probes for each Access-protected hostname through authenticated checks.
- Alert on repeated 403/401 spikes to identify Access policy drift.
- Alert on unexpected 404 response volume to catch DNS/ingress mismatches.
- Track TLS/certificate expiry and Cloudflare tunnel health status per hostname.
