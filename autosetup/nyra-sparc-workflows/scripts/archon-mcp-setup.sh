#!/usr/bin/env bash
# Cross-platform Archon MCP bootstrap for Linux/macOS devcontainers / WSL.

set -euo pipefail

INSTALL_ROOT="${INSTALL_ROOT:-$HOME/dev/archon-mcp}"
REPO_URL="${REPO_URL:-https://github.com/archon-mcp/archon-mcp.git}"

echo "🚀 Archon MCP bootstrap starting..."
mkdir -p "$INSTALL_ROOT"
cd "$INSTALL_ROOT"

if [ ! -d ".git" ]; then
  git clone "$REPO_URL" .
else
  echo "Repo already present, pulling latest..."
  git pull
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required. Please install and re-run." >&2
  exit 1
fi

npm install

CONFIG_DIR="$INSTALL_ROOT/.archon"
mkdir -p "$CONFIG_DIR"
CONFIG_PATH="$CONFIG_DIR/archon.config.json"

cat > "$CONFIG_PATH" <<'JSON'
{
  "orchestrator": {
    "role": "secondary",
    "primary": "claude-flow"
  },
  "mcp": {
    "enableServerManagement": true,
    "autoDiscover": true
  },
  "routing": {
    "strategy": "capability-based"
  },
  "env": {
    "CLAUDE_FLOW_API_KEY": "${CLAUDE_FLOW_API_KEY}",
    "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
    "OPENAI_API_KEY": "${OPENAI_API_KEY}"
  }
}
JSON

echo "✅ Archon MCP installed at $INSTALL_ROOT"
echo "Config written to $CONFIG_PATH"
echo "Remember: bind secrets via Infisical on this host."