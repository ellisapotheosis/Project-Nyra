#!/usr/bin/env bash
set -euo pipefail

# Claude-Flow: https://github.com/ruvnet/claude-flow
# This script installs claude-flow "alpha" via npm (node required) and runs a tiny smoke test.
#
# IMPORTANT:
# - Claude-Flow commonly expects Claude Code to be installed/configured as well.
# - Follow Claude Code setup docs: https://code.claude.com/docs/en/setup

if ! command -v node >/dev/null 2>&1; then
  echo "node not found. Install node first (see scripts/wsl/install-node.sh)."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found (should come with node)."
  exit 1
fi

echo "[claude-flow] Installing @alpha globally..."
npm i -g claude-flow@alpha

echo "[claude-flow] Version:"
claude-flow --version || true

echo "[claude-flow] Listing templates (should work even before Claude Code is fully configured):"
claude-flow templates list || true

echo "[claude-flow] Done. Next:"
echo "  - Apply templates in your project: docs/08-CLAUDE-FLOW-TEMPLATES.md"
echo "  - Start MCP server (after Claude Code is setup): claude-flow mcp start"
