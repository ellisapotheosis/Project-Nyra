#!/usr/bin/env bash
# Usage: wake-worker.sh <worker-name>
# worker-name: worker-rtx5090 | worker-rtx3090ti | worker-rtx3060 | all
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/wol.conf"

wake_one() {
    local name="$1" mac="$2"
    echo "  Sending magic packet -> $name ($mac)"
    wakeonlan -i "$WOL_BROADCAST" -p "$WOL_PORT" "$mac"
}

wait_for_ssh() {
    local alias="$1" name="$2"
    echo "  Waiting for $name to come online (max 120s)..."
    for i in $(seq 1 24); do
        if ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no "$alias" "echo ok" &>/dev/null; then
            echo "  $name is up (${i}x5s elapsed)"
            return 0
        fi
        sleep 5
    done
    echo "  WARNING: $name did not respond within 120s — check BIOS WoL setting"
    return 1
}

WORKER="${1:-}"
if [[ -z "$WORKER" ]]; then
    echo "Usage: $0 <worker-rtx5090|worker-rtx3090ti|worker-rtx3060|all>"
    exit 64
fi

echo "=== Nyra Wake-on-LAN ==="
case "$WORKER" in
    worker-rtx5090|5090)
        wake_one "worker-rtx5090" "$WORKER_RTX5090_MAC"
        wait_for_ssh "$WORKER_RTX5090_SSH" "worker-rtx5090" ;;
    worker-rtx3090ti|3090)
        wake_one "worker-rtx3090ti" "$WORKER_RTX3090TI_MAC"
        wait_for_ssh "$WORKER_RTX3090TI_SSH" "worker-rtx3090ti" ;;
    worker-rtx3060|3060)
        wake_one "worker-rtx3060" "$WORKER_RTX3060_MAC"
        wait_for_ssh "$WORKER_RTX3060_SSH" "worker-rtx3060" ;;
    all)
        wake_one "worker-rtx5090"   "$WORKER_RTX5090_MAC"
        wake_one "worker-rtx3090ti" "$WORKER_RTX3090TI_MAC"
        wake_one "worker-rtx3060"   "$WORKER_RTX3060_MAC"
        wait_for_ssh "$WORKER_RTX5090_SSH"   "worker-rtx5090"   &
        wait_for_ssh "$WORKER_RTX3090TI_SSH" "worker-rtx3090ti" &
        wait_for_ssh "$WORKER_RTX3060_SSH"   "worker-rtx3060"   &
        wait ;;
    *)
        echo "Unknown worker: $WORKER"
        exit 64 ;;
esac
echo "=== Done ==="
