#!/bin/bash
#
# Wake RTX 3060 GPU Worker
# Convenience wrapper for waking the RTX 3060 mobile worker
#
# Usage: ./wake-rtx3060.sh
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

# Execute wake for RTX 3060
exec "$WAKE_SCRIPT" worker-rtx3060
