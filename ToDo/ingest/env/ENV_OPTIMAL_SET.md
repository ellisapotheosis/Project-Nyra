# ENV Optimal Set — Project Nyra (Recommended defaults; secrets blank)

This document gives recommended **shapes and defaults** by environment.
Secrets are **intentionally blank** — store them in Infisical.

## Dev defaults (local docker)
- NEXUS_PUBLIC_URL=http://localhost:4000
- LITELLM_HOST=litellm
- LITELLM_PORT=4000
- OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
- OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
- DIFY_WEB_URL=http://localhost:3001
- N8N_EDITOR_BASE_URL=http://localhost:5678
- AP_BASE_URL=http://localhost:8080
- TWENTY_BASE_URL=http://localhost:3000
- FALKORDB_HOST=falkordb
- FALKORDB_PORT=6379

## Staging defaults (single VM)
- NEXUS_PUBLIC_URL=https://nexus.staging.ratehunter.net
- DIFY_WEB_URL=https://nyra-chat.staging.ratehunter.net
- N8N_EDITOR_BASE_URL=https://automation.staging.ratehunter.net
- AP_BASE_URL=https://actions.staging.ratehunter.net
- TWENTY_BASE_URL=https://crm.staging.ratehunter.net

## Production defaults (split services)
- NEXUS_PUBLIC_URL=https://nexus.ratehunter.net
- DIFY_WEB_URL=https://nyra.ratehunter.net
- N8N_EDITOR_BASE_URL=https://automation.ratehunter.net
- AP_BASE_URL=https://actions.ratehunter.net
- TWENTY_BASE_URL=https://crm.ratehunter.net

## Infisical path mapping rules (your taxonomy)
- Clients:
  - /clients/claude-flow/
  - /clients/claude-code/
  - /clients/n8n/
  - /clients/activepieces/
  - /clients/dify/
  - /clients/twenty/
  - /clients/graphiti/
  - /clients/letta/
  - /clients/mem0/
- Providers:
  - /providers/anthropic/
  - /providers/openrouter/
  - /providers/google/
  - /providers/cloudflare/
  - /providers/tailscale/
- Databases:
  - /databases/postgres/
  - /databases/falkordb/
  - /databases/neo4j/
  - /databases/qdrant/
- Machines:
  - /machines/orchestrator-mini/
  - /machines/worker-rtx3060/
  - /machines/worker-rtx3090ti/
  - /machines/worker-rtx5090/

## What changes per-PC in your 4-PC setup
- Anything binding to local GPUs or local sockets:
  - DOCKER_MCP_SOCKET
  - filesystem roots
  - local model paths (if used)
- Machine identity:
  - HOSTNAME
  - MACHINE_ROLE (orchestrator vs worker)
- Tailscale:
  - TAILSCALE_AUTHKEY (unique per node if you choose)
- Cloudflare tunnel:
  - CLOUDFLARE_TUNNEL_TOKEN (usually only on orchestrator)
