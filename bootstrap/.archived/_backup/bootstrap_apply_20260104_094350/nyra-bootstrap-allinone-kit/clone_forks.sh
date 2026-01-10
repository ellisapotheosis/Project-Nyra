#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT_DIR/services/vendor"
mkdir -p "$VENDOR"

clone_or_pull () {
  local url="$1"
  local dest="$2"
  if [ -d "$dest/.git" ]; then
    echo "[Nyra] Updating: $dest"
    git -C "$dest" pull
  else
    echo "[Nyra] Cloning: $url -> $dest"
    git clone "$url" "$dest"
  fi
}

clone_or_pull "https://github.com/ellisapotheosis/claude-flow" "$VENDOR/claude-flow"
clone_or_pull "https://github.com/ellisapotheosis/archon" "$VENDOR/archon"

echo "[Nyra] Forks ready under services/vendor/"
