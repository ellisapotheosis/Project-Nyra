#!/usr/bin/env bash
set -euo pipefail

STACK_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
PROFILE="${1:-all}"

cd "$STACK_DIR"
if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  echo "[dev-stack] Created .env from .env.example"
fi

docker compose --profile "$PROFILE" up -d --build

echo "[dev-stack] Started profile: $PROFILE"
