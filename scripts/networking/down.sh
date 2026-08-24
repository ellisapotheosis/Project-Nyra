#!/usr/bin/env bash
set -euo pipefail

# Project Nyra - bring down networking + core services
# Usage:
#   cd ~/project-nyra
#   ./scripts/networking/down.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

CORE_COMPOSE="infra/stacks/nyra-mortgage/docker-compose.yml"
NET_COMPOSE="infra/networking/docker-compose.network.yml"

if [ -f "$NET_COMPOSE" ]; then
  echo "[nyra] Stopping networking (Cloudflare + Tailscale)..."
  if [ -f .env.cloudflare ]; then
    docker compose -f "$NET_COMPOSE" --env-file .env.cloudflare down
  else
    docker compose -f "$NET_COMPOSE" --env-file .env down
  fi
fi

if [ -f "$CORE_COMPOSE" ]; then
  echo "[nyra] Stopping core Nyra stack..."
  docker compose -f "$CORE_COMPOSE" down
fi

echo "[nyra] Remaining containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | sed -n '1,20p'
