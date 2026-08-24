#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_OPENCLAW="${ENV_OPENCLAW:-$ROOT_DIR/infra/env/openclaw.env}"
ENV_UI="${ENV_UI:-$ROOT_DIR/infra/env/openclaw.ui.env}"
OPENCLAW_IMAGE_DEFAULT="nyra/openclaw-mvp:local"
HEALTH_TIMEOUT_S="${OPENCLAW_HEALTH_TIMEOUT_S:-90}"
COMPOSE_VALIDATE="${OPENCLAW_COMPOSE_VALIDATE:-true}"

resolve_infra_path() {
  local path="$1"
  if [[ "$path" = /* ]]; then
    printf '%s\n' "$path"
  else
    printf '%s\n' "$ROOT_DIR/infra/${path#./}"
  fi
}

usage() {
  cat <<USAGE
Usage: $0 [--core-only] [--with-ui] [--skip-build] [--force-build]

Behavior:
  - Ensures env files exist and required keys are set.
  - Creates persistence paths for OpenClaw state + sessions.
  - Auto-builds OpenClaw image if missing (unless --skip-build).
  - Starts the OpenClaw core overlay and optionally the UI overlay.
USAGE
}

log() { echo "[openclaw-up] $*"; }
err() { echo "[openclaw-up] ERROR: $*" >&2; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { err "Missing command: $1"; exit 1; }
}

ensure_env_file() {
  local path="$1"
  local example="$2"
  if [[ ! -f "$path" ]]; then
    cp "$example" "$path"
    err "Created $path from example; fill required values then rerun."
    exit 1
  fi
}

source_envs() {
  set -a
  # shellcheck disable=SC1090
  source "$ENV_OPENCLAW"
  [[ -f "$ENV_VOICE" ]] && source "$ENV_VOICE"
  [[ -f "$ENV_UI" ]] && source "$ENV_UI"
  set +a
}

validate_required_env() {
  : "${OPENAI_API_KEY:?set OPENAI_API_KEY in $ENV_OPENCLAW}"
  : "${MEM0_API_KEY:?set MEM0_API_KEY in $ENV_OPENCLAW}"
}

validate_compose() {
  local compose_args=("$@")
  if [[ "$COMPOSE_VALIDATE" != "true" ]]; then
    return 0
  fi
  docker compose "${compose_args[@]}" config >/dev/null
}

build_if_needed() {
  local image_tag="${OPENCLAW_MVP_IMAGE:-$OPENCLAW_IMAGE_DEFAULT}"
  if [[ "${SKIP_BUILD:-false}" == "true" ]]; then
    log "Skipping image build by request (SKIP_BUILD=true)."
    return
  fi
  if [[ "${FORCE_BUILD:-false}" == "true" || "${OPENCLAW_FORCE_BUILD:-false}" == "true" ]] || ! docker image inspect "$image_tag" >/dev/null 2>&1; then
    log "Building OpenClaw image: $image_tag"
    docker build \
      -f "$ROOT_DIR/infra/openclaw/Dockerfile" \
      --build-arg OPENCLAW_INSTALL_BROWSER="${OPENCLAW_INSTALL_BROWSER:-0}" \
      --build-arg OPENCLAW_DOCKER_APT_PACKAGES="${OPENCLAW_DOCKER_APT_PACKAGES:-git curl jq python3}" \
      -t "$image_tag" \
      "$ROOT_DIR"
  else
    log "Image already present: $image_tag"
  fi
}

wait_for_container_running() {
  local cname="$1"
  local timeout="$2"
  local start_ts now state
  start_ts="$(date +%s)"
  while true; do
    if state="$(docker inspect -f '{{.State.Status}}' "$cname" 2>/dev/null)"; then
      if [[ "$state" == "running" ]]; then
        log "$cname is running."
        return 0
      fi
    fi
    now="$(date +%s)"
    if (( now - start_ts > timeout )); then
      err "Timed out waiting for $cname to reach running state."
      docker ps -a --filter "name=$cname" || true
      return 1
    fi
    sleep 2
  done
}

WITH_UI="${BOOT_OPENCLAW_UI_PROXY:-false}"
SKIP_BUILD=false
FORCE_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --core-only)
      WITH_UI=false
      shift
      ;;
    --with-ui)
      WITH_UI=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --force-build)
      FORCE_BUILD=true
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

require_cmd docker

ensure_env_file "$ENV_OPENCLAW" "$ROOT_DIR/infra/env/openclaw.env.example"
[[ -f "$ENV_UI" ]] || cp "$ROOT_DIR/infra/env/openclaw.ui.env.example" "$ENV_UI"

source_envs
validate_required_env

OPENCLAW_DATA_DIR_RESOLVED="$(resolve_infra_path "${OPENCLAW_DATA_DIR:-./data/openclaw}")"
mkdir -p "$OPENCLAW_DATA_DIR_RESOLVED" "$OPENCLAW_DATA_DIR_RESOLVED/sessions"

build_if_needed

BASE=(-f "$ROOT_DIR/infra/docker-compose.yml")
CORE_OVERLAY=(-f "$ROOT_DIR/infra/compose/openclaw.compose.yml")
UI_OVERLAY=(-f "$ROOT_DIR/infra/compose/openclaw.ui.compose.yml")

validate_compose "${BASE[@]}" "${CORE_OVERLAY[@]}"
docker compose "${BASE[@]}" "${CORE_OVERLAY[@]}" --profile openclaw up -d openclaw-mvp
wait_for_container_running nyra-openclaw-mvp "$HEALTH_TIMEOUT_S"

if [[ "$WITH_UI" == "true" ]]; then
  validate_compose "${BASE[@]}" "${CORE_OVERLAY[@]}" "${UI_OVERLAY[@]}"
  docker compose "${BASE[@]}" "${CORE_OVERLAY[@]}" "${UI_OVERLAY[@]}" --profile openclaw --profile openclaw-ui up -d openclaw-mvp openclaw-ui-proxy
  wait_for_container_running nyra-openclaw-ui-proxy "$HEALTH_TIMEOUT_S"
fi

log "OpenClaw startup complete."
