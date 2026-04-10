#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_DIR="$ROOT_DIR/nyra-stack"

ADDONS="${ADDONS:-0}"
SERVICES="${SERVICES:-0}"
LOCALBUILD="${LOCALBUILD:-0}"
letta="${letta:-0}"

cd "$STACK_DIR"

FILES=(-f docker-compose.yml)
[[ "$ADDONS" == "1" ]] && FILES+=(-f docker-compose.addons.yml)
[[ "$SERVICES" == "1" ]] && FILES+=(-f docker-compose.services.yml)
[[ "$LOCALBUILD" == "1" ]] && FILES+=(-f docker-compose.local.yml)
[[ "$letta" == "1" ]] && FILES+=(-f docker-compose.letta.yml)

docker compose "${FILES[@]}" up -d ${LOCALBUILD:+--build} ${SERVICES:+--build}
