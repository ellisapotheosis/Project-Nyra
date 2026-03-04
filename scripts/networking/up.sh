#!/usr/bin/env bash
set -euo pipefail

# Project Nyra - bring up core services, Gitea, and networking (Cloudflare + Tailscale)
# Usage:
#   cd ~/project-nyra
#   ./scripts/networking/up.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

CORE_COMPOSE="infra/stacks/nyra-mortgage/docker-compose.yml"
GITEA_COMPOSE=".gitea/docker-compose.gitea.yml"
NET_COMPOSE="infra/networking/docker-compose.network.yml"

echo "[nyra] Using root: $ROOT_DIR"

if [ -f "$CORE_COMPOSE" ]; then
  echo "[nyra] Starting core Nyra stack..."
  docker compose -f "$CORE_COMPOSE" up -d
else
  echo "[nyra] WARNING: $CORE_COMPOSE not found, skipping core stack"
fi

if [ -f "$GITEA_COMPOSE" ]; then
  echo "[nyra] Starting Gitea stack..."
  docker compose -f "$GITEA_COMPOSE" up -d
else
  echo "[nyra] WARNING: $GITEA_COMPOSE not found, skipping Gitea"
fi

if [ -f "$NET_COMPOSE" ]; then
  echo "[nyra] Starting networking (Cloudflare + Tailscale)..."
  # Prefer .env.cloudflare if present, otherwise fall back to .env
  if [ -f .env.cloudflare ]; then
    docker compose -f "$NET_COMPOSE" --env-file .env.cloudflare up -d
  else
    docker compose -f "$NET_COMPOSE" --env-file .env up -d
  fi
else
  echo "[nyra] WARNING: $NET_COMPOSE not found, skipping networking"
fi

echo "[nyra] Docker stacks requested. Current containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | sed -n '1,20p'
