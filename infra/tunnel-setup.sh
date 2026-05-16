#!/bin/bash

# ==============================================================================
# CLOUDFLARED TUNNEL SETUP
# ==============================================================================
# One-time setup for Cloudflare tunnel connectivity
# Prerequisites:
#   1. Cloudflare account (free tier OK)
#   2. Domain added to Cloudflare DNS
#   3. Tunnel created in Cloudflare Zero Trust
# ==============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}CLOUDFLARED TUNNEL SETUP${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Check for tunnel credentials
echo "Step 1: Verify Tunnel Credentials"
echo "=================================="
echo ""

TUNNEL_ID="${CLOUDFLARE_TUNNEL_ID:-64fe03f2-9859-44ca-b0ab-e499d8464104}"
CREDS_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"

if [[ ! -f "$CREDS_FILE" ]]; then
    echo -e "${RED}✗ Tunnel credentials NOT FOUND${NC}"
    echo ""
    echo "To get tunnel credentials:"
    echo "  1. Go to: https://dash.cloudflare.com/?to=/:account/zero-trust"
    echo "  2. Navigate to: Networks → Tunnels"
    echo "  3. Create a tunnel (or use existing)"
    echo "  4. Click 'Install connector' → choose your OS"
    echo "  5. Follow instructions to download credentials JSON"
    echo "  6. Save to: $CREDS_FILE"
    echo ""
    echo "Then run: $0"
    exit 1
else
    echo -e "${GREEN}✓ Tunnel credentials found at: $CREDS_FILE${NC}"
fi

echo ""

# Step 2: Auto-generate tunnel config from port discovery
echo "Step 2: Generate Tunnel Configuration"
echo "====================================="
echo ""

if [[ ! -f "PORT_DISCOVERY_REPORT.txt" ]]; then
    echo -e "${YELLOW}⚠ Running port discovery first...${NC}"
    bash infra/scripts/port-discovery.sh
else
    echo -e "${GREEN}✓ Using existing port discovery${NC}"
fi

echo ""

# Step 3: Validate tunnel config
echo "Step 3: Validate Configuration"
echo "=============================="
echo ""

if [[ -f "infra/cloudflared/config.yml" ]]; then
    echo -e "${YELLOW}Validating tunnel config...${NC}"
    cloudflared tunnel ingress validate infra/cloudflared/config.yml || \
        (echo -e "${RED}✗ Config validation failed${NC}" && exit 1)
    echo -e "${GREEN}✓ Configuration is valid${NC}"
else
    echo -e "${RED}✗ Configuration file not found${NC}"
    exit 1
fi

echo ""

# Step 4: Create public hostnames
echo "Step 4: Create Public Hostnames (DNS Records)"
echo "============================================="
echo ""

declare -a HOSTNAMES=(
    "ratehunter.net"
    "app.projectnyra.com"
    "crm.projectnyra.com"
    "chat.projectnyra.com"
    "nexus.projectnyra.com"
    "orchestrator.projectnyra.com"
    "admin.projectnyra.com"
    "n8n.projectnyra.com"
    "flows.projectnyra.com"
    "grafana.projectnyra.com"
    "metrics.projectnyra.com"
    "git.projectnyra.com"
)

echo "Creating DNS records for tunnel..."
echo ""

for hostname in "${HOSTNAMES[@]}"; do
    echo -n "  $hostname... "
    # Note: This requires cloudflared to be authenticated
    # In practice, DNS records are created via Cloudflare dashboard
    if cloudflared tunnel route dns "$TUNNEL_ID" "$hostname" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (may already exist or need manual setup)${NC}"
    fi
done

echo ""

# Step 5: Test tunnel connectivity
echo "Step 5: Test Tunnel Connection"
echo "=============================="
echo ""

echo -e "${YELLOW}Note: Tunnel must be running to test${NC}"
echo ""
echo "In another terminal, start the tunnel with:"
echo "  make tunnel-start"
echo ""
echo "Then test with:"
echo "  curl https://ratehunter.net"
echo ""

# Step 6: Setup instructions
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}TUNNEL SETUP COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the tunnel:"
echo "   ${GREEN}make tunnel-start${NC}"
echo ""
echo "2. Verify connectivity:"
echo "   ${GREEN}curl https://ratehunter.net${NC}"
echo ""
echo "3. Monitor tunnel:"
echo "   ${GREEN}cloudflared tunnel logs $TUNNEL_ID${NC}"
echo ""
echo "4. Access services:"
echo "   - Landing:     https://ratehunter.net"
echo "   - App:         https://app.projectnyra.com"
echo "   - CRM:         https://crm.projectnyra.com"
echo "   - Chat:        https://chat.projectnyra.com"
echo "   - Admin:       https://admin.projectnyra.com"
echo "   - Grafana:     https://grafana.projectnyra.com"
echo ""
echo "5. Troubleshooting:"
echo "   - Check tunnel status: cloudflared tunnel info"
echo "   - View logs: make logs"
echo "   - Health check: make health-check"
echo ""
