#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TOKEN_SOURCE="missing"
TOKEN_VALUE=""

if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
  TOKEN_SOURCE="INFISICAL_TOKEN"
  TOKEN_VALUE="${INFISICAL_TOKEN}"
elif [[ -n "${INFISICAL_ACCESS_TOKEN:-}" ]]; then
  TOKEN_SOURCE="INFISICAL_ACCESS_TOKEN"
  TOKEN_VALUE="${INFISICAL_ACCESS_TOKEN}"
elif [[ -n "${INFISICAL_SESSION_TOKEN:-}" ]]; then
  TOKEN_SOURCE="INFISICAL_SESSION_TOKEN"
  TOKEN_VALUE="${INFISICAL_SESSION_TOKEN}"
fi

mask() {
  local value="${1:-}"
  local len=${#value}
  if [[ "$len" -le 8 ]]; then
    printf '%s' "$value"
    return 0
  fi
  printf '%s...%s' "${value:0:4}" "${value: -4}"
}

echo "repo_root=$REPO_ROOT"
echo "pwd=$(pwd)"
echo "shell=${SHELL:-unknown}"
echo "user=$(id -un)"
echo "infisical_env=${INFISICAL_ENV:-dev}"
echo "infisical_path=${INFISICAL_PATH:-/shared}"
echo "infisical_project_id=${INFISICAL_PROJECT_ID:-unset}"
echo "token_source=$TOKEN_SOURCE"
echo "token_value=$(mask "$TOKEN_VALUE")"
echo "has_infisical=$(command -v infisical >/dev/null 2>&1 && echo yes || echo no)"
echo "has_docker=$(command -v docker >/dev/null 2>&1 && echo yes || echo no)"
echo "has_node=$(command -v node >/dev/null 2>&1 && echo yes || echo no)"
echo "has_pnpm=$(command -v pnpm >/dev/null 2>&1 && echo yes || echo no)"
echo "has_python3=$(command -v python3 >/dev/null 2>&1 && echo yes || echo no)"

if command -v infisical >/dev/null 2>&1; then
  echo "infisical_version=$(infisical --version 2>/dev/null || echo unknown)"
fi
