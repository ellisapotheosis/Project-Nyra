#!/usr/bin/env bash
set -euo pipefail

NODE=${1:-}
if [[ -z "$NODE" ]]; then
  echo "Usage: $0 <orchestrator|oracle|worker-rtx3060|worker-rtx5090|worker-rtx3090ti|dev-laptop>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/env/.env.$NODE"
OVR_FILE="$ROOT_DIR/compose/overrides/docker-compose.$NODE.override.yml"
BASE_FILE="$ROOT_DIR/docker-compose.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

COMPOSE_ARGS=(--env-file "$ENV_FILE" -f "$BASE_FILE")
if [[ -f "$OVR_FILE" ]]; then
  COMPOSE_ARGS+=( -f "$OVR_FILE" )
fi

cd "$ROOT_DIR"

echo "Validating compose for '$NODE'"
docker compose "${COMPOSE_ARGS[@]}" config >/dev/null

echo "Starting node '$NODE' with env: $ENV_FILE"
docker compose "${COMPOSE_ARGS[@]}" up -d

echo "Done. Tip: docker compose ${COMPOSE_ARGS[*]} ps"
