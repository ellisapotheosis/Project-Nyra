#!/usr/bin/env bash
set -euo pipefail

STACK_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$STACK_DIR"

docker compose down --remove-orphans

echo "[dev-stack] Stopped"
