#!/usr/bin/env bash
set -euo pipefail
sudo apt-get update -y
# best-effort; docker container is recommended fallback
sudo apt-get install -y cloudflared || true
if command -v cloudflared >/dev/null 2>&1; then
  cloudflared --version
else
  echo "cloudflared not installed via apt. Use Docker:"
  echo "docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <TUNNEL_TOKEN>"
  exit 1
fi
