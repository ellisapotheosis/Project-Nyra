#!/usr/bin/env bash
set -euo pipefail

# Starts Archon stack with Nexus-compatible compose overlays.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "${ROOT_DIR}"

ARCHON_PROFILE="${ARCHON_PROFILE:-archon}"
ENABLE_ARCHON_AGENTS="${ENABLE_ARCHON_AGENTS:-true}"

./infra/scripts/archon/bootstrap_archon_source.sh

BASE_CMD=(
  docker compose
  -f infra/docker-compose.yml
  -f infra/compose/docker-compose.archon.yml
  --profile "${ARCHON_PROFILE}"
)

if [[ "${ENABLE_ARCHON_AGENTS}" == "true" ]]; then
  BASE_CMD+=(--profile archon-agents)
fi

"${BASE_CMD[@]}" up -d
"${BASE_CMD[@]}" ps

echo
echo "Archon services requested. Run these checks:"
echo "  docker compose -f infra/docker-compose.yml -f infra/compose/docker-compose.archon.yml logs --tail=100 archon-os"
echo "  docker compose -f infra/docker-compose.yml -f infra/compose/docker-compose.archon.yml logs --tail=100 archon-server"
echo "  curl -fsS http://localhost:${ARCHON_OS_PORT:-9001}/health"
echo "  curl -fsS http://localhost:${ARCHON_SERVER_PORT:-8181}/health"
echo "  curl -fsS http://localhost:${ARCHON_MCP_PORT:-8051}/health"
