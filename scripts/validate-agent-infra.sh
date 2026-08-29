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
    SEARXNG_SECRET=x \
    BROWSERLESS_TOKEN=x \
    docker compose -f infra/hosts/oracle-vps/docker-compose.oracle.yml config

compose_config "memory backend" \
  env \
    LETTA_DB_PASSWORD=x \
    LETTA_SERVER_PASSWORD=x \
    OPENAI_API_KEY=x \
    docker compose -f infra/hosts/oracle-vps/docker-compose.memory.yml config

compose_config "OpenClaw Composio injection" \
  env \
    COMPOSIO_MCP_URL='https://backend.composio.dev/v3/mcp/server?user_id=nyra' \
    COMPOSIO_API_KEY=x \
    COMPOSIO_DEFAULT_USER_ID=nyra \
    OPENCLAW_GATEWAY_TOKEN=x \
    LITELLM_MASTER_KEY=x \
    docker compose -f infra/compose/openclaw.profile.yml -f infra/compose/composio.inject.compose.yml config

cat >"$tmpdir/openclaw-mvp.base.yml" <<'YAML'
services:
  openclaw-mvp:
    image: nyra/openclaw-mvp:local
YAML

compose_config "OpenClaw MVP Composio injection" \
  env \
    COMPOSIO_MCP_URL='https://backend.composio.dev/v3/mcp/server?user_id=nyra' \
    COMPOSIO_API_KEY=x \
    COMPOSIO_DEFAULT_USER_ID=nyra \
    docker compose -f "$tmpdir/openclaw-mvp.base.yml" -f infra/compose/composio.openclaw-mvp.inject.compose.yml config

cat >"$tmpdir/webapp.base.yml" <<'YAML'
services:
  webapp:
    image: node:20-alpine
YAML

compose_config "webapp Composio injection" \
  env \
    COMPOSIO_MCP_URL='https://backend.composio.dev/v3/mcp/server?user_id=nyra' \
    COMPOSIO_API_KEY=x \
    COMPOSIO_DEFAULT_USER_ID=nyra \
    docker compose -f "$tmpdir/webapp.base.yml" -f infra/compose/composio.webapp.inject.compose.yml config

for file in \
  infra/workers/worker-rtx3060/docker-compose.voice.yml \
  infra/workers/worker-rtx3060/docker-compose.kyutai-mesh.yml \
  infra/workers/worker-rtx3090ti/docker-compose.kyutai-mesh.yml \
  infra/workers/worker-rtx5090/docker-compose.kyutai-mesh.yml
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

if rg -n 'OpenMemory|MemOS|MemPalace|Activepieces|openmemory|memos|mempalace|activepieces' \
  infra/hosts/oracle-vps/docker-compose.oracle.yml \
  infra/hosts/oracle-vps/docker-compose.memory.yml \
  infra/compose/composio.inject.compose.yml \
  infra/compose/composio.openclaw-mvp.inject.compose.yml \
  infra/compose/composio.webapp.inject.compose.yml \
  infra/env/composio.env.example \
  infra/environments/oracle-agent-utils.example.env \
  infra/environments/memory.example.env \
  infra/environments/voice-mesh.example.env \
  infra/compose/configs/openclaw/mcp.servers.composio.json \
  infra/workers/worker-rtx3060/docker-compose.voice.yml \
  infra/workers/worker-rtx3060/docker-compose.kyutai-mesh.yml \
  infra/workers/worker-rtx3090ti/docker-compose.kyutai-mesh.yml \
  infra/workers/worker-rtx5090/docker-compose.kyutai-mesh.yml \
  docs/architecture/kyutai-unmute-gpu-mesh.md
then
  echo "forbidden architecture token found in new infra files" >&2
  exit 1
fi

echo "agent infra validation passed"
