#!/usr/bin/env bash
set -euo pipefail
COMPOSE_FILE="${1:-nyra-infra/nyra-stack-v6_2/orchestrator/docker-compose.yml}"
: "${INFISICAL_PROJECT_ID:?Missing}"
INFISICAL_ENV="${INFISICAL_ENV:-dev}"
PATHS="${INFISICAL_FOLDER_PATHS:-${INFISICAL_FOLDER_PATH:-/shared}}"
if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
  export INFISICAL_TOKEN="$(infisical login --method=universal-auth --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" --silent --plain)"
fi
IFS=',' read -r -a P_ARR <<< "$PATHS"
for p in "${P_ARR[@]}"; do
  infisical run --env="$INFISICAL_ENV" --projectId="$INFISICAL_PROJECT_ID" --path="$p" -- docker compose -f "$COMPOSE_FILE" up -d
done
