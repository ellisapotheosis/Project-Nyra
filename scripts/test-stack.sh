#!/bin/bash
# Simple health check script for Project Nyra stack

echo "🧪 Testing Project Nyra Stack..."

check_service() {
  local name="$1"
  local url="$2"
  echo -n "  ${name}: "
  if curl -sf "$url" > /dev/null; then
    echo "✅"
  else
    echo "❌"
  fi
}

echo "📊 Health Checks:"
check_service "Nexus" "http://localhost:6000/health"
check_service "LiteLLM" "http://localhost:4000/health"
check_service "Claude Flow Dashboard" "http://localhost:3003"
check_service "Gitea" "http://localhost:3100"

# Test Vertex AI through LiteLLM via Nexus
echo ""
echo "🎯 Testing Vertex AI via LiteLLM through Nexus..."
curl -s -X POST http://localhost:6000/llm/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/economy",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }' | jq .

echo ""
echo "✅ If you see a response above, your Vertex AI credits are being used!"