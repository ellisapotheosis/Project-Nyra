#!/bin/bash
# Start MCP Servers - Development Environment
# Project Nyra

set -e

echo "🚀 Starting Project Nyra MCP Servers (Development)..."

# Check if .env file exists
if [ ! -f "../../.env" ]; then
    echo "❌ Error: .env file not found in project root"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' ../../.env | xargs)

# Check required environment variables
REQUIRED_VARS=(
    "GOOGLE_GEMINI_API_KEY"
    "ANTHROPIC_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  Warning: $var is not set in .env"
    fi
done

# Create log directories
mkdir -p ./logs/{mcp-gemini,mcp-claude-flow,mcp-ruv-swarm,mcp-archon}

echo "📦 Building Docker images..."
docker-compose -f docker-compose.mcp-dev.yml build

echo "🔄 Starting MCP containers..."
docker-compose -f docker-compose.mcp-dev.yml up -d

echo "⏳ Waiting for containers to be healthy..."
sleep 10

echo "🔍 Checking container status..."
docker-compose -f docker-compose.mcp-dev.yml ps

echo ""
echo "✅ MCP Servers started successfully!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.mcp-dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📝 View logs with:"
echo "  docker-compose -f docker-compose.mcp-dev.yml logs -f [service-name]"
echo ""
echo "🛑 Stop servers with:"
echo "  docker-compose -f docker-compose.mcp-dev.yml down"
