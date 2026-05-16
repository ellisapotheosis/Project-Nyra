#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

compose_config() {
  local label="$1"
  shift
  printf 'validating %s... ' "$label"
  "$@" >/dev/null
  printf 'ok\n'
}

compose_config "oracle agent utilities" \
  env \
    PAPERCLIP_DB_PASSWORD=x \
    PAPERCLIP_SESSION_SECRET=x \
    SEARXNG_SECRET=x \
    BROWSERLESS_TOKEN=x \
    docker compose -f infra/hosts/oracle-vps/docker-compose.oracle.yml config

compose_config "memory backend" \
  env \
    LETTA_DB_PASSWORD=x \
    LETTA_SERVER_PASSWORD=x \
    OPENAI_API_KEY=x \
    docker compose -f infra/hosts/oracle-vps/docker-compose.memory.yml config

compose_config "orchestrator OpenClaw edge" \
  env \
    OPENCLAW_GATEWAY_TOKEN=x \
    LITELLM_MASTER_KEY=x \
    PORTAINER_EDGE_ID=test-edge-id \
    PORTAINER_EDGE_KEY=test-edge-key \
    docker compose \
      -f infra/hosts/orchestrator/docker-compose.yml \
      -f infra/hosts/orchestrator/portainer-mesh/docker-compose.portainer.edge-agent.yml \
      -f infra/hosts/_templates/docker-compose.infisical-runtime.yml \
      config

for file in \
  infra/hosts/worker-rtx3060/docker-compose.voice.yml \
  infra/hosts/worker-rtx3060/docker-compose.distributed-voice.yml \
  infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml \
  infra/hosts/worker-rtx5090/docker-compose.distributed-voice.yml
do
  compose_config "$file" \
    env \
      RTX3060_LAN_IP=192.168.1.36 \
      RTX3090TI_LAN_IP=192.168.1.39 \
      RTX5090_LAN_IP=192.168.1.50 \
      LITELLM_API_KEY=x \
      COMPOSIO_MCP_URL='https://backend.composio.dev/v3/mcp/server?user_id=nyra' \
      COMPOSIO_API_KEY=x \
      docker compose -f "$file" config
done

compose_config "oracle MCP tools" \
  env \
    POSTGRES_PASSWORD=x \
    JWT_SECRET=x \
    TWENTY_DB_PASSWORD=x \
    TWENTY_APP_SECRET=x \
    BETTER_AUTH_SECRET=x \
    PAPERCLIP_AGENT_JWT_SECRET=x \
    LITELLM_MASTER_KEY=x \
    OPENAI_API_KEY=x \
    ANTHROPIC_API_KEY=x \
    FIRECRAWL_API_KEY=x \
    TAVILY_API_KEY=x \
    docker compose \
      -f infra/hosts/oracle-vps/docker-compose.yml \
      -f infra/hosts/oracle-vps/docker-compose.activepieces-mcp.yml \
      config

compose_config "worker AI overlays" \
  env \
    POSTGRES_PASSWORD=x \
    PORTAINER_EDGE_ID=test-edge-id \
    PORTAINER_EDGE_KEY=test-edge-key \
    docker compose \
      -f infra/hosts/worker-rtx3060/docker-compose.yml \
      -f infra/hosts/_templates/docker-compose.infisical-runtime.yml \
      -f infra/hosts/_templates/docker-compose.worker-ai-common.yml \
      -f infra/hosts/worker-rtx3060/docker-compose.openclaw.yml \
      config

bash scripts/infra/assert-compose-source-of-truth.sh

if rg -n 'RuVector|Graphiti|ruvector|graphiti' \
  infra/hosts/oracle-vps/docker-compose.oracle.yml \
  infra/hosts/oracle-vps/docker-compose.memory.yml \
  infra/hosts/oracle-vps/docker-compose.yml \
  infra/hosts/worker-rtx3060/docker-compose.yml \
  infra/hosts/worker-rtx3090ti/docker-compose.yml \
  infra/hosts/worker-rtx5090/docker-compose.yml
then
  echo "deprecated memory architecture token found in active infra files" >&2
  exit 1
fi

echo "agent infra validation passed"
