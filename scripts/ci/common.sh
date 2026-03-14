#!/usr/bin/env bash
set -euo pipefail

resolve_deploy_sha() {
  local event_name="${1:-${GITHUB_EVENT_NAME:-}}"
  local workflow_run_head_sha="${2:-${GITHUB_EVENT_WORKFLOW_RUN_HEAD_SHA:-}}"
  local manual_deploy_sha="${3:-${GITHUB_EVENT_INPUT_DEPLOY_SHA:-}}"

  if [[ "$event_name" == "workflow_dispatch" ]]; then
    DEPLOY_SHA="$manual_deploy_sha"
  elif [[ "$event_name" == "workflow_run" && -n "$workflow_run_head_sha" ]]; then
    DEPLOY_SHA="$workflow_run_head_sha"
  else
    DEPLOY_SHA="${GITHUB_SHA:-}"
  fi

  if [[ -z "$DEPLOY_SHA" ]]; then
    echo "Unable to resolve DEPLOY_SHA" >&2
    return 1
  fi

  SHORT_SHA="${DEPLOY_SHA:0:7}"
  export DEPLOY_SHA SHORT_SHA
}

detect_compose() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_BIN="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_BIN="docker-compose"
  else
    echo "Docker Compose is unavailable" >&2
    return 1
  fi

  export COMPOSE_BIN
}

compose_run() {
  if [[ "${COMPOSE_BIN:-}" == "docker-compose" ]]; then
    docker-compose "$@"
  else
    docker compose "$@"
  fi
}
