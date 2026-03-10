#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

find_parent_pnp_manifest() {
  local dir="$1"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/.pnp.cjs" ]]; then
      printf '%s\n' "$dir/.pnp.cjs"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}

restore_pnp_files() {
  if [[ -n "${PARENT_PNP_BACKUP:-}" && -f "$PARENT_PNP_BACKUP" ]]; then
    mv "$PARENT_PNP_BACKUP" "$PARENT_PNP_PATH"
  fi
  if [[ -n "${PARENT_PNP_LOADER_BACKUP:-}" && -f "$PARENT_PNP_LOADER_BACKUP" ]]; then
    mv "$PARENT_PNP_LOADER_BACKUP" "$PARENT_PNP_LOADER_PATH"
  fi
}

PARENT_PNP_PATH=""
PARENT_PNP_BACKUP=""
PARENT_PNP_LOADER_PATH=""
PARENT_PNP_LOADER_BACKUP=""

if PARENT_PNP_PATH="$(find_parent_pnp_manifest "$APP_DIR")"; then
  PARENT_PNP_DIR="$(dirname "$PARENT_PNP_PATH")"
  PARENT_PNP_BACKUP="$PARENT_PNP_PATH.codex-bak.$$"
  PARENT_PNP_LOADER_PATH="$PARENT_PNP_DIR/.pnp.loader.mjs"
  PARENT_PNP_LOADER_BACKUP="$PARENT_PNP_LOADER_PATH.codex-bak.$$"

  trap restore_pnp_files EXIT INT TERM

  mv "$PARENT_PNP_PATH" "$PARENT_PNP_BACKUP"
  if [[ -f "$PARENT_PNP_LOADER_PATH" ]]; then
    mv "$PARENT_PNP_LOADER_PATH" "$PARENT_PNP_LOADER_BACKUP"
  fi
fi

cd "$APP_DIR"
opennextjs-cloudflare build --skipWranglerConfigCheck
