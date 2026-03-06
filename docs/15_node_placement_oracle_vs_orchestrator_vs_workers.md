# 15 Node Placement: Oracle vs Orchestrator vs Workers

## Placement matrix (active services)

| Service | Node | Why | Ports | Exposure |
|---|---|---|---|---|
| postgres | oracle | durable state and primary datastore | 5432 | private |
| redis | oracle | shared cache/queue state | 6379 | private |
| mongo | oracle | document persistence for app subsystems | 27017 | private |
| n8n | oracle/orchestrator | workflow control surface | 5678 | Access-protected public |
| activepieces | oracle/orchestrator | automation UI/API | 80/8082 | Access-protected public |
| twenty/twentycrm | oracle | CRM core app, persistent backend | 3000 | Access-protected public |
| quote-api | oracle | domain API serving upstream apps | 7070 | Access-protected public |
| litellm | orchestrator | centralized LLM gateway | 4000 | Access-protected public |
| nexus-router | orchestrator | request routing/API gateway | 7000/8080/9091 | Access-protected public |
| grafana | orchestrator/oracle | observability UI | 3000 | Access-protected public |
| gitea | orchestrator | internal forge + CI control plane | 3000/22 | Access-protected (web), SSH restricted |
| infisical | orchestrator | secrets management control plane | 8080 | Access-protected public |
| worker-3060-ollama | workers | GPU-bound inference runtime | 11434 | private |
| worker-3090ti-vllm | workers | GPU-bound inference runtime | 8000 | private |
| worker-5090-vllm | workers | high-end GPU inference | 8000 | private |

## Node role definitions

- **Oracle**: always-on business/state layer.
- **Orchestrator**: routing, automation control, governance, and operator interfaces.
- **Workers**: execution/inference heavy workloads with private network access.

## Placement constraints

1. Datastores remain private regardless of node.
2. Worker inference endpoints are not internet-routed.
3. Internet-facing UI/API endpoints are cloudflared + Access only.
4. Cross-node service communication should prefer private networking/Tailscale.

## Network policy expectations
- Oracle and orchestrator should communicate over private network only.
- Worker nodes should accept inference traffic from trusted internal sources.
- Public traffic should terminate at Cloudflare edge before reaching internal services.

## Capacity guidance
- Keep stateful and latency-sensitive business services off ephemeral worker nodes.
- Scale worker pool independently based on GPU workload and model mix.
- Track per-node saturation to inform future placement shifts.
