#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and fill keys." >&2
  exit 1
fi
docker compose up -d

echo "Nexus up. OpenAI base: http://localhost:8000/llm/openai/v1"
echo "Anthropic base: http://localhost:8000/llm/anthropic"
echo "MCP endpoint:  http://localhost:8000/mcp"
