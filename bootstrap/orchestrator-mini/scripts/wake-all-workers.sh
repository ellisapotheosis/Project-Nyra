#!/bin/bash
#
# Wake All GPU Workers
# Convenience wrapper for waking all WoL-enabled workers
#
# Usage: ./wake-all-workers.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
WAKE_SCRIPT="${PROJECT_ROOT}/scripts/orchestrator/wake-gpu-worker.sh"

# Check if main wake script exists
if [ ! -f "$WAKE_SCRIPT" ]; then
    echo "❌ Error: Main wake script not found at: $WAKE_SCRIPT"
    exit 1
fi

# Execute wake all
exec "$WAKE_SCRIPT" --all
