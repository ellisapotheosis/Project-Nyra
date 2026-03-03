#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cp docker/.env.example docker/.env 2>/dev/null || true
docker compose --env-file docker/.env -f docker/docker-compose.nyra.yml up -d
echo "[OK] Services starting."
