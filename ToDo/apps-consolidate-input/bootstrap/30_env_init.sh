#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cp -n "$ROOT_DIR/infra/.env.example" "$ROOT_DIR/infra/.env" || true
echo "[Nyra] Created infra/.env (edit keys!)"
