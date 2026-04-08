#!/usr/bin/env sh
set -eu

CLI_BIN=""
if command -v ruflo >/dev/null 2>&1; then
  CLI_BIN="ruflo"
elif command -v claude-flow >/dev/null 2>&1; then
  CLI_BIN="claude-flow"
fi

echo "[ruflo-runtime] workspace: $(pwd)"
echo "[ruflo-runtime] selected_cli=${CLI_BIN:-none}"

if [ "${RUFLO_BOOTSTRAP:-1}" = "1" ] && [ -n "$CLI_BIN" ]; then
  "$CLI_BIN" --version || true
  "$CLI_BIN" init --minimal --skip-claude --force || true
  "$CLI_BIN" doctor || true
  "$CLI_BIN" memory init --force || true
  ("$CLI_BIN" daemon start >/tmp/ruflo-daemon.log 2>&1 || true) &
fi

if [ "${RUFLO_START_SYSTEM:-0}" = "1" ] && [ -n "$CLI_BIN" ]; then
  if [ "${RUFLO_START_BACKGROUND:-1}" = "1" ]; then
    ("$CLI_BIN" start --daemon --port "${RUFLO_MCP_PORT:-8080}" --topology "${RUFLO_TOPOLOGY:-hierarchical-mesh}" >/tmp/ruflo-start.log 2>&1 || true) &
  else
    exec "$CLI_BIN" start --port "${RUFLO_MCP_PORT:-8080}" --topology "${RUFLO_TOPOLOGY:-hierarchical-mesh}"
  fi
fi

echo "[ruflo-runtime] ready"
tail -f /dev/null
