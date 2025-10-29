#!/bin/bash
echo "======================================"
echo "  NYRA CONSOLIDATION SUMMARY"
echo "======================================"
echo ""

echo "✓ COMPLETED ACTIONS:"
echo "  [1] Secured .env files and created .env.example"
echo "  [2] Deleted 8 duplicate CLAUDE.md files"
echo "  [3] Deleted 2 duplicate Claude-Code-Development-Kit dirs"
echo "  [4] Created canonical directory structure:"
echo "      - nyra-core/"
echo "      - nyra-infra/"
echo "      - nyra-orchestration/"
echo "      - nyra-mcp/"
echo "      - nyra-webapp/"
echo "      - nyra-memory/"
echo "      - nyra-tools/"
echo "      - nyra-docs/"
echo "  [5] Installed MetaMCP dependencies"
echo "  [6] Consolidated scattered content into canonical dirs"
echo "  [7] Created infrastructure configurations:"
echo "      - MetaMCP + Infisical (nyra-mcp/servers/MetaMCP/)"
echo "      - Archon MCP (nyra-orchestration/archon/)"
echo "      - Open-WebUI (nyra-infra/open-webui-compose.yml)"
echo ""

echo "📊 REPOSITORY STATUS:"
find . -maxdepth 1 -type d -name "nyra-*" | while read dir; do
    if [ -d "$dir" ]; then
        files=$(find "$dir" -type f 2>/dev/null | wc -l)
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "  $dir: $files files, $size"
    fi
done
echo ""

echo "🚀 INFRASTRUCTURE READY:"
echo "  [MetaMCP]    nyra-mcp/servers/MetaMCP/docker-compose.yml"
echo "  [Infisical]  Configured with MetaMCP"
echo "  [Archon]     nyra-orchestration/archon/package.json"
echo "  [Open-WebUI] nyra-infra/open-webui-compose.yml"
echo ""

echo "▶ NEXT STEPS:"
echo "  1. Start MetaMCP + Infisical:"
echo "     cd nyra-mcp/servers/MetaMCP && docker-compose up -d"
echo ""
echo "  2. Start Open-WebUI:"
echo "     cd nyra-infra && docker-compose -f open-webui-compose.yml up -d"
echo ""
echo "  3. Install Archon MCP:"
echo "     cd nyra-orchestration/archon && npm install"
echo ""
echo "  4. Configure MCP servers in Claude Code"
echo ""
echo "  5. Remove old scattered directories after verification"
echo ""

echo "======================================"
