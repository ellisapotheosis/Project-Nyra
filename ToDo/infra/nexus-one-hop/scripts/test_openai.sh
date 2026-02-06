#!/usr/bin/env bash
set -euo pipefail
BASE=${BASE:-http://localhost:8000/llm/openai/v1}
MODEL=${MODEL:-claude/economy}

echo "Listing models..."
curl -s "$BASE/models"

echo "\nSending chat completion..."
cat > /tmp/payload.json <<JSON
{"model":"$MODEL","messages":[{"role":"user","content":"Say hi in 5 words"}]}
JSON

curl -s "$BASE/chat/completions" \
  -H "Content-Type: application/json" \
  --data @/tmp/payload.json
