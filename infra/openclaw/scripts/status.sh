#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
command -v docker >/dev/null 2>&1 || { echo "docker missing" >&2; exit 1; }

services=(nyra-openclaw-mvp nyra-kyutai-unmute-cloud nyra-openclaw-ui-proxy nyra-openclaw-ops)

for s in "${services[@]}"; do
  if docker inspect "$s" >/dev/null 2>&1; then
    state="$(docker inspect -f '{{.State.Status}}' "$s")"
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' "$s")"
    image="$(docker inspect -f '{{.Config.Image}}' "$s")"
    echo "$s | state=$state | health=$health | image=$image"
  else
    echo "$s | state=missing"
  fi
done

echo "\nActive ports (docker ps):"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | rg 'openclaw|unmute|NAMES' || true
