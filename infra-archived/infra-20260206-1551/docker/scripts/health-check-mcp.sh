#!/bin/bash
# Health Check for MCP Servers
# Project Nyra

set -e

# Check which environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
    COMPOSE_FILE="docker-compose.mcp.yml"
    ENV_NAME="Production"
else
    COMPOSE_FILE="docker-compose.mcp-dev.yml"
    ENV_NAME="Development"
fi

echo "🔍 Checking MCP Server Health ($ENV_NAME)..."
echo ""

# Get container status
CONTAINERS=$(docker-compose -f $COMPOSE_FILE ps --format json)

if [ -z "$CONTAINERS" ]; then
    echo "❌ No containers are running"
    exit 1
fi

# Parse and display status
echo "📊 Container Health Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "$CONTAINERS" | jq -r '. | "\(.Name)\t\(.Status)\t\(.Health // "N/A")"' | while IFS=$'\t' read -r name status health; do
    # Color coding
    if [[ $health == "healthy" || $status == *"Up"* ]]; then
        echo "✅ $name: $status ($health)"
    elif [[ $health == "unhealthy" ]]; then
        echo "❌ $name: $status ($health)"
    elif [[ $status == *"Exit"* ]]; then
        echo "🔴 $name: $status"
    else
        echo "⚠️  $name: $status ($health)"
    fi
done

echo ""

# Check specific services
echo "🔬 Detailed Service Checks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Postgres
PG_STATUS=$(docker-compose -f $COMPOSE_FILE exec -T postgres-mcp pg_isready 2>/dev/null || echo "Not reachable")
if [[ $PG_STATUS == *"accepting connections"* ]]; then
    echo "✅ PostgreSQL: $PG_STATUS"
else
    echo "❌ PostgreSQL: $PG_STATUS"
fi

# Redis
REDIS_STATUS=$(docker-compose -f $COMPOSE_FILE exec -T redis-mcp redis-cli ping 2>/dev/null || echo "Not reachable")
if [[ $REDIS_STATUS == "PONG" ]]; then
    echo "✅ Redis: Connected"
else
    echo "❌ Redis: $REDIS_STATUS"
fi

echo ""

# Resource usage
echo "💻 Resource Usage:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose -f $COMPOSE_FILE ps -q)

echo ""
echo "✅ Health check complete"
