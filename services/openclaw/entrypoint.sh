#!/bin/sh
set -e

mkdir -p /root/.openclaw

export OPENAI_BASE_URL="${OPENAI_BASE_URL:-https://api.openai.com/v1}"
export FALKORDB_HOST="${FALKORDB_HOST:-falkordb}"
export FALKORDB_PORT="${FALKORDB_PORT:-6379}"
export OPENCLAW_MEMORY_SLOT="${OPENCLAW_MEMORY_SLOT:-openclaw-mem0}"
export MEMOS_BASE_URL="${MEMOS_BASE_URL:-https://memos.projectnyra.com}"
export OPEN_WEBUI_BOT_EMAIL="${OPEN_WEBUI_BOT_EMAIL:-}"
export OPEN_WEBUI_BOT_PASSWORD="${OPEN_WEBUI_BOT_PASSWORD:-}"

# Substitute env vars into the config template
envsubst < /etc/openclaw/openclaw.json.template > /root/.openclaw/openclaw.json

echo "openclaw config written to /root/.openclaw/openclaw.json"
GATEWAY_PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
echo "Starting openclaw gateway on port ${GATEWAY_PORT}..."

set -- openclaw gateway --port "$GATEWAY_PORT"

if [ -n "${OPENCLAW_GATEWAY_BIND:-}" ]; then
  set -- "$@" --bind "$OPENCLAW_GATEWAY_BIND"
fi

if [ -n "${OPENCLAW_GATEWAY_AUTH:-}" ]; then
  set -- "$@" --auth "$OPENCLAW_GATEWAY_AUTH"
fi

if [ -n "${OPENCLAW_GATEWAY_TOKEN:-}" ]; then
  set -- "$@" --token "$OPENCLAW_GATEWAY_TOKEN"
fi

if [ -n "${OPENCLAW_GATEWAY_PASSWORD_FILE:-}" ]; then
  set -- "$@" --password-file "$OPENCLAW_GATEWAY_PASSWORD_FILE"
fi

exec "$@"
