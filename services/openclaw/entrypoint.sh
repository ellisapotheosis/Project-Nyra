#!/bin/sh
set -e

mkdir -p /root/.openclaw

export OPENAI_BASE_URL="${OPENAI_BASE_URL:-https://api.openai.com/v1}"
export OPENCLAW_AGENT_MODEL="${OPENCLAW_AGENT_MODEL:-litellm/local/qwen-coder-32b}"
export OPENCLAW_MEM0_ENABLED="${OPENCLAW_MEM0_ENABLED:-false}"
export OPENCLAW_MEM0_LLM_MODEL="${OPENCLAW_MEM0_LLM_MODEL:-local/gemma-4}"
export OPENCLAW_MEM0_EMBEDDING_MODEL="${OPENCLAW_MEM0_EMBEDDING_MODEL:-local/embeddings}"
export FALKORDB_HOST="${FALKORDB_HOST:-falkordb}"
export FALKORDB_PORT="${FALKORDB_PORT:-6379}"
export OPEN_WEBUI_BOT_EMAIL="${OPEN_WEBUI_BOT_EMAIL:-}"
export OPEN_WEBUI_BOT_PASSWORD="${OPEN_WEBUI_BOT_PASSWORD:-}"

# Substitute env vars into the config template
envsubst < /etc/openclaw/openclaw.json.template > /root/.openclaw/openclaw.json

echo "openclaw config written to /root/.openclaw/openclaw.json"
echo "Starting openclaw gateway on port 18789..."

if [ -n "${OPENCLAW_GATEWAY_TOKEN:-}" ]; then
  exec openclaw gateway --port 18789 --token "$OPENCLAW_GATEWAY_TOKEN"
fi

if [ -n "${OPENCLAW_GATEWAY_PASSWORD:-}" ]; then
  exec openclaw gateway --port 18789 --password "$OPENCLAW_GATEWAY_PASSWORD"
fi

exec openclaw gateway --port 18789
