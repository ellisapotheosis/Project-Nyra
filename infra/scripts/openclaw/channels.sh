#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/infra/env/nyra.env}"
COMPOSE="docker compose -f $ROOT_DIR/infra/compose/nyra.compose.yaml --profile openclaw"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

CHANNEL="${1:-}"
case "$CHANNEL" in
  telegram)
    [[ -n "${TELEGRAM_BOT_TOKEN:-}" ]] || { echo "Set TELEGRAM_BOT_TOKEN in env"; exit 1; }
    $COMPOSE exec -T openclaw-cli openclaw channels add telegram --token-ref env:TELEGRAM_BOT_TOKEN
    ;;
  discord)
    [[ -n "${DISCORD_BOT_TOKEN:-}" ]] || { echo "Set DISCORD_BOT_TOKEN in env"; exit 1; }
    $COMPOSE exec -T openclaw-cli openclaw channels add discord --token-ref env:DISCORD_BOT_TOKEN
    ;;
  whatsapp)
    $COMPOSE exec -T openclaw-cli openclaw channels add whatsapp
    echo "Run: $COMPOSE logs -f openclaw-cli  # scan QR"
    ;;
  *)
    echo "Usage: $0 {telegram|discord|whatsapp}"
    exit 1
    ;;
esac
