#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SETUP_SCRIPT="$REPO_ROOT/scripts/setup/codex-webapp-manual-setup.sh"

INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
ROOT_ENV_FILE="${ROOT_ENV_FILE:-$REPO_ROOT/.env}"
PYTHON_VENV_DIR="${PYTHON_VENV_DIR:-$REPO_ROOT/.venv}"
RUN_GIT_PULL="${RUN_GIT_PULL:-0}"
START_CORE_STACK="${START_CORE_STACK:-0}"
EXTRA_COMPOSE_FILE=""
EXTRA_INFISICAL_PATH=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERR]${NC} $1"; }

usage() {
  cat <<'EOF'
Project Nyra - Codex Webapp Manual Maintenance

Usage:
  scripts/setup/codex-webapp-manual-maintenance.sh [options]

Options:
  --env <name>                 Infisical environment (default: dev)
  --path <path>                Infisical path for root env export (default: /shared)
  --project-id <id>            Infisical project id
  --root-env-file <path>       Root .env output path
  --python-venv <path>         Python virtualenv path
  --with-pull                  Run git pull --rebase before dependency sync
  --start-core-stack           Start/reconcile infra core profile
  --extra-compose <path>       Optional extra compose file to reconcile
  --extra-path <path>          Infisical path for extra compose run
  -h, --help                   Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      INFISICAL_ENV="$2"
      shift 2
      ;;
    --path)
      INFISICAL_PATH="$2"
      shift 2
      ;;
    --project-id)
      INFISICAL_PROJECT_ID="$2"
      shift 2
      ;;
    --root-env-file)
      ROOT_ENV_FILE="$2"
      shift 2
      ;;
    --python-venv)
      PYTHON_VENV_DIR="$2"
      shift 2
      ;;
    --with-pull)
      RUN_GIT_PULL=1
      shift
      ;;
    --start-core-stack)
      START_CORE_STACK=1
      shift
      ;;
    --extra-compose)
      EXTRA_COMPOSE_FILE="$2"
      shift 2
      ;;
    --extra-path)
      EXTRA_INFISICAL_PATH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      err "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Missing required command: $1"
    exit 1
  fi
}

refresh_python_requirements() {
  if [[ ! -d "$PYTHON_VENV_DIR" ]]; then
    warn "Python venv missing at $PYTHON_VENV_DIR; recreating with setup script"
    return 1
  fi
  # shellcheck disable=SC1090
  source "$PYTHON_VENV_DIR/bin/activate"
  python -m pip install --upgrade pip setuptools wheel >/dev/null

  local requirements_files=(
    "$REPO_ROOT/services/campaign-engine/requirements.txt"
    "$REPO_ROOT/services/litellm-proxy/requirements.txt"
    "$REPO_ROOT/services/mem0-mcp/requirements.txt"
    "$REPO_ROOT/services/mem0-rest-api/requirements.txt"
    "$REPO_ROOT/services/mem0-rest/requirements.txt"
    "$REPO_ROOT/services/nyra-orchestrator/requirements.txt"
    "$REPO_ROOT/services/orchestrator/requirements.txt"
    "$REPO_ROOT/services/quote-api/requirements.txt"
    "$REPO_ROOT/services/quote-api/requirements-test.txt"
    "$REPO_ROOT/services/quote-engine/requirements.txt"
  )

  local req
  for req in "${requirements_files[@]}"; do
    if [[ -f "$req" ]]; then
      info "Refreshing Python requirements: ${req#$REPO_ROOT/}"
      pip install -r "$req"
    fi
  done
  deactivate || true
}

main() {
  cd "$REPO_ROOT"
  require_cmd bash
  require_cmd git

  if [[ ! -x "$SETUP_SCRIPT" ]]; then
    err "Setup script not found or not executable: $SETUP_SCRIPT"
    exit 1
  fi

  if [[ "$RUN_GIT_PULL" -eq 1 ]]; then
    info "Updating repository with git pull --rebase"
    git pull --rebase --autostash
  fi

  export HUSKY=0

  # Reuse setup script for deterministic maintenance of environment and services.
  local setup_args=(
    --env "$INFISICAL_ENV"
    --path "$INFISICAL_PATH"
    --root-env-file "$ROOT_ENV_FILE"
    --python-venv "$PYTHON_VENV_DIR"
    --skip-system-deps
  )
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    setup_args+=(--project-id "$INFISICAL_PROJECT_ID")
  fi
  if [[ "$START_CORE_STACK" -eq 1 ]]; then
    setup_args+=(--start-core-stack)
  fi
  if [[ -n "$EXTRA_COMPOSE_FILE" ]]; then
    setup_args+=(--extra-compose "$EXTRA_COMPOSE_FILE")
  fi
  if [[ -n "$EXTRA_INFISICAL_PATH" ]]; then
    setup_args+=(--extra-path "$EXTRA_INFISICAL_PATH")
  fi

  info "Running setup script in maintenance mode"
  "$SETUP_SCRIPT" "${setup_args[@]}"

  if ! refresh_python_requirements; then
    warn "Falling back to full Python dependency setup"
    "$SETUP_SCRIPT" "${setup_args[@]}" --skip-system-deps --skip-js-deps --skip-services --skip-env-export
  fi

  require_cmd node
  require_cmd pnpm
  require_cmd python3
  require_cmd docker

  info "Final maintenance checks"
  echo "  node:    $(node -v)"
  echo "  pnpm:    $(pnpm -v)"
  echo "  python3: $(python3 --version)"
  docker ps --format 'table {{.Names}}\t{{.Status}}' | head -n 25 || true

  ok "✅ Project Nyra Codex webapp maintenance completed"
}

main "$@"
