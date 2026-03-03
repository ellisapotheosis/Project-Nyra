#!/usr/bin/env bash
set -euo pipefail
mkdir -p infra/openclaw
if command -v docker >/dev/null; then
  docker compose run --rm openclaw-cli clawhub explore --sort downloads --limit 20 --json > infra/openclaw/top20_downloads.json || true
fi
echo "Wrote infra/openclaw/top20_downloads.json (if clawhub available)"
