#!/usr/bin/env bash
set -euo pipefail

NODE=${1:-}
if [[ -z "$NODE" ]]; then
  echo "Usage: $0 <orchestrator|worker-rtx3060|worker-rtx5090|worker-rtx3090ti>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/env/.env.$NODE"
OVR_FILE="$ROOT_DIR/compose/overrides/docker-compose.$NODE.override.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi
if [[ ! -f "$OVR_FILE" ]]; then
  echo "Missing override file: $OVR_FILE" >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "Starting node '$NODE' with env: $ENV_FILE"

docker compose --env-file "$ENV_FILE" \
  -f "$ROOT_DIR/docker-compose.yml" \
  -f "$OVR_FILE" \
  up -d

echo "Done. Tip: docker compose --env-file $ENV_FILE -f docker-compose.yml -f $OVR_FILE ps"
