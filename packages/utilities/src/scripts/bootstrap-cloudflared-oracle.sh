#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CF_DIR="$ROOT_DIR/infra/cloudflared"

if [[ ! -f "$CF_DIR/.env.cloudflared" ]]; then
  echo "Missing $CF_DIR/.env.cloudflared. Copy from .env.cloudflared.example first." >&2
  exit 1
fi

if [[ ! -f "$CF_DIR/credentials/oracle.json" ]]; then
  echo "Missing oracle credentials JSON at $CF_DIR/credentials/oracle.json" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for bootstrap-cloudflared-oracle" >&2
  exit 1
fi

docker network inspect nyra_net >/dev/null 2>&1 || {
  echo "Docker network 'nyra_net' not found. Start oracle stack first." >&2
  exit 1
}

docker compose -f "$CF_DIR/docker-compose.cloudflared.oracle.yml" --env-file "$CF_DIR/.env.cloudflared" up -d

echo "Oracle cloudflared container started."
