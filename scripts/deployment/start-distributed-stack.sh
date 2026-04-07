#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/infra/compose/distributed/nyra-distributed-compose.yml"

ROLE="${1:-orchestrator}"
ROLE="${ROLE#--role=}"

case "$ROLE" in
  orchestrator|oracle|worker|homeassistant) ;;
  *)
    echo "Usage: $0 [orchestrator|oracle|worker|homeassistant]" >&2
    exit 1
    ;;
esac

if ! command -v infisical >/dev/null 2>&1; then
  echo "infisical CLI not found; run scripts/setup/infisical-setup.sh first." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

: "${INFISICAL_TOKEN:?set INFISICAL_TOKEN}"
: "${INFISICAL_PROJECT_ID:?set INFISICAL_PROJECT_ID}"

export INFISICAL_ENV="${INFISICAL_ENV:-prod}"
export INFISICAL_PATH="${INFISICAL_PATH:-/shared}"

if [[ "$ROLE" == "worker" ]]; then
  export NYRA_NODE_ROLE="${NYRA_NODE_ROLE:-worker-rtx5090}"
fi

echo "Starting role '$ROLE' with Infisical injection using compose: $COMPOSE_FILE"
infisical run \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --path="$INFISICAL_PATH" \
  -- docker compose -f "$COMPOSE_FILE" --profile "$ROLE" up -d

echo "Validating role '$ROLE' containers"
docker compose -f "$COMPOSE_FILE" --profile "$ROLE" ps
