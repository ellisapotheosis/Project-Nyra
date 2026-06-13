#!/bin/bash
# Verify Nexus Router MCP connection and list available tools
# Usage: ./scripts/verify-nexus-mcp.sh [SERVICE_TOKEN]

set -euo pipefail

# Configuration
NEXUS_URL="${NEXUS_URL:-https://nexus.projectnyra.com/mcp}"
SERVICE_TOKEN="${1:-${CLOUDFLARE_SERVICE_TOKEN:-}}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Nexus Router MCP Connection Verification Script        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check connectivity
echo -e "${BLUE}[1/4]${NC} Testing basic connectivity to Nexus Router..."
echo "URL: $NEXUS_URL"

if curl -s -I "$NEXUS_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Endpoint is reachable"
else
    echo -e "${YELLOW}⚠${NC} Endpoint returned non-2xx status (may be auth-protected)"
fi

# Step 2: Test with service token if provided
if [ -n "$SERVICE_TOKEN" ]; then
    echo ""
    echo -e "${BLUE}[2/4]${NC} Testing with Cloudflare service token..."
    
    RESPONSE=$(curl -s -H "CF-Access-Service-Token: $SERVICE_TOKEN" "$NEXUS_URL/health" 2>&1 || true)
    
    if echo "$RESPONSE" | grep -q "healthy\|ok" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Authenticated request successful"
        echo "Response: $RESPONSE"
    else
        echo -e "${YELLOW}⚠${NC} Service token may not be configured correctly"
        echo "Response preview: ${RESPONSE:0:200}"
    fi
else
    echo ""
    echo -e "${YELLOW}[2/4]${NC} Skipping authenticated tests (no SERVICE_TOKEN provided)"
    echo "To test with authentication, set CLOUDFLARE_SERVICE_TOKEN or pass as argument:"
    echo "  ./scripts/verify-nexus-mcp.sh YOUR_SERVICE_TOKEN"
fi

# Step 3: MCP Protocol Information
echo ""
echo -e "${BLUE}[3/4]${NC} Nexus Router Configuration Summary:"
echo "  Service: Grafbase Nexus Router"
echo "  Location: oracle-vps (Oracle VPS cloud instance)"
echo "  Port: 3000 (internal) → 6000 (localhost) → HTTPS via Cloudflare tunnel"
echo "  MCP Endpoint: /mcp (SSE/HTTP transport)"
echo "  Health Check: /health"
echo "  LLM Gateway: /v1 (OpenAI-compatible)"
echo ""

# Step 4: Configuration for Warp
echo -e "${BLUE}[4/4]${NC} Warp Configuration Options:"
echo ""
echo "Option A: Via Warp UI"
echo "  1. Settings → Agents → MCP servers"
echo "  2. Add MCP server with:"
echo "     Name: nexus-router"
echo "     URL: $NEXUS_URL"
echo "     Headers: CF-Access-Service-Token: <YOUR_SERVICE_TOKEN>"
echo ""

echo "Option B: Via Agent Config JSON"
cat > /tmp/nexus-agent-config-example.json << 'EOF'
{
  "name": "nexus-agent",
  "model_id": "claude-opus-4-6",
  "mcp_servers": {
    "nexus_router": {
      "url": "https://nexus.projectnyra.com/mcp",
      "headers": {
        "CF-Access-Service-Token": "${CLOUDFLARE_SERVICE_TOKEN}"
      }
    }
  }
}
EOF
echo "  Config file created at: /tmp/nexus-agent-config-example.json"
echo ""

echo "Option C: Via CLI"
echo "  oz agent run \\"
echo "    --mcp '{\"nexus_router\": {\"url\": \"$NEXUS_URL\"}}' \\"
echo "    --prompt 'your task'"
echo ""

# Step 5: Available MCP Servers (from nexus.toml)
echo -e "${BLUE}Available MCP Servers:${NC}"
echo "  (As configured in /infra/hosts/oracle-vps/nexus.toml)"
echo ""
echo "  Note: Nexus currently aggregates active, smoke-tested servers."
echo "  Servers with known SSE/transport issues are deployed directly:"
echo "    - OpenMemory (direct deployment)"
echo "    - Letta MCP (direct deployment at localhost:8284)"
echo "    - Serena MCP (availability varies)"
echo ""

echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Obtain a Cloudflare service token for nexus.projectnyra.com"
echo "  2. Set CLOUDFLARE_SERVICE_TOKEN environment variable or pass as arg"
echo "  3. Configure Warp with the MCP endpoint using one of the options above"
echo "  4. Start using Nexus Router tools in your agents!"
