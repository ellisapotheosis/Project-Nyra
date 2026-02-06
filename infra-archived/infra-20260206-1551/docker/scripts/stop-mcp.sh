#!/bin/bash
# Stop MCP Servers
# Project Nyra

set -e

# Check which environment to stop
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
    COMPOSE_FILE="docker-compose.mcp.yml"
    ENV_NAME="Production"
else
    COMPOSE_FILE="docker-compose.mcp-dev.yml"
    ENV_NAME="Development"
fi

echo "🛑 Stopping Project Nyra MCP Servers ($ENV_NAME)..."

# Stop containers
docker-compose -f $COMPOSE_FILE down

echo ""
echo "✅ MCP Servers stopped successfully!"
echo ""
echo "💾 Data volumes are preserved. To remove volumes, run:"
echo "  docker-compose -f $COMPOSE_FILE down -v"
