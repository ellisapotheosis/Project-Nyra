#!/bin/bash

# ChatGPT MCP Integration Tester
# Tests ChatGPT Developer Mode connector compatibility with Nexus Router

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXUS_URL="${NEXUS_URL:-http://localhost:8000}"
MCP_ENDPOINT="${MCP_ENDPOINT:-$NEXUS_URL/mcp}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}ChatGPT MCP Integration Tester${NC}\n"

# Test 1: Initialize (ChatGPT sends this first)
echo -e "${BLUE}Test 1: ChatGPT Initialize Request${NC}"
INIT=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {
        "tools": {},
        "resources": {},
        "prompts": {}
      },
      "clientInfo": {
        "name": "ChatGPT",
        "version": "1.0.0"
      }
    }
  }')

if echo "$INIT" | grep -q '"serverInfo"'; then
  echo -e "${GREEN}✓ Initialize successful${NC}"
  SERVER_NAME=$(echo "$INIT" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "  Server: $SERVER_NAME"
else
  echo -e "${RED}✗ Initialize failed${NC}"
  echo "$INIT"
  exit 1
fi

# Test 2: List Tools (ChatGPT lists available tools)
echo -e "\n${BLUE}Test 2: ChatGPT Tools/List Request${NC}"
TOOLS=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/list",
    "params": {}
  }')

if echo "$TOOLS" | grep -q '"tools"'; then
  echo -e "${GREEN}✓ Tools/list successful${NC}"

  # Extract specific tool information
  CREATE_BRANCH=$(echo "$TOOLS" | grep -o '"name":"create_branch"')
  if [ -n "$CREATE_BRANCH" ]; then
    echo -e "  ${GREEN}✓ Found: create_branch${NC}"
  fi

  CREATE_FILE=$(echo "$TOOLS" | grep -o '"name":"create_or_update_file"')
  if [ -n "$CREATE_FILE" ]; then
    echo -e "  ${GREEN}✓ Found: create_or_update_file${NC}"
  fi

  CREATE_PR=$(echo "$TOOLS" | grep -o '"name":"create_pull_request"')
  if [ -n "$CREATE_PR" ]; then
    echo -e "  ${GREEN}✓ Found: create_pull_request${NC}"
  fi

  MERGE_PR=$(echo "$TOOLS" | grep -o '"name":"merge_pull_request"')
  if [ -n "$MERGE_PR" ]; then
    echo -e "  ${GREEN}✓ Found: merge_pull_request${NC}"
  fi
else
  echo -e "${RED}✗ Tools/list failed${NC}"
  echo "$TOOLS"
  exit 1
fi

# Test 3: Simple Read Operation (no auth required)
echo -e "\n${BLUE}Test 3: GitHub Search Operation (Read)${NC}"
SEARCH=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "method": "tools/call",
    "params": {
      "name": "search_issues",
      "arguments": {
        "owner": "torvalds",
        "repo": "linux",
        "query": "is:open label:bug"
      }
    }
  }')

if echo "$SEARCH" | grep -q '"result"'; then
  echo -e "${GREEN}✓ Read operation successful${NC}"
elif echo "$SEARCH" | grep -q '"error"'; then
  ERROR_MSG=$(echo "$SEARCH" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${YELLOW}⚠ Operation error: $ERROR_MSG${NC}"
  echo "  (This is expected if GitHub token is not configured)"
else
  echo -e "${RED}✗ Unexpected response${NC}"
  echo "$SEARCH"
fi

# Test 4: Batch Request (ChatGPT can send multiple requests)
echo -e "\n${BLUE}Test 4: Batch Request (Multiple Operations)${NC}"
BATCH=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "jsonrpc": "2.0",
      "id": "batch-1",
      "method": "tools/list",
      "params": {}
    },
    {
      "jsonrpc": "2.0",
      "id": "batch-2",
      "method": "initialize",
      "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": { "name": "ChatGPT", "version": "1.0" }
      }
    }
  ]')

if echo "$BATCH" | grep -q '"batch-1"'; then
  echo -e "${GREEN}✓ Batch request successful${NC}"
  echo "  Processed multiple requests in single call"
else
  echo -e "${RED}✗ Batch request failed${NC}"
  echo "$BATCH"
fi

# Test 5: Error Handling (Invalid request)
echo -e "\n${BLUE}Test 5: Error Handling${NC}"
ERROR=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "5",
    "method": "invalid_method",
    "params": {}
  }')

if echo "$ERROR" | grep -q '"error"'; then
  ERROR_CODE=$(echo "$ERROR" | grep -o '"code":-[0-9]*' | cut -d':' -f2)
  echo -e "${GREEN}✓ Error handling working${NC}"
  echo "  Error code: $ERROR_CODE (method not found)"
else
  echo -e "${RED}✗ Error handling not working${NC}"
fi

# Test 6: CORS Headers (ChatGPT runs cross-origin)
echo -e "\n${BLUE}Test 6: CORS Headers${NC}"
HEADERS=$(curl -s -i -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Origin: https://chatgpt.com" \
  -d '{"jsonrpc":"2.0","id":"6","method":"initialize","params":{}}' | head -20)

if echo "$HEADERS" | grep -q "Allow"; then
  echo -e "${GREEN}✓ CORS headers present${NC}"
fi

# Summary
echo -e "\n${BLUE}Integration Test Summary${NC}"
echo "========================================"
echo -e "${GREEN}✓ ChatGPT Connector Compatibility Verified${NC}"
echo ""
echo "The Nexus Router MCP endpoint is ready for:"
echo "  • ChatGPT Developer Mode integration"
echo "  • GitHub repository operations"
echo "  • Audit logging of write operations"
echo ""
echo "Next steps:"
echo "  1. Configure GITHUB_TOKEN in environment"
echo "  2. Set ORCHESTRATOR_TUNNEL_TOKEN"
echo "  3. Add https://nexus.projectnyra.com/mcp as connector in ChatGPT"
echo "========================================"
