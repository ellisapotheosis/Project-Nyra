#!/bin/bash
# Project Nyra - Start Archon + Claude Flow
# Quick startup script for WSL/Linux

set -e

echo "🚀 Starting Project Nyra Services..."
echo ""

# Create networks if they don't exist
echo "📡 Creating Docker networks..."
docker network create nyra-mcp 2>/dev/null || echo "  ✓ nyra-mcp network exists"
docker network create nyra-core 2>/dev/null || echo "  ✓ nyra-core network exists"
docker network create nyra-network 2>/dev/null || echo "  ✓ nyra-network exists"
echo ""

# Start Golden Stack (PostgreSQL, Redis, etc.)
echo "⭐ Starting Golden Stack..."
docker-compose -f infra/docker-compose/docker-compose.golden-stack.yml up -d
echo ""

# Start Archon OS
echo "🧠 Starting Archon OS..."
docker-compose -f infra/docker-compose/docker-compose.archon.yml up -d
echo ""

# Start Claude Flow
echo "🤖 Starting Claude Flow..."
docker-compose -f infra/docker-compose/docker-compose.claude-flow.yml up -d 2>/dev/null || echo "  ⚠️  Claude Flow compose file not found, skipping..."
echo ""

# Show status
echo "✅ Services started!"
echo ""
echo "📝 Access URLs:"
echo "   Archon UI:        http://100.64.0.1:3737"
echo "   Archon API:       http://100.64.0.1:8181"
echo "   Archon MCP:       http://100.64.0.1:8051"
echo ""
echo "🔍 Check status with: docker ps"
echo "📋 View logs with: docker-compose -f infra/docker-compose/docker-compose.archon.yml logs -f"
