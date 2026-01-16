#!/bin/bash
#
# Wake RTX 3090 Ti GPU Worker
# Convenience wrapper for waking the RTX 3090 Ti always-on worker
# Note: This worker is configured as always-on, so WoL is disabled
#
# Usage: ./wake-rtx3090ti.sh
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

# Execute wake for RTX 3090 Ti (will show that it's always-on)
exec "$WAKE_SCRIPT" worker-rtx3090ti
