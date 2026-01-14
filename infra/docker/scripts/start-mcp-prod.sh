#!/bin/bash
# Start MCP Servers - Production Environment
# Project Nyra

set -e

echo "🚀 Starting Project Nyra MCP Servers (Production)..."

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
    "SUPABASE_URL"
    "SUPABASE_SERVICE_KEY"
    "MCP_DB_PASSWORD"
    "MCP_REDIS_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Create log directories
sudo mkdir -p /var/log/nyra/{mcp-gemini,mcp-claude-flow,mcp-ruv-swarm,mcp-archon,postgres-mcp,redis-mcp,nginx-mcp}
sudo chown -R $USER:$USER /var/log/nyra

echo "📦 Building Docker images..."
docker-compose -f docker-compose.mcp.yml build --no-cache

echo "🔄 Starting MCP containers..."
docker-compose -f docker-compose.mcp.yml up -d

echo "⏳ Waiting for containers to be healthy..."
sleep 30

echo "🔍 Checking container health..."
for i in {1..30}; do
    UNHEALTHY=$(docker-compose -f docker-compose.mcp.yml ps --format json | jq -r 'select(.Health == "unhealthy") | .Name')
    if [ -z "$UNHEALTHY" ]; then
        echo "✅ All containers are healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Some containers are still unhealthy: $UNHEALTHY"
        docker-compose -f docker-compose.mcp.yml logs $UNHEALTHY
    fi
    echo "  Waiting for containers... ($i/30)"
    sleep 2
done

echo ""
echo "✅ MCP Servers started successfully in production mode!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.mcp.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📝 View logs with:"
echo "  docker-compose -f docker-compose.mcp.yml logs -f [service-name]"
echo ""
echo "📊 Monitor resources:"
echo "  docker stats"
echo ""
echo "🛑 Stop servers with:"
echo "  docker-compose -f docker-compose.mcp.yml down"
echo ""
echo "⚠️  Production Mode Active - Logs are in /var/log/nyra/"
