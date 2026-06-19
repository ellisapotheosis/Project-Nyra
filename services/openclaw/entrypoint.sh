#!/bin/sh
set -e

mkdir -p /root/.openclaw

export OPENAI_BASE_URL="${OPENAI_BASE_URL:-https://api.openai.com/v1}"
export FALKORDB_HOST="${FALKORDB_HOST:-falkordb}"
export FALKORDB_PORT="${FALKORDB_PORT:-6379}"
export OPEN_WEBUI_BOT_EMAIL="${OPEN_WEBUI_BOT_EMAIL:-}"
export OPEN_WEBUI_BOT_PASSWORD="${OPEN_WEBUI_BOT_PASSWORD:-}"

# Substitute env vars into the config template
envsubst < /etc/openclaw/openclaw.json.template > /root/.openclaw/openclaw.json

echo "openclaw config written to /root/.openclaw/openclaw.json"
echo "Starting openclaw gateway on port 18789..."

exec openclaw gateway --port 18789
