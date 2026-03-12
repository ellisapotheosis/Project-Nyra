#!/usr/bin/env bash
set -euo pipefail
NODE=${1:-}
if [[ -z "$NODE" ]]; then
  echo "Usage: $0 <node>" >&2
  exit 1
fi
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/env/.env.$NODE"
OVR_FILE="$ROOT_DIR/compose/overrides/docker-compose.$NODE.override.yml"

docker compose --env-file "$ENV_FILE" \
  -f "$ROOT_DIR/docker-compose.yml" -f "$OVR_FILE" \
  ps
