#!/usr/bin/env bash
set -euo pipefail
echo "[Nyra] Checking prerequisites..."
command -v git >/dev/null || (echo "git missing" && exit 1)
command -v docker >/dev/null || (echo "docker missing" && exit 1)
command -v docker >/dev/null || (echo "docker missing" && exit 1)
echo "[Nyra] OK"
