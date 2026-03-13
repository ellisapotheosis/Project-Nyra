#!/usr/bin/env sh
set -eu

echo "[agentic-flow-runtime] version: $(agentic-flow --version | tr '\n' ' ')"

if [ "${AGENTIC_FLOW_BOOTSTRAP:-1}" = "1" ]; then
  PROVIDER="${AGENTIC_FLOW_PROVIDER:-anthropic}"
  PORT="${AGENTIC_FLOW_PORT:-8095}"
  echo "[agentic-flow-runtime] starting proxy on :${PORT} provider=${PROVIDER}"
  (agentic-flow proxy --provider "$PROVIDER" --port "$PORT" >/tmp/agentic-flow.log 2>&1 || true) &
fi

echo "[agentic-flow-runtime] ready"
tail -f /dev/null
