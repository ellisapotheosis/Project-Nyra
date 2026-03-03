#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_DIR="${OPENCLAW_DIR:-./openclaw-gateway}"
if [[ ! -d "$OPENCLAW_DIR/.git" ]]; then
  git clone https://github.com/openclaw/openclaw.git "$OPENCLAW_DIR"
fi

cd "$OPENCLAW_DIR"
chmod +x ./docker-setup.sh
./docker-setup.sh || true

echo "OpenClaw repo prepared at $OPENCLAW_DIR"
echo "Next: docker compose up -d --build"
