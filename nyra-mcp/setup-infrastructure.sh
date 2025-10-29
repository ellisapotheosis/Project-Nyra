#!/bin/bash
echo "=== NYRA MCP INFRASTRUCTURE SETUP ==="

# Setup MetaMCP
echo "1. Setting up MetaMCP..."
cd servers/MetaMCP
if [ -f "docker-compose.yml" ]; then
    echo "✓ MetaMCP configuration ready"
    echo "  To start: docker-compose up -d"
fi

# Setup Infisical
echo "2. Infisical is configured in MetaMCP docker-compose"
echo "  Access at: http://localhost:8080"

# Setup Archon MCP
echo "3. Setting up Archon MCP..."
mkdir -p ../../nyra-orchestration/archon
cd ../../nyra-orchestration/archon

# Clone or setup Archon if not exists
if [ ! -d ".git" ]; then
    echo "  Installing Archon MCP..."
    # For now, create placeholder
    cat > package.json << 'ARCHON'
{
  "name": "archon-mcp",
  "version": "1.0.0",
  "description": "Archon MCP Server for NYRA Orchestration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest"
  }
}
ARCHON
    echo "✓ Archon MCP placeholder created"
fi

echo ""
echo "=== INFRASTRUCTURE SETUP COMPLETE ==="
echo ""
echo "Next steps:"
echo "  1. cd nyra-mcp/servers/MetaMCP"
echo "  2. docker-compose up -d"
echo "  3. Configure Infisical at http://localhost:8080"
echo "  4. Setup Open-WebUI"
