# 02 Ports Registry (POST-MOVE)

| Service | Repo path (FINAL) | Compose service name | Container port(s) | Host port(s) | Protocol | Health endpoint | Exposure (public/private) | Proposed hostname (if public) | Cloudflared ingress rule snippet (copy/paste) |
|---|---|---|---|---|---|---|---|---|---|
| n8n | `apps/ingestion/files/nyra-stack/docker-compose.addons.yml` | `n8n` | `5678` | `5678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify-db | `apps/ingestion/files/nyra-stack/docker-compose.addons.yml` | `dify-db` | `5432` | `5434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify-redis | `apps/ingestion/files/nyra-stack/docker-compose.addons.yml` | `dify-redis` | `6379` | `6380` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify-api | `apps/ingestion/files/nyra-stack/docker-compose.addons.yml` | `dify-api` | `5001` | `5001` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://dify-api:5001
``` |
| dify-web | `apps/ingestion/files/nyra-stack/docker-compose.addons.yml` | `dify-web` | `3000` | `3005` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| graphiti_mcp | `apps/ingestion/files/nyra-stack/docker-compose.graphiti.yml` | `graphiti_mcp` | `8000` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nyra_orchestrator | `apps/ingestion/files/nyra-stack/docker-compose.local.yml` | `nyra_orchestrator` | `9000` | `9000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| quote_engine | `apps/ingestion/files/nyra-stack/docker-compose.services.yml` | `quote_engine` | `9010` | `9010` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://quote_engine:9010
``` |
| campaign_engine | `apps/ingestion/files/nyra-stack/docker-compose.services.yml` | `campaign_engine` | `9020` | `9020` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| quote_api | `apps/ingestion/files/nyra-stack/docker-compose.services.yml` | `quote_api` | `8080` | `8089` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://quote_api:8080
``` |
| nexus | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `nexus` | `6000` | `6000` | `tcp` | `n/a` | `public` | `nexus.ratehunter.net` | ```yaml
- hostname: nexus.ratehunter.net
  service: http://nexus:6000
``` |
| litellm | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `litellm` | `4000` | `4000` | `tcp` | `/health` | `public` | `litellm.ratehunter.net` | ```yaml
- hostname: litellm.ratehunter.net
  service: http://litellm:4000
``` |
| twenty | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `twenty` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| falkordb | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `falkordb` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| letta | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `letta` | `8283` | `8283` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mem0 | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `mem0` | `4321` | `4321` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| openmemory_mcp | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `openmemory_mcp` | `8081` | `8081` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nyra_orchestrator | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `nyra_orchestrator` | `8010` | `8010` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| loki | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `loki` | `3100` | `3100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `grafana` | `3000` | `3005` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| alertmanager | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `alertmanager` | `9093` | `9093` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| openwebui | `apps/ingestion/files/nyra-stack/docker-compose.yml` | `openwebui` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| web | `apps/web/webapp/mortgage-services/docker-compose.yml` | `web` | `3000` | `8080` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| web | `apps/web/webapp/mortgage-services/docker-compose.yml` | `web` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| api | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `api` | `3000` | `3000` | `tcp` | `/health` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://api:3000
``` |
| mongodb | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `mongodb` | `27017` | `27017` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis-commander | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `redis-commander` | `8081` | `8081` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mongo-express | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `mongo-express` | `8081` | `8082` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mailhog | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `mailhog` | `1025` | `1025` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mailhog | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `mailhog` | `8025` | `8025` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `grafana` | `3000` | `3001` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nginx | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `nginx` | `80` | `80` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nginx | `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/docker-compose.yml` | `nginx` | `443` | `443` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| app | `docs/references/claude-flow-examples/flask-api-sparc/docker-compose.yml` | `app` | `5000` | `5000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| litellm | `docs/references/claude-flow-examples/litellm/docker-compose.basic.yml` | `litellm` | `4000` | `4000` | `tcp` | `/health` | `public` | `litellm.ratehunter.net` | ```yaml
- hostname: litellm.ratehunter.net
  service: http://litellm:4000
``` |
| nginx | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `nginx` | `80` | `4000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nginx | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `nginx` | `443` | `4443` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `grafana` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| loki | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `loki` | `3100` | `3100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| pgadmin | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `pgadmin` | `80` | `5050` | `tcp` | `n/a` | `public` | `admin.ratehunter.net` | ```yaml
- hostname: admin.ratehunter.net
  service: http://pgadmin:80
``` |
| ollama | `docs/references/claude-flow-examples/litellm/docker-compose.yml` | `ollama` | `11434` | `11434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `infra-archived/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/docker-compose.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `infra-archived/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/docker-compose.yml` | `grafana` | `3000` | `3005` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| alertmanager | `infra-archived/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/docker-compose.yml` | `alertmanager` | `9093` | `9093` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| pushgateway | `infra-archived/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/docker-compose.yml` | `pushgateway` | `9091` | `9091` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| node-exporter | `infra-archived/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/docker-compose.yml` | `node-exporter` | `9100` | `9100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| cadvisor | `infra-archived/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/docker-compose.yml` | `cadvisor` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.claude-flow.yml` | `claude-flow` | `12018` | `12018` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| portainer | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.management.yml` | `portainer` | `9000` | `9000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dozzle | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.management.yml` | `dozzle` | `8080` | `9999` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.mcp.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.memory.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.memory.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.memory.yml` | `qdrant` | `6333` | `6333` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.metamcp.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.metatool.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.orchestration.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| n8n | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.orchestration.yml` | `n8n` | `5678` | `5678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| flowise | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.orchestration.yml` | `flowise` | `3001` | `3001` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.orchestration.yml` | `dify` | `80` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-ui | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui-integration.yml` | `archon-ui` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| open-webui | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui-integration.yml` | `open-webui` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp-proxy | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui-integration.yml` | `metamcp-proxy` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| open-webui | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui.yml` | `open-webui` | `8080` | `3000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| pipelines | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui.yml` | `pipelines` | `9099` | `9099` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mcpo | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui.yml` | `mcpo` | `3339` | `3339` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| lobechat | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui.yml` | `lobechat` | `3210` | `3210` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| librechat | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/compose.ui.yml` | `librechat` | `3000` | `3333` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| github-mcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/general-mcp.compose.yml` | `github-mcp` | `3010` | `3010` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| docker-mcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/general-mcp.compose.yml` | `docker-mcp` | `3011` | `3011` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| filesystem-mcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/general-mcp.compose.yml` | `filesystem-mcp` | `3012` | `3012` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| memory-mcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/general-mcp.compose.yml` | `memory-mcp` | `3013` | `3013` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| notion-mcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/general-mcp.compose.yml` | `notion-mcp` | `3014` | `3014` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/orchestration.compose.yml` | `metamcp` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/orchestration.compose.yml` | `metamcp` | `3001` | `3001` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-mcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/orchestration.compose.yml` | `archon-mcp` | `3003` | `3003` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-ui | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/orchestration.compose.yml` | `archon-ui` | `3005` | `3005` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| bitwarden | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/security.compose.yml` | `bitwarden` | `80` | `8081` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| infisical | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/security.compose.yml` | `infisical` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| open-webui | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/ui.compose.yml` | `open-webui` | `8080` | `3002` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ollama | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/compose/ui.compose.yml` | `ollama` | `11434` | `11434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.claude-flow.yml` | `claude-flow` | `12018` | `12018` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.mcp.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.memory.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.memory.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.memory.yml` | `qdrant` | `6333` | `6333` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.metamcp.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.orchestration.yml` | `metamcp` | `12008` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| n8n | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.orchestration.yml` | `n8n` | `5678` | `5678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| flowise | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.orchestration.yml` | `flowise` | `3001` | `3001` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.orchestration.yml` | `dify` | `80` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| open-webui | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.ui.yml` | `open-webui` | `8080` | `3000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| pipelines | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.ui.yml` | `pipelines` | `9099` | `9099` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mcpo | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.ui.yml` | `mcpo` | `3339` | `3339` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| lobechat | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.ui.yml` | `lobechat` | `3210` | `3210` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| librechat | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/compose/compose.ui.yml` | `librechat` | `3000` | `3333` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ollama | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/nyra-stack-v6_2/worker/docker-compose.yml` | `ollama` | `11434` | `11434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| caddy | `infra-archived/infra-20260206-1551/archive/nyra-infra-old/nyra-stack-v6_2/worker/docker-compose.yml` | `caddy` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| open-webui | `infra-archived/infra-20260206-1551/archive/open-webui/open-webui-compose.yml` | `open-webui` | `8080` | `3002` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ollama | `infra-archived/infra-20260206-1551/archive/open-webui/open-webui-compose.yml` | `ollama` | `11434` | `11434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow-dashboard | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.claude-flow-dashboard.yml` | `claude-flow-dashboard` | `3003` | `3003` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow-dashboard | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.claude-flow-dashboard.yml` | `claude-flow-dashboard` | `24678` | `24678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.databases.yml` | `qdrant` | `6334` | `6334` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ruvector-postgres | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.golden-core.yml` | `ruvector-postgres` | `5432` | `5433` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.golden-core.yml` | `redis` | `6379` | `6380` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| falkordb | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.golden-core.yml` | `falkordb` | `6379` | `6381` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| falkordb | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.golden-core.yml` | `falkordb` | `8000` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| node-exporter | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.observability.yml` | `node-exporter` | `9100` | `9100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify-api | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.workflow.yml` | `dify-api` | `5001` | `5001` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://dify-api:5001
``` |
| twenty | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `twenty` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| n8n | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `n8n` | `5678` | `5678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify-api | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `dify-api` | `5001` | `3001` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://dify-api:5001
``` |
| dify-web | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `dify-web` | `3000` | `3002` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| openwebui | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `openwebui` | `8080` | `3333` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nyra-orchestrator | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `nyra-orchestrator` | `8010` | `8010` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow-alpha | `infra-archived/infra-20260206-1551/docker/apps/docker-compose.apps.yml` | `claude-flow-alpha` | `3000` | `9000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nexus-router | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `nexus-router` | `6000` | `6000` | `tcp` | `n/a` | `public` | `nexus.ratehunter.net` | ```yaml
- hostname: nexus.ratehunter.net
  service: http://nexus-router:6000
``` |
| nexus-router | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `nexus-router` | `8000` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `qdrant` | `6333` | `6333` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `qdrant` | `6334` | `6334` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| falkordb | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `falkordb` | `6379` | `6380` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| neo4j | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `neo4j` | `7474` | `7474` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| neo4j | `infra-archived/infra-20260206-1551/docker/base/docker-compose.core.yml` | `neo4j` | `7687` | `7687` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nexus-router | `infra-archived/infra-20260206-1551/docker/base/docker-compose.mcp.yml` | `nexus-router` | `6000` | `6000` | `tcp` | `n/a` | `public` | `nexus.ratehunter.net` | ```yaml
- hostname: nexus.ratehunter.net
  service: http://nexus-router:6000
``` |
| litellm | `infra-archived/infra-20260206-1551/docker/base/docker-compose.mcp.yml` | `litellm` | `4000` | `4000` | `tcp` | `/health` | `public` | `litellm.ratehunter.net` | ```yaml
- hostname: litellm.ratehunter.net
  service: http://litellm:4000
``` |
| claude-flow | `infra-archived/infra-20260206-1551/docker/base/docker-compose.mcp.yml` | `claude-flow` | `3010` | `3010` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| agentdb | `infra-archived/infra-20260206-1551/docker/base/docker-compose.mcp.yml` | `agentdb` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ruvector | `infra-archived/infra-20260206-1551/docker/base/docker-compose.mcp.yml` | `ruvector` | `8888` | `8888` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| infisical | `infra-archived/infra-20260206-1551/docker/base/docker-compose.mcp.yml` | `infisical` | `8080` | `8082` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-frontend | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `archon-frontend` | `3000` | `8051` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-backend | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `archon-backend` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-db | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `archon-db` | `5432` | `5433` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-redis | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `archon-redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| transformers-service | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `transformers-service` | `8080` | `8090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| onnx-runtime | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `onnx-runtime` | `8001` | `8091` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| open-webui | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `open-webui` | `8080` | `3000` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| serena-mcp | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `serena-mcp` | `8080` | `8092` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| gemini-assistant-mcp | `infra-archived/infra-20260206-1551/docker/client/docker-compose.yml` | `gemini-assistant-mcp` | `8080` | `8093` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-server | `infra-archived/infra-20260206-1551/docker/docker-compose.archon.yml` | `archon-server` | `8181` | `8181` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-mcp | `infra-archived/infra-20260206-1551/docker/docker-compose.archon.yml` | `archon-mcp` | `8051` | `8051` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-ui | `infra-archived/infra-20260206-1551/docker/docker-compose.archon.yml` | `archon-ui` | `3737` | `3737` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon-agents | `infra-archived/infra-20260206-1551/docker/docker-compose.archon.yml` | `archon-agents` | `8052` | `8052` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `claude-flow` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `claude-flow` | `9229` | `9229` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `archon` | `8000` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archon | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `archon` | `5678` | `5678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mongo | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `mongo` | `27017` | `27017` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| adminer | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `adminer` | `8080` | `8082` | `tcp` | `n/a` | `public` | `admin.ratehunter.net` | ```yaml
- hostname: admin.ratehunter.net
  service: http://adminer:8080
``` |
| redis-commander | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `redis-commander` | `8081` | `8081` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mailhog | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `mailhog` | `8025` | `8025` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mailhog | `infra-archived/infra-20260206-1551/docker/docker-compose.dev.yml` | `mailhog` | `1025` | `1025` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mcp-archon | `infra-archived/infra-20260206-1551/docker/docker-compose.mcp.yml` | `mcp-archon` | `8051` | `8051` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mcp-exa | `infra-archived/infra-20260206-1551/docker/docker-compose.mcp.yml` | `mcp-exa` | `8007` | `8007` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nginx-mcp | `infra-archived/infra-20260206-1551/docker/docker-compose.mcp.yml` | `nginx-mcp` | `80` | `8050` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/docker/docker-compose.orchestration.yml` | `qdrant` | `6334` | `6334` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `infra-archived/infra-20260206-1551/docker/docker-compose.prod.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `infra-archived/infra-20260206-1551/docker/docker-compose.prod.yml` | `grafana` | `3000` | `3002` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| loki | `infra-archived/infra-20260206-1551/docker/docker-compose.prod.yml` | `loki` | `3100` | `3100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nexus-router | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `nexus-router` | `6000` | `6000` | `tcp` | `n/a` | `public` | `nexus.ratehunter.net` | ```yaml
- hostname: nexus.ratehunter.net
  service: http://nexus-router:6000
``` |
| nexus-router | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `nexus-router` | `8000` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `qdrant` | `6333` | `6333` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| qdrant | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `qdrant` | `6334` | `6334` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| falkordb | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `falkordb` | `6379` | `6380` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| neo4j | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `neo4j` | `7474` | `7474` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| neo4j | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `neo4j` | `7687` | `7687` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| litellm | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `litellm` | `4000` | `4000` | `tcp` | `/health` | `public` | `litellm.ratehunter.net` | ```yaml
- hostname: litellm.ratehunter.net
  service: http://litellm:4000
``` |
| claude-flow | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `claude-flow` | `3010` | `3010` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| agentdb | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `agentdb` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ruvector | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `ruvector` | `8888` | `8888` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| infisical | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `infisical` | `8080` | `8082` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| twenty | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `twenty` | `3000` | `3000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| n8n | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `n8n` | `5678` | `5678` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| dify-api | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `dify-api` | `5001` | `3001` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://dify-api:5001
``` |
| dify-web | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `dify-web` | `3000` | `3002` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nyra-orchestrator | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `nyra-orchestrator` | `8010` | `8010` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow-alpha | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `claude-flow-alpha` | `3000` | `9000` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archgw-router | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `archgw-router` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `grafana` | `3000` | `3005` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| loki | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `loki` | `3100` | `3100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| alertmanager | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `alertmanager` | `9093` | `9093` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| perf-monitor | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `perf-monitor` | `8090` | `8090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| model-cache | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `model-cache` | `8091` | `8091` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ollama-rtx3060 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `ollama-rtx3060` | `11434` | `11434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| litellm-proxy-rtx3060 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `litellm-proxy-rtx3060` | `4000` | `4001` | `tcp` | `/health` | `public` | `litellm.ratehunter.net` | ```yaml
- hostname: litellm.ratehunter.net
  service: http://litellm-proxy-rtx3060:4000
``` |
| model-manager-rtx3060 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `model-manager-rtx3060` | `8080` | `8081` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| perf-monitor-rtx3060 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `perf-monitor-rtx3060` | `9090` | `9001` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis-worker-rtx3060 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `redis-worker-rtx3060` | `6379` | `6380` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| health-check-rtx3060 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `health-check-rtx3060` | `8080` | `8091` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `prometheus-rtx3090ti` | `9090` | `9091` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `grafana-rtx3090ti` | `3000` | `3006` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| loki-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `loki-rtx3090ti` | `3100` | `3101` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| alertmanager-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `alertmanager-rtx3090ti` | `9093` | `9094` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| node-exporter-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `node-exporter-rtx3090ti` | `9100` | `9100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| cadvisor-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `cadvisor-rtx3090ti` | `8080` | `8083` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| health-check-rtx3090ti | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `health-check-rtx3090ti` | `8080` | `8093` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| vllm-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `vllm-rtx5090` | `8000` | `8000` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ollama-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `ollama-rtx5090` | `11434` | `11435` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| neo4j-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `neo4j-rtx5090` | `7474` | `7475` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| neo4j-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `neo4j-rtx5090` | `7687` | `7688` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| falkordb-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `falkordb-rtx5090` | `6379` | `6381` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| model-manager-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `model-manager-rtx5090` | `8080` | `8082` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| perf-monitor-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `perf-monitor-rtx5090` | `9090` | `9002` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| health-check-rtx5090 | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `health-check-rtx5090` | `8080` | `8092` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| onnx-runtime | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `onnx-runtime` | `8001` | `8001` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| xenova-embeddings | `infra-archived/infra-20260206-1551/docker/docker-compose.yml` | `xenova-embeddings` | `8002` | `8002` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| metamcp-router | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `metamcp-router` | `8080` | `12008` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| claude-flow-dev | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `claude-flow-dev` | `3000` | `7403` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| ruvector-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `ruvector-mcp` | `8080` | `7406` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| agentdb-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `agentdb-mcp` | `8080` | `7407` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| graphiti-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `graphiti-mcp` | `8797` | `8797` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| flow-nexus | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `flow-nexus` | `3000` | `7401` | `tcp` | `/health` | `public` | `nexus.ratehunter.net` | ```yaml
- hostname: nexus.ratehunter.net
  service: http://flow-nexus:3000
``` |
| filesystem-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `filesystem-mcp` | `8080` | `7400` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| github-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `github-mcp` | `8080` | `7402` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| infisical-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `infisical-mcp` | `8080` | `7404` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| bitwarden-mcp | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.legacy.yml` | `bitwarden-mcp` | `8080` | `7405` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| archgw-router | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `archgw-router` | `8080` | `8080` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| prometheus | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `prometheus` | `9090` | `9090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| grafana | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `grafana` | `3000` | `3005` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| loki | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `loki` | `3100` | `3100` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| alertmanager | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `alertmanager` | `9093` | `9093` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| perf-monitor | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `perf-monitor` | `8090` | `8090` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| model-cache | `infra-archived/infra-20260206-1551/docker/orchestrator/docker-compose.orchestrator.yml` | `model-cache` | `8091` | `8091` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| agent-booster | `infra-archived/infra-20260206-1551/docker/services/agent-booster/docker-compose.yml` | `agent-booster` | `3010` | `3010` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| onnx-runtime | `infra-archived/infra-20260206-1551/docker/services/docker-compose.embeddings.yml` | `onnx-runtime` | `8001` | `8001` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| xenova-embeddings | `infra-archived/infra-20260206-1551/docker/services/docker-compose.embeddings.yml` | `xenova-embeddings` | `8002` | `8002` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| agent-booster | `infra-archived/infra-20260206-1551/docker/services/docker-compose.routing.yml` | `agent-booster` | `3010` | `3010` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| epic-sdk | `infra-archived/infra-20260206-1551/docker/services/docker-compose.routing.yml` | `epic-sdk` | `3011` | `3011` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| epic-sdk | `infra-archived/infra-20260206-1551/docker/services/epic-sdk/docker-compose.yml` | `epic-sdk` | `3011` | `3011` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| agent-booster | `infra-archived/infra-20260206-1551/docker/services/epic-sdk/docker-compose.yml` | `agent-booster` | `3010` | `3010` | `tcp` | `/health` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| nexus-router | `infra-archived/infra-20260206-1551/docker/services/nexus-router/docker-compose.yml` | `nexus-router` | `3000` | `6000` | `tcp` | `/health` | `public` | `nexus.ratehunter.net` | ```yaml
- hostname: nexus.ratehunter.net
  service: http://nexus-router:3000
``` |
| redis | `infra-archived/infra-20260206-1551/docker/services/nexus-router/docker-compose.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| postgres | `infra-archived/infra-20260206-1551/docker/tests/docker-compose.test.yml` | `postgres` | `5432` | `5432` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| redis | `infra-archived/infra-20260206-1551/docker/tests/docker-compose.test.yml` | `redis` | `6379` | `6379` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mongo | `infra-archived/infra-20260206-1551/docker/tests/docker-compose.test.yml` | `mongo` | `27017` | `27017` | `tcp` | `n/a` | `private` | `-` | ```yaml
n/a (tailscale/private)
``` |
| mock-api | `infra-archived/infra-20260206-1551/docker/tests/docker-compose.test.yml` | `mock-api` | `1080` | `1080` | `tcp` | `n/a` | `public` | `api.ratehunter.net` | ```yaml
- hostname: api.ratehunter.net
  service: http://mock-api:1080
``` |
| ollama | `infra-archived/infra-20260206-1551/docker/workers/docker-compose.worker-rtx3060.yml` | `ollama` | `11434` | `11434` | `tcp` | `n/a` | `public` | `-` | ```yaml
n/a (tailscale/private)
``` |
| litellm-proxy | `infra-archived/infra-20260206-1551/docker/workers/docker-compose.worker-rtx3060.yml` | `litellm-proxy` | `4000` | `4001` | `tcp` | `/health` | `public` | `litellm.ratehunter.net` | ```yaml
- hostname: litellm.ratehunter.net
  service: http://litellm-proxy:4000
``` |
