# 02 Ports Registry (Active Only)

_Generated from the canonical compose set used by `Makefile`, `infra/scripts/node-*.sh`, and the dedicated root bootstrap stacks._

## Authoritative compose set
- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`

## Active compose scope used for registry
- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/compose/base.yml`
- `infra/compose/cloudflared.profile.yml`
- `infra/compose/monitoring.profile.yml`
- `infra/compose/openclaw-unmute.overlay.yml`
- `infra/compose/openclaw.compose.yml`
- `infra/compose/openclaw.ops.compose.yml`
- `infra/compose/openclaw.profile.yml`
- `infra/compose/openclaw.ui.compose.yml`
- `infra/compose/openclaw.voice.compose.yml`
- `infra/compose/oracle.override.yml`
- `infra/compose/orchestrator.override.yml`
- `infra/compose/voice.profile.yml`
- `infra/compose/workers.override.yml`
- `infra/configs/gitea/docker-compose.gitea.yml`
- `infra/dev-stack/docker-compose.yml`
- `infra/docker-compose.oracle.yml`
- `infra/docker-compose.yml`
- `infra/docker-compose/docker-compose.archon-os.yml`
- `infra/homeassistant/docker-compose.homeassistant-dashboard.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `infra/orchestrator/docker-compose.orchestrator.yml`
- `infra/orchestrator/portainer-mesh/docker-compose.portainer.edge-agent.yml`
- `infra/orchestrator/portainer-mesh/docker-compose.portainer.orchestrator.yml`
- `infra/stacks/nyra-mortgage/docker-compose.addons.yml`
- `infra/stacks/nyra-mortgage/docker-compose.letta.yml`
- `infra/stacks/nyra-mortgage/docker-compose.local.yml`
- `infra/stacks/nyra-mortgage/docker-compose.services.yml`
- `infra/stacks/nyra-mortgage/docker-compose.voice.yml`
- `infra/stacks/nyra-mortgage/docker-compose.yml`
- `infra/workers/docker-compose.workers.yml`
- `infra/workers/worker-3060/docker-compose.worker-3060.yml`
- `infra/workers/worker-3090/docker-compose.worker-3090.yml`
- `infra/workers/worker-rtx3060/docker-compose.gpu.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.gpu.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.gpu.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml`

## Exposure policy
- Datastores and worker inference backends default to `private`.
- Only explicitly approved operator-facing HTTP services receive proposed hostnames or cloudflared snippets.
- Internal APIs and gateways remain private by default even when they speak HTTP.
- The marketing landing page stays on Cloudflare Pages and is not tunnel-routed.

> Replace the example domain `nyra.example.com` with your real Cloudflare zone before provisioning DNS.

| Service | Repo path (FINAL) | Compose service name | Container port(s) | Host port(s) | Protocol | Health endpoint | Exposure | Proposed hostname | Cloudflared ingress snippet |
|---|---|---|---|---|---|---|---|---|---|
| activepieces | `infra/docker-compose.oracle.yml` | `activepieces` | `80` | `3001` | `tcp` | — | public-via-cloudflare-access | activepieces.nyra.example.com | - hostname: activepieces.nyra.example.com<br>  service: http://localhost:3001 |
| adminer | `infra/docker-compose.oracle.yml` | `adminer` | `8080` | `8080` | `tcp` | — | private |   | — |
| ruvector | `infra/dev-stack/docker-compose.yml` | `ruvector` | `5432` | `5440` | `tcp` | — | private |   | — |
| archon-os | `infra/dev-stack/docker-compose.yml` | `archon-os` | `8095` | `8095` | `tcp` | — | private |   | — |
| alertmanager | `infra/stacks/nyra-mortgage/docker-compose.yml` | `alertmanager` | `9093` | `9093` | `tcp` | — | private |   | — |
| archon-agent-work-orders | `docker-compose.archon.yml` | `archon-agent-work-orders` | `8053` | `8053` | `tcp` | — | private |   | — |
| archon-agents | `docker-compose.archon.yml` | `archon-agents` | `8052` | `8052` | `tcp` | — | private |   | — |
| archon-mcp | `docker-compose.archon.yml` | `archon-mcp` | `8051` | `8051` | `tcp` | — | private |   | — |
| archon-os | `docker-compose.archon.yml` | `archon-os` | `9001` | `9001` | `tcp` | — | private |   | — |
| archon-server | `docker-compose.archon.yml` | `archon-server` | `8181` | `8181` | `tcp` | — | private |   | — |
| archon-ui | `docker-compose.archon.yml` | `archon-ui` | `5173` | `3737` | `tcp` | — | public-via-cloudflare-access | archon.nyra.example.com | - hostname: archon.nyra.example.com<br>  service: http://localhost:3737 |
| bitwarden-mcp | `infra/docker-compose.yml` | `bitwarden-mcp` | `8814` | `8814` | `tcp` | — | private |   | — |
| cadvisor | `infra/docker-compose.yml` | `cadvisor` | `8080` | `8081` | `tcp` | — | private |   | — |
| campaign_engine | `infra/stacks/nyra-mortgage/docker-compose.services.yml` | `campaign_engine` | `9020` | `9020` | `tcp` | — | private |   | — |
| archon-os | `infra/docker-compose.yml` | `archon-os` | `8080` | `8085` | `tcp` | — | private |   | — |
| archon-os-brain | `infra/dev-stack/docker-compose.yml` | `archon-os-brain` | `8080` | `8085` | `tcp` | — | private |   | — |
| archon-os-cicd | `infra/docker-compose/docker-compose.archon-os.yml` | `archon-os-cicd` | `—` | `—` | `—` | — | private |   | — |
| archon-os-dashboard | `infra/dev-stack/docker-compose.yml` | `archon-os-dashboard` | `3003` | `3003` | `tcp` | — | private |   | — |
| archon-os-event-server | `infra/dev-stack/docker-compose.yml` | `archon-os-event-server` | `3004, 3005` | `3004, 3005` | `tcp` | — | private |   | — |
| cloudflared | `infra/compose/cloudflared.profile.yml` | `cloudflared` | `—` | `—` | `—` | — | private |   | — |
| docker-mcp-toolkit | `infra/docker-compose.yml` | `docker-mcp-toolkit` | `8811` | `8811` | `tcp` | — | private |   | — |
| embedding-service | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `embedding-service` | `8080` | `8080` | `tcp` | — | private |   | — |
| falkordb | `infra/oracle/docker-compose.oracle.yml` | `falkordb` | `—` | `—` | `—` | — | private |   | — |
| git-mcp | `infra/docker-compose.yml` | `git-mcp` | `8812` | `8812` | `tcp` | — | private |   | — |
| gitea | `docker-compose.gitea.yml` | `gitea` | `3000, 22` | `3100, 2222` | `tcp` | — | public-via-cloudflare-access | gitea.nyra.example.com | - hostname: gitea.nyra.example.com<br>  service: http://localhost:3100 |
| gitea-act-runner | `docker-compose.gitea.yml` | `gitea-act-runner` | `—` | `—` | `—` | — | private |   | — |
| gitea-act-runner-large | `docker-compose.gitea.yml` | `gitea-act-runner-large` | `—` | `—` | `—` | — | private |   | — |
| gitea-ai-reviewer | `docker-compose.gitea.yml` | `gitea-ai-reviewer` | `—` | `—` | `—` | — | private |   | — |
| gitea-db | `docker-compose.gitea.yml` | `gitea-db` | `—` | `—` | `—` | — | private |   | — |
| gitea-runner | `infra/configs/gitea/docker-compose.gitea.yml` | `gitea-runner` | `—` | `—` | `—` | — | private |   | — |
| github-mcp | `infra/docker-compose.yml` | `github-mcp` | `8813` | `8813` | `tcp` | — | private |   | — |
| github-mirror-sync | `infra/configs/gitea/docker-compose.gitea.yml` | `github-mirror-sync` | `—` | `—` | `—` | — | private |   | — |
| gpu-exporter | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `gpu-exporter` | `9445` | `9445` | `tcp` | — | private |   | — |
| grafana | `infra/docker-compose.yml` | `grafana` | `3000` | `3003` | `tcp` | /api/health | public-via-cloudflare-access | grafana.nyra.example.com | - hostname: grafana.nyra.example.com<br>  service: http://localhost:3003 |
| letta-mcp | `infra/oracle/docker-compose.oracle.yml` | `letta-mcp` | `—` | `—` | `—` | — | private |   | — |
| letta_mcp | `infra/stacks/nyra-mortgage/docker-compose.letta.yml` | `letta_mcp` | `8000` | `8000` | `tcp` | — | private |   | — |
| health-checker | `infra/workers/docker-compose.workers.yml` | `health-checker` | `—` | `—` | `—` | — | private |   | — |
| health-monitor | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `health-monitor` | `9090` | `9090` | `tcp` | — | private |   | — |
| infisical | `docker-compose.infisical.yml` | `infisical` | `8080` | `3201` | `tcp` | — | public-via-cloudflare-access | infisical.nyra.example.com | - hostname: infisical.nyra.example.com<br>  service: http://localhost:3201 |
| infisical-agent | `docker-compose.archon.yml` | `infisical-agent` | `—` | `—` | `—` | — | private |   | — |
| infisical-agent-gitea | `docker-compose.gitea.yml` | `infisical-agent-gitea` | `—` | `—` | `—` | — | private |   | — |
| infisical-cli | `docker-compose.archon.yml` | `infisical-cli` | `—` | `—` | `—` | — | private |   | — |
| infisical-db | `docker-compose.infisical.yml` | `infisical-db` | `—` | `—` | `—` | — | private |   | — |
| infisical-mcp | `infra/docker-compose.yml` | `infisical-mcp` | `8815` | `8815` | `tcp` | — | private |   | — |
| infisical-redis | `docker-compose.infisical.yml` | `infisical-redis` | `—` | `—` | `—` | — | private |   | — |
| kyutai-unmute | `infra/compose/voice.profile.yml` | `kyutai-unmute` | `8080` | `127.0.0.1:8088` | `tcp` | — | private |   | — |
| kyutai-unmute-cloud | `infra/compose/openclaw-unmute.overlay.yml` | `kyutai-unmute-cloud` | `8080` | `127.0.0.1:8098` | `tcp` | — | private |   | — |
| lead-ingestion | `infra/docker-compose.oracle.yml` | `lead-ingestion` | `8090` | `8090` | `tcp` | — | private |   | — |
| letta | `infra/stacks/nyra-mortgage/docker-compose.yml` | `letta` | `8283` | `8283` | `tcp` | — | private |   | — |
| letta_postgres | `infra/stacks/nyra-mortgage/docker-compose.yml` | `letta_postgres` | `—` | `—` | `—` | — | private |   | — |
| litellm | `docker-compose.archon.yml` | `litellm` | `—` | `—` | `—` | — | private |   | — |
| lmcache | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `lmcache` | `8100` | `8100` | `tcp` | — | private |   | — |
| lmcache-server | `infra/workers/worker-rtx3090ti/docker-compose.gpu.yml` | `lmcache-server` | `8100` | `127.0.0.1:8100` | `tcp` | — | private |   | — |
| loki | `infra/docker-compose.yml` | `loki` | `3100` | `3100` | `tcp` | — | private |   | — |
| mem0 | `infra/docker-compose.oracle.yml` | `mem0` | `5000` | `5000` | `tcp` | — | private |   | — |
| model-preloader | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `model-preloader` | `—` | `—` | `—` | — | private |   | — |
| model-switcher | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `model-switcher` | `—` | `—` | `—` | — | private |   | — |
| moltbot | `infra/oracle/docker-compose.oracle.yml` | `moltbot` | `18789, 18790` | `18789, 18790` | `tcp` | — | private |   | — |
| moltbot-web | `infra/docker-compose.yml` | `moltbot-web` | `3030` | `3030` | `tcp` | — | private |   | — |
| mongo | `infra/docker-compose.yml` | `mongo` | `27017` | `27017` | `tcp` | — | private |   | — |
| n8n | `infra/docker-compose.yml` | `n8n` | `5678` | `5678` | `tcp` | /healthz | public-via-cloudflare-access | n8n.nyra.example.com | - hostname: n8n.nyra.example.com<br>  service: http://localhost:5678 |
| nexus | `infra/orchestrator/docker-compose.orchestrator.yml` | `nexus` | `6000` | `6000` | `tcp` | — | private |   | — |
| nexus-router | `docker-compose.archon.yml` | `nexus-router` | `7000, 8080, 9091` | `7000, 8080, 9091` | `tcp` | — | private |   | — |
| nexus_onehop | `infra/orchestrator/docker-compose.nexus-one-hop.yml` | `nexus_onehop` | `6000, 6011` | `6000, 6011` | `tcp` | — | private |   | — |
| node-exporter | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `node-exporter` | `9100` | `9100` | `tcp` | — | private |   | — |
| nvidia-gpu-exporter | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `nvidia-gpu-exporter` | `9835` | `9835` | `tcp` | — | private |   | — |
| nyra-home-dashboard | `infra/homeassistant/docker-compose.homeassistant-dashboard.yml` | `nyra-home-dashboard` | `3000` | `3007` | `tcp` | — | private |   | — |
| nyra-mcp | `infra/docker-compose.yml` | `nyra-mcp` | `8081` | `3333` | `tcp` | — | private |   | — |
| nyra-secrets-init | `docker-compose.gitea.yml` | `nyra-secrets-init` | `—` | `—` | `—` | — | private |   | — |
| nyra_orchestrator | `infra/stacks/nyra-mortgage/docker-compose.local.yml` | `nyra_orchestrator` | `9000` | `9000` | `tcp` | — | private |   | — |
| ollama | `infra/workers/docker-compose.workers.yml` | `ollama` | `11434` | `11434` | `tcp` | — | private |   | — |
| ollama-model-loader | `infra/workers/worker-rtx3060/docker-compose.gpu.yml` | `ollama-model-loader` | `—` | `—` | `—` | — | private |   | — |
| ollama-server | `infra/workers/worker-rtx3060/docker-compose.gpu.yml` | `ollama-server` | `11434, 11434` | `127.0.0.1:11434, 0.0.0.0:11434` | `tcp` | — | private |   | — |
| onnx-runtime | `infra/workers/worker-3060/docker-compose.worker-3060.yml` | `onnx-runtime` | `8001, 8002` | `8001, 8002` | `tcp` | — | private |   | — |
| openclaw | `infra/orchestrator/docker-compose.orchestrator.yml` | `openclaw` | `8001` | `8001` | `tcp` | — | private |   | — |
| openclaw-cli | `infra/compose/openclaw.profile.yml` | `openclaw-cli` | `—` | `—` | `—` | — | private |   | — |
| openclaw-gateway | `infra/compose/openclaw.profile.yml` | `openclaw-gateway` | `127.0.0.1:3400:3400` | `—` | `tcp` | — | private |   | — |
| openclaw-mvp | `infra/compose/openclaw-unmute.overlay.yml` | `openclaw-mvp` | `3400` | `127.0.0.1:3401` | `tcp` | — | private |   | — |
| openclaw-ops | `infra/compose/openclaw.ops.compose.yml` | `openclaw-ops` | `—` | `—` | `—` | — | private |   | — |
| openclaw-ui-proxy | `infra/compose/openclaw.ui.compose.yml` | `openclaw-ui-proxy` | `8080` | `127.0.0.1:8099` | `tcp` | — | private |   | — |
| openmemory_mcp | `infra/stacks/nyra-mortgage/docker-compose.yml` | `openmemory_mcp` | `8081` | `8081` | `tcp` | — | private |   | — |
| openwebui | `infra/docker-compose.yml` | `openwebui` | `8080` | `8088` | `tcp` | — | private |   | — |
| portainer | `infra/orchestrator/portainer-mesh/docker-compose.portainer.orchestrator.yml` | `portainer` | `9443, 9000, 9001` | `9443, 9000, 9001` | `tcp` | — | private |   | — |
| portainer-edge-agent | `infra/orchestrator/portainer-mesh/docker-compose.portainer.edge-agent.yml` | `portainer-edge-agent` | `—` | `—` | `—` | — | private |   | — |
| portainer-edge-agent-local | `infra/orchestrator/portainer-mesh/docker-compose.portainer.orchestrator.yml` | `portainer-edge-agent-local` | `—` | `—` | `—` | — | private |   | — |
| postgres | `docker-compose.archon.yml` | `postgres` | `5432` | `5432` | `tcp` | — | private |   | — |
| postgres-client | `infra/orchestrator/docker-compose.orchestrator.yml` | `postgres-client` | `—` | `—` | `—` | — | private |   | — |
| prometheus | `infra/compose/monitoring.profile.yml` | `prometheus` | `9090` | `127.0.0.1:9090` | `tcp` | — | private |   | — |
| promtail | `infra/workers/worker-3090/docker-compose.worker-3090.yml` | `promtail` | `—` | `—` | `—` | — | private |   | — |
| quote-api | `infra/oracle/docker-compose.oracle.yml` | `quote-api` | `7070` | `7070` | `tcp` | /health | private |   | — |
| quote-engine | `infra/docker-compose.oracle.yml` | `quote-engine` | `8089` | `8089` | `tcp` | — | private |   | — |
| quote_api | `infra/stacks/nyra-mortgage/docker-compose.services.yml` | `quote_api` | `8080` | `8089` | `tcp` | — | private |   | — |
| quote_engine | `infra/stacks/nyra-mortgage/docker-compose.services.yml` | `quote_engine` | `9010` | `9010` | `tcp` | — | private |   | — |
| redis | `docker-compose.archon.yml` | `redis` | `6379` | `6379` | `tcp` | — | private |   | — |
| redis-cache | `infra/oracle/docker-compose.oracle.yml` | `redis-cache` | `—` | `—` | `—` | — | private |   | — |
| ruflo-runtime | `infra/dev-stack/docker-compose.yml` | `ruflo-runtime` | `—` | `—` | `—` | — | private |   | — |
| ruvector-pgadmin | `infra/docker-compose.yml` | `ruvector-pgadmin` | `80` | `5050` | `tcp` | — | private |   | — |
| ruvector-postgres | `infra/dev-stack/docker-compose.yml` | `ruvector-postgres` | `5432` | `5436` | `tcp` | — | private |   | — |
| tunnel | `infra/docker-compose.orchestrator-cf-tunnel.yml` | `tunnel` | `—` | `—` | `—` | — | private |   | — |
| twenty | `infra/compose/oracle.override.yml` | `twenty` | `3000` | `127.0.0.1:3002` | `tcp` | — | private |   | — |
| twenty-crm | `infra/docker-compose.oracle.yml` | `twenty-crm` | `3000` | `3000` | `tcp` | — | private |   | — |
| twenty-db | `infra/docker-compose.twenty.yml` | `twenty-db` | `5432` | `5433` | `tcp` | — | private |   | — |
| twenty-mcp-server | `infra/docker-compose.twenty.yml` | `twenty-mcp-server` | `3022` | `3022` | `tcp` | — | private |   | — |
| twenty-postgres | `infra/docker-compose.yml` | `twenty-postgres` | `—` | `—` | `—` | — | private |   | — |
| twenty-redis | `infra/docker-compose.twenty.yml` | `twenty-redis` | `6379` | `6380` | `tcp` | — | private |   | — |
| twenty-worker | `infra/docker-compose.twenty.yml` | `twenty-worker` | `—` | `—` | `—` | — | private |   | — |
| twenty_postgres | `infra/stacks/nyra-mortgage/docker-compose.yml` | `twenty_postgres` | `—` | `—` | `—` | — | private |   | — |
| twentycrm | `infra/docker-compose.yml` | `twentycrm` | `3000` | `3000` | `tcp` | — | public-via-cloudflare-access | twentycrm.nyra.example.com | - hostname: twentycrm.nyra.example.com<br>  service: http://localhost:3000 |
| twentycrm-mcp | `infra/docker-compose.yml` | `twentycrm-mcp` | `8082` | `8182` | `tcp` | — | private |   | — |
| vllm | `infra/workers/docker-compose.workers.yml` | `vllm` | `8000` | `8000` | `tcp` | — | private |   | — |
| vllm-server | `infra/workers/worker-rtx3090ti/docker-compose.gpu.yml` | `vllm-server` | `8000, 8000` | `127.0.0.1:8000, 0.0.0.0:8000` | `tcp` | — | private |   | — |
| vllm-worker | `infra/compose/workers.override.yml` | `vllm-worker` | `8000` | `127.0.0.1:8000` | `tcp` | — | private |   | — |
| worker-3060-ollama | `infra/docker-compose.yml` | `worker-3060-ollama` | `11434` | `11434` | `tcp` | — | private |   | — |
| worker-3090ti-vllm | `infra/docker-compose.yml` | `worker-3090ti-vllm` | `8000` | `8000` | `tcp` | — | private |   | — |
| worker-5090-vllm | `infra/docker-compose.yml` | `worker-5090-vllm` | `8000` | `8001` | `tcp` | — | private |   | — |
| worker-rtx3060 | `infra/workers/worker-rtx3060/docker-compose.worker.yml` | `worker-rtx3060` | `—` | `—` | `—` | — | private |   | — |
