#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
ENVIRONMENT="${INFISICAL_ENVIRONMENT:-prod}"
PATH_SCOPE="${INFISICAL_PATH:-/}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "INFISICAL_PROJECT_ID is required. Do not hardcode secrets." >&2
  exit 1
fi

infisical run --projectId "$PROJECT_ID" --env "$ENVIRONMENT" --path "$PATH_SCOPE" -- "$@"

