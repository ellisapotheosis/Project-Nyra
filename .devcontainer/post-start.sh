#!/bin/bash

# Post-start script for Nyra development container
set -e

echo "🔄 Starting Nyra development environment..."

# Load environment variables from Infisical if configured
if [ -f ~/.infisical.env ]; then
    echo "🔐 Loading secrets from Infisical..."
    export $(cat ~/.infisical.env | xargs)
fi

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U nyra; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done
echo "PostgreSQL is up and running!"

# Wait for FalkorDB
echo "Waiting for FalkorDB..."
until redis-cli -h falkordb -p 6379 ping; do
    echo "FalkorDB is unavailable - sleeping"
    sleep 2
done
echo "FalkorDB is up and running!"

# Wait for ChromaDB
echo "Waiting for ChromaDB..."
until curl -f http://chromadb:8000/api/v1/heartbeat &>/dev/null; do
    echo "ChromaDB is unavailable - sleeping"
    sleep 2
done
echo "ChromaDB is up and running!"

# Initialize Claude Flow if needed
if [ ! -f .claude-flow/initialized ]; then
    echo "🤖 Initializing Claude Flow..."
    npx claude-flow@alpha init --sparc
    touch .claude-flow/initialized
fi

# Start Claude Flow in background
echo "🚀 Starting Claude Flow..."
npx claude-flow@alpha start --ui &

# Display environment information
echo ""
echo "🌟 Nyra Development Environment Ready!"
echo "============================================"
echo "📍 Services:"
echo "  - Nyra Web UI:      http://localhost:3000"
echo "  - Nyra API:         http://localhost:8000"
echo "  - Claude Flow UI:   http://localhost:3001"
echo "  - Nexus Router:     http://localhost:12010/nyra/complete"
echo "  - PostgreSQL:       localhost:5432"
echo "  - FalkorDB:         localhost:6379"
echo "  - ChromaDB:         http://localhost:8001"
echo ""
echo "🔧 Management Commands:"
echo "  - cf status         # Check Claude Flow status"
echo "  - nyra-logs         # View all service logs"
echo "  - nyra-status       # Check service status"
echo "  - dc up -d          # Start all services"
echo "  - dc down           # Stop all services"
echo ""
echo "📚 Documentation:"
echo "  - Architecture:     /workspace/docs/DOCKER_WSL_MIGRATION_ARCHITECTURE.md"
echo "  - Migration Guide:  /workspace/docs/MIGRATION_GUIDE.md"
echo ""