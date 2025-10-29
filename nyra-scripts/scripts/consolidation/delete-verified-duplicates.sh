#!/bin/bash
echo "=== DELETING VERIFIED DUPLICATE FILES ==="

# Keep root CLAUDE.md, delete duplicates with same checksum
echo "Deleting duplicate CLAUDE.md files (keeping ./CLAUDE.md)..."
rm -f "./nyra-agents-starter-v2/CLAUDE.md"
rm -f "./nyra-orchestration/Claude/claude-flow/CLAUDE.md"
rm -f "./Project-Nyra/nyra-orchestration/anthropic-agents-sdk/CLAUDE.md"
rm -f "./Project-Nyra/nyra-orchestration/claude-flow/CLAUDE.md"
echo "✓ Deleted 4 duplicate CLAUDE.md files (737deb79...)"

rm -f "./nyra-orchestration/claude-flow/CLAUDE.md"
rm -f "./nyra-scripts/repo-misc-files/CLAUDE.md"
rm -f "./mcp-ecosystem/ClaudeFlowMCP/CLAUDE.md"
echo "✓ Deleted 3 duplicate CLAUDE.md files (95843d03...)"

rm -f "./nyra-orchestration/Claude-Code-Development-Kit/Claude-Code-Development-Kit/docs/CLAUDE.md"
echo "✓ Deleted 1 duplicate CLAUDE.md file (99612630...)"

# Delete nested Claude-Code-Development-Kit duplicates
echo "Deleting duplicate Claude-Code-Development-Kit directories..."
rm -rf "./nyra-orchestration/Claude/Claude-Code-Development-Kit/Claude-Code-Development-Kit"
rm -rf "./nyra-orchestration/Claude-Code-Development-Kit/Claude-Code-Development-Kit"
echo "✓ Deleted 2 nested Claude-Code-Development-Kit directories"

echo "=== DELETION COMPLETE ==="
echo "Summary: Deleted 8 duplicate CLAUDE.md files + 2 duplicate kit directories"
