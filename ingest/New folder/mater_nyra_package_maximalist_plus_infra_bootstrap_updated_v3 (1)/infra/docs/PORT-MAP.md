# Nyra Port Map

This document lists the canonical port assignments for all services in the
Nyra stack.  If you change any port, update this file, all compose files,
Cloudflare tunnel mappings, and your Infisical secrets accordingly.

## Orchestrator

| Service           | Container Port | Host Port | Profiles         | External |
|-------------------|---------------:|----------:|------------------|---------|
| Nexus Router      | 6000           | 6000      | core             | Via tunnel |
| Archon API        | 4000           | 4000      | core             | Via tunnel (optional) |
| Archon UI         | 3737           | 3737      | core             | Via tunnel (private) |
| Archon MCP        | 8051           | 8051      | core             | Internal |
| Infisical         | 3000           | 8080      | core             | Via tunnel |
| Gitea UI          | 3000           | 3001      | core             | Via tunnel |
| Gitea SSH         | 22             | 2222      | core             | Internal |
| Redis             | 6380           | 6380      | databases        | Internal |
| FalkorDB          | 6379           | 6379      | databases        | Internal |
| RuVector Postgres | 5432           | 5436      | databases/vector | Internal |
| Postgres: Archon  | 5432           | n/a       | databases        | Internal |
| Postgres: Gitea   | 5432           | n/a       | databases        | Internal |
| Postgres: Infisical| 5432          | n/a       | databases        | Internal |
| Postgres: Twenty  | 5432           | n/a       | databases/crm    | Internal |
| Postgres: Nyra AI | 5432           | n/a       | databases/vector | Internal |
| Prometheus        | 9090           | 9090      | observability    | Internal |
| Grafana           | 3000           | 3005      | observability    | Via tunnel |
| Loki              | 3100           | 3100      | observability    | Internal |
| n8n               | 5678           | 5678      | workflows        | Via tunnel |
| Activepieces      | 8082           | 8082      | workflows        | Via tunnel |
| Twenty CRM        | 3000           | 3000      | crm              | Via tunnel |
| Letta             | 8283           | 8283      | memory           | Internal |
| Quote API         | 8001           | 8001      | apps             | Internal |
| Campaign Engine   | 8002           | 8002      | apps             | Internal |
| Admin UI          | 3101           | 3101      | apps/ui          | Via tunnel |
| Dify Chat         | 3002           | 3002      | ui               | Via tunnel |

## GPU Workers

| Service      | Port  | Node                   | Purpose        |
|-------------|------:|------------------------|---------------|
| Ollama       | 11434 | worker-rtx3060         | Small models  |
| VLLM         | 8000  | worker-rtx3090ti/5090  | Large models  |
| LMCache      | 6379  | worker-rtx3090ti/5090  | KV cache      |
| Node Exporter| 9100  | all workers            | Metrics       |
| DCGM Exporter| 9400  | all workers            | GPU metrics   |

## Oracle VM (suggested)

When offloading services to Oracle, follow the same port assignments.  Use
Firewall rules to restrict access to the Oracle host and use Tailscale to
expose internal ports back to the LAN.
