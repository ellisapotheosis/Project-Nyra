#!/usr/bin/env bash
# session-start.sh — Claude Code SessionStart hook
# Checks cluster reachability and emits a brief status to stderr.
# Non-blocking: all probes run in parallel with a 3s hard cap.
#
# Wire up in .claude/settings.json under SessionStart hooks.

set -euo pipefail

TS_SUFFIX=".trex-fiordland.ts.net"
TIMEOUT=3

# Worker definitions: "label ip port"
declare -a WORKERS=(
    "oracle-vps       100.64.0.3  8283"
    "orchestrator     100.64.0.10 8095"
    "worker-rtx3060   100.64.0.12 11434"
    "worker-rtx3090ti 100.64.0.13 8000"
    "worker-rtx5090   100.64.0.11 8000"
)

# Probe a single worker and print result
probe_worker() {
    local label="$1"
    local ip="$2"
    local port="$3"
    if curl -sf --max-time "${TIMEOUT}" --connect-timeout 2 \
            "http://${ip}:${port}" >/dev/null 2>&1 \
        || curl -sf --max-time "${TIMEOUT}" --connect-timeout 2 \
            "http://${ip}:${port}/health" >/dev/null 2>&1; then
        printf "  %-20s \033[32mONLINE\033[0m\n" "${label}" >&2
    else
        printf "  %-20s \033[31mOFFLINE\033[0m\n" "${label}" >&2
    fi
}

# Check WoL manager on orchestrator specifically (our hook dependency)
check_wol_manager() {
    local url="http://orchestrator${TS_SUFFIX}:8095/health"
    if curl -sf --max-time "${TIMEOUT}" --connect-timeout 2 "${url}" >/dev/null 2>&1; then
        printf "  %-20s \033[32mREACHABLE\033[0m\n" "wol-manager" >&2
    else
        printf "  %-20s \033[33mUNREACHABLE\033[0m (pre-tool-use WoL will be no-op)\n" "wol-manager" >&2
    fi
}

# Print header
printf "\n\033[1;36m=== Nyra Cluster Status ===\033[0m\n" >&2

# Run all probes in parallel, collect PIDs
PIDS=()
for entry in "${WORKERS[@]}"; do
    read -r label ip port <<< "${entry}"
    probe_worker "${label}" "${ip}" "${port}" &
    PIDS+=($!)
done
check_wol_manager &
PIDS+=($!)

# Wait for all probes (they each have their own timeout)
for pid in "${PIDS[@]}"; do
    wait "${pid}" 2>/dev/null || true
done

printf "\033[1;36m===========================\033[0m\n\n" >&2

# Also restore last known docker context if saved
STATE_FILE="${HOME}/.nyra/current-docker-context"
if [ -f "${STATE_FILE}" ]; then
    saved_ctx="$(cat "${STATE_FILE}")"
    printf "[session-start] Last docker context: \033[33m%s\033[0m\n" "${saved_ctx}" >&2
fi

exit 0
