#!/usr/bin/env bash
set -euo pipefail

NODE=${1:-}
if [[ -z "$NODE" ]]; then
 echo "Usage: $0 <orchestrator|oracle| |worker-rtx5090|worker-rtx3090ti|dev-laptop>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/env/.env.$NODE"
OVR_FILE="$ROOT_DIR/compose/overrides/docker-compose.$NODE.override.yml"
BASE_FILE="$ROOT_DIR/docker-compose.yml"

COMPOSE_ARGS=(--env-file "$ENV_FILE" -f "$BASE_FILE")
if [[ -f "$OVR_FILE" ]]; then
  COMPOSE_ARGS+=( -f "$OVR_FILE" )
fi

docker compose "${COMPOSE_ARGS[@]}" down --remove-orphans
