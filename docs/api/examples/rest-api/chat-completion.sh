#!/bin/bash

# Project Nyra - Chat Completion Example
# This script demonstrates how to use the chat completions API

# Configuration
BASE_URL="${NYRA_API_URL:-https://api.project-nyra.io}"
TOKEN="${NYRA_API_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo "Error: NYRA_API_TOKEN environment variable is not set"
    echo "Usage: export NYRA_API_TOKEN='your-jwt-token'"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Project Nyra Chat Completion Example ===${NC}\n"

# Example 1: Simple chat completion
echo -e "${GREEN}Example 1: Simple question${NC}"
curl -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [
      {
        "role": "user",
        "content": "What is the current average 30-year fixed mortgage rate?"
      }
    ]
  }' | jq .

echo -e "\n"

# Example 2: With system message
echo -e "${GREEN}Example 2: With system prompt${NC}"
curl -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful mortgage advisor assistant."
      },
      {
        "role": "user",
        "content": "Should I refinance my mortgage?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }' | jq .

echo -e "\n"

# Example 3: Multi-turn conversation
echo -e "${GREEN}Example 3: Multi-turn conversation${NC}"
curl -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [
      {
        "role": "user",
        "content": "What documents do I need for a mortgage application?"
      },
      {
        "role": "assistant",
        "content": "You typically need: 1) Proof of income (pay stubs, tax returns), 2) Bank statements, 3) Employment verification, 4) Credit report, 5) Property information."
      },
      {
        "role": "user",
        "content": "How recent should the bank statements be?"
      }
    ]
  }' | jq .

echo -e "\n${BLUE}=== Examples Complete ===${NC}"
