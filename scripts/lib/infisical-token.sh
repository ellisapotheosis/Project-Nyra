#!/usr/bin/env bash
set -euo pipefail

NYRA_INFISICAL_PROJECT_ID_DEFAULT="8374cea9-e5e8-4050-bda4-b91f25ab30ef"

nyra_require_infisical_token() {
  if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
    echo "ERROR: INFISICAL_TOKEN environment variable is required." >&2
    return 1
  fi
}

nyra_resolve_infisical_project_id() {
  export INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-$NYRA_INFISICAL_PROJECT_ID_DEFAULT}"
}

nyra_infisical_run() {
  local env_name="$1"
  local path_name="${2:-}"
  shift 2

  nyra_require_infisical_token
  nyra_resolve_infisical_project_id

  local cmd=(
    infisical run
    --projectId "$INFISICAL_PROJECT_ID"
    --env "$env_name"
  )

  if [[ -n "$path_name" ]]; then
    cmd+=(--path "$path_name")
  fi

  cmd+=(-- "$@")
  "${cmd[@]}"
}

nyra_infisical_export() {
  local env_name="$1"
  local path_name="${2:-}"
  shift 2

  nyra_require_infisical_token
  nyra_resolve_infisical_project_id

  local cmd=(
    infisical export
    --projectId "$INFISICAL_PROJECT_ID"
    --env "$env_name"
  )

  if [[ -n "$path_name" ]]; then
    cmd+=(--path "$path_name")
  fi

  cmd+=("$@")
  "${cmd[@]}"
}

nyra_infisical_secrets_set() {
  local env_name="$1"
  local path_name="${2:-}"
  shift 2

  nyra_require_infisical_token
  nyra_resolve_infisical_project_id

  local cmd=(
    infisical secrets set
    --projectId "$INFISICAL_PROJECT_ID"
    --env "$env_name"
  )

  if [[ -n "$path_name" ]]; then
    cmd+=(--path "$path_name")
  fi

  cmd+=("$@")
  "${cmd[@]}"
}
