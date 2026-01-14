#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT_DIR/vendor"
mkdir -p "$VENDOR"
cd "$VENDOR"

if [ ! -d "claude-flow" ]; then
  git clone https://github.com/ellisapotheosis/claude-flow.git
else
  echo "claude-flow already exists"
fi

if [ ! -d "archon" ]; then
  git clone https://github.com/ellisapotheosis/archon.git
else
  echo "archon already exists"
fi

echo "[Nyra] Forks cloned into $VENDOR"
