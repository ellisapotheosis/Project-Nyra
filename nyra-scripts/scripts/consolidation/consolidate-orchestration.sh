#!/bin/bash
echo "=== CONSOLIDATING ORCHESTRATION DIRECTORIES ==="

TARGET="./nyra-orchestration"

# Consolidate nyra-all-in-one-bootstrapping/nyra-orchestration
if [ -d "./nyra-all-in-one-bootstrapping/nyra-orchestration" ]; then
    echo "Merging nyra-all-in-one-bootstrapping/nyra-orchestration..."
    rsync -av --ignore-existing "./nyra-all-in-one-bootstrapping/nyra-orchestration/" "$TARGET/"
    echo "✓ Merged content"
fi

# Consolidate nested nyra-orchestration/nyra-orchestration
if [ -d "./nyra-orchestration/nyra-orchestration" ]; then
    echo "Merging nested nyra-orchestration/nyra-orchestration..."
    rsync -av --ignore-existing "./nyra-orchestration/nyra-orchestration/" "$TARGET/"
    echo "✓ Merged content"
fi

# Create MCP servers directory structure
mkdir -p "$TARGET/mcp-servers"/{metamcp,infisical,archon}

echo "=== CONSOLIDATION COMPLETE ==="
