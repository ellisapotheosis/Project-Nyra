# Cloudflared Setup Package

Updated: 2026-04-30

This folder is the current owner-facing package for setting up Project Nyra
Cloudflare Tunnel hostnames for `projectnyra.com`; `ratehunter.net` is landing-only.

## Important Cloudflared Modes

Cloudflare supports two practical tunnel management styles:

- Dashboard-managed tunnel: configure Public Hostnames in the Cloudflare Zero
  Trust Web UI. Use `hostname-matrix.md` as the checklist.
- Locally-managed tunnel: run `cloudflared` with a YAML config file. Use the two
  YAML templates in this folder.

Dashboard-managed tunnels do not automatically sync from local YAML files. If
you use the Cloudflare Web UI, manually recreate the hostnames from
`hostname-matrix.md`.

## Files

| File                        | Purpose                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `hostname-matrix.md`        | Canonical hostname, origin, and Access policy matrix           |
| `cloudflared-oracle.yml`    | Main Oracle/local Docker-network tunnel template               |
| `cloudflared-worker-ui.yml` | Optional worker/orchestrator UI tunnel template over Tailscale |
| `webui-public-hostnames.md` | Step-by-step Cloudflare Web UI entry list                      |
| `validation.md`             | Validation and drift checks                                    |

## Public Entry Points

| Hostname              | Role                           |
| --------------------- | ------------------------------ |
| `ratehunter.net`      | Cloudflare Pages landing site  |
| `ratehunter.net`      | Cloudflare Pages landing alias |
| `app.projectnyra.com` | Project Nyra webapp            |
| `crm.projectnyra.com` | Twenty CRM                     |

All other hostnames in this package should be Cloudflare Access-gated unless a
future product decision explicitly makes them public.

## Security Rules

- Do not publish Postgres, Redis, FalkorDB, Qdrant, worker vLLM, worker Ollama,
  exporter ports, or raw voice/media ports.
- Every non-marketing hostname must have a Cloudflare Access policy.
- Local-managed tunnel YAML must end with `service: http_status:404`.
- Use the WebApp for business workflows: `WebApp -> CRM API -> Twenty CRM`.
- Use Nexus Router for AI/tool routing: `WebApp -> Nexus Router -> model/tool backends`.

## Official References

- Cloudflare Tunnel config files:
  https://developers.cloudflare.com/tunnel/advanced/local-management/configuration-file/
- Cloudflare Tunnel configuration:
  https://developers.cloudflare.com/tunnel/configuration/
