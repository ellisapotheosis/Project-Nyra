#!/usr/bin/env bash
# NYRA System Maintenance Script
# Performs routine maintenance tasks

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_ROOT="$(cd "$INFRA_DIR/.." && pwd)"

echo "🔧 Starting NYRA maintenance routine..."

cd "$PROJECT_ROOT"

# Docker cleanup
echo "→ Cleaning Docker resources..."
docker system prune -f --volumes 2>/dev/null || true
echo "✓ Docker cleanup complete"

# Check disk space
echo "→ Checking disk space..."
df -h "$PROJECT_ROOT" | tail -1
echo "✓ Disk space checked"

# Update dependencies if package files exist
if [ -f "package.json" ]; then
    echo "→ Checking npm dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install --frozen-lockfile 2>/dev/null || pnpm install
        echo "✓ pnpm dependencies updated"
    elif command -v npm &> /dev/null; then
        npm install
        echo "✓ npm dependencies updated"
    fi
fi

# Clean up logs older than 7 days
if [ -d "logs" ]; then
    echo "→ Cleaning old logs..."
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    echo "✓ Old logs cleaned"
fi

# Verify critical directories
echo "→ Verifying directory structure..."
for dir in infra/shared infra/orchestrator-mini infra/worker-rtx3060 infra/worker-rtx3090ti infra/worker-rtx5090; do
    mkdir -p "$dir/scripts" 2>/dev/null || true
done
echo "✓ Directory structure verified"

echo "✅ NYRA maintenance complete"
