#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.yml}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-30}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed or unavailable in PATH" >&2
  exit 1
fi

if ! [[ "$TIMEOUT_SECONDS" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT_SECONDS" -le 0 ]]; then
  echo "ERROR: TIMEOUT_SECONDS must be a positive integer" >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" config >/dev/null; then
  echo "ERROR: Compose preflight failed for $COMPOSE_FILE; refusing to stop running services" >&2
  exit 1
fi

echo "Restarting services with compose file: $COMPOSE_FILE"

docker compose -f "$COMPOSE_FILE" down --remove-orphans --timeout "$TIMEOUT_SECONDS"
docker compose -f "$COMPOSE_FILE" up -d

echo "Current service status:"
docker compose -f "$COMPOSE_FILE" ps
