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
USER_HOME="${SNAP_REAL_HOME:-$HOME}"

INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
INFISICAL_API_URL="${INFISICAL_API_URL:-https://app.infisical.com/api}"
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

add_path_if_exists() {
  local dir="$1"
  if [[ -d "$dir" && ":$PATH:" != *":$dir:"* ]]; then
    export PATH="$dir:$PATH"
  fi
}

find_existing_node_bin_dir() {
  local candidate=""

  if command -v node >/dev/null 2>&1; then
    dirname "$(command -v node)"
    return 0
  fi

  for candidate in \
    "$USER_HOME/.local/share/fnm/node-versions"/*/installation/bin/node \
    "$USER_HOME/.nvm/versions/node"/*/bin/node \
    "$USER_HOME/.volta/bin/node" \
    "/usr/local/bin/node" \
    "/usr/bin/node"
  do
    if [[ -x "$candidate" ]]; then
      dirname "$candidate"
      return 0
    fi
  done

  return 1
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

read_json_field() {
  local file="$1"
  local field="$2"

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  if command -v jq >/dev/null 2>&1; then
    jq -r ".${field} // empty" "$file" 2>/dev/null || true
    return 0
  fi

  if command -v python3 >/dev/null 2>&1; then
    python3 - "$file" "$field" <<'PY'
import json
import sys

path, field = sys.argv[1], sys.argv[2]
with open(path, "r", encoding="utf-8") as handle:
    value = json.load(handle)

for key in field.split("."):
    if not isinstance(value, dict):
        value = ""
        break
    value = value.get(key, "")

if value in ("", None):
    raise SystemExit(0)

print(value)
PY
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    node -e '
      const fs = require("fs");
      const [file, field] = process.argv.slice(1);
      let value = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const key of field.split(".")) {
        if (!value || typeof value !== "object") {
          value = "";
          break;
        }
        value = value[key] ?? "";
      }
      if (value !== "" && value != null) console.log(value);
    ' "$file" "$field" 2>/dev/null || true
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

read_project_id() {
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    return 0
  fi
  INFISICAL_PROJECT_ID="$(read_json_field "$REPO_ROOT/.infisical.json" "workspaceId")"
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

resolve_infisical_universal_auth_credentials() {
  local client_id=""
  local client_secret=""

  client_id="${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-${INFISICAL_CLIENT_ID:-}}"
  client_secret="${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-${INFISICAL_CLIENT_SECRET:-}}"

  if [[ -z "$client_id" ]]; then
    client_id="$(read_dotenv_value "$ROOT_ENV_FILE" "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID")"
  fi
  if [[ -z "$client_id" ]]; then
    client_id="$(read_dotenv_value "$ROOT_ENV_FILE" "INFISICAL_CLIENT_ID")"
  fi
  if [[ -z "$client_secret" ]]; then
    client_secret="$(read_dotenv_value "$ROOT_ENV_FILE" "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET")"
  fi
  if [[ -z "$client_secret" ]]; then
    client_secret="$(read_dotenv_value "$ROOT_ENV_FILE" "INFISICAL_CLIENT_SECRET")"
  fi

  if [[ -n "$client_id" && -n "$client_secret" ]]; then
    printf '%s\n%s\n' "$client_id" "$client_secret"
    return 0
  fi

  return 1
}

ensure_infisical_auth() {
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

  local creds=()
  local client_id=""
  local client_secret=""
  if mapfile -t creds < <(resolve_infisical_universal_auth_credentials 2>/dev/null); then
    client_id="${creds[0]:-}"
    client_secret="${creds[1]:-}"
    if [[ -n "$client_id" && -n "$client_secret" ]]; then
      info "Authenticating Infisical via universal auth"
      if token="$(infisical login --domain "$INFISICAL_API_URL" --method=universal-auth --client-id="$client_id" --client-secret="$client_secret" --silent --plain 2>/dev/null)"; then
        if [[ -n "$token" ]]; then
          INFISICAL_TOKEN="$token"
          export INFISICAL_TOKEN
          INFISICAL_SESSION_TOKEN="$token"
          export INFISICAL_SESSION_TOKEN
          return 0
        fi
      fi
      warn "Infisical universal auth failed for project '$INFISICAL_PROJECT_ID' at '$INFISICAL_API_URL'. Falling back to any existing Infisical CLI session."
    fi
  fi

  if run_infisical_cli export --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --format=dotenv >/dev/null 2>&1; then
    info "Using existing Infisical CLI session"
    return 0
  fi

  err "Infisical authentication is not configured. Provide INFISICAL_TOKEN/INFISICAL_ACCESS_TOKEN, valid universal-auth credentials, or a working Infisical CLI session."
  exit 1
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

apt_package_available() {
  local package="$1"
  apt-cache show "$package" >/dev/null 2>&1
}

resolve_compose_command() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
    return 0
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
    return 0
  fi

  return 1
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

  if ! run_with_optional_sudo true >/dev/null 2>&1; then
    warn "No non-interactive sudo access; skipping apt package installation"
    return 0
  fi

  info "Installing base system dependencies"
  run_with_sudo apt-get update -y
  run_with_sudo apt-get install -y \
    ca-certificates curl wget git jq unzip zip xz-utils \
    build-essential pkg-config make g++ \
    python3 python3-pip python3-venv pipx \
    ruby-full git-lfs

  local docker_packages=()
  local compose_package=""

  if ! command -v docker >/dev/null 2>&1; then
    if apt_package_available docker.io; then
      docker_packages+=(docker.io)
    else
      warn "docker.io is unavailable in the configured apt repositories"
    fi
  fi

  if ! resolve_compose_command; then
    if apt_package_available docker-compose-plugin; then
      compose_package="docker-compose-plugin"
    elif apt_package_available docker-compose-v2; then
      compose_package="docker-compose-v2"
    elif apt_package_available docker-compose; then
      compose_package="docker-compose"
    else
      warn "No Docker Compose package is available in the configured apt repositories"
    fi
  fi

  if [[ -n "$compose_package" ]]; then
    docker_packages+=("$compose_package")
  fi

  if [[ "${#docker_packages[@]}" -gt 0 ]]; then
    info "Installing Docker packages: ${docker_packages[*]}"
    run_with_sudo apt-get install -y "${docker_packages[@]}"
  fi
}

ensure_nvm_node_pnpm() {
  local requested_major="${NODE_VERSION%%.*}"
  local active_major=""
  local nvm_dir="${NVM_DIR:-$USER_HOME/.nvm}"
  local existing_node_bin_dir=""
  export NVM_DIR="$nvm_dir"

  add_path_if_exists "$USER_HOME/.local/bin"
  if existing_node_bin_dir="$(find_existing_node_bin_dir)"; then
    add_path_if_exists "$existing_node_bin_dir"
  fi

  if command -v node >/dev/null 2>&1; then
    active_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  fi

  if [[ -n "$active_major" && "$active_major" -ge "$requested_major" ]]; then
    info "Using existing Node.js $(node -v)"
  else
    if [[ ! -s "$nvm_dir/nvm.sh" ]]; then
      require_cmd curl
      info "Installing nvm"
      curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    fi

    # shellcheck disable=SC1090
    source "$nvm_dir/nvm.sh"
    info "Ensuring Node.js $NODE_VERSION"
    nvm install "$NODE_VERSION" >/dev/null
    nvm use "$NODE_VERSION" >/dev/null
    nvm alias default "$NODE_VERSION" >/dev/null
    add_path_if_exists "$(dirname "$(nvm which "$NODE_VERSION")")"
  fi

  require_cmd node
  require_cmd npm

  if [[ -f "$REPO_ROOT/package.json" ]]; then
    local package_manager
    package_manager="$(read_json_field "$REPO_ROOT/package.json" "packageManager")"
    if [[ "$package_manager" =~ ^pnpm@ ]]; then
      PNPM_VERSION="${package_manager#pnpm@}"
    fi
  fi

  info "Ensuring pnpm $PNPM_VERSION via corepack"
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    corepack prepare "pnpm@${PNPM_VERSION}" --activate >/dev/null 2>&1 || true
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    local npm_prefix="${NPM_CONFIG_PREFIX:-$USER_HOME/.local/npm-global}"
    mkdir -p "$npm_prefix/bin"
    if ! npm install -g "pnpm@${PNPM_VERSION}" >/dev/null 2>&1; then
      npm install -g --prefix "$npm_prefix" "pnpm@${PNPM_VERSION}" >/dev/null
    fi
    add_path_if_exists "$npm_prefix/bin"
  fi

  require_cmd pnpm
}

ensure_python_tooling() {
  require_cmd python3
  if ! python3 -m pip --version >/dev/null 2>&1; then
    python3 -m ensurepip --upgrade >/dev/null 2>&1 || true
  fi

  if ! command -v uv >/dev/null 2>&1; then
    info "Installing uv"
    if command -v pipx >/dev/null 2>&1; then
      pipx install uv >/dev/null 2>&1 || pipx install --force uv >/dev/null 2>&1
    else
      local tooling_venv="$USER_HOME/.local/share/nyra-tooling-venv"
      mkdir -p "$(dirname "$tooling_venv")" "$USER_HOME/.local/bin"
      python3 -m venv "$tooling_venv"
      "$tooling_venv/bin/pip" install --upgrade pip uv >/dev/null
      ln -sf "$tooling_venv/bin/uv" "$USER_HOME/.local/bin/uv"
    fi
    add_path_if_exists "$USER_HOME/.local/bin"
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

ensure_infisical() {
  if command -v infisical >/dev/null 2>&1; then
    return 0
  fi

  info "Installing Infisical CLI"

  if ! command -v npm >/dev/null 2>&1; then
    err "npm is unavailable, cannot install Infisical CLI automatically"
    exit 1
  fi

  local npm_prefix="${NPM_CONFIG_PREFIX:-$USER_HOME/.local/npm-global}"
  mkdir -p "$npm_prefix/bin"

  if ! npm install -g @infisical/cli >/dev/null 2>&1; then
    npm install -g --prefix "$npm_prefix" @infisical/cli >/dev/null
  fi
  add_path_if_exists "$npm_prefix/bin"

  require_cmd infisical
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
    run_with_sudo apt-get update -y
    run_with_sudo apt-get install -y wget
  fi

  run_with_sudo mkdir -p -m 755 /etc/apt/keyrings
  wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | run_with_sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  run_with_sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | run_with_sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  run_with_sudo apt-get update -y
  run_with_sudo apt-get install -y gh
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
    local resolved_env="$INFISICAL_ENV"
    resolved_env="$(resolve_infisical_env "$INFISICAL_PATH" 2>/dev/null || printf '%s' "$INFISICAL_ENV")"
    for key in GITHUB_TOKEN GH_TOKEN GITHUB_PERSONAL_ACCESS_TOKEN; do
      local cmd=(secrets get "$key" --env="$resolved_env" --path="$INFISICAL_PATH" --plain)
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

  if ! token="$(resolve_github_token)"; then
    warn "No GitHub token found in env or $ROOT_ENV_FILE; skipping gh auth"
    return 0
  fi

  ensure_github_cli
  if ! command -v gh >/dev/null 2>&1; then
    return 0
  fi

  if gh auth status >/dev/null 2>&1; then
    info "GitHub CLI is already authenticated"
    return 0
  fi

  info "Authenticating GitHub CLI"
  printf '%s' "$token" | gh auth login --hostname github.com --with-token --git-protocol https >/dev/null
  gh auth setup-git >/dev/null 2>&1 || true
  gh auth status || warn "GitHub CLI auth verification reported a problem"
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

  local cmd=(run --env="$env" --path="$path_arg")
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    cmd+=(--projectId="$INFISICAL_PROJECT_ID")
  fi
  cmd+=(--)
  cmd+=("$@")
  run_infisical_cli "${cmd[@]}"
}

resolve_infisical_env() {
  local path_arg="$1"
  local resolved=""
  while IFS= read -r candidate; do
    if run_infisical_cli export --env="$candidate" --path="$path_arg" --format=dotenv >/dev/null 2>&1; then
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

  local cmd=(export --env="$resolved_env" --path="$INFISICAL_PATH" --format=dotenv --output-file="$tmp_file")
  if [[ -n "$INFISICAL_PROJECT_ID" ]]; then
    cmd+=(--projectId="$INFISICAL_PROJECT_ID")
  fi
  run_infisical_cli "${cmd[@]}"

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

  if ! command -v docker >/dev/null 2>&1; then
    warn "Docker CLI is unavailable; skipping service startup"
    return 0
  fi
  if ! docker info >/dev/null 2>&1; then
    warn "Docker daemon is unavailable; skipping service startup"
    return 0
  fi
  if ! resolve_compose_command; then
    warn "Docker Compose is unavailable; skipping service startup"
    return 0
  fi
  export HUSKY=0

  local resolved_env
  resolved_env="$(resolve_infisical_env "$INFISICAL_PATH")"

  local litellm_primary="$REPO_ROOT/services/litellm-proxy/docker-compose.yml"
  local litellm_fallback="$REPO_ROOT/services/litellm-proxy/docker-compose.fallback.yml"

  if [[ -f "$litellm_primary" ]]; then
    ensure_compose_env_file "$litellm_primary"
    info "Starting LiteLLM primary stack"
    if ! run_infisical "$resolved_env" "$INFISICAL_PATH" "${COMPOSE_CMD[@]}" -f "$litellm_primary" up -d; then
      warn "LiteLLM primary failed, trying fallback"
      if [[ -f "$litellm_fallback" ]]; then
        ensure_compose_env_file "$litellm_fallback"
        run_infisical "$resolved_env" "$INFISICAL_PATH" "${COMPOSE_CMD[@]}" -f "$litellm_fallback" up -d
      fi
    fi
  fi

  if [[ "$START_CORE_STACK" -eq 1 ]] && [[ -f "$REPO_ROOT/infra/docker-compose.yml" ]]; then
    info "Starting infra core profile stack"
    run_infisical "$resolved_env" "$INFISICAL_PATH" \
      "${COMPOSE_CMD[@]}" -f "$REPO_ROOT/infra/docker-compose.yml" --profile core up -d || warn "Core stack failed to start"
  fi

  if [[ -n "$EXTRA_COMPOSE_FILE" ]]; then
    local extra_path="$EXTRA_INFISICAL_PATH"
    [[ -z "$extra_path" ]] && extra_path="$INFISICAL_PATH"
    local extra_env
    extra_env="$(resolve_infisical_env "$extra_path")"
    info "Starting extra compose: $EXTRA_COMPOSE_FILE (path: $extra_path, env: $extra_env)"
    run_infisical "$extra_env" "$extra_path" "${COMPOSE_CMD[@]}" -f "$EXTRA_COMPOSE_FILE" up -d
  fi

  ok "Service startup sequence completed"
}

print_versions() {
  info "Toolchain versions"
  echo "  node:    $(node -v 2>/dev/null || echo missing)"
  echo "  npm:     $(npm -v 2>/dev/null || echo missing)"
  echo "  pnpm:    $(pnpm -v 2>/dev/null || echo missing)"
  echo "  python3: $(python3 --version 2>/dev/null || echo missing)"
  echo "  pip:     $(python3 -m pip --version 2>/dev/null || echo missing)"
  echo "  uv:      $(uv --version 2>/dev/null || echo missing)"
  echo "  ruby:    $(ruby --version 2>/dev/null || echo missing)"
  echo "  bundler: $(bundle --version 2>/dev/null || echo missing)"
  echo "  infisical: $(infisical --version 2>/dev/null || echo missing)"
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
  ensure_infisical
  ensure_infisical_auth

  export_root_env_file
  configure_github_auth
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
