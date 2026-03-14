# 02 Ports Registry Appendix (Secondary and Parallel Compose Paths)

These entries are intentionally excluded from the active registry because they are overrides, bootstrap-safe parallels, or secondary runtime definitions.

## Secondary compose set
- `infra/compose/overrides/docker-compose.orchestrator.override.yml`
- `infra/compose/overrides/docker-compose.oracle.override.yml`
- `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml`
- `infra/orchestrator/docker-compose.nexus-one-hop.yml`
- `docker-compose.gitea.bootstrap.yml`
- `docker-compose.infisical.bootstrap.yml`

| Service | Repo path | Host port(s) | Exposure |
|---|---|---|---|
| activepieces | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:8082` | public-via-cloudflare-access |
| activepieces | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:8082` | public-via-cloudflare-access |
| activepieces | `infra/oracle/docker-compose.oracle.yml` | `8080` | public-via-cloudflare-access |
| archon-agent-work-orders | `docker-compose.archon.yml` | `8053` | private |
| archon-agents | `docker-compose.archon.yml` | `8052` | private |
| archon-mcp | `docker-compose.archon.yml` | `8051` | private |
| archon-os | `docker-compose.archon.yml` | `9001` | private |
| archon-server | `docker-compose.archon.yml` | `8181` | private |
| archon-ui | `docker-compose.archon.yml` | `3737` | public-via-cloudflare-access |
| cadvisor | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:8081` | private |
| cadvisor | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:8081` | private |
| cadvisor | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:8081` | private |
| cadvisor | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:8081` | private |
| cloudflared | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `—` | private |
| cloudflared | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `—` | private |
| cloudflared | `infra/oracle/docker-compose.oracle.yml` | `—` | private |
| cloudflared | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `—` | private |
| cloudflared | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `—` | private |
| gitea | `docker-compose.gitea.bootstrap.yml` | `3100, 2222` | public-via-cloudflare-access |
| gitea-act-runner | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-act-runner-large | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-ai-reviewer | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| gitea-db | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| grafana | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:3006` | public-via-cloudflare-access |
| grafana | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:3003` | public-via-cloudflare-access |
| grafana | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:3003` | public-via-cloudflare-access |
| grafana | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:3003` | public-via-cloudflare-access |
| grafana | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:3003` | public-via-cloudflare-access |
| infisical | `docker-compose.infisical.bootstrap.yml` | `3201` | public-via-cloudflare-access |
| infisical | `docker-compose.infisical.yml` | `3201` | public-via-cloudflare-access |
| infisical | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:8086` | public-via-cloudflare-access |
| infisical-agent | `docker-compose.archon.yml` | `—` | private |
| infisical-agent-gitea | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| infisical-cli | `docker-compose.archon.yml` | `—` | private |
| infisical-db | `docker-compose.infisical.bootstrap.yml` | `—` | private |
| infisical-redis | `docker-compose.infisical.bootstrap.yml` | `—` | private |
| litellm | `docker-compose.archon.yml` | `—` | private |
| loki | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:3100` | private |
| loki | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:3100` | private |
| loki | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:3100` | private |
| loki | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:3100` | private |
| mongo | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:27017` | private |
| mongo | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:27017` | private |
| mongo | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:27017` | private |
| mongo | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:27017` | private |
| mongo | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:27017` | private |
| n8n | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:5678` | public-via-cloudflare-access |
| n8n | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5678` | public-via-cloudflare-access |
| n8n | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| n8n | `infra/oracle/docker-compose.oracle.yml` | `5678` | public-via-cloudflare-access |
| n8n | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| n8n | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:5678` | public-via-cloudflare-access |
| nexus-router | `docker-compose.archon.yml` | `7000, 8080, 9091` | private |
| nyra-secrets-init | `docker-compose.gitea.bootstrap.yml` | `—` | private |
| postgres | `docker-compose.archon.yml` | `5432` | private |
| postgres | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:5432` | private |
| postgres | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5432` | private |
| postgres | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:5432` | private |
| postgres | `infra/oracle/docker-compose.oracle.yml` | `—` | private |
| postgres | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:5432` | private |
| postgres | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:5432` | private |
| prometheus | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:9090` | private |
| prometheus | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:9090` | private |
| prometheus | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:9090` | private |
| prometheus | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:9090` | private |
| redis | `docker-compose.archon.yml` | `6379` | private |
| redis | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:6379` | private |
| redis | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:6379` | private |
| redis | `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml` | `127.0.0.1:6379` | private |
| redis | `infra/workers/worker-rtx3090ti/docker-compose.worker.yml` | `127.0.0.1:6379` | private |
| redis | `infra/workers/worker-rtx5090/docker-compose.worker.yml` | `127.0.0.1:6379` | private |
| ruvector-pgadmin | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5050` | private |
| ruvector-postgres | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | `0.0.0.0:5436` | private |
| twentycrm | `infra/compose/overrides/docker-compose.oracle.override.yml` | `0.0.0.0:3000` | public-via-cloudflare-access |
