#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is required" >&2
  exit 1
fi

if [[ ! -f .env.portainer.orchestrator ]]; then
  cp .env.portainer.orchestrator.example .env.portainer.orchestrator
  echo "Created .env.portainer.orchestrator from example. Fill REPLACE_ME values then re-run."
  exit 1
fi

if grep -q 'REPLACE_ME_' .env.portainer.orchestrator; then
  echo "ERROR: replace all REPLACE_ME_* variables in .env.portainer.orchestrator" >&2
  exit 1
fi

if ! docker network inspect nyra-net >/dev/null 2>&1; then
  docker network create nyra-net >/dev/null
  echo "Created docker network: nyra-net"
fi

docker compose --env-file .env.portainer.orchestrator -f docker-compose.portainer.orchestrator.yml up -d

echo "Portainer control plane started."
echo "Next:"
echo "  1) In Portainer UI, create one Edge Group per node (worker-3060/worker-3090ti/worker-5090/homeassistant-green)."
echo "  2) Copy edge ID/key into each node's .env.portainer.edge file."
echo "  3) On each node, run:"
echo "     docker compose --env-file .env.portainer.edge -f docker-compose.portainer.edge-agent.yml up -d"
