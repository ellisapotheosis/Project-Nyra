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

| Subdomain      | Domain            | Type | URL               |
| -------------- | ----------------- | ---- | ----------------- |
| `nyra`         | `projectnyra.com` | HTTP | `webapp:3001`     |
| `crm`          | `projectnyra.com` | HTTP | `twenty:3000`     |
| `n8n`          | `projectnyra.com` | HTTP | `n8n:5678`        |
| `activepieces` | `projectnyra.com` | HTTP | `activepieces:80` |
| `nexus`        | `projectnyra.com` | HTTP | `nexus:3000`      |
| `grafana`      | `projectnyra.com` | HTTP | `grafana:3000`    |
| `paperclip`    | `projectnyra.com` | HTTP | `paperclip:3100`  |

## Add After Core Works

| Subdomain    | Domain            | Type | URL                         |
| ------------ | ----------------- | ---- | --------------------------- |
| `openwebui`  | `projectnyra.com` | HTTP | `openwebui:8080`            |
| `forgejo`    | `projectnyra.com` | HTTP | `forgejo:3000`              |
| `prometheus` | `projectnyra.com` | HTTP | `prometheus:9090`           |
| `loki`       | `projectnyra.com` | HTTP | `loki:3100`                 |
| `cadvisor`   | `projectnyra.com` | HTTP | `cadvisor:8080`             |
| `crm-api`    | `projectnyra.com` | HTTP | `nyra-crm-api:4001`         |
| `quote`      | `projectnyra.com` | HTTP | `nyra-quote-api:7070`       |
| `campaign`   | `projectnyra.com` | HTTP | `nyra-campaign-engine:8020` |

## Owner-Only MCP And Memory Routes

These should use a stricter owner-only Access policy:

| Subdomain       | Domain            | Type | URL                       |
| --------------- | ----------------- | ---- | ------------------------- |
| `mem0`          | `projectnyra.com` | HTTP | `nyra-mem0-rest:5000`     |
| `letta`         | `projectnyra.com` | HTTP | `letta:8283`              |
| `memos`         | `projectnyra.com` | HTTP | `nyra-mem-os:8085`        |
| `openmemory`    | `projectnyra.com` | HTTP | `openmemory-mcp:8765`     |
| `crm-mcp`       | `projectnyra.com` | HTTP | `twenty-mcp:8400`         |
| `infisical-mcp` | `projectnyra.com` | HTTP | `nyra-infisical-mcp:8766` |
| `paperclip-mcp` | `projectnyra.com` | HTTP | `paperclip-mcp:8767`      |

## Worker UI Routes

Add these in a separate tunnel if possible:

| Subdomain       | Domain            | Type  | URL                                            |
| --------------- | ----------------- | ----- | ---------------------------------------------- |
| `openclaw`      | `projectnyra.com` | HTTP  | `orchestrator.trex-fiordland.ts.net:8001`      |
| `litellm`       | `projectnyra.com` | HTTP  | `orchestrator.trex-fiordland.ts.net:4000`      |
| `portainer`     | `projectnyra.com` | HTTPS | `orchestrator.trex-fiordland.ts.net:9443`      |
| `openclaw-5090` | `projectnyra.com` | HTTP  | `worker-rtx5090.trex-fiordland.ts.net:8001`    |
| `nerve-5090`    | `projectnyra.com` | HTTP  | `worker-rtx5090.trex-fiordland.ts.net:18789`   |
| `openclaw-3090` | `projectnyra.com` | HTTP  | `worker-rtx3090ti.trex-fiordland.ts.net:8001`  |
| `nerve-3090`    | `projectnyra.com` | HTTP  | `worker-rtx3090ti.trex-fiordland.ts.net:18789` |

For `portainer.projectnyra.com`, disable TLS verification for the origin if using
Portainer's self-signed certificate.
