# Stack Asset Inventory

Generated: 2026-02-28T20:15:13+00:00

## Compose files discovered
- infra/compose/docker-compose.archon.yml
- infra/compose/docker-compose.cloudflared.yml
- infra/compose/overrides/docker-compose.orchestrator.override.yml
- infra/compose/overrides/docker-compose.worker-rtx3060.override.yml
- infra/compose/overrides/docker-compose.worker-rtx3090ti.override.yml
- infra/compose/overrides/docker-compose.worker-rtx5090.override.yml
- infra/configs/gitea/docker-compose.gitea.yml
- infra/docker-compose.archon-os-cicd.yml
- infra/docker-compose.dashboard.yml
- infra/docker-compose.orchestrator-cf-tunnel.yml
- infra/docker-compose.yml
- infra/docker-compose/docker-compose.archon-os.yml
- infra/stacks/nyra-mortgage/docker-compose.addons.yml
- infra/stacks/nyra-mortgage/docker-compose.letta.yml
- infra/stacks/nyra-mortgage/docker-compose.local.yml
- infra/stacks/nyra-mortgage/docker-compose.services.yml
- infra/stacks/nyra-mortgage/docker-compose.voice.yml
- infra/stacks/nyra-mortgage/docker-compose.yml
- infra/workers/worker-3060/docker-compose.worker-3060.yml
- infra/workers/worker-3090/docker-compose.worker-3090.yml
- infra/workers/worker-5090/docker-compose.worker-5090.yml

## Dockerfiles discovered
- apps/archon-os-dashboard/Dockerfile
- apps/ingestion/files/nyra-stack/services/mem0-rest/Dockerfile
- apps/ingestion/files/nyra-stack/services/nyra-orchestrator/Dockerfile
- apps/ingestion/files/services/campaign-engine/Dockerfile
- apps/ingestion/files/services/mem0-mcp/Dockerfile
- apps/ingestion/files/services/nyra-orchestrator/Dockerfile
- apps/ingestion/files/services/quote-api/Dockerfile
- apps/ingestion/files/services/quote-engine/Dockerfile
- apps/web/webapp/mortgage-services/Dockerfile
- infra/images/n8n/Dockerfile
- infra/images/nexus-router/Dockerfile
- infra/stacks/nyra-mortgage/services/mem0-rest/Dockerfile
- infra/stacks/nyra-mortgage/services/nyra-orchestrator/Dockerfile
- infra/workers/worker-3060/embedding-service/Dockerfile
- infra/workers/worker-3060/health-monitor/Dockerfile
- services/archon-os/docker/Dockerfile.agents
- services/archon-os/docker/Dockerfile.archon-os
- services/archon-os/docker/Dockerfile.mcp
- services/archon-os/docker/Dockerfile.server
- services/archon-os-event-server/Dockerfile
- services/archon-os/Dockerfile
- services/gitea-mcp/Dockerfile
- services/security-service/node_modules/sql.js/.devcontainer/Dockerfile

## Services currently in master compose
- postgres
- redis
- mongo
- litellm
- nexus-router
- n8n
- activepieces
- twenty-postgres
- twentycrm
- twentycrm-mcp
- archon-os
- archon-os
- moltbot-web
- openwebui
- prometheus
- loki
- grafana
- cloudflared

## Ports currently declared in master compose
- postgres: ${POSTGRES_PORT:-5432}:5432
- redis: ${REDIS_PORT:-6379}:6379
- mongo: ${MONGO_PORT:-27017}:27017
- litellm: ${LITELLM_PORT:-4000}:4000
- nexus-router: ${NEXUS_ROUTER_PORT:-7000}:7000, ${NEXUS_MCP_PORT:-8080}:8080, ${NEXUS_METRICS_PORT:-9091}:9091
- n8n: ${N8N_PORT:-5678}:5678
- activepieces: ${ACTIVEPIECES_PORT:-8082}:80
- twentycrm: ${TWENTYCRM_PORT:-3000}:3000
- twentycrm-mcp: ${TWENTYCRM_MCP_PORT:-8082}:8082
- archon-os: ${ARCHON_OS_PORT:-9001}:9001
- archon-os: ${ARCHON_OS_PORT:-9001}:9001
- moltbot-web: ${MOLTBOT_WEB_PORT:-3030}:3030
- openwebui: ${OPENWEBUI_PORT:-8088}:8080
- prometheus: ${PROMETHEUS_PORT:-9090}:9090
- loki: ${LOKI_PORT:-3100}:3100
- grafana: ${GRAFANA_PORT:-3003}:3000
