#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."

echo "🧹 Project Nyra - Docker Cleanup Utility"
echo "========================================"
echo ""

# Parse arguments
DEEP_CLEAN=false
if [ "${1:-}" = "--deep" ]; then
    DEEP_CLEAN=true
fi

cd "$PROJECT_ROOT"

# Stop all services
echo "⏸️  Stopping all services..."
docker-compose -f infra/docker/docker-compose.yml down

# Remove containers
echo "🗑️  Removing containers..."
docker-compose -f infra/docker/docker-compose.yml rm -f

# Remove dangling images
echo "🖼️  Removing dangling images..."
docker image prune -f

# Remove dangling volumes (unused)
echo "💾 Removing dangling volumes..."
docker volume prune -f

if [ "$DEEP_CLEAN" = true ]; then
    echo ""
    echo "⚠️  DEEP CLEAN MODE ACTIVATED"
    echo "========================================"

    # Remove all project images
    echo "🖼️  Removing all Nyra images..."
    docker images | grep nyra | awk '{print $3}' | xargs -r docker rmi -f || true

    # Remove all project volumes (WARNING: DATA LOSS)
    echo "💾 Removing all Nyra volumes..."
    docker volume ls | grep nyra | awk '{print $2}' | xargs -r docker volume rm -f || true

    # Remove build cache
    echo "🗂️  Removing build cache..."
    docker builder prune -f

    echo ""
    echo "⚠️  WARNING: All data has been removed!"
    echo "   You will need to reinitialize databases on next startup."
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💾 Disk space saved:"
docker system df

echo ""
echo "▶️  To start services again: ./scripts/dev/start-dev.sh"
