# 15 Node Placement: Oracle vs Orchestrator vs Workers

## Placement matrix

| Service | Node | Why | Ports | Exposure |
|---|---|---|---|---|
| twenty (CRM) | oracle | durable line-of-business app near DB services | 3000 | access-protected HTTP |
| activepieces | oracle | workflow automation service with operational UI | 8080 | access-protected HTTP |
| n8n | oracle | internal workflow execution control plane | 5678 | access-protected HTTP |
| quote-api | oracle | quote workflows tied to durable state | 7070 | private |
| grafana | oracle | centralized ops dashboard | 3003 | access-protected HTTP |
| falkordb | oracle | memory datastore | 6381 | private |
| gitea | orchestrator | git forge + actions control plane | 3100, 2222 | access-protected web + restricted SSH |
| infisical | orchestrator | secrets management endpoint | 3201 | access-protected HTTP |
| archon | orchestrator | primary admin/control UI | 3737 | access-protected HTTP |
| nexus-router | orchestrator | MCP/model routing entrypoint | 7000, 8080, 9091 | access-protected/private mixed |
| openwebui | orchestrator | internal LLM experimentation UI | 8088 | access-protected HTTP |
| ollama-server | worker-rtx3060 | lightweight local model serving | 11434 | private |
| vllm-server | worker-rtx3090ti | private high-throughput inference | 8000 | private |
| vllm-server | worker-rtx5090 | primary heavy inference worker | 8000 | private |

## Evidence
- Oracle services: `infra/hosts/oracle-vps/docker-compose.oracle.yml`
- Orchestrator services: `docker-compose.gitea.yml`, `docker-compose.infisical.yml`, `infra/docker-compose.yml`, `infra/compose/docker-compose.archon.yml`
- Worker services: `infra/hosts/worker-rtx3060/docker-compose.gpu.yml`, `infra/hosts/worker-rtx3090ti/docker-compose.gpu.yml`, `infra/hosts/worker-rtx5090/docker-compose.gpu.yml`
