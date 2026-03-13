#!/usr/bin/env bash
set -euo pipefail

INV_ROOT="${1:-/srv/nyra/fleet/inventory}"
REMOTE="${RCLONE_REMOTE:-}"
REMOTE_PATH="${RCLONE_REMOTE_PATH:-}"

if [[ -z "${REMOTE}" || -z "${REMOTE_PATH}" ]]; then
  echo "Set RCLONE_REMOTE and RCLONE_REMOTE_PATH to upload."
  exit 1
fi

if ! command -v rclone >/dev/null 2>&1; then
  apt-get update && apt-get install -y rclone
fi

rclone sync "${INV_ROOT}" "${REMOTE}:${REMOTE_PATH}" --create-empty-src-dirs
