#!/usr/bin/env bash
# NYRA System Shutdown Script
# Gracefully stops all NYRA services

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_ROOT="$(cd "$INFRA_DIR/.." && pwd)"

echo "🔻 Shutting down NYRA services..."

# Navigate to project root
cd "$PROJECT_ROOT"

# Stop Docker services
if [ -f "docker/.env" ] && [ -f "docker/docker-compose.nyra.yml" ]; then
    echo "→ Stopping Docker Compose services..."
    docker compose --env-file docker/.env -f docker/docker-compose.nyra.yml down
    echo "✓ Docker services stopped"
else
    echo "⚠  Docker configuration not found, skipping..."
fi

# Stop any Python orchestrators
if pgrep -f "nyra_a2a_server.py" > /dev/null; then
    echo "→ Stopping Python A2A server..."
    pkill -f "nyra_a2a_server.py" || true
    echo "✓ A2A server stopped"
fi

if pgrep -f "orchestrators/ag2/host.py" > /dev/null; then
    echo "→ Stopping AG2 orchestrator..."
    pkill -f "orchestrators/ag2/host.py" || true
    echo "✓ AG2 orchestrator stopped"
fi

echo "✅ NYRA shutdown complete"
