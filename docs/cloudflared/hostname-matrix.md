# Cloudflared Hostname Matrix

Updated: 2026-05-28

This is the human checklist for Cloudflare Zero Trust Public Hostnames and
Access applications. The machine-readable desired state lives in
`infra/cloudflare/desired-state/exposure-matrix.yml`.

## Pages Hostnames

These are Cloudflare Pages custom domains. Do not add them to any tunnel.

| Hostname             | Target                           | Access |
| -------------------- | -------------------------------- | ------ |
| `ratehunter.net`     | Cloudflare Pages landing project | Public |
| `www.ratehunter.net` | Cloudflare Pages landing alias   | Public |

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
| `gastown.projectnyra.com`          | Gastown UI                         | `http://gastown:8080`       | Required; confirm service health first               |
| `clawteam.projectnyra.com`         | ClawTeam UI                        | `http://clawteam:8080`      | Required; optional overlay must be running           |
| `portainer-oracle.projectnyra.com` | Oracle Portainer                   | `https://portainer:9443`    | Owner-only, no TLS verify                            |
| `git-ssh.projectnyra.com`          | Gitea SSH                          | `ssh://gitea:2222`          | Optional Access SSH only                             |
| `uptime.projectnyra.com`           | Uptime Kuma monitoring             | `http://nyra-uptime-kuma:3001` | Required                                          |
| `public-status.projectnyra.com`    | Public status page (uptime alias)  | `http://nyra-uptime-kuma:3001` | Public                                            |
| `oracle.projectnyra.com`           | Oracle VPS Caddy gateway           | `http://nyra-caddy:80`      | Public entry / fallback router                       |

## Orchestrator Tunnel

The orchestrator tunnel proxies control-plane services, orchestrator-local
containers, and all worker UIs over Tailscale.

| Hostname                           | Service                                    | Origin URL                                              | Access policy         |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------- | --------------------- |
| `links.projectnyra.com`            | HA Green Linkwarden/Starwarden             | `http://100.64.0.2:3007`                                | Required              |
| `linkwarden.projectnyra.com`       | Existing Linkwarden alias                  | `http://100.64.0.2:3007`                                | Required              |
| `ha.projectnyra.com`               | Home Assistant                             | `http://homeassistant.trex-fiordland.ts.net:8123`       | Required              |
| `portainer.projectnyra.com`        | Orchestrator Portainer                     | `https://nyra-portainer:9443`                           | Owner-only, no TLS verify |
| `litellm.projectnyra.com`          | LiteLLM (via Tailscale)                    | `http://oracle.trex-fiordland.ts.net:4000`              | Owner-only            |
| `nexus.projectnyra.com`            | Nexus Router (via Tailscale)               | `http://oracle.trex-fiordland.ts.net:6000`              | Required              |
| `nexus-router.projectnyra.com`     | Nexus Router API (via Tailscale)           | `http://oracle.trex-fiordland.ts.net:6000`              | Service token         |
| `letta.projectnyra.com`            | Letta (via Tailscale)                      | `http://oracle.trex-fiordland.ts.net:8283`              | Required              |
| `crm-ui.projectnyra.com`           | CRM UI (Twenty via Tailscale)              | `http://oracle.trex-fiordland.ts.net:3000`              | Required              |
| `openclaw-gateway.projectnyra.com` | OpenClaw Gateway                           | `http://nyra-openclaw-gateway:8001`                     | Required              |
| `router.openclaw.projectnyra.com`  | OpenClaw Router alias                      | `http://nyra-openclaw-gateway:8001`                     | Required              |
| `admin.projectnyra.com`            | Admin portal                               | `http://nyra-admin:3001`                                | Required              |
| `chat.projectnyra.com`             | Chat UI                                    | `http://nyra-chat-ui:3000`                              | Required              |
| `borrower-chat.projectnyra.com`    | Borrower-facing Chat UI                    | `http://nyra-borrower-chat:3002`                        | Required              |
| `campaigns.projectnyra.com`        | Campaign builder                           | `http://nyra-campaign-engine:3003`                      | Required              |
| `quotes.projectnyra.com`           | Quoting API                                | `http://nyra-quote-api:8000`                            | Required              |
| `status.projectnyra.com`           | Status / health dashboard                  | `http://nyra-uptime-kuma:3001`                          | Required              |
| `gastown.projectnyra.com`          | GasTown service                            | `http://nyra-gastown:7000`                              | Required              |
| `gasteam.projectnyra.com`          | GasTeam service                            | `http://nyra-gasteam:7001`                              | Required              |
| `nerve-5090.projectnyra.com`       | Worker RTX 5090 Nerve UI (mobile — may be offline) | `http://worker-rtx5090.trex-fiordland.ts.net:7860` | Required     |
| `claw-5090.projectnyra.com`        | Worker RTX 5090 Claw UI                    | `http://worker-rtx5090.trex-fiordland.ts.net:3000`      | Required              |
| `nerve-3090.projectnyra.com`       | Worker RTX 3090 Ti Nerve UI                | `http://worker-rtx3090ti.trex-fiordland.ts.net:7860`    | Required              |
| `claw-3090.projectnyra.com`        | Worker RTX 3090 Ti Claw UI                 | `http://worker-rtx3090ti.trex-fiordland.ts.net:3000`    | Required              |
| `nerve-3060.projectnyra.com`       | Worker RTX 3060 Nerve UI (always-on)       | `http://worker-rtx3060.trex-fiordland.ts.net:7860`      | Required              |
| `picoclaw-3060.projectnyra.com`    | Worker RTX 3060 PicoClaw UI (conditional)  | `http://worker-rtx3060.trex-fiordland.ts.net:3000`      | Required              |

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

## Do Not Publish

Do not create public hostnames for these origins:

- Postgres, Supabase Postgres, Twenty DB, or any other database.
- Redis, FalkorDB, Qdrant, Loki, or other data/backing stores.
- Worker vLLM and Ollama ports (11434, 8000, 4000 on worker hosts).
- Docker socket or Docker API.
- Node exporter, GPU exporter, and raw `/metrics` endpoints.
- Raw MCP endpoints unless they are deliberately service-token gated.
- Tailscale coordination endpoints.
