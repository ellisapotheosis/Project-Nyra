#!/usr/bin/env bash
# Usage: sleep-worker.sh <worker-name> [--force]
# Gracefully shuts down a worker PC via SSH. Use --force for immediate shutdown.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/wol.conf"

WORKER="${1:-}"
FORCE="${2:-}"
DELAY="$SSH_SHUTDOWN_DELAY"
[[ "$FORCE" == "--force" ]] && DELAY=0

if [[ -z "$WORKER" ]]; then
    echo "Usage: $0 <worker-rtx5090|worker-rtx3090ti|worker-rtx3060|all> [--force]"
    exit 64
fi

shutdown_worker() {
    local alias="$1" name="$2"
    echo "  Shutting down $name (${DELAY}s delay)..."
    if ssh -o ConnectTimeout=10 "$alias" "shutdown /s /t $DELAY" 2>/dev/null; then
        echo "  $name shutdown initiated"
    else
        echo "  WARNING: Could not reach $name via SSH"
        return 1
    fi
}

echo "=== Nyra Worker Shutdown ==="
case "$WORKER" in
    worker-rtx5090|5090)
        shutdown_worker "$WORKER_RTX5090_SSH" "worker-rtx5090" ;;
    worker-rtx3090ti|3090)
        shutdown_worker "$WORKER_RTX3090TI_SSH" "worker-rtx3090ti" ;;
    worker-rtx3060|3060)
        shutdown_worker "$WORKER_RTX3060_SSH" "worker-rtx3060" ;;
    all)
        shutdown_worker "$WORKER_RTX5090_SSH"   "worker-rtx5090"   &
        shutdown_worker "$WORKER_RTX3090TI_SSH" "worker-rtx3090ti" &
        shutdown_worker "$WORKER_RTX3060_SSH"   "worker-rtx3060"   &
        wait ;;
    *)
        echo "Unknown worker: $WORKER"; exit 64 ;;
esac
echo "=== Done ==="
