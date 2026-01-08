#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-cheap-gemini}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
ENV_DIR="$ROOT/.env.modes"
TARGET="$ROOT/.env"
case "$MODE" in
  cheap-gemini) SRC="$ENV_DIR/.env.cheap-gemini" ;;
  balanced-mix) SRC="$ENV_DIR/.env.balanced-mix" ;;
  offline-ollama) SRC="$ENV_DIR/.env.offline-ollama" ;;
  *) echo "Unknown mode: $MODE"; exit 1 ;;
esac
cp "$SRC" "$TARGET"
echo "Switched Nyra mode -> $MODE"
