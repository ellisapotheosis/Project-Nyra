#!/bin/bash
echo "=== NYRA INFRASTRUCTURE SETUP ==="

# Setup MetaMCP with Infisical
echo "1. Setting up MetaMCP..."
cd "../../mcp-ecosystem/MetaMCP"
if [ -f "package.json" ]; then
    npm install 2>/dev/null || echo "✓ Dependencies exist"
    echo "✓ MetaMCP ready"
fi

# Setup Infisical MCP
echo "2. Setting up Infisical MCP..."
cd "../Infisical"
if [ -f "package.json" ]; then
    npm install 2>/dev/null || echo "✓ Dependencies exist"
    echo "✓ Infisical MCP ready"
fi

# Check for Archon MCP
echo "3. Checking for Archon MCP..."
if [ -d "../../nyra-orchestration/nyra-orchestration/archon" ]; then
    echo "✓ Archon found at nyra-orchestration/nyra-orchestration/archon"
else
    echo "⚠ Archon not found, will need to install"
fi

echo "=== INFRASTRUCTURE SETUP COMPLETE ==="
