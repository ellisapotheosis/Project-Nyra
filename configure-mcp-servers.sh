#!/bin/bash
echo "=== CONFIGURING MCP SERVERS FOR CLAUDE CODE ==="

cat > .mcp-servers.json << 'MCPCONFIG'
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "description": "Claude Flow orchestration"
    },
    "ruv-swarm": {
      "command": "npx",
      "args": ["ruv-swarm", "mcp", "start"],
      "description": "Ruv Swarm coordination"
    },
    "flow-nexus": {
      "command": "npx",
      "args": ["flow-nexus@latest", "mcp", "start"],
      "description": "Flow Nexus cloud features"
    },
    "archon": {
      "command": "node",
      "args": ["nyra-orchestration/archon/index.js"],
      "description": "Archon MCP orchestration"
    },
    "metamcp": {
      "command": "node",
      "args": ["nyra-mcp/servers/MetaMCP/index.js"],
      "description": "MetaMCP gateway"
    },
    "infisical": {
      "url": "http://localhost:8080/api/mcp",
      "description": "Infisical secrets management"
    }
  }
}
MCPCONFIG

echo "✓ Created .mcp-servers.json"
echo ""
echo "To add to Claude Code, run:"
echo "  claude mcp add claude-flow npx claude-flow@alpha mcp start"
echo "  claude mcp add archon node nyra-orchestration/archon/index.js"
echo "  claude mcp add metamcp node nyra-mcp/servers/MetaMCP/index.js"
echo ""
