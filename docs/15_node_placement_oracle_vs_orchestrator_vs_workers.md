# 15 Node Placement: Oracle vs Orchestrator vs Workers

## Placement matrix (active services)

| Service | Node | Why | Ports | Exposure |
|---|---|---|---|---|
| postgres | oracle | primary relational state | 5432 | private |
| redis | oracle | shared cache and queue state | 6379 | private |
| n8n | oracle/orchestrator | workflow control surface | 5678 | Access-protected public |
| activepieces | oracle/orchestrator | workflow automation surface | 8082 | Access-protected public |
| twentycrm | oracle | CRM core app with durable backing services | 3000 | Access-protected public |
| quote-api | oracle | domain API for pricing workflows | 7070 | private |
| grafana | orchestrator/oracle | operator observability UI | 3003 | Access-protected public |
| gitea | orchestrator | internal forge and CI control plane | 3100, 2222 | Access-protected web, SSH restricted |
| infisical | orchestrator | secrets control plane | 8086 | Access-protected public |
| archon-ui | orchestrator | operator-facing Archon UI | 3737 | Access-protected public |
| worker-3060-ollama | workers | GPU-bound inference runtime | 11434 | private |
| worker-3090ti-vllm | workers | GPU-bound inference runtime | 8000 | private |
| worker-5090-vllm | workers | high-end GPU inference runtime | 8001 | private |

## Evidence

- Base stack: `infra/docker-compose.yml`
- Oracle stack: `infra/oracle/docker-compose.oracle.yml`
- Dedicated Archon stack: `docker-compose.archon.yml`
- Dedicated Gitea and Infisical stacks: `docker-compose.gitea.yml`, `docker-compose.infisical.yml`
- Worker stacks: `infra/workers/worker-rtx3060/docker-compose.worker.yml`, `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`, `infra/workers/worker-rtx5090/docker-compose.worker.yml`
