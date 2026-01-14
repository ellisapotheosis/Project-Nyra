#!/usr/bin/env bash
set -euo pipefail
echo "==> Gemini CLI version:"
gemini --version || true
echo "==> Models via LiteLLM:"
curl -s -H "Authorization: Bearer nyra-dev" http://localhost:4000/v1/models | head -n 5 || true
echo "==> Gemini CLI quick prompt:"
gemini -p "Reply with 'NYRA OK' only."
