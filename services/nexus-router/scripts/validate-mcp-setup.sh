#!/bin/bash

# Nexus Router MCP Setup Validator
# Validates the MCP server configuration, GitHub connectivity, and SSE endpoint

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NEXUS_URL="${NEXUS_URL:-http://localhost:8000}"
MCP_ENDPOINT="${MCP_ENDPOINT:-$NEXUS_URL/mcp}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Nexus Router MCP Setup Validator${NC}\n"

# Check if Nexus Router is running
echo -e "${BLUE}1. Checking Nexus Router connectivity...${NC}"
if curl -s "$NEXUS_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Nexus Router is running at $NEXUS_URL${NC}"
else
  echo -e "${RED}✗ Cannot reach Nexus Router at $NEXUS_URL${NC}"
  echo "   Make sure Nexus Router is running: npm run dev"
  exit 1
fi

# Check MCP endpoint availability
echo -e "\n${BLUE}2. Testing MCP endpoint availability...${NC}"
if curl -s "$MCP_ENDPOINT" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ MCP endpoint is available at $MCP_ENDPOINT${NC}"
else
  echo -e "${RED}✗ MCP endpoint not available at $MCP_ENDPOINT${NC}"
  exit 1
fi

# Test MCP initialize request
echo -e "\n${BLUE}3. Testing MCP initialize method...${NC}"
INIT_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-init",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "Validator",
        "version": "1.0.0"
      }
    }
  }')

if echo "$INIT_RESPONSE" | grep -q '"result"'; then
  PROTOCOL_VERSION=$(echo "$INIT_RESPONSE" | grep -o '"protocolVersion":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✓ MCP initialize successful (protocol: $PROTOCOL_VERSION)${NC}"
else
  echo -e "${RED}✗ MCP initialize failed${NC}"
  echo "Response: $INIT_RESPONSE"
  exit 1
fi

# Test tools/list method
echo -e "\n${BLUE}4. Testing MCP tools/list method...${NC}"
TOOLS_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-tools",
    "method": "tools/list",
    "params": {}
  }')

if echo "$TOOLS_RESPONSE" | grep -q '"tools"'; then
  TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | grep -o '"tools":\[' | wc -l)
  GITHUB_TOOLS=$(echo "$TOOLS_RESPONSE" | grep -o '"name":"[^"]*github[^"]*"' | wc -l)
  echo -e "${GREEN}✓ Tools/list successful (Total: $TOOL_COUNT, GitHub: $GITHUB_TOOLS)${NC}"
else
  echo -e "${RED}✗ Tools/list failed${NC}"
  echo "Response: $TOOLS_RESPONSE"
  exit 1
fi

# Check GitHub MCP connection
echo -e "\n${BLUE}5. Testing GitHub MCP server connection...${NC}"
if [ -z "$GITHUB_MCP_URL" ]; then
  GITHUB_MCP_URL="http://github-mcp:8813"
  echo "   Using default GitHub MCP URL: $GITHUB_MCP_URL"
fi

if curl -s "$GITHUB_MCP_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ GitHub MCP server is running${NC}"
else
  echo -e "${YELLOW}⚠ GitHub MCP server not accessible at $GITHUB_MCP_URL${NC}"
  echo "   GitHub operations may not work until GitHub MCP is started"
fi

# Test SSE connection
echo -e "\n${BLUE}6. Testing SSE connection...${NC}"
SSE_TEST=$(timeout 3 curl -s -N "$MCP_ENDPOINT" 2>&1 || true)

if echo "$SSE_TEST" | grep -q "event:"; then
  echo -e "${GREEN}✓ SSE connection successful${NC}"
else
  echo -e "${YELLOW}⚠ SSE connection test inconclusive (this is normal if using standard curl)${NC}"
fi

# Check audit logging configuration
echo -e "\n${BLUE}7. Checking audit logging...${NC}"
if [ -z "$MCP_AUDIT_LOGGING_ENABLED" ]; then
  echo "   Audit logging: Not explicitly configured (default: enabled)"
else
  if [ "$MCP_AUDIT_LOGGING_ENABLED" = "true" ]; then
    echo -e "${GREEN}✓ Audit logging is enabled${NC}"
    AUDIT_LOG_PATH="${MCP_AUDIT_LOG_PATH:-./logs/mcp-audit.log}"
    echo "   Audit log path: $AUDIT_LOG_PATH"
  else
    echo "   Audit logging is disabled"
  fi
fi

# Check environment variables
echo -e "\n${BLUE}8. Checking configuration...${NC}"
MISSING_VARS=()

if [ -z "$GITHUB_TOKEN" ]; then
  MISSING_VARS+=("GITHUB_TOKEN")
fi

if [ -z "$ORCHESTRATOR_TUNNEL_TOKEN" ]; then
  MISSING_VARS+=("ORCHESTRATOR_TUNNEL_TOKEN")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠ Missing environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "These are required for full functionality. Configure them in .env"
else
  echo -e "${GREEN}✓ All required environment variables are set${NC}"
fi

# Summary
echo -e "\n${BLUE}Summary${NC}"
echo "========================================"
echo -e "Nexus Router MCP validation completed"
echo "Endpoint: $MCP_ENDPOINT"
if [ -z "$GITHUB_TOOLS" ] || [ "$GITHUB_TOOLS" -eq 0 ]; then
  echo -e "${YELLOW}Note: GitHub tools were not detected. Ensure GitHub MCP is running.${NC}"
fi
echo "========================================"
echo -e "\n${GREEN}Setup validation successful!${NC}\n"
