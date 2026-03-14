# 02 Ports Registry (Active Only)

_Generated from the canonical compose set used by `Makefile`, `infra/scripts/node-*.sh`, and the dedicated root bootstrap stacks._

## Authoritative compose set
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`

## Exposure policy
- Datastores and worker inference backends default to `private`.
- Only explicitly approved operator-facing HTTP services receive proposed hostnames or cloudflared snippets.
- Internal APIs and gateways remain private by default even when they speak HTTP.
- The marketing landing page stays on Cloudflare Pages and is not tunnel-routed.

> Replace the example domain `nyra.example.com` with your real Cloudflare zone before provisioning DNS.

| Service | Repo path (FINAL) | Compose service name | Container port(s) | Host port(s) | Protocol | Health endpoint | Exposure | Proposed hostname | Cloudflared ingress snippet |
|---|---|---|---|---|---|---|---|---|---|
| activepieces | `infra/docker-compose.yml` | `activepieces` | `80` | `8082` | `tcp` | — | public-via-cloudflare-access | activepieces.nyra.example.com | - hostname: activepieces.nyra.example.com<br>  service: http://localhost:8082 |
| agentdb | `infra/docker-compose.yml` | `agentdb` | `5432` | `5440` | `tcp` | — | private |   | — |
| agentic-flow | `infra/docker-compose.yml` | `agentic-flow` | `8095` | `8095` | `tcp` | — | private |   | — |
| archon-agent-work-orders | `infra/docker-compose.yml` | `archon-agent-work-orders` | `8053` | `8053` | `tcp` | — | private |   | — |
| archon-agents | `infra/docker-compose.yml` | `archon-agents` | `8052` | `8052` | `tcp` | — | private |   | — |
| archon-mcp | `infra/docker-compose.yml` | `archon-mcp` | `8051` | `8051` | `tcp` | — | private |   | — |
| archon-os | `infra/docker-compose.yml` | `archon-os` | `9001` | `9001` | `tcp` | — | private |   | — |
| archon-server | `infra/docker-compose.yml` | `archon-server` | `8181` | `8181` | `tcp` | — | private |   | — |
| archon-ui | `infra/docker-compose.yml` | `archon-ui` | `5173` | `3737` | `tcp` | — | public-via-cloudflare-access | archon.nyra.example.com | - hostname: archon.nyra.example.com<br>  service: http://localhost:3737 |
| bitwarden-mcp | `infra/docker-compose.yml` | `bitwarden-mcp` | `8814` | `8814` | `tcp` | — | private |   | — |
| cadvisor | `infra/docker-compose.yml` | `cadvisor` | `8080` | `8081` | `tcp` | — | private |   | — |
| claude-flow | `infra/docker-compose.yml` | `claude-flow` | `8080` | `8085` | `tcp` | — | private |   | — |
| cloudflared | `infra/docker-compose.yml` | `cloudflared` | `—` | `—` | `—` | — | private |   | — |
| docker-mcp-toolkit | `infra/docker-compose.yml` | `docker-mcp-toolkit` | `8811` | `8811` | `tcp` | — | private |   | — |
| falkordb | `infra/oracle/docker-compose.oracle.yml` | `falkordb` | `—` | `—` | `—` | — | private |   | — |
| git-mcp | `infra/docker-compose.yml` | `git-mcp` | `8812` | `8812` | `tcp` | — | private |   | — |
| gitea | `docker-compose.gitea.yml` | `gitea` | `3000, 22` | `3100, 2222` | `tcp` | — | public-via-cloudflare-access | gitea.nyra.example.com | - hostname: gitea.nyra.example.com<br>  service: http://localhost:3100 |
| gitea-act-runner | `docker-compose.gitea.yml` | `gitea-act-runner` | `—` | `—` | `—` | — | private |   | — |
| gitea-act-runner-large | `docker-compose.gitea.yml` | `gitea-act-runner-large` | `—` | `—` | `—` | — | private |   | — |
| gitea-ai-reviewer | `docker-compose.gitea.yml` | `gitea-ai-reviewer` | `—` | `—` | `—` | — | private |   | — |
| gitea-db | `docker-compose.gitea.yml` | `gitea-db` | `—` | `—` | `—` | — | private |   | — |
| github-mcp | `infra/docker-compose.yml` | `github-mcp` | `8813` | `8813` | `tcp` | — | private |   | — |
| grafana | `infra/docker-compose.yml` | `grafana` | `3000` | `3003` | `tcp` | /api/health | public-via-cloudflare-access | grafana.nyra.example.com | - hostname: grafana.nyra.example.com<br>  service: http://localhost:3003 |
| graphiti-mcp | `infra/oracle/docker-compose.oracle.yml` | `graphiti-mcp` | `—` | `—` | `—` | — | private |   | — |
| infisical | `infra/docker-compose.yml` | `infisical` | `8080` | `8086` | `tcp` | — | public-via-cloudflare-access | infisical.nyra.example.com | - hostname: infisical.nyra.example.com<br>  service: http://localhost:8086 |
| infisical-agent | `infra/docker-compose.yml` | `infisical-agent` | `—` | `—` | `—` | — | private |   | — |
| infisical-agent-gitea | `docker-compose.gitea.yml` | `infisical-agent-gitea` | `—` | `—` | `—` | — | private |   | — |
| infisical-cli | `infra/docker-compose.yml` | `infisical-cli` | `—` | `—` | `—` | — | private |   | — |
| infisical-db | `docker-compose.infisical.yml` | `infisical-db` | `—` | `—` | `—` | — | private |   | — |
| infisical-mcp | `infra/docker-compose.yml` | `infisical-mcp` | `8815` | `8815` | `tcp` | — | private |   | — |
| infisical-redis | `docker-compose.infisical.yml` | `infisical-redis` | `—` | `—` | `—` | — | private |   | — |
| litellm | `infra/docker-compose.yml` | `litellm` | `4000` | `4000` | `tcp` | — | private |   | — |
| loki | `infra/docker-compose.yml` | `loki` | `3100` | `3100` | `tcp` | — | private |   | — |
| moltbot | `infra/oracle/docker-compose.oracle.yml` | `moltbot` | `18789, 18790` | `18789, 18790` | `tcp` | — | private |   | — |
| moltbot-web | `infra/docker-compose.yml` | `moltbot-web` | `3030` | `3030` | `tcp` | — | private |   | — |
| mongo | `infra/docker-compose.yml` | `mongo` | `27017` | `27017` | `tcp` | — | private |   | — |
| n8n | `infra/docker-compose.yml` | `n8n` | `5678` | `5678` | `tcp` | /healthz | public-via-cloudflare-access | n8n.nyra.example.com | - hostname: n8n.nyra.example.com<br>  service: http://localhost:5678 |
| nexus-router | `infra/docker-compose.yml` | `nexus-router` | `7000, 8080, 9091` | `7000, 8080, 9091` | `tcp` | — | private |   | — |
| nexus_onehop | `infra/orchestrator/docker-compose.nexus-one-hop.yml` | `nexus_onehop` | `6000, 6011` | `6000, 6011` | `tcp` | — | private |   | — |
| nyra-mcp | `infra/docker-compose.yml` | `nyra-mcp` | `8081` | `3333` | `tcp` | — | private |   | — |
| nyra-secrets-init | `docker-compose.gitea.yml` | `nyra-secrets-init` | `—` | `—` | `—` | — | private |   | — |
| openwebui | `infra/docker-compose.yml` | `openwebui` | `8080` | `8088` | `tcp` | — | private |   | — |
| postgres | `infra/docker-compose.yml` | `postgres` | `5432` | `5432` | `tcp` | — | private |   | — |
| prometheus | `infra/docker-compose.yml` | `prometheus` | `9090` | `9090` | `tcp` | — | private |   | — |
| quote-api | `infra/oracle/docker-compose.oracle.yml` | `quote-api` | `7070` | `7070` | `tcp` | /health | private |   | — |
| redis | `infra/docker-compose.yml` | `redis` | `6379` | `6379` | `tcp` | — | private |   | — |
| redis-cache | `infra/oracle/docker-compose.oracle.yml` | `redis-cache` | `—` | `—` | `—` | — | private |   | — |
| ruvector-pgadmin | `infra/docker-compose.yml` | `ruvector-pgadmin` | `80` | `5050` | `tcp` | — | private |   | — |
| ruvector-postgres | `infra/docker-compose.yml` | `ruvector-postgres` | `5432` | `5436` | `tcp` | — | private |   | — |
| twenty | `infra/oracle/docker-compose.oracle.yml` | `twenty` | `3000` | `3000` | `tcp` | — | private |   | — |
| twenty-postgres | `infra/docker-compose.yml` | `twenty-postgres` | `—` | `—` | `—` | — | private |   | — |
| twentycrm | `infra/docker-compose.yml` | `twentycrm` | `3000` | `3000` | `tcp` | — | public-via-cloudflare-access | twentycrm.nyra.example.com | - hostname: twentycrm.nyra.example.com<br>  service: http://localhost:3000 |
| twentycrm-mcp | `infra/docker-compose.yml` | `twentycrm-mcp` | `8082` | `8182` | `tcp` | — | private |   | — |
| worker-3060-ollama | `infra/docker-compose.yml` | `worker-3060-ollama` | `11434` | `11434` | `tcp` | — | private |   | — |
| worker-3090ti-vllm | `infra/docker-compose.yml` | `worker-3090ti-vllm` | `8000` | `8000` | `tcp` | — | private |   | — |
| worker-5090-vllm | `infra/docker-compose.yml` | `worker-5090-vllm` | `8000` | `8001` | `tcp` | — | private |   | — |
| worker-rtx3060 | `infra/workers/worker-rtx3060/docker-compose.worker.yml` | `worker-rtx3060` | `—` | `—` | `—` | — | private |   | — |
