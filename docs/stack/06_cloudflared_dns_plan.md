# 06 - Cloudflared Tunnels + DNS Plan

Updated: 2026-04-30

Current package: `docs/cloudflared/`

## Tunnel topology

- Oracle tunnel container exists in `infra/hosts/oracle-vps/docker-compose.yml` (`cloudflared` service) and currently runs token-managed.
- Orchestrator tunnel container exists at `infra/hosts/orchestrator/docker-compose.cloudflared.yml`.
- Local-managed tunnel templates for the current DNS plan live at:
  - `docs/cloudflared/cloudflared-oracle.yml`
  - `docs/cloudflared/cloudflared-worker-ui.yml`
- If using Cloudflare Web UI/dashboard-managed tunnels, recreate the routes from `docs/cloudflared/hostname-matrix.md` rather than expecting YAML sync.

## Recommended DNS/subdomain map

| Hostname                           | Target (internal)                              | Exposure                        |
| ---------------------------------- | ---------------------------------------------- | ------------------------------- |
| `app.projectnyra.com`              | `webapp:3001`                                  | Access-gated app                |
| `ratehunter.net`, `ratehunter.net` | Cloudflare Pages                               | public marketing                |
| `crm.projectnyra.com`              | `twenty:3000`                                  | Access-gated CRM                |
| `n8n.projectnyra.com`              | `n8n:5678`                                     | Access-gated workflows/webhooks |
| `activepieces.projectnyra.com`     | `activepieces:80`                              | Access-gated workflows          |
| `nexus.projectnyra.com`            | `nexus:3000`                                   | Access-gated AI/MCP gateway     |
| `grafana.projectnyra.com`          | `grafana:3000`                                 | Access-gated observability      |
| `paperclip.projectnyra.com`        | `paperclip:3100`                               | Access-gated document UI        |
| `nerve-5090.projectnyra.com`       | `worker-rtx5090.trex-fiordland.ts.net:18789`   | Access-gated worker UI          |
| `nerve-3090.projectnyra.com`       | `worker-rtx3090ti.trex-fiordland.ts.net:18789` | Access-gated worker UI          |

## Implementation defaults

- Keep Oracle as the primary always-on tunnel host.
- Keep worker inference endpoints off public DNS; route through Tailscale from Oracle/orchestrator.
- Use Cloudflare Access policies for n8n/grafana/admin routes.
- Keep local-managed tunnel configs ending with `http_status:404`.
