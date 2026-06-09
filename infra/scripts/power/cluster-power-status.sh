#!/usr/bin/env bash
# Reports online/offline status of all cluster GPU workers via ping + SSH probe
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/wol.conf"

check_worker() {
    local name="$1" alias="$2"
    local host
    host=$(ssh -G "$alias" 2>/dev/null | awk '/^hostname / {print $2}')
    if ping -c 1 -W 2 "$host" &>/dev/null; then
        if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$alias" "echo ok" &>/dev/null; then
            echo "  ONLINE   $name ($host)"
        else
            echo "  BOOTING  $name ($host) — ping OK, SSH not yet ready"
        fi
    else
        echo "  OFFLINE  $name ($host)"
    fi
}

echo "=== Nyra Cluster Power Status ==="
check_worker "worker-rtx5090"   "$WORKER_RTX5090_SSH"   &
check_worker "worker-rtx3090ti" "$WORKER_RTX3090TI_SSH" &
check_worker "worker-rtx3060"   "$WORKER_RTX3060_SSH"   &
wait
echo "================================="
