# Cloudflared Hostname Matrix

Updated: 2026-04-30

Use this as the checklist when adding Public Hostnames in the Cloudflare Zero
Trust Web UI.

## Public Pages

These are Cloudflare Pages/DNS records, not local cloudflared YAML routes.

| Hostname | Target | Access |
|---|---|---|
| `ratehunter.net` | Cloudflare Pages landing project | Public |
| `www.ratehunter.net` | Cloudflare Pages landing project | Public |

## Oracle Tunnel Hostnames

| Hostname | Service | Origin URL | Access policy |
|---|---|---|---|
| `nyra.ratehunter.net` | WebApp | `http://webapp:3001` | Required |
| `crm.ratehunter.net` | Twenty CRM | `http://twenty:3000` | Required |
| `n8n.ratehunter.net` | n8n | `http://n8n:5678` | Required |
| `hooks.ratehunter.net` | n8n webhooks | `http://n8n:5678` | Required or provider allowlist |
| `activepieces.ratehunter.net` | Activepieces | `http://activepieces:80` | Required |
| `active.ratehunter.net` | Activepieces alias | `http://activepieces:80` | Required |
| `nexus.ratehunter.net` | Nexus Router | `http://nexus:3000` | Required |
| `openwebui.ratehunter.net` | Open WebUI | `http://openwebui:8080` | Required |
| `clawteam.ratehunter.net` | HKUDS/ClawTeam | `http://clawteam:8080` | Required |
| `paperclip.ratehunter.net` | Paperclip UI | `http://paperclip:3100` | Required |
| `crm-api.ratehunter.net` | CRM API | `http://crm-api:4001` | Required/API service token |
| `quote.ratehunter.net` | Quote API | `http://quote-api:7070` | Required/API service token |
| `quote-api.ratehunter.net` | Quote API alias | `http://quote-api:7070` | Required/API service token |
| `campaign.ratehunter.net` | Campaign engine | `http://campaign_engine:8020` | Required/API service token |
| `mem0.ratehunter.net` | Mem0 REST | `http://mem0-rest:5000` | Owner-only |
| `letta.ratehunter.net` | Letta | `http://letta:8283` | Owner-only |
| `memos.ratehunter.net` | memOS | `http://mem-os:8085` | Owner-only |
| `openmemory.ratehunter.net` | OpenMemory MCP | `http://openmemory-mcp:8765` | Owner-only |
| `crm-mcp.ratehunter.net` | Twenty MCP | `http://twenty-mcp:8400` | Owner-only |
| `infisical-mcp.ratehunter.net` | Infisical MCP | `http://infisical-mcp:8766` | Owner-only |
| `mempalace-mcp.ratehunter.net` | Mempalace MCP | `http://mempalace-mcp:8000` | Owner-only |
| `gitea-mcp.ratehunter.net` | Gitea MCP | `http://gitea-mcp:3101` | Owner-only |
| `paperclip-mcp.ratehunter.net` | Paperclip MCP | `http://paperclip-mcp:8767` | Owner-only |
| `gitea.ratehunter.net` | Gitea UI | `http://gitea:3000` | Required |
| `grafana.ratehunter.net` | Grafana | `http://grafana:3000` | Required |
| `prometheus.ratehunter.net` | Prometheus | `http://prometheus:9090` | Owner-only |
| `loki.ratehunter.net` | Loki | `http://loki:3100` | Owner-only |
| `cadvisor.ratehunter.net` | cAdvisor | `http://cadvisor:8080` | Owner-only |

## Worker/Orchestrator UI Hostnames

These are optional and should be placed in a separate tunnel or separate
Access application group.

| Hostname | Service | Origin URL | Access policy |
|---|---|---|---|
| `litellm.ratehunter.net` | Orchestrator LiteLLM | `http://orchestrator.trex-fiordland.ts.net:4000` | Owner-only |
| `openclaw.ratehunter.net` | Orchestrator OpenClaw Gateway | `http://orchestrator.trex-fiordland.ts.net:8001` | Required |
| `portainer.ratehunter.net` | Portainer | `https://orchestrator.trex-fiordland.ts.net:9443` | Owner-only |
| `prometheus-orch.ratehunter.net` | Orchestrator Prometheus | `http://orchestrator.trex-fiordland.ts.net:9090` | Owner-only |
| `grafana-orch.ratehunter.net` | Orchestrator Grafana | `http://orchestrator.trex-fiordland.ts.net:3003` | Owner-only |
| `loki-orch.ratehunter.net` | Orchestrator Loki | `http://orchestrator.trex-fiordland.ts.net:3100` | Owner-only |
| `cadvisor-orch.ratehunter.net` | Orchestrator cAdvisor | `http://orchestrator.trex-fiordland.ts.net:8081` | Owner-only |
| `openclaw-5090.ratehunter.net` | RTX 5090 OpenClaw | `http://worker-rtx5090.trex-fiordland.ts.net:8001` | Required |
| `nerve-5090.ratehunter.net` | RTX 5090 Nerve UI | `http://worker-rtx5090.trex-fiordland.ts.net:18789` | Required |
| `litellm-5090.ratehunter.net` | RTX 5090 LiteLLM | `http://worker-rtx5090.trex-fiordland.ts.net:4000` | Owner-only |
| `openclaw-3090.ratehunter.net` | RTX 3090 Ti OpenClaw | `http://worker-rtx3090ti.trex-fiordland.ts.net:8001` | Required |
| `nerve-3090.ratehunter.net` | RTX 3090 Ti Nerve UI | `http://worker-rtx3090ti.trex-fiordland.ts.net:18789` | Required |
| `litellm-3090.ratehunter.net` | RTX 3090 Ti LiteLLM | `http://worker-rtx3090ti.trex-fiordland.ts.net:4000` | Owner-only |
| `litellm-3060.ratehunter.net` | RTX 3060 LiteLLM | `http://worker-rtx3060.trex-fiordland.ts.net:4000` | Owner-only |

## Do Not Publish

Do not create public hostnames for these origins:

- Postgres, Redis, FalkorDB, Qdrant, or any database/cache/vector store.
- Worker vLLM and Ollama ports.
- Node exporter, GPU exporter, and raw metrics exporter ports.
- Raw Unmute voice/media transport ports.
- Gitea SSH unless using Cloudflare Access SSH with an explicit owner-approved
  procedure.
