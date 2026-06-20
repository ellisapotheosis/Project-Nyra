# Cloudflared Hostname Matrix

Updated: 2026-05-08

This is the human checklist for Cloudflare Zero Trust Public Hostnames and
Access applications. The machine-readable desired state lives in
`infra/cloudflare/desired-state/exposure-matrix.yml`.

## Pages Hostnames

These are Cloudflare Pages custom domains. Do not add them to any tunnel.

| Hostname             | Target                           | Access |
| -------------------- | -------------------------------- | ------ |
| `ratehunter.net`     | Cloudflare Pages landing project | Public |
| `www.ratehunter.net` | Cloudflare Pages landing project | Public |

## Oracle VPS Tunnel

The Oracle tunnel hosts durable app, auth, CRM, workflow, observability, Nexus,
LiteLLM, and service surfaces.

| Hostname                           | Service                            | Origin URL                  | Access policy                                        |
| ---------------------------------- | ---------------------------------- | --------------------------- | ---------------------------------------------------- |
| `app.projectnyra.com`              | Broker/customer webapp             | `http://webapp:3001`        | Access until app auth is production-ready            |
| `api.projectnyra.com`              | Self-hosted Supabase Kong/Auth/API | `http://supabase-kong:8000` | Public Supabase gateway, app/JWT controls            |
| `hooks.projectnyra.com`            | Webhook ingress                    | `http://n8n:5678`           | Signed webhook, provider allowlist, or service token |
| `twenty.projectnyra.com`           | Twenty CRM                         | `http://twenty:3000`        | Required                                             |
| `crm.projectnyra.com`              | Twenty CRM alias                   | `http://twenty:3000`        | Required                                             |
| `n8n.projectnyra.com`              | n8n UI                             | `http://n8n:5678`           | Required plus n8n auth                               |
| `gitea.projectnyra.com`            | Gitea UI                           | `http://gitea:3000`         | Required plus Gitea auth                             |
| `activepieces.projectnyra.com`     | Activepieces UI                    | `http://activepieces:80`    | Required                                             |
| `grafana.projectnyra.com`          | Grafana                            | `http://grafana:3000`       | Required                                             |
| `openlit.projectnyra.com`          | OpenLIT observability              | `http://openlit:3000`       | Owner-only                                           |
| `prometheus.projectnyra.com`       | Prometheus                         | `http://prometheus:9090`    | Owner-only                                           |
| `cadvisor.projectnyra.com`         | cAdvisor                           | `http://cadvisor:8080`      | Owner-only                                           |
| `openwebui.projectnyra.com`        | Open WebUI                         | `http://openwebui:8080`     | Required                                             |
| `nexus.projectnyra.com`            | Nexus UI                           | `http://nexus-ui:3016`      | Required                                             |
| `nexus-router.projectnyra.com`     | Nexus Router API/MCP               | `http://nexus:3000`         | Cloudflare Access service token preferred            |
| `litellm.projectnyra.com`          | LiteLLM                            | `http://litellm:4000`       | Owner-only                                           |
| `paperclip.projectnyra.com`        | Paperclip UI                       | `http://paperclip:3100`     | Required; confirm service health first               |
| `clawteam.projectnyra.com`         | ClawTeam UI                        | `http://clawteam:8080`      | Required; optional overlay must be running           |
| `portainer-oracle.projectnyra.com` | Oracle Portainer                   | `https://portainer:9443`    | Owner-only, no TLS verify                            |
| `git-ssh.projectnyra.com`          | Gitea SSH                          | `ssh://gitea:2222`          | Optional Access SSH only                             |

## Orchestrator Tunnel

The active orchestrator connector currently runs from local Docker on
`AlienApoth51`; the real `orchestrator.trex-fiordland.ts.net:2223` SSH target was
not reachable during the last runtime check.

| Hostname                           | Service                                    | Origin URL                          | Access policy |
| ---------------------------------- | ------------------------------------------ | ----------------------------------- | ------------- |
| `links.projectnyra.com`            | Home Assistant Green Linkwarden/Starwarden | `http://100.64.0.2:3007`            | Required      |
| `linkwarden.projectnyra.com`       | Existing Linkwarden alias                  | `http://100.64.0.2:3007`            | Required      |
| `openclaw-gateway.projectnyra.com` | OpenClaw Gateway                           | `http://nyra-openclaw-gateway:8001` | Required      |

## MCP Exposure Policy

Default policy: do not create direct browser-public MCP hostnames. Agents should
use Nexus first.

Preferred external entrypoint if needed:

| Hostname                       | Service                         | Origin URL          | Access policy                   |
| ------------------------------ | ------------------------------- | ------------------- | ------------------------------- |
| `nexus-router.projectnyra.com` | Nexus Router MCP/API aggregator | `http://nexus:3000` | Cloudflare Access service token |

Direct MCP hostnames are allowed only when explicitly needed and protected by
Cloudflare Access service-token policies. Candidate origins are listed in
`infra/cloudflare/desired-state/exposure-matrix.yml`.

## Tailscale-Only (Split DNS)

These services are **not** exposed via Cloudflare. Accessible only within the Tailscale
tailnet via MagicDNS (`*.trex-fiordland.ts.net`) and via Tailscale Split DNS
(`*.projectnyra.com` resolved privately — no public DNS, no Cloudflare tunnel).

Each service runs as its own Tailscale node (Docker sidecar) to get a unique ts.net hostname.

| MagicDNS Hostname                          | Split DNS Hostname                  | Service                    | Port | Notes                                 |
| ------------------------------------------ | ----------------------------------- | -------------------------- | ---- | ------------------------------------- |
| `spline-mcp.trex-fiordland.ts.net`         | `spline-mcp.projectnyra.com`        | Spline 3D design MCP       | 8779 | Tailscale sidecar; not Cloudflare     |
| `meshy-mcp.trex-fiordland.ts.net`          | `meshy-mcp.projectnyra.com`         | Meshy AI 3D generation MCP | 8780 | Tailscale sidecar; not Cloudflare     |
| `loki-website-mcp.trex-fiordland.ts.net`   | `loki-website-mcp.projectnyra.com`  | Loki website builder MCP   | 8781 | Not Grafana Loki; not Cloudflare      |

Setup instructions: `docs/network/TAILSCALE-SERVICES.md`

## Do Not Publish

Do not create public hostnames for these origins:

- Postgres, Supabase Postgres, Twenty DB, or any other database.
- Redis, FalkorDB, Qdrant, Loki, or other data/backing stores.
- Worker vLLM and Ollama ports.
- Docker socket or Docker API.
- Node exporter, GPU exporter, and raw `/metrics` endpoints.
- Raw MCP endpoints unless they are deliberately service-token gated.
