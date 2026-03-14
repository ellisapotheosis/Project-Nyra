# Service Catalog (Canonical Infra)

This catalog consolidates active `/infra` services and tracked archived services from `/infra-archived/infra-20260206-1551`.

## Core + Gateway

| Service      | Profile(s)           | Host target         | Notes                 |
| ------------ | -------------------- | ------------------- | --------------------- |
| postgres     | core                 | orchestrator        | Primary app database  |
| redis        | core                 | orchestrator        | Shared cache + queue  |
| mongo        | core                 | orchestrator        | Supporting datastore  |
| litellm      | gateway,orchestrator | orchestrator        | Unified model gateway |
| nexus-router | gateway,orchestrator | orchestrator        | MCP/API routing       |
| cloudflared  | edge                 | orchestrator/oracle | Ingress tunnel        |

## Workflow + CRM + Apps

| Service         | Profile(s)                   | Host target         | Notes                   |
| --------------- | ---------------------------- | ------------------- | ----------------------- |
| n8n             | workflow,orchestrator,oracle | oracle preferred    | Automation workflows    |
| activepieces    | workflow,orchestrator,oracle | oracle preferred    | Workflow orchestration  |
| twenty-postgres | crm,orchestrator,oracle      | oracle preferred    | Twenty backing DB       |
| twentycrm       | crm,orchestrator,oracle      | oracle preferred    | CRM UI/API              |
| twentycrm-mcp   | crm,mcp                      | oracle/orchestrator | MCP adapter (port 8182) |
| openwebui       | apps,oracle                  | oracle              | User-facing chat UI     |
| moltbot-web     | apps,oracle                  | oracle              | Claw/Molt web app       |
| agentdb         | apps                         | oracle/orchestrator | archived parity service |
| agentic-flow    | apps                         | oracle/orchestrator | archived parity service |

## Secrets + MCP

| Service            | Profile(s)     | Host target         | Notes                     |
| ------------------ | -------------- | ------------------- | ------------------------- |
| infisical          | secrets,oracle | oracle preferred    | Self-hosted secrets plane |
| docker-mcp-toolkit | mcp,devtools   | orchestrator        | Docker MCP hub            |
| git-mcp            | mcp,devtools   | orchestrator        | Git repo MCP server       |
| github-mcp         | mcp,devtools   | orchestrator        | GitHub MCP server         |
| bitwarden-mcp      | mcp,secrets    | oracle/orchestrator | Vault integration         |
| infisical-mcp      | mcp,secrets    | oracle/orchestrator | Secrets MCP integration   |

## Archon + Observability + Vector

| Service           | Profile(s)    | Host target      | Notes                      |
| ----------------- | ------------- | ---------------- | -------------------------- |
| archon-os         | archon        | orchestrator     | Archon application service backed by managed Supabase |
| prometheus        | observability | oracle preferred | Metrics storage            |
| loki              | observability | oracle preferred | Log storage                |
| grafana           | observability | oracle preferred | Observability UI           |
| cadvisor          | observability | each node        | Runtime metrics exporter   |
| ruvector-postgres | vector        | oracle preferred | Vector postgres            |
| ruvector-pgadmin  | vector,debug  | orchestrator/dev | DB admin helper            |

## Workers

| Service            | Profile(s)    | Host target      | Notes           |
| ------------------ | ------------- | ---------------- | --------------- |
| worker-3060-ollama | worker-3060   | worker-rtx3060   | Ollama endpoint |
| worker-3090ti-vllm | worker-3090ti | worker-rtx3090ti | vLLM endpoint   |
| worker-5090-vllm   | worker-5090   | worker-rtx5090   | vLLM endpoint   |

## Archived-only services still tracked

The following are cataloged but not fully integrated due to missing production-safe defaults and/or unknown runtime contracts: `composio-mcp`, `metamcp-*`, `qdrant*`, `neo4j*`, `postgres-mcp`, `redis-mcp`, `dozzle`, `portainer`, `wake-on-lan`, `zep-mcp`, `serena-mcp`, `notion-mcp`, `websearch-mcp`.

These remain preserved under `infra-archived/infra-20260206-1551` and should be integrated with dedicated compose fragments after credentials and resource budgets are finalized.
