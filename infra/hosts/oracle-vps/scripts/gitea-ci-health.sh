#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${ROOT_DIR:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/hosts/oracle-vps/docker-compose.gitea.yml}"
ENV_FILE="${ENV_FILE:-.env.gitea}"
GITEA_HTTP_PORT="${GITEA_HTTP_PORT:-3001}"
GITEA_CONTAINER_PREFIX="${GITEA_CONTAINER_PREFIX:-nyra}"
GITEA_CONTAINER="${GITEA_CONTAINER_PREFIX}-gitea"
GITEA_DB_CONTAINER="${GITEA_CONTAINER_PREFIX}-gitea-db"
GITEA_RUNNER_CONTAINER="${GITEA_CONTAINER_PREFIX}-gitea-runner"
GITHUB_MIRROR_CONTAINER="${GITEA_CONTAINER_PREFIX}-github-mirror"

cd "$ROOT_DIR"

if [ -f "$ENV_FILE" ]; then
  echo "Refusing repo-local Gitea env file: $ENV_FILE" >&2
  echo "Run this health check through the repo-root Makefile/Infisical path instead." >&2
  exit 66
fi

docker ps \
  --filter "name=^/${GITEA_CONTAINER}$" \
  --filter "name=^/${GITEA_DB_CONTAINER}$" \
  --filter "name=^/${GITEA_RUNNER_CONTAINER}$"

curl -fsS "http://127.0.0.1:${GITEA_HTTP_PORT}/api/healthz" >/dev/null

for container in "$GITEA_CONTAINER" "$GITEA_DB_CONTAINER" "$GITEA_RUNNER_CONTAINER"; do
  if ! docker inspect -f '{{.State.Running}}' "$container" | grep -qx true; then
    echo "Container is not running: $container" >&2
    exit 1
  fi
done

if ! docker logs --tail=200 "$GITEA_RUNNER_CONTAINER" 2>&1 | grep -q "declare successfully"; then
  echo "Gitea runner has not declared successfully" >&2
  exit 1
fi

echo "Oracle Gitea CI health OK"
