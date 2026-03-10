#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
ROOT_ENV_FILE="${ROOT_ENV_FILE:-$REPO_ROOT/.env}"
PYTHON_VENV_DIR="${PYTHON_VENV_DIR:-$REPO_ROOT/.venv}"
NODE_VERSION="${NODE_VERSION:-20}"
PNPM_VERSION="${PNPM_VERSION:-10.27.0}"
START_CORE_STACK="${START_CORE_STACK:-0}"
SKIP_SYSTEM_DEPS=0
SKIP_JS_DEPS=0
SKIP_PYTHON_DEPS=0
SKIP_SERVICES=0
SKIP_ENV_EXPORT=0
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
Project Nyra - Codex Webapp Manual Setup

Usage:
  scripts/setup/codex-webapp-manual-setup.sh [options]

Options:
  --env <name>                 Infisical environment (default: dev)
  --path <path>                Infisical path for root env export (default: /shared)
  --project-id <id>            Infisical project id (auto-detected from .infisical.json if omitted)
  --root-env-file <path>       Root .env output path (default: <repo>/.env)
  --python-venv <path>         Python virtualenv path (default: <repo>/.venv)
  --node-version <version>     Node version for nvm (default: 20)
  --pnpm-version <version>     pnpm version for corepack (default: 10.27.0)
  --start-core-stack           Start infra core profile in addition to LiteLLM
  --extra-compose <path>       Optional extra compose file to bring up
  --extra-path <path>          Infisical path for extra compose run (default: same as --path)
  --skip-system-deps           Skip apt/system dependency installation
  --skip-js-deps               Skip pnpm install
  --skip-python-deps           Skip Python venv + requirements install
  --skip-services              Skip docker compose service startup
  --skip-env-export            Skip writing root .env from Infisical
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
    --node-version)
      NODE_VERSION="$2"
      shift 2
      ;;
    --pnpm-version)
      PNPM_VERSION="$2"
      shift 2
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
    --skip-system-deps)
      SKIP_SYSTEM_DEPS=1
      shift
      ;;
    --skip-js-deps)
      SKIP_JS_DEPS=1
      shift
      ;;
    --skip-python-deps)
      SKIP_PYTHON_DEPS=1
      shift
      ;;
    --skip-services)
      SKIP_SERVICES=1
      shift
      ;;
    --skip-env-export)
      SKIP_ENV_EXPORT=1
      shift
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

read_project_id() {
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    return 0
  fi
  if [[ -f "$REPO_ROOT/.infisical.json" ]] && command -v jq >/dev/null 2>&1; then
    INFISICAL_PROJECT_ID="$(jq -r '.workspaceId // empty' "$REPO_ROOT/.infisical.json")"
  fi
}

run_with_sudo() {
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    return 1
  fi
}

install_system_dependencies() {
  if [[ "$SKIP_SYSTEM_DEPS" -eq 1 ]]; then
    warn "Skipping system dependency install"
    return 0
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    warn "apt-get not available, skipping OS package installation"
    return 0
  fi

  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    if ! command -v sudo >/dev/null 2>&1 || ! sudo -n true >/dev/null 2>&1; then
      warn "No non-interactive sudo access; skipping apt package installation"
      return 0
    fi
  fi

  info "Installing base system dependencies"
  run_with_sudo apt-get update -y
  run_with_sudo apt-get install -y \
    ca-certificates curl wget git jq unzip zip xz-utils \
    build-essential pkg-config make g++ \
    python3 python3-pip python3-venv pipx \
    ruby-full \
    docker.io docker-compose-plugin
}

ensure_nvm_node_pnpm() {
  local nvm_dir="${NVM_DIR:-$HOME/.nvm}"
  export NVM_DIR="$nvm_dir"

  if [[ ! -s "$nvm_dir/nvm.sh" ]]; then
    info "Installing nvm"
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi

  # shellcheck disable=SC1090
  source "$nvm_dir/nvm.sh"
  info "Ensuring Node.js $NODE_VERSION"
  nvm install "$NODE_VERSION" >/dev/null
  nvm use "$NODE_VERSION" >/dev/null
  nvm alias default "$NODE_VERSION" >/dev/null
  local node_bin
  node_bin="$(dirname "$(nvm which "$NODE_VERSION")")"
  export PATH="$node_bin:$PATH"

  require_cmd node
  require_cmd npm

  if [[ -f "$REPO_ROOT/package.json" ]] && command -v jq >/dev/null 2>&1; then
    local package_manager
    package_manager="$(jq -r '.packageManager // empty' "$REPO_ROOT/package.json" 2>/dev/null || true)"
    if [[ "$package_manager" =~ ^pnpm@ ]]; then
      PNPM_VERSION="${package_manager#pnpm@}"
    fi
  fi

  info "Ensuring pnpm $PNPM_VERSION via corepack"
  corepack enable >/dev/null 2>&1 || true
  corepack prepare "pnpm@${PNPM_VERSION}" --activate >/dev/null
  require_cmd pnpm
}

ensure_python_tooling() {
  require_cmd python3
  require_cmd pip3

  if ! command -v uv >/dev/null 2>&1; then
    info "Installing uv"
    if command -v pipx >/dev/null 2>&1; then
      pipx install uv >/dev/null 2>&1 || pipx install --force uv >/dev/null 2>&1
    else
      local tooling_venv="$HOME/.local/share/nyra-tooling-venv"
      mkdir -p "$(dirname "$tooling_venv")" "$HOME/.local/bin"
      python3 -m venv "$tooling_venv"
      "$tooling_venv/bin/pip" install --upgrade pip uv >/dev/null
      ln -sf "$tooling_venv/bin/uv" "$HOME/.local/bin/uv"
    fi
    export PATH="$PATH:$HOME/.local/bin"
  fi
}

ensure_ruby_tooling() {
  if ! command -v ruby >/dev/null 2>&1; then
    warn "Ruby not found after setup; skipping bundler install"
    return 0
  fi
  if ! command -v bundle >/dev/null 2>&1; then
    gem install bundler --no-document >/dev/null 2>&1 || true
  fi
}

infisical_env_candidates() {
  local env="$1"
  printf "%s\n" "$env"
  if [[ "$env" == "staging" ]]; then
    printf "stag\n"
  elif [[ "$env" == "stag" ]]; then
    printf "staging\n"
  fi
}

run_infisical() {
  local env="$1"
  local path_arg="$2"
  shift 2

  local cmd=(infisical run --env="$env" --path="$path_arg")
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    cmd+=(--projectId="$INFISICAL_PROJECT_ID")
  fi
  cmd+=(--)
  cmd+=("$@")
  "${cmd[@]}"
}

resolve_infisical_env() {
  local path_arg="$1"
  local resolved=""
  while IFS= read -r candidate; do
    if infisical export --env="$candidate" --path="$path_arg" --format=dotenv >/dev/null 2>&1; then
      resolved="$candidate"
      break
    fi
  done < <(infisical_env_candidates "$INFISICAL_ENV")

  if [[ -z "$resolved" ]]; then
    err "Could not resolve Infisical environment for '$INFISICAL_ENV' on path '$path_arg'"
    exit 1
  fi
  echo "$resolved"
}

export_root_env_file() {
  if [[ "$SKIP_ENV_EXPORT" -eq 1 ]]; then
    warn "Skipping root .env export"
    return 0
  fi

  local resolved_env
  resolved_env="$(resolve_infisical_env "$INFISICAL_PATH")"
  info "Exporting env from Infisical env='$resolved_env' path='$INFISICAL_PATH' -> $ROOT_ENV_FILE"

  local tmp_file
  tmp_file="$(mktemp)"
  trap 'rm -f "$tmp_file"' RETURN

  local cmd=(infisical export --env="$resolved_env" --path="$INFISICAL_PATH" --format=dotenv --output-file="$tmp_file")
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    cmd+=(--projectId="$INFISICAL_PROJECT_ID")
  fi
  "${cmd[@]}"

  if [[ ! -s "$tmp_file" ]]; then
    err "Infisical export produced empty output"
    exit 1
  fi

  if [[ -f "$ROOT_ENV_FILE" ]]; then
    local backup_file="${ROOT_ENV_FILE}.backup.$(date +%Y%m%d-%H%M%S)"
    cp "$ROOT_ENV_FILE" "$backup_file"
    info "Backed up existing env to $backup_file"
  fi

  mkdir -p "$(dirname "$ROOT_ENV_FILE")"
  mv "$tmp_file" "$ROOT_ENV_FILE"
  chmod 600 "$ROOT_ENV_FILE" || true
  ok "Wrote $(grep -c '=' "$ROOT_ENV_FILE" || echo 0) keys to $ROOT_ENV_FILE"
}

install_js_dependencies() {
  if [[ "$SKIP_JS_DEPS" -eq 1 ]]; then
    warn "Skipping JS dependency install"
    return 0
  fi
  export HUSKY=0
  info "Installing workspace JavaScript dependencies"
  pnpm install --no-frozen-lockfile
  ok "pnpm install complete"
}

install_python_dependencies() {
  if [[ "$SKIP_PYTHON_DEPS" -eq 1 ]]; then
    warn "Skipping Python dependency install"
    return 0
  fi

  info "Creating/updating Python venv at $PYTHON_VENV_DIR"
  python3 -m venv "$PYTHON_VENV_DIR"
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
      info "Installing Python requirements: ${req#$REPO_ROOT/}"
      pip install -r "$req"
    fi
  done
  deactivate || true
  ok "Python dependency sync complete"
}

ensure_compose_env_file() {
  local compose_file="$1"
  local compose_dir
  compose_dir="$(cd "$(dirname "$compose_file")" && pwd)"
  local compose_env="$compose_dir/.env"
  if [[ -f "$compose_env" ]]; then
    return 0
  fi
  if [[ -f "$ROOT_ENV_FILE" ]]; then
    cp "$ROOT_ENV_FILE" "$compose_env"
    chmod 600 "$compose_env" || true
    info "Created $compose_env from $ROOT_ENV_FILE"
  fi
}

start_services() {
  if [[ "$SKIP_SERVICES" -eq 1 ]]; then
    warn "Skipping service startup"
    return 0
  fi

  require_cmd docker
  export HUSKY=0

  local resolved_env
  resolved_env="$(resolve_infisical_env "$INFISICAL_PATH")"

  local litellm_primary="$REPO_ROOT/services/litellm-proxy/docker-compose.yml"
  local litellm_fallback="$REPO_ROOT/services/litellm-proxy/docker-compose.fallback.yml"

  if [[ -f "$litellm_primary" ]]; then
    ensure_compose_env_file "$litellm_primary"
    info "Starting LiteLLM primary stack"
    if ! run_infisical "$resolved_env" "$INFISICAL_PATH" docker compose -f "$litellm_primary" up -d; then
      warn "LiteLLM primary failed, trying fallback"
      if [[ -f "$litellm_fallback" ]]; then
        ensure_compose_env_file "$litellm_fallback"
        run_infisical "$resolved_env" "$INFISICAL_PATH" docker compose -f "$litellm_fallback" up -d
      fi
    fi
  fi

  if [[ "$START_CORE_STACK" -eq 1 ]] && [[ -f "$REPO_ROOT/infra/docker-compose.yml" ]]; then
    info "Starting infra core profile stack"
    run_infisical "$resolved_env" "$INFISICAL_PATH" \
      docker compose -f "$REPO_ROOT/infra/docker-compose.yml" --profile core up -d || warn "Core stack failed to start"
  fi

  if [[ -n "$EXTRA_COMPOSE_FILE" ]]; then
    local extra_path="$EXTRA_INFISICAL_PATH"
    [[ -z "$extra_path" ]] && extra_path="$INFISICAL_PATH"
    local extra_env
    extra_env="$(resolve_infisical_env "$extra_path")"
    info "Starting extra compose: $EXTRA_COMPOSE_FILE (path: $extra_path, env: $extra_env)"
    run_infisical "$extra_env" "$extra_path" docker compose -f "$EXTRA_COMPOSE_FILE" up -d
  fi

  ok "Service startup sequence completed"
}

print_versions() {
  info "Toolchain versions"
  echo "  node:    $(node -v 2>/dev/null || echo missing)"
  echo "  npm:     $(npm -v 2>/dev/null || echo missing)"
  echo "  pnpm:    $(pnpm -v 2>/dev/null || echo missing)"
  echo "  python3: $(python3 --version 2>/dev/null || echo missing)"
  echo "  pip3:    $(pip3 --version 2>/dev/null || echo missing)"
  echo "  uv:      $(uv --version 2>/dev/null || echo missing)"
  echo "  ruby:    $(ruby --version 2>/dev/null || echo missing)"
  echo "  bundler: $(bundle --version 2>/dev/null || echo missing)"
  echo "  docker:  $(docker --version 2>/dev/null || echo missing)"
}

main() {
  cd "$REPO_ROOT"
  read_project_id

  info "Project root: $REPO_ROOT"
  info "Infisical target: env='$INFISICAL_ENV' path='$INFISICAL_PATH'"
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    info "Infisical project ID: $INFISICAL_PROJECT_ID"
  fi

  install_system_dependencies
  ensure_nvm_node_pnpm
  ensure_python_tooling
  ensure_ruby_tooling

  require_cmd infisical
  require_cmd jq

  export_root_env_file
  install_js_dependencies
  install_python_dependencies
  start_services
  print_versions

  echo
  ok "✅ Project Nyra Codex webapp setup completed"
  echo "Next checks:"
  echo "  cd \"$REPO_ROOT\""
  echo "  HUSKY=0 pnpm -w build"
  echo "  docker ps --format 'table {{.Names}}\\t{{.Status}}'"
}

main "$@"
