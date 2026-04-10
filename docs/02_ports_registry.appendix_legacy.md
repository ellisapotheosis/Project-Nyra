# 02 Ports Registry Appendix (Secondary and Parallel Compose Paths)

These entries are intentionally excluded from the active registry because they are overrides, bootstrap-safe parallels, or secondary runtime definitions.

## Secondary compose set
- `docker-compose.gitea.bootstrap.yml`
- `docker-compose.infisical.bootstrap.yml`
- `infra/compose/docker-compose.archon.yml`
- `infra/compose/docker-compose.cloudflared.yml`
- `infra/compose/overrides/docker-compose.dev-laptop.override.yml`
- `infra/compose/overrides/docker-compose.oracle.override.yml`
- `infra/compose/overrides/docker-compose.orchestrator.override.yml`
- `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml`
- `infra/docker-compose.archon-os-cicd.yml`
- `infra/docker-compose.dashboard.yml`
- `infra/docker-compose.orchestrator-cf-tunnel.yml`
- `infra/docker-compose.twenty.yml`
- `infra/orchestrator/docker-compose.nexus-one-hop.yml`

| Service | Repo path | Host port(s) | Exposure |
|---|---|---|---|
| activepieces | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:8082` | public-via-cloudflare-access |
| activepieces | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:8082` | public-via-cloudflare-access |
| activepieces | `infra/docker-compose.yml` | `8082` | public-via-cloudflare-access |
| activepieces | `infra/oracle/docker-compose.oracle.yml` | `8080` | public-via-cloudflare-access |
| ruvector | `infra/docker-compose.yml` | `5440` | private |
| archon-os | `infra/docker-compose.yml` | `8095` | private |
| archon-agent-work-orders | `infra/docker-compose.yml` | `8053` | private |
| archon-agents | `infra/compose/docker-compose.archon.yml` | `8052` | private |
| archon-agents | `infra/docker-compose.yml` | `8052` | private |
| archon-mcp | `infra/compose/docker-compose.archon.yml` | `8051` | private |
| archon-mcp | `infra/docker-compose.yml` | `8051` | private |
| archon-os | `infra/compose/docker-compose.archon.yml` | `9001` | private |
| archon-os | `infra/docker-compose.yml` | `9001` | private |
| archon-os | `infra/orchestrator/docker-compose.orchestrator.yml` | `8080` | private |
| archon-server | `infra/compose/docker-compose.archon.yml` | `8181` | private |
| archon-server | `infra/docker-compose.yml` | `8181` | private |
| archon-ui | `infra/compose/docker-compose.archon.yml` | `3737` | public-via-cloudflare-access |
| archon-ui | `infra/docker-compose.yml` | `3737` | public-via-cloudflare-access |
| cadvisor | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:8081` | private |
| cadvisor | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:8081` | private |
| cadvisor | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:8081` | private |
| cadvisor | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:8081` | private |
| archon-os | `infra/orchestrator/docker-compose.orchestrator.yml` | `8000` | private |
| archon-os-brain | `infra/docker-compose/docker-compose.archon-os.yml` | `8080, 3000` | private |
| archon-os-cicd | `infra/docker-compose.archon-os-cicd.yml` | `—` | private |
| archon-os-dashboard | `infra/docker-compose.dashboard.yml` | `3003` | private |
| archon-os-event-server | `infra/docker-compose.dashboard.yml` | `3004, 3005` | private |
| cloudflared | `infra/compose/docker-compose.cloudflared.yml` | `—` | private |
| cloudflared | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `—` | private |
| cloudflared | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `—` | private |
| cloudflared | `infra/docker-compose.yml` | `—` | private |
| cloudflared | `infra/oracle/docker-compose.oracle.yml` | `—` | private |
| cloudflared | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `—` | private |
| cloudflared | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `—` | private |
| docker-mcp-toolkit | `infra/orchestrator/docker-compose.orchestrator.yml` | `8811` | private |
| falkordb | `infra/stacks/nyra-mortgage/docker-compose.yml` | `6379` | private |
| gitea | `docker-compose.gitea.bootstrap.yml` | `3100, 2222` | public-via-cloudflare-access |
| gitea | `infra/configs/gitea/docker-compose.gitea.yml` | `3001, 2222` | public-via-cloudflare-access |
| gitea | `infra/docker-compose.oracle.yml` | `3002, 2222` | public-via-cloudflare-access |
| gitea-act-runner | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-act-runner-large | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-ai-reviewer | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-db | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-runner | `infra/docker-compose.oracle.yml` | `—` | private |
| gpu-exporter | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `9835` | private |
| grafana | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:3006` | public-via-cloudflare-access |
| grafana | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:3003` | public-via-cloudflare-access |
| grafana | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:3003` | public-via-cloudflare-access |
| grafana | `infra/stacks/nyra-mortgage/docker-compose.yml` | `3005` | public-via-cloudflare-access |
| grafana | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:3003` | public-via-cloudflare-access |
| grafana | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:3003` | public-via-cloudflare-access |
| health-monitor | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `—` | private |
| health-monitor | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `—` | private |
| infisical | `docker-compose.infisical.bootstrap.yml` | `3201` | public-via-cloudflare-access |
| infisical | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:8086` | public-via-cloudflare-access |
| infisical | `infra/docker-compose.yml` | `8086` | public-via-cloudflare-access |
| infisical-agent | `infra/docker-compose.oracle.yml` | `—` | private |
| infisical-agent | `infra/docker-compose.yml` | `—` | private |
| infisical-agent | `infra/orchestrator/docker-compose.orchestrator.yml` | `—` | private |
| infisical-agent-gitea | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| infisical-cli | `infra/docker-compose.yml` | `—` | private |
| infisical-db | `docker-compose.infisical.bootstrap.yml` | `—` | private |
| infisical-redis | `docker-compose.infisical.bootstrap.yml` | `—` | private |
| kyutai-unmute-cloud | `infra/compose/openclaw.voice.compose.yml` | `127.0.0.1:8098` | private |
| litellm | `infra/compose/orchestrator.override.yml` | `127.0.0.1:4000` | private |
| litellm | `infra/docker-compose.yml` | `4000` | private |
| litellm | `infra/orchestrator/docker-compose.orchestrator.yml` | `4000` | private |
| litellm | `infra/stacks/nyra-mortgage/docker-compose.yml` | `—` | private |
| litellm | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `4000` | private |
| lmcache | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `8100` | private |
| lmcache-server | `infra/workers/worker-rtx5090/docker-compose.gpu.yml` | `127.0.0.1:8100` | private |
| loki | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:3100` | private |
| loki | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:3100` | private |
| loki | `infra/stacks/nyra-mortgage/docker-compose.yml` | `3100` | private |
| loki | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:3100` | private |
| loki | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:3100` | private |
| mem0 | `infra/stacks/nyra-mortgage/docker-compose.yml` | `4321` | private |
| model-switcher | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `—` | private |
| mongo | `infra/compose/overrides/docker-compose.dev-laptop.override.yml` | `127.0.0.1:27017` | private |
| mongo | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:27017` | private |
| mongo | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:27017` | private |
| mongo | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:27017` | private |
| mongo | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:27017` | private |
| mongo | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:27017` | private |
| n8n | `infra/compose/overrides/docker-compose.dev-laptop.override.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| n8n | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:5678` | public-via-cloudflare-access |
| n8n | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5678` | public-via-cloudflare-access |
| n8n | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| n8n | `infra/oracle/docker-compose.oracle.yml` | `5678` | public-via-cloudflare-access |
| n8n | `infra/stacks/nyra-mortgage/docker-compose.addons.yml` | `5678` | public-via-cloudflare-access |
| n8n | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| n8n | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| nexus | `infra/stacks/nyra-mortgage/docker-compose.yml` | `4001` | private |
| nexus-router | `infra/compose/orchestrator.override.yml` | `127.0.0.1:3010` | private |
| nexus-router | `infra/docker-compose.yml` | `7000, 8080, 9091` | private |
| node-exporter | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `9100` | private |
| nyra-secrets-init | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| nyra_orchestrator | `infra/stacks/nyra-mortgage/docker-compose.yml` | `8010` | private |
| ollama | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `11434` | private |
| openclaw-mvp | `infra/compose/openclaw.compose.yml` | `127.0.0.1:3401` | private |
| openwebui | `infra/stacks/nyra-mortgage/docker-compose.yml` | `8080` | private |
| postgres | `infra/compose/base.yml` | `127.0.0.1:5432` | private |
| postgres | `infra/compose/overrides/docker-compose.dev-laptop.override.yml` | `127.0.0.1:5432` | private |
| postgres | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:5432` | private |
| postgres | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5432` | private |
| postgres | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:5432` | private |
| postgres | `infra/docker-compose.oracle.yml` | `5432` | private |
| postgres | `infra/docker-compose.yml` | `5432` | private |
| postgres | `infra/oracle/docker-compose.oracle.yml` | `—` | private |
| postgres | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:5432` | private |
| postgres | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:5432` | private |
| prometheus | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:9090` | private |
| prometheus | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:9090` | private |
| prometheus | `infra/docker-compose.yml` | `9090` | private |
| prometheus | `infra/stacks/nyra-mortgage/docker-compose.yml` | `9090` | private |
| prometheus | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:9090` | private |
| prometheus | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:9090` | private |
| promtail | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `—` | private |
| redis | `infra/compose/base.yml` | `127.0.0.1:6379` | private |
| redis | `infra/compose/overrides/docker-compose.dev-laptop.override.yml` | `127.0.0.1:6379` | private |
| redis | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:6379` | private |
| redis | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:6379` | private |
| redis | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:6379` | private |
| redis | `infra/dev-stack/docker-compose.yml` | `6379` | private |
| redis | `infra/docker-compose.oracle.yml` | `6379` | private |
| redis | `infra/docker-compose.yml` | `6379` | private |
| redis | `infra/orchestrator/docker-compose.orchestrator.yml` | `6379` | private |
| redis | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `6379` | private |
| redis | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:6379` | private |
| redis | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:6379` | private |
| redis-cache | `infra/workers/worker-rtx3090ti/docker-compose.gpu.yml` | `127.0.0.1:6379` | private |
| redis-cache | `infra/workers/worker-rtx5090/docker-compose.gpu.yml` | `127.0.0.1:6379` | private |
| ruvector-pgadmin | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5050` | private |
| ruvector-postgres | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5436` | private |
| ruvector-postgres | `infra/docker-compose.yml` | `5436` | private |
| twenty | `infra/oracle/docker-compose.oracle.yml` | `3000` | private |
| twenty | `infra/stacks/nyra-mortgage/docker-compose.yml` | `3000` | private |
| twenty-crm | `infra/docker-compose.twenty.yml` | `3020` | private |
| twentycrm | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:3000` | public-via-cloudflare-access |
| vllm | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `8000` | private |
| vllm | `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml` | `8000` | private |
| vllm-server | `infra/workers/worker-rtx5090/docker-compose.gpu.yml` | `127.0.0.1:8000, 0.0.0.0:8000` | private |
