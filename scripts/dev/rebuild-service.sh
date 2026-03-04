#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."

if [ $# -eq 0 ]; then
    echo "❌ Error: No service specified"
    echo ""
    echo "Usage: $0 <service_name>"
    echo ""
    echo "Available services:"
    echo "  - quote_engine"
    echo "  - campaign_engine"
    echo "  - nyra_orchestrator"
    echo "  - mem0"
    echo ""
    exit 1
fi

SERVICE=$1

cd "$PROJECT_ROOT"

echo "🔨 Rebuilding $SERVICE..."
echo "========================================"

# Stop the service
echo "⏸️  Stopping $SERVICE..."
docker-compose -f infra/docker/docker-compose.yml stop "$SERVICE"

# Remove the container
echo "🗑️  Removing old container..."
docker-compose -f infra/docker/docker-compose.yml rm -f "$SERVICE"

# Rebuild the image
echo "🏗️  Building new image..."
docker-compose -f infra/docker/docker-compose.yml build --no-cache "$SERVICE"

# Start the service
echo "▶️  Starting $SERVICE..."
docker-compose -f infra/docker/docker-compose.yml up -d "$SERVICE"

# Wait for health check
echo "⏳ Waiting for service to be healthy..."
sleep 10

# Show status
echo ""
echo "✅ Rebuild complete!"
echo ""
docker-compose -f infra/docker/docker-compose.yml ps "$SERVICE"
echo ""
echo "📋 View logs with: ./scripts/dev/logs-all.sh 50 $SERVICE"
