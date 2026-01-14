#!/usr/bin/env bash
set -euo pipefail

MODES="${1:-spec,arch,impl,verify}"
PROMPT_FILE="${2:-$(cd "$(dirname "$0")/.." && pwd)/prompts/NYRA_AIO_MASTER_BATCH.md}"

echo "== NYRA AIO Batch Runner =="
echo "Prompt: $PROMPT_FILE"
echo "Modes: $MODES"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

echo "[1/3] Verifying claude-flow..."
npx claude-flow@alpha --version

echo "[2/3] Loading prompt..."
TASK="$(cat "$PROMPT_FILE")"
if [ -z "$TASK" ]; then
  echo "Prompt file is empty." >&2
  exit 1
fi

echo "[3/3] Running SPARC batch..."
npx claude-flow@alpha sparc batch "$MODES" "$TASK"
