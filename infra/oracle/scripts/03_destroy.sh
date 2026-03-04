#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
AUTH_PHRASE="I AUTHORIZE DESTRUCTIVE ACTIONS"
INPUT_PHRASE="${1:-}"

cd "${PROJECT_DIR}"

if [[ "${INPUT_PHRASE}" != "${AUTH_PHRASE}" ]]; then
  echo "Destructive operation requested: terraform destroy"
  echo "To continue, re-run with exact authorization phrase as argument:"
  echo "  ./scripts/03_destroy.sh \"${AUTH_PHRASE}\""
  read -r -p "Type the exact phrase to continue: " typed
  if [[ "${typed}" != "${AUTH_PHRASE}" ]]; then
    echo "Authorization phrase mismatch. Aborting destroy."
    exit 1
  fi
fi

terraform destroy -auto-approve
