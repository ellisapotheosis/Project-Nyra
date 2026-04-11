#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"

resolve_repo_root() {
  if git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    git -C "$SCRIPT_DIR" rev-parse --show-toplevel
    return 0
  fi

  local candidate
  candidate="$(cd -- "$SCRIPT_DIR/../.." && pwd -P)"
  if [[ -f "$candidate/package.json" ]]; then
    printf '%s\n' "$candidate"
    return 0
  fi

  printf 'Unable to resolve repository root from %s\n' "$SCRIPT_DIR" >&2
  exit 1
}

REPO_ROOT="$(resolve_repo_root)"
cd "$REPO_ROOT"

SETUP_MODE="${NYRA_CODEX_SETUP_MODE:-auto}"
INSTALL_DEPS="${NYRA_CODEX_INSTALL_DEPS:-1}"
RUN_TESTS="${NYRA_CODEX_RUN_TESTS:-0}"
FULL_SETUP_SCRIPT="$REPO_ROOT/scripts/setup/codex-webapp-manual-setup.sh"
AI_CLIENT_SYNC_SCRIPT="$REPO_ROOT/scripts/setup/sync-ai-client-config.sh"

info() {
  printf '[codex-setup] %s\n' "$1"
}

ensure_pnpm() {
  if ! command -v node >/dev/null 2>&1; then
    info "node is unavailable; skipping JavaScript bootstrap"
    return 0
  fi

  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    corepack prepare pnpm@10.27.0 --activate >/dev/null 2>&1 || true
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    info "pnpm is unavailable after corepack; skipping JavaScript bootstrap"
    return 0
  fi

  if [[ "$INSTALL_DEPS" != "1" ]]; then
    info "Skipping pnpm install because NYRA_CODEX_INSTALL_DEPS=$INSTALL_DEPS"
    return 0
  fi

  if [[ -f "$REPO_ROOT/package.json" && -f "$REPO_ROOT/pnpm-lock.yaml" ]]; then
    info "Installing workspace dependencies from $REPO_ROOT"
    HUSKY=0 CI="${CI:-1}" pnpm install --no-frozen-lockfile
  fi
}

run_minimal_setup() {
  info "Running minimal Codex bootstrap in $REPO_ROOT"
  if [[ -x "$AI_CLIENT_SYNC_SCRIPT" ]]; then
    "$AI_CLIENT_SYNC_SCRIPT"
  fi
  ensure_pnpm

  if [[ "$RUN_TESTS" == "1" ]] && command -v pnpm >/dev/null 2>&1; then
    info "Running smoke validation"
    HUSKY=0 CI="${CI:-1}" pnpm -w test -- --runInBand
  fi
}

run_full_setup() {
  if [[ ! -x "$FULL_SETUP_SCRIPT" ]]; then
    info "Full setup script is missing or not executable: $FULL_SETUP_SCRIPT"
    exit 1
  fi

  info "Running full Project Nyra setup"
  "$FULL_SETUP_SCRIPT" --skip-system-deps
}

case "$SETUP_MODE" in
  full)
    run_full_setup
    ;;
  minimal)
    run_minimal_setup
    ;;
  auto)
    if [[ -n "${CODEX_ENV_NODE_VERSION:-}" || "$REPO_ROOT" == /workspace* ]]; then
      run_minimal_setup
    else
      run_full_setup
    fi
    ;;
  *)
    printf 'Unsupported NYRA_CODEX_SETUP_MODE=%s\n' "$SETUP_MODE" >&2
    exit 1
    ;;
esac
