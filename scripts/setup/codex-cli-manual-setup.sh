#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$REPO_ROOT/scripts/lib/infisical-token.sh"

INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
ROOT_ENV_FILE="${ROOT_ENV_FILE:-$REPO_ROOT/.env}"
LITELLM_COMPOSE_FILE=""
LITELLM_FALLBACK_COMPOSE_FILE="$REPO_ROOT/services/litellm-proxy/docker-compose.fallback.yml"
EXTRA_COMPOSE_FILE=""
EXTRA_INFISICAL_PATH=""

SKIP_INSTALL=0
SKIP_SERVICES=0
SKIP_ENV_EXPORT=0

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
Project Nyra - Codex CLI Manual Setup

Usage:
  scripts/setup/codex-cli-manual-setup.sh [options]

Options:
  --env <name>               Infisical environment (default: dev)
  --path <path>              Infisical path for root .env export (default: /shared)
  --project-id <id>          Infisical project id (default: repo standard project id)
  --root-env-file <path>     Output path for dotenv export (default: <repo>/.env)
  --litellm-compose <path>   Explicit LiteLLM compose file path
  --extra-compose <path>     Optional extra docker compose file to bring up
  --extra-path <path>        Infisical path for extra compose run (default: same as --path)
  --skip-install             Skip pnpm install
  --skip-services            Skip docker compose service startup
  --skip-env-export          Skip writing root .env
  -h, --help                 Show help

Examples:
  scripts/setup/codex-cli-manual-setup.sh
  scripts/setup/codex-cli-manual-setup.sh --env dev --path /shared
  scripts/setup/codex-cli-manual-setup.sh --extra-compose docker/qdrant/docker-compose.yml --extra-path /databases/qdrant-local
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
    --litellm-compose)
      LITELLM_COMPOSE_FILE="$2"
      shift 2
      ;;
    --extra-compose)
      EXTRA_COMPOSE_FILE="$2"
      shift 2
      ;;
    --extra-path)
      EXTRA_INFISICAL_PATH="$2"
      shift 2
      ;;
    --skip-install)
      SKIP_INSTALL=1
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

resolve_litellm_compose_file() {
  if [[ -n "$LITELLM_COMPOSE_FILE" ]]; then
    echo "$LITELLM_COMPOSE_FILE"
    return 0
  fi

  local candidates=(
    "$REPO_ROOT/docker/litellm-proxy/docker-compose.yml"
    "$REPO_ROOT/services/litellm-proxy/docker-compose.yml"
  )

  local file
  for file in "${candidates[@]}"; do
    if [[ -f "$file" ]]; then
      echo "$file"
      return 0
    fi
  done

  return 1
}

ensure_node_toolchain() {
  if ! command -v node >/dev/null 2>&1 && [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
    nvm use --silent default >/dev/null 2>&1 || true
  fi

  require_cmd node
  require_cmd npm

  if ! command -v pnpm >/dev/null 2>&1; then
    if command -v corepack >/dev/null 2>&1; then
      info "pnpm not found; enabling via corepack"
      corepack enable >/dev/null 2>&1 || true
      corepack prepare pnpm@10.27.0 --activate >/dev/null 2>&1 || true
    fi
  fi

  require_cmd pnpm
}

run_infisical() {
  local path_arg="$1"
  shift

  local cmd=(infisical run --env="$INFISICAL_ENV" --path="$path_arg")
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    cmd+=(--projectId="$INFISICAL_PROJECT_ID")
  fi
  cmd+=(--)
  cmd+=("$@")
  "${cmd[@]}"
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
  else
    warn "$compose_env is missing and root env file is unavailable"
  fi
}

export_root_env_file() {
  local tmp_file
  tmp_file="$(mktemp)"
  trap 'rm -f "$tmp_file"' RETURN

  local export_cmd=(infisical export --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --format=dotenv --output-file="$tmp_file")
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    export_cmd+=(--projectId="$INFISICAL_PROJECT_ID")
  fi

  info "Exporting Infisical secrets to $ROOT_ENV_FILE from $INFISICAL_PATH ($INFISICAL_ENV)"
  "${export_cmd[@]}"

  if [[ ! -s "$tmp_file" ]]; then
    err "Infisical export returned an empty file; aborting."
    exit 1
  fi

  if [[ -f "$ROOT_ENV_FILE" ]]; then
    local backup_file="${ROOT_ENV_FILE}.backup.$(date +%Y%m%d-%H%M%S)"
    cp "$ROOT_ENV_FILE" "$backup_file"
    info "Backed up existing env file to $backup_file"
  fi

  mkdir -p "$(dirname "$ROOT_ENV_FILE")"
  mv "$tmp_file" "$ROOT_ENV_FILE"
  chmod 600 "$ROOT_ENV_FILE" || true
  ok "Wrote $(grep -c '=' "$ROOT_ENV_FILE" || echo 0) entries to $ROOT_ENV_FILE"
}

start_litellm_stack() {
  local litellm_file="$1"

  ensure_compose_env_file "$litellm_file"
  info "🌐 Verifying LiteLLM Proxy Gateway..."

  if run_infisical "$INFISICAL_PATH" docker compose -f "$litellm_file" up -d; then
    ok "LiteLLM Proxy Gateway is up"
    return 0
  fi

  warn "Primary LiteLLM compose failed: $litellm_file"

  if [[ -f "$LITELLM_FALLBACK_COMPOSE_FILE" ]]; then
    warn "Trying fallback LiteLLM compose: $LITELLM_FALLBACK_COMPOSE_FILE"
    run_infisical "$INFISICAL_PATH" docker compose -f "$LITELLM_FALLBACK_COMPOSE_FILE" up -d
    ok "Fallback LiteLLM stack is up"
    return 0
  fi

  err "No fallback LiteLLM compose file found."
  return 1
}

main() {
  cd "$REPO_ROOT"

  info "Project root: $REPO_ROOT"
  info "Infisical env/path: $INFISICAL_ENV / $INFISICAL_PATH"

  require_cmd infisical
  require_cmd docker
  ensure_node_toolchain
  nyra_require_infisical_token
  nyra_resolve_infisical_project_id

  export HUSKY=0

  if [[ "$SKIP_ENV_EXPORT" -eq 0 ]]; then
    export_root_env_file
  else
    warn "Skipping root .env export"
  fi

  if [[ "$SKIP_INSTALL" -eq 0 ]]; then
    info "Installing workspace dependencies (HUSKY=0)"
    pnpm install --no-frozen-lockfile
    ok "Dependency install finished"
  else
    warn "Skipping dependency install"
  fi

  if [[ "$SKIP_SERVICES" -eq 0 ]]; then
    local litellm_file
    if litellm_file="$(resolve_litellm_compose_file)"; then
      start_litellm_stack "$litellm_file"
    else
      warn "Could not find LiteLLM compose file. Use --litellm-compose to set it explicitly."
    fi

    if [[ -n "$EXTRA_COMPOSE_FILE" ]]; then
      local extra_path="$EXTRA_INFISICAL_PATH"
      if [[ -z "$extra_path" ]]; then
        extra_path="$INFISICAL_PATH"
      fi
      info "Starting extra compose stack: $EXTRA_COMPOSE_FILE (Infisical path: $extra_path)"
      run_infisical "$extra_path" docker compose -f "$EXTRA_COMPOSE_FILE" up -d
      ok "Extra compose stack is up"
    fi
  else
    warn "Skipping docker service startup"
  fi

  echo
  ok "✅ Nyra Environment Resumed and Ready."
  echo
  echo "Next checks:"
  echo "  docker ps"
  echo "  test -f \"$ROOT_ENV_FILE\" && echo '.env present'"
  echo "  pnpm -v && node -v"
}

main "$@"
