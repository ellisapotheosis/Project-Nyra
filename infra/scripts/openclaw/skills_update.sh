#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/infra/compose/nyra.compose.yaml --profile openclaw"
$COMPOSE exec -T openclaw-cli openclaw skills update --installed-only
