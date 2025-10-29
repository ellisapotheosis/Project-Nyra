#!/bin/bash
echo "=== STARTING NYRA INFRASTRUCTURE ==="

# Create Docker network
echo "1. Creating Docker network..."
docker network create nyra-network 2>/dev/null || echo "✓ Network exists"

# Start MetaMCP + Infisical
echo "2. Starting MetaMCP + Infisical..."
cd nyra-mcp/servers/MetaMCP
docker-compose up -d
echo "✓ MetaMCP running on http://localhost:3000"
echo "✓ Infisical running on http://localhost:8080"

# Start Open-WebUI
echo "3. Starting Open-WebUI..."
cd ../../../nyra-infra
docker-compose -f open-webui-compose.yml up -d
echo "✓ Open-WebUI running on http://localhost:3002"

# Install Archon MCP dependencies
echo "4. Installing Archon MCP..."
cd ../nyra-orchestration/archon
npm install
echo "✓ Archon MCP ready"

echo ""
echo "=== INFRASTRUCTURE STARTED ==="
echo ""
echo "Access points:"
echo "  - MetaMCP:    http://localhost:3000"
echo "  - Infisical:  http://localhost:8080"
echo "  - Open-WebUI: http://localhost:3002"
echo ""
