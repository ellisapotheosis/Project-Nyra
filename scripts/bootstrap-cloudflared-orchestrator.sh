#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CF_DIR="$ROOT_DIR/infra/cloudflared"

if [[ ! -f "$CF_DIR/.env.cloudflared" ]]; then
  echo "Missing $CF_DIR/.env.cloudflared. Copy from .env.cloudflared.example first." >&2
  exit 1
fi

if [[ ! -f "$CF_DIR/credentials/orchestrator.json" ]]; then
  echo "Missing orchestrator credentials JSON at $CF_DIR/credentials/orchestrator.json" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for bootstrap-cloudflared-orchestrator" >&2
  exit 1
fi

docker network inspect nyra >/dev/null 2>&1 || {
  echo "Docker network 'nyra' not found. Start orchestrator stack first." >&2
  exit 1
}

docker compose -f "$CF_DIR/docker-compose.cloudflared.orchestrator.yml" --env-file "$CF_DIR/.env.cloudflared" up -d

echo "Orchestrator cloudflared container started."
