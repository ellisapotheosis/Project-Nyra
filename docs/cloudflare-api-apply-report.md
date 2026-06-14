# Cloudflare API Apply Report

Updated: 2026-05-17

Cloudflare API apply was run from this workspace using Infisical `/shared`
Cloudflare credentials. The apply targeted the `projectnyra.com` zone:

- Zone ID: `e745a08b7f4be9fd97363b80fcdf0551`
- Zone status at apply time: `pending`

Applied successfully:

- Updated the orchestrator Cloudflare Tunnel ingress config.
- Updated the Oracle VPS Cloudflare Tunnel ingress config.
- Upserted 22 proxied CNAME records under `projectnyra.com`.
- Confirmed DNS now contains the expected platform/admin service records.

Applied tunnel hostnames:

- Orchestrator tunnel: `links.projectnyra.com`, `linkwarden.projectnyra.com`,
  `openclaw-gateway.projectnyra.com`
- Oracle tunnel: `app.projectnyra.com`, `api.projectnyra.com`,
  `hooks.projectnyra.com`, `twenty.projectnyra.com`, `crm.projectnyra.com`,
  `n8n.projectnyra.com`, `gitea.projectnyra.com`,
  `activepieces.projectnyra.com`, `grafana.projectnyra.com`,
  `prometheus.projectnyra.com`, `cadvisor.projectnyra.com`,
  `openwebui.projectnyra.com`, `nexus.projectnyra.com`,
  `nexus-router.projectnyra.com`, `litellm.projectnyra.com`,
  `paperclip.projectnyra.com`, `clawteam.projectnyra.com`,
  `portainer-oracle.projectnyra.com`, `git-ssh.projectnyra.com`

DNS result:

- `dns_total`: 22
- `dns_successes`: 22
- `dns_failures`: 0

Access app result:

- Attempted to create/update 15 Cloudflare Access self-hosted applications for
  protected `projectnyra.com` hostnames.
- Cloudflare rejected all 15 with `domain does not belong to zone`.
- This is consistent with the zone still being `pending`; rerun
  `bash infra/cloudflare/apply-access-apps.sh` after the zone is active.

RateHunter policy:

- `ratehunter.net` remains apex-only landing/Page guidance.
- No platform, API, MCP, admin UI, worker, or tunnel hostname should use a
  `ratehunter.net` subdomain.
