#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_OPENCLAW="${ENV_OPENCLAW:-$ROOT_DIR/infra/env/openclaw.env}"
ENV_VOICE="${ENV_VOICE:-$ROOT_DIR/infra/env/openclaw.voice.env}"
ENV_UI="${ENV_UI:-$ROOT_DIR/infra/env/openclaw.ui.env}"
OPENCLAW_IMAGE_DEFAULT="nyra/openclaw-mvp:local"
HEALTH_TIMEOUT_S="${OPENCLAW_HEALTH_TIMEOUT_S:-90}"
COMPOSE_VALIDATE="${OPENCLAW_COMPOSE_VALIDATE:-true}"

usage() {
  cat <<USAGE
Usage: $0 [--core-only] [--with-voice] [--with-ui] [--skip-build] [--force-build]

Behavior:
  - Ensures env files exist and required keys are set.
  - Creates persistence paths for OpenClaw state + sessions.
  - Auto-builds OpenClaw image if missing (unless --skip-build).
  - Starts openclaw core overlay and optionally voice/UI overlays.
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
      --build-arg OPENCLAW_INSTALL_BROWSER="${OPENCLAW_INSTALL_BROWSER:-1}" \
      --build-arg OPENCLAW_DOCKER_APT_PACKAGES="${OPENCLAW_DOCKER_APT_PACKAGES:-git curl jq python3 python3-pip build-essential ffmpeg}" \
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

WITH_VOICE="${BOOT_OPENCLAW_VOICE:-false}"
WITH_UI="${BOOT_OPENCLAW_UI_PROXY:-false}"
SKIP_BUILD=false
FORCE_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --core-only)
      WITH_VOICE=false
      WITH_UI=false
      shift
      ;;
    --with-voice)
      WITH_VOICE=true
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
[[ -f "$ENV_VOICE" ]] || cp "$ROOT_DIR/infra/env/openclaw.voice.env.example" "$ENV_VOICE"
[[ -f "$ENV_UI" ]] || cp "$ROOT_DIR/infra/env/openclaw.ui.env.example" "$ENV_UI"

source_envs
validate_required_env

mkdir -p "$ROOT_DIR/infra/data/openclaw/mvp" "$ROOT_DIR/infra/data/openclaw/sessions"

build_if_needed

BASE=(-f "$ROOT_DIR/infra/docker-compose.yml")
CORE_OVERLAY=(-f "$ROOT_DIR/infra/compose/openclaw.compose.yml")
VOICE_OVERLAY=(-f "$ROOT_DIR/infra/compose/openclaw.voice.compose.yml")
UI_OVERLAY=(-f "$ROOT_DIR/infra/compose/openclaw.ui.compose.yml")

validate_compose "${BASE[@]}" "${CORE_OVERLAY[@]}"
docker compose "${BASE[@]}" "${CORE_OVERLAY[@]}" --profile openclaw up -d openclaw-mvp
wait_for_container_running nyra-openclaw-mvp "$HEALTH_TIMEOUT_S"

if [[ "$WITH_VOICE" == "true" ]]; then
  : "${UNMUTE_OPENAI_API_KEY:?set UNMUTE_OPENAI_API_KEY in $ENV_VOICE}"
  validate_compose "${BASE[@]}" "${VOICE_OVERLAY[@]}"
  docker compose "${BASE[@]}" "${VOICE_OVERLAY[@]}" --profile voice up -d kyutai-unmute-cloud
  wait_for_container_running nyra-kyutai-unmute-cloud "$HEALTH_TIMEOUT_S"
fi

if [[ "$WITH_UI" == "true" ]]; then
  validate_compose "${BASE[@]}" "${CORE_OVERLAY[@]}" "${UI_OVERLAY[@]}"
  docker compose "${BASE[@]}" "${CORE_OVERLAY[@]}" "${UI_OVERLAY[@]}" --profile openclaw --profile openclaw-ui up -d openclaw-mvp openclaw-ui-proxy
  wait_for_container_running nyra-openclaw-ui-proxy "$HEALTH_TIMEOUT_S"
fi

log "OpenClaw startup complete."
