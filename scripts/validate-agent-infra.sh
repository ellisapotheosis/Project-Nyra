#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

compose_config() {
  local label="$1"
  shift
  printf 'validating %s... ' "$label"
  env \
    ACTIVEPIECES_API_KEY=x \
    AP_ENCRYPTION_KEY=x \
    AP_JWT_SECRET=x \
    BETTER_AUTH_SECRET=x \
    BROWSERLESS_TOKEN=x \
    FIRECRAWL_API_KEY=x \
    GITEA_DB_PASSWORD=x \
    GITEA_INTERNAL_TOKEN=x \
    GITEA_JWT_SECRET=x \
    GITEA_SECRET_KEY=x \
    GRAFANA_ADMIN_PASSWORD=x \
    HF_TOKEN=x \
    LETTA_DB_PASSWORD=x \
    LETTA_SERVER_PASSWORD=x \
    LITELLM_MASTER_KEY=x \
    NEXUS_ADMIN_TOKEN=x \
    NYRA_STATUS_BRIDGE_TOKEN=x \
    OPENAI_API_KEY=x \
    OPENCLAW_GATEWAY_TOKEN=x \
    OPENLIT_DB_PASSWORD=x \
    OPENLIT_NEXTAUTH_SECRET=x \
    OPENLIT_VAULT_ENCRYPTION_KEY=x \
    GASTOWN_AGENT_JWT_SECRET=x \
    GASTOWN_API_KEY=x \
    GASTOWN_DB_PASSWORD=x \
    GASTOWN_SESSION_SECRET=x \
    PORTAINER_EDGE_ID=x \
    PORTAINER_EDGE_KEY=x \
    QUOTE_API_SECRET=x \
    SEARXNG_SECRET=x \
    SUPERSET_ADMIN_PASSWORD=x \
    SUPERSET_SECRET_KEY=x \
    UNMUTE_OPENAI_API_KEY=x \
    WORKER_GRAFANA_PORT=3005 \
    "$@" >/dev/null
  printf 'ok\n'
}

compose_config "oracle core and app overlays" \
  docker compose \
    -f infra/hosts/oracle-vps/docker-compose.yml \
    -f infra/hosts/oracle-vps/docker-compose.apps.yml \
    -f infra/hosts/oracle-vps/docker-compose.activepieces-mcp.yml \
    config

compose_config "oracle agent utilities" \
  docker compose -f infra/hosts/oracle-vps/docker-compose.oracle.yml config

compose_config "oracle memory backend" \
  docker compose \
    -f infra/hosts/oracle-vps/docker-compose.memory.yml \
    -f infra/hosts/oracle-vps/docker-compose.letta-mcp.yml \
    -f infra/hosts/oracle-vps/docker-compose.memory-extra.yml \
    config

compose_config "oracle tool overlays" \
  docker compose \
    -f infra/hosts/oracle-vps/docker-compose.yml \
    -f infra/hosts/oracle-vps/docker-compose.gastown.yml \
    -f infra/hosts/oracle-vps/docker-compose.clawteam.yml \
    -f infra/hosts/oracle-vps/docker-compose.gitea.yml \
    config

compose_config "orchestrator overlays" \
  docker compose \
    -f infra/hosts/orchestrator/docker-compose.yml \
    -f infra/hosts/orchestrator/docker-compose.cloudflared.yml \
    -f infra/hosts/orchestrator/docker-compose.llxprt.yml \
    -f infra/hosts/orchestrator/docker-compose.voice.yml \
    config

compose_config "worker rtx5090 overlays" \
  docker compose \
    -f infra/hosts/worker-rtx5090/docker-compose.yml \
    -f infra/hosts/_templates/docker-compose.infisical-runtime.yml \
    -f infra/hosts/_templates/docker-compose.worker-ai-common.yml \
    -f infra/hosts/worker-rtx5090/docker-compose.llxprt.yml \
    -f infra/hosts/worker-rtx5090/docker-compose.model-switcher.yml \
    -f infra/hosts/worker-rtx5090/docker-compose.nerve.yml \
    -f infra/hosts/worker-rtx5090/docker-compose.voice.yml \
    -f infra/hosts/worker-rtx5090/docker-compose.distributed-voice.yml \
    config

compose_config "worker rtx3090ti overlays" \
  docker compose \
    -f infra/hosts/worker-rtx3090ti/docker-compose.yml \
    -f infra/hosts/_templates/docker-compose.infisical-runtime.yml \
    -f infra/hosts/_templates/docker-compose.worker-ai-common.yml \
    -f infra/hosts/worker-rtx3090ti/docker-compose.llxprt.yml \
    -f infra/hosts/worker-rtx3090ti/docker-compose.nerve.yml \
    -f infra/hosts/worker-rtx3090ti/docker-compose.voice.yml \
    -f infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml \
    config

compose_config "worker rtx3060 overlays" \
  docker compose \
    -f infra/hosts/worker-rtx3060/docker-compose.yml \
    -f infra/hosts/_templates/docker-compose.infisical-runtime.yml \
    -f infra/hosts/_templates/docker-compose.worker-ai-common.yml \
    -f infra/hosts/worker-rtx3060/docker-compose.llxprt.yml \
    -f infra/hosts/worker-rtx3060/docker-compose.openclaw.yml \
    -f infra/hosts/worker-rtx3060/docker-compose.voice.yml \
    -f infra/hosts/worker-rtx3060/docker-compose.distributed-voice.yml \
    config

if rg -n 'infra/(compose|stacks|workers)/|infra/homeassistant|infra/ingest' \
  Makefile scripts docs/architecture docs/decisions docs/infra docs/operations docs/runbook.md docs/runbooks docs/user-todo \
  --glob '!scripts/validate-agent-infra.sh' >/tmp/nyra-stale-infra-paths.txt
then
  cat /tmp/nyra-stale-infra-paths.txt >&2
  rm -f /tmp/nyra-stale-infra-paths.txt
  echo "stale runtime infra path references found" >&2
  exit 1
fi
rm -f /tmp/nyra-stale-infra-paths.txt

echo "agent infra validation passed"
