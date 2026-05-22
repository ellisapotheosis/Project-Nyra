#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
session="${NYRA_ZELLIJ_SESSION:-nyra-wave-ai}"
include_3060="${NYRA_INCLUDE_3060:-0}"
layout="$repo_root/infra/configs/zellij/nyra-wave-ai.kdl"

if [ "$include_3060" = "1" ]; then
  layout="$repo_root/infra/configs/zellij/nyra-wave-ai-3060.kdl"
else
  layout="$repo_root/infra/configs/zellij/nyra-wave-ai.kdl"
fi

mkdir -p "${NYRA_ZELLIJ_HISTORY_DIR:-$HOME/.nyra/zellij-history}"

if [ "${NYRA_LAUNCH_WAVETERM:-1}" = "1" ] && command -v waveterm >/dev/null 2>&1; then
  if ! pgrep -f waveterm >/dev/null 2>&1; then
    nohup waveterm >/dev/null 2>&1 &
  fi
fi

if zellij list-sessions 2>/dev/null | awk '{print $1}' | grep -qx "$session"; then
  exec zellij attach "$session"
fi

exec zellij --session "$session" --layout "$layout"
