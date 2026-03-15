#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

resolve_repo_root() {
  if git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    git -C "$SCRIPT_DIR" rev-parse --show-toplevel
    return 0
  fi

  local candidate
  for candidate in \
    "$SCRIPT_DIR/../.." \
    "$PWD" \
    "/workspace/Project-Nyra" \
    "/workspace/project-nyra" \
    "$HOME/project-nyra"
  do
    candidate="$(cd "$candidate" 2>/dev/null && pwd -P || true)"
    if [[ -n "$candidate" ]] && ([[ -d "$candidate/.git" ]] || [[ -f "$candidate/package.json" ]]); then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  printf 'Unable to resolve Project Nyra repository root from %s\n' "$SCRIPT_DIR" >&2
  exit 1
}

REPO_ROOT="$(resolve_repo_root)"
SETUP_SCRIPT="$REPO_ROOT/scripts/setup/codex-webapp-manual-setup.sh"

INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
INFISICAL_API_URL="${INFISICAL_API_URL:-https://app.infisical.com/api}"
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

run_with_optional_sudo() {
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then
    sudo "$@"
  else
    return 1
  fi
}

read_dotenv_value() {
  local file="$1"
  local key="$2"
  local raw=""

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  raw="$(grep -E "^${key}=" "$file" | tail -n 1 | cut -d'=' -f2- || true)"
  raw="${raw#\"}"
  raw="${raw%\"}"
  raw="${raw#\'}"
  raw="${raw%\'}"
  printf '%s' "$raw"
}

resolve_infisical_base_args() {
  INFISICAL_BASE_ARGS=(--domain "$INFISICAL_API_URL" --silent)

  if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
    INFISICAL_BASE_ARGS+=(--token "$INFISICAL_TOKEN")
  elif [[ -n "${INFISICAL_ACCESS_TOKEN:-}" ]]; then
    INFISICAL_BASE_ARGS+=(--token "$INFISICAL_ACCESS_TOKEN")
  elif [[ -n "${INFISICAL_SESSION_TOKEN:-}" ]]; then
    INFISICAL_BASE_ARGS+=(--token "$INFISICAL_SESSION_TOKEN")
  fi
}

run_infisical_cli() {
  resolve_infisical_base_args
  infisical "${INFISICAL_BASE_ARGS[@]}" "$@"
}

resolve_infisical_token_from_env_or_file() {
  local key=""
  local value=""

  for key in INFISICAL_TOKEN INFISICAL_ACCESS_TOKEN; do
    value="${!key:-}"
    if [[ -n "$value" ]]; then
      printf '%s' "$value"
      return 0
    fi
  done

  for key in INFISICAL_TOKEN INFISICAL_ACCESS_TOKEN; do
    value="$(read_dotenv_value "$ROOT_ENV_FILE" "$key")"
    if [[ -n "$value" ]]; then
      printf '%s' "$value"
      return 0
    fi
  done

  return 1
}

ensure_infisical_auth() {
  if ! command -v infisical >/dev/null 2>&1; then
    return 0
  fi

  if [[ -n "${INFISICAL_TOKEN:-}" || -n "${INFISICAL_ACCESS_TOKEN:-}" || -n "${INFISICAL_SESSION_TOKEN:-}" ]]; then
    return 0
  fi

  local token=""
  if token="$(resolve_infisical_token_from_env_or_file 2>/dev/null)"; then
    INFISICAL_TOKEN="$token"
    export INFISICAL_TOKEN
    INFISICAL_SESSION_TOKEN="$token"
    export INFISICAL_SESSION_TOKEN
    return 0
  fi

  if run_infisical_cli export --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --format=dotenv >/dev/null 2>&1; then
    info "Using existing Infisical CLI session"
    return 0
  fi

  err "Infisical authentication is not configured. Provide INFISICAL_TOKEN/INFISICAL_ACCESS_TOKEN or a working Infisical CLI session."
  exit 1
}

ensure_github_cli() {
  if command -v gh >/dev/null 2>&1; then
    return 0
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    warn "apt-get is unavailable; skipping GitHub CLI installation"
    return 0
  fi

  if ! run_with_optional_sudo true >/dev/null 2>&1; then
    warn "No non-interactive sudo access; skipping GitHub CLI installation"
    return 0
  fi

  info "Installing GitHub CLI"
  if ! command -v wget >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y wget
  fi

  sudo mkdir -p -m 755 /etc/apt/keyrings
  wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y gh
}

resolve_github_token() {
  local key=""
  local value=""

  for key in GH_TOKEN GITHUB_TOKEN GITHUB_PERSONAL_ACCESS_TOKEN; do
    value="${!key:-}"
    if [[ -n "$value" ]]; then
      printf '%s' "$value"
      return 0
    fi
  done

  if command -v infisical >/dev/null 2>&1; then
    ensure_infisical_auth
    for key in GITHUB_TOKEN GH_TOKEN GITHUB_PERSONAL_ACCESS_TOKEN; do
      local cmd=(secrets get "$key" --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --plain)
      if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
        cmd+=(--projectId="$INFISICAL_PROJECT_ID")
      fi
      value="$(run_infisical_cli "${cmd[@]}" 2>/dev/null || true)"
      if [[ -n "$value" ]]; then
        printf '%s' "$value"
        return 0
      fi
    done
  fi

  for key in GH_TOKEN GITHUB_TOKEN GITHUB_PERSONAL_ACCESS_TOKEN; do
    value="$(read_dotenv_value "$ROOT_ENV_FILE" "$key")"
    if [[ -n "$value" ]]; then
      printf '%s' "$value"
      return 0
    fi
  done

  return 1
}

configure_github_auth() {
  local token=""

  ensure_github_cli
  if ! command -v gh >/dev/null 2>&1; then
    return 0
  fi

  if gh auth status >/dev/null 2>&1; then
    info "GitHub CLI is already authenticated"
    return 0
  fi

  if ! token="$(resolve_github_token)"; then
    warn "No GitHub token found in env or $ROOT_ENV_FILE; skipping gh auth"
    return 0
  fi

  info "Authenticating GitHub CLI"
  printf '%s' "$token" | gh auth login --hostname github.com --with-token --git-protocol https >/dev/null
  gh auth setup-git >/dev/null 2>&1 || true
  gh auth status || warn "GitHub CLI auth verification reported a problem"
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

  if [[ ! -f "$SETUP_SCRIPT" ]]; then
    err "Setup script not found: $SETUP_SCRIPT"
    exit 1
  fi

  if [[ "$RUN_GIT_PULL" -eq 1 ]]; then
    ensure_infisical_auth
    configure_github_auth
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
  bash "$SETUP_SCRIPT" "${setup_args[@]}"

  if ! refresh_python_requirements; then
    warn "Falling back to full Python dependency setup"
    bash "$SETUP_SCRIPT" "${setup_args[@]}" --skip-system-deps --skip-js-deps --skip-services --skip-env-export
  fi

  info "Final maintenance checks"
  echo "  node:      $(node -v 2>/dev/null || echo missing)"
  echo "  pnpm:      $(pnpm -v 2>/dev/null || echo missing)"
  echo "  python3:   $(python3 --version 2>/dev/null || echo missing)"
  echo "  pip:       $(python3 -m pip --version 2>/dev/null || echo missing)"
  echo "  infisical: $(infisical --version 2>/dev/null || echo missing)"
  echo "  docker:    $(docker --version 2>/dev/null || echo missing)"
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    docker ps --format 'table {{.Names}}\t{{.Status}}' | head -n 25 || true
  else
    warn "Docker is unavailable in this environment; skipped container status check"
  fi

  ok "✅ Project Nyra Codex webapp maintenance completed"
}

main "$@"
