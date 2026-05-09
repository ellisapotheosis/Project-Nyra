# Cloudflared Hostname Matrix

Updated: 2026-05-08

This is the human checklist for Cloudflare Zero Trust Public Hostnames and
Access applications. The machine-readable desired state lives in
`infra/cloudflare/desired-state/exposure-matrix.yml`.

## Pages Hostnames

These are Cloudflare Pages custom domains. Do not add them to any tunnel.

| Hostname | Target | Access |
|---|---|---|
| `ratehunter.net` | Cloudflare Pages landing project | Public |
| `www.ratehunter.net` | Cloudflare Pages landing project | Public |

## Oracle VPS Tunnel

The Oracle tunnel hosts durable app, auth, CRM, workflow, observability, Nexus,
LiteLLM, and service surfaces.

| Hostname | Service | Origin URL | Access policy |
|---|---|---|---|
| `nyra.ratehunter.net` | Broker/customer webapp | `http://webapp:3001` | Access until app auth is production-ready |
| `api.ratehunter.net` | Self-hosted Supabase Kong/Auth/API | `http://supabase-kong:8000` | Public Supabase gateway, app/JWT controls |
| `hooks.ratehunter.net` | Webhook ingress | `http://n8n:5678` | Signed webhook, provider allowlist, or service token |
| `twenty.ratehunter.net` | Twenty CRM | `http://twenty:3000` | Required |
| `crm.ratehunter.net` | Twenty CRM alias | `http://twenty:3000` | Required |
| `n8n.ratehunter.net` | n8n UI | `http://n8n:5678` | Required plus n8n auth |
| `gitea.ratehunter.net` | Gitea UI | `http://gitea:3000` | Required plus Gitea auth |
| `activepieces.ratehunter.net` | Activepieces UI | `http://activepieces:80` | Required |
| `grafana.ratehunter.net` | Grafana | `http://grafana:3000` | Required |
| `prometheus.ratehunter.net` | Prometheus | `http://prometheus:9090` | Owner-only |
| `cadvisor.ratehunter.net` | cAdvisor | `http://cadvisor:8080` | Owner-only |
| `openwebui.ratehunter.net` | Open WebUI | `http://openwebui:8080` | Required |
| `nexus.ratehunter.net` | Nexus UI | `http://nexus-ui:3016` | Required |
| `nexus-router.ratehunter.net` | Nexus Router API/MCP | `http://nexus:3000` | Service token preferred |
| `litellm.ratehunter.net` | LiteLLM | `http://litellm:4000` | Owner-only |
| `paperclip.ratehunter.net` | Paperclip UI | `http://paperclip:3100` | Required; confirm service health first |
| `clawteam.ratehunter.net` | ClawTeam UI | `http://clawteam:8080` | Required; optional overlay must be running |
| `portainer-oracle.ratehunter.net` | Oracle Portainer | `https://portainer:9443` | Owner-only, no TLS verify |
| `git-ssh.ratehunter.net` | Gitea SSH | `ssh://gitea:2222` | Optional Access SSH only |

## Orchestrator Tunnel

The active orchestrator connector currently runs from local Docker on
`AlienApoth51`; the real `orchestrator.trex-fiordland.ts.net:2223` SSH target was
not reachable during the last runtime check.

| Hostname | Service | Origin URL | Access policy |
|---|---|---|---|
| `links.ratehunter.net` | Home Assistant Green Linkwarden/Starwarden | `http://100.64.0.2:3007` | Required |
| `linkwarden.ratehunter.net` | Existing Linkwarden alias | `http://100.64.0.2:3007` | Required |
| `openclaw-gateway.ratehunter.net` | OpenClaw Gateway | `http://nyra-openclaw-gateway:8001` | Required |

## MCP Exposure Policy

Default policy: do not create direct browser-public MCP hostnames. Agents should
use Nexus first.

Preferred external entrypoint if needed:

| Hostname | Service | Origin URL | Access policy |
|---|---|---|---|
| `nexus-router.ratehunter.net` | Nexus Router MCP/API aggregator | `http://nexus:3000` | Cloudflare Access service token |

Direct MCP hostnames are allowed only when explicitly needed and protected by
Cloudflare Access service-token policies. Candidate origins are listed in
`infra/cloudflare/desired-state/exposure-matrix.yml`.

## Do Not Publish

Do not create public hostnames for these origins:

- Postgres, Supabase Postgres, Twenty DB, or any other database.
- Redis, FalkorDB, Qdrant, Loki, or other data/backing stores.
- Worker vLLM and Ollama ports.
- Docker socket or Docker API.
- Node exporter, GPU exporter, and raw `/metrics` endpoints.
- Raw MCP endpoints unless they are deliberately service-token gated.
