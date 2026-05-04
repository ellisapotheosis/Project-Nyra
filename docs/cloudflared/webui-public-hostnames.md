# Cloudflare Web UI Public Hostname Checklist

Updated: 2026-04-30

Use this when configuring a dashboard-managed tunnel in the Cloudflare Zero Trust
Web UI.

## Path

1. Open Cloudflare Zero Trust.
2. Go to `Networks -> Tunnels`.
3. Select the Oracle tunnel for Project Nyra.
4. Open `Public Hostnames`.
5. Add the rows from `hostname-matrix.md`.
6. Create or verify Cloudflare Access applications for every non-Pages hostname.

## Minimum First Pass

Add these first to get the core app stack online:

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `nyra` | `ratehunter.net` | HTTP | `webapp:3001` |
| `crm` | `ratehunter.net` | HTTP | `twenty:3000` |
| `n8n` | `ratehunter.net` | HTTP | `n8n:5678` |
| `activepieces` | `ratehunter.net` | HTTP | `activepieces:80` |
| `nexus` | `ratehunter.net` | HTTP | `nexus:3000` |
| `grafana` | `ratehunter.net` | HTTP | `grafana:3000` |
| `paperclip` | `ratehunter.net` | HTTP | `paperclip:3100` |

## Add After Core Works

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `openwebui` | `ratehunter.net` | HTTP | `openwebui:8080` |
| `gitea` | `ratehunter.net` | HTTP | `gitea:3000` |
| `prometheus` | `ratehunter.net` | HTTP | `prometheus:9090` |
| `loki` | `ratehunter.net` | HTTP | `loki:3100` |
| `cadvisor` | `ratehunter.net` | HTTP | `cadvisor:8080` |
| `crm-api` | `ratehunter.net` | HTTP | `nyra-crm-api:4001` |
| `quote` | `ratehunter.net` | HTTP | `nyra-quote-api:7070` |
| `campaign` | `ratehunter.net` | HTTP | `nyra-campaign-engine:8020` |

## Owner-Only MCP And Memory Routes

These should use a stricter owner-only Access policy:

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `mem0` | `ratehunter.net` | HTTP | `nyra-mem0-rest:5000` |
| `letta` | `ratehunter.net` | HTTP | `letta:8283` |
| `memos` | `ratehunter.net` | HTTP | `nyra-mem-os:8085` |
| `openmemory` | `ratehunter.net` | HTTP | `openmemory-mcp:8765` |
| `crm-mcp` | `ratehunter.net` | HTTP | `twenty-mcp:8400` |
| `infisical-mcp` | `ratehunter.net` | HTTP | `nyra-infisical-mcp:8766` |
| `mempalace-mcp` | `ratehunter.net` | HTTP | `nyra-mempalace-mcp:8000` |
| `gitea-mcp` | `ratehunter.net` | HTTP | `nyra-gitea-mcp:3101` |
| `paperclip-mcp` | `ratehunter.net` | HTTP | `paperclip-mcp:8767` |

## Worker UI Routes

Add these in a separate tunnel if possible:

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `openclaw` | `ratehunter.net` | HTTP | `orchestrator.trex-fiordland.ts.net:8001` |
| `litellm` | `ratehunter.net` | HTTP | `orchestrator.trex-fiordland.ts.net:4000` |
| `portainer` | `ratehunter.net` | HTTPS | `orchestrator.trex-fiordland.ts.net:9443` |
| `openclaw-5090` | `ratehunter.net` | HTTP | `worker-rtx5090.trex-fiordland.ts.net:8001` |
| `nerve-5090` | `ratehunter.net` | HTTP | `worker-rtx5090.trex-fiordland.ts.net:18789` |
| `openclaw-3090` | `ratehunter.net` | HTTP | `worker-rtx3090ti.trex-fiordland.ts.net:8001` |
| `nerve-3090` | `ratehunter.net` | HTTP | `worker-rtx3090ti.trex-fiordland.ts.net:18789` |

For `portainer.ratehunter.net`, disable TLS verification for the origin if using
Portainer's self-signed certificate.
