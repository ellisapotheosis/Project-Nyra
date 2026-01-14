#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."

cd "$PROJECT_ROOT"

# Default to tail last 100 lines
LINES="${1:-100}"
SERVICE="${2:-}"

if [ -z "$SERVICE" ]; then
    echo "📋 Showing logs for all services (last $LINES lines)..."
    echo "========================================"
    docker-compose -f infra/docker/docker-compose.yml logs --tail="$LINES" --follow
else
    echo "📋 Showing logs for $SERVICE (last $LINES lines)..."
    echo "========================================"
    docker-compose -f infra/docker/docker-compose.yml logs --tail="$LINES" --follow "$SERVICE"
fi
