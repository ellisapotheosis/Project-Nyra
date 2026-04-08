#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.gitea}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gitea.bootstrap.yml}"
NETWORK_NAME="${NYRA_NETWORK:-nyra-net}"
ENABLE_ACTIONS="${ENABLE_ACTIONS:-true}"
ENABLE_ACTIONS_LARGE="${ENABLE_ACTIONS_LARGE:-false}"
ENABLE_AI="${ENABLE_AI:-false}"
ENABLE_INFISICAL_AGENT="${ENABLE_INFISICAL_AGENT:-false}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

if [ ! -f "$ENV_FILE" ]; then
  cp .env.gitea.template "$ENV_FILE"
  echo "Created $ENV_FILE from template"
fi

if [ -z "${INFISICAL_TOKEN:-}" ]; then
  echo "INFISICAL_TOKEN is required to bootstrap the Gitea stack." >&2
  exit 1
fi

if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  docker network create "$NETWORK_NAME" >/dev/null
  echo "Created docker network: $NETWORK_NAME"
fi

PROFILES=()
if [ "$ENABLE_ACTIONS" = "true" ]; then PROFILES+=(--profile actions); fi
if [ "$ENABLE_ACTIONS_LARGE" = "true" ]; then PROFILES+=(--profile actions-large); fi
if [ "$ENABLE_AI" = "true" ]; then PROFILES+=(--profile ai); fi
if [ "$ENABLE_INFISICAL_AGENT" = "true" ]; then PROFILES+=(--profile infisical); fi

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "${PROFILES[@]}" up -d

echo "Waiting for Gitea to become healthy..."
for _ in {1..60}; do
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps --format json 2>/dev/null | grep -q '"Name":"nyra-gitea"'; then
    if curl -fsS "http://localhost:${GITEA_PORT:-3100}/api/healthz" >/dev/null 2>&1; then
      echo "Gitea is healthy"
      break
    fi
  fi
  sleep 2
done

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Bootstrap complete"
echo "Gitea URL: http://localhost:${GITEA_PORT:-3100}"
echo "Gitea SSH: ssh -p ${GITEA_SSH_PORT:-2222} git@localhost"
