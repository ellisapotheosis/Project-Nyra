#!/usr/bin/env bash
set -euo pipefail
export ANTHROPIC_BASE_URL="http://localhost:4000"
export ANTHROPIC_AUTH_TOKEN="local-noauth"
npx claude-flow@latest mcp start
