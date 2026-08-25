#!/usr/bin/env bash
set -euo pipefail

# Export the canonical Oracle host boundary before Compose resolves ${...}.
# Container sidecars cannot provide variables during Compose interpolation.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/hosts/oracle-vps/docker-compose.yml"
REMOTE_ROOT="${ORACLE_REMOTE_ROOT:-/home/ubuntu/project-nyra}"
PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
ENV_NAME="${INFISICAL_ENV:-prod}"
SECRET_PATH="${INFISICAL_PATH:-/hosts/oracle-vps}"
DOCKER_CONTEXT="${DOCKER_CONTEXT:-}"

usage() {
  printf '%s\n' 'Usage: ops/scripts/infisical-oracle-compose.sh [--env dev|staging|prod] <docker-compose arguments...>'
}

if [[ "${1:-}" == "--env" ]]; then
  ENV_NAME="${2:?missing environment name}"
  shift 2
fi
[[ $# -gt 0 ]] || { usage >&2; exit 2; }

bootstrap_token() {
  if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
    printf '%s' "$INFISICAL_TOKEN"
    return 0
  fi

  : "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?set INFISICAL_TOKEN or Universal Auth client ID}"
  : "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?set INFISICAL_TOKEN or Universal Auth client secret}"
  : "${INFISICAL_HOST_URL:?set INFISICAL_HOST_URL for Universal Auth}"

  infisical login --method universal-auth \
    --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
    --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
    --domain "$INFISICAL_HOST_URL" \
    --silent 2>&1 \
    | awk '/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/ { token=$0 } END { print token }'
}

TOKEN="$(bootstrap_token)"
[[ -n "$TOKEN" ]] || { printf '%s\n' 'Unable to obtain an Infisical bootstrap token.' >&2; exit 1; }

umask 077
RUNTIME_ENV="$(mktemp "${TMPDIR:-/tmp}/nyra-oracle-infisical.XXXXXX.env")"
cleanup() { rm -f "$RUNTIME_ENV"; }
trap cleanup EXIT

infisical export \
  --token="$TOKEN" \
  --projectId="$PROJECT_ID" \
  --env="$ENV_NAME" \
  --path="$SECRET_PATH" \
  --format=dotenv \
  --silent >"$RUNTIME_ENV"

# The two containers that materialize file-backed secrets need the same short-lived
# bootstrap token. It is supplied only to the Compose invocation and not persisted.
printf 'INFISICAL_TOKEN=%s\nINFISICAL_PROJECT_ID=%s\nINFISICAL_ENV=%s\nINFISICAL_PATH=%s\n' \
  "$TOKEN" "$PROJECT_ID" "$ENV_NAME" "$SECRET_PATH" >>"$RUNTIME_ENV"

# The canonical Oracle Compose declares the project name `nyra-network`,
# while its explicit container_name values use the historical
# `nyra-network-nyra-*` prefix. Infisical may still contain `oracle-vps`;
# allowing it to win creates a second set of containers and duplicate ports.
printf 'COMPOSE_PROJECT_NAME=nyra-network-nyra\n' >>"$RUNTIME_ENV"

docker_args=(compose --env-file "$RUNTIME_ENV" -f "$COMPOSE_FILE")
if [[ "$DOCKER_CONTEXT" == "oracle" ]]; then
  # Compose resolves bind mounts on the client. Running it from WSL with an
  # Oracle Docker context would therefore mount the local repo path and can
  # silently turn a missing file into a directory. Execute from the canonical
  # checkout on Oracle instead.
  REMOTE_ENV="/tmp/nyra-oracle-infisical.$$.env"
  scp -q "$RUNTIME_ENV" "oracle:$REMOTE_ENV"
  cleanup_remote() { ssh -o ConnectTimeout=8 oracle "rm -f '$REMOTE_ENV'" >/dev/null 2>&1 || true; }
  trap 'cleanup_remote; cleanup' EXIT

  quote_args=()
  for arg in "$@"; do
    printf -v quoted '%q' "$arg"
    quote_args+=("$quoted")
  done
  ssh -o ConnectTimeout=8 oracle \
    "cd '$REMOTE_ROOT' && docker compose --env-file '$REMOTE_ENV' -f 'infra/hosts/oracle-vps/docker-compose.yml' ${quote_args[*]}"
else
  docker "${docker_args[@]}" "$@"
fi
