# 15 Node Placement: Oracle vs Orchestrator vs Workers

## Placement assumptions
- **Oracle node**: durable business systems + databases.
- **Orchestrator node**: control plane, gateways, CI/secrets/operator UIs.
- **Worker nodes**: GPU inference execution, kept private.

## Service placement table
| Service | Node | Why | Ports | Exposure |
|---|---|---|---|---|
| postgres | oracle | primary relational data store for platform services | 5432 | private |
| redis | oracle | shared cache/queue backing state | 6379 | private |
| mongo | oracle | document store for orchestration and tooling components | 27017 | private |
| twentycrm / twenty | oracle | CRM system of record and business app surface | 3000 | Access-protected HTTP |
| quote-api | oracle | mortgage quote domain API colocated with durable dependencies | 7070 | private |
| n8n | orchestrator (or oracle variant) | workflow automation control surface | 5678 | Access-protected HTTP |
| activepieces | orchestrator (or oracle variant) | workflow/integration automation console | 8082 | Access-protected HTTP |
| grafana | orchestrator | operator monitoring and dashboards | 3003 | Access-protected HTTP |
| nexus-router | orchestrator | LLM/API gateway routing and coordination | 7000/8080/9091 | private |
| litellm | orchestrator | model gateway layer for internal consumers | 4000 | private |
| archon-ui | orchestrator | operations UI for Archon control plane | 3737 | Access-protected HTTP |
| gitea | orchestrator | internal forge and CI control plane | 3100 (web), 2222 (ssh) | web Access-protected; ssh private/restricted |
| infisical | orchestrator | secrets control plane UI/API | 8086 (or 3201 in dedicated stack) | Access-protected HTTP |
| worker-3060-ollama | workers | GPU-bound local inference endpoint | 11434 | private |
| worker-3090ti-vllm | workers | GPU inference for mid/high-load model serving | 8000 | private |
| worker-5090-vllm | workers | high-end inference for heavy workloads | 8001 host -> 8000 container | private |

## Exposure policy by class
- Datastores (`postgres`, `redis`, `mongo`, `agentdb`, `ruvector-postgres`, `infisical-db`, `gitea-db`) remain private.
- Inference backends remain private and should be reachable only from trusted networks.
- Public edge exposure is limited to approved HTTP apps behind Cloudflare Access.
- Raw TCP/SSH is not tunnel-exposed by default.

## Evidence set
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`
- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
