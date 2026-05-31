#!/usr/bin/env bash
# pre-tool-use.sh — Claude Code PreToolUse hook
# Fast path: < 1s target, 3s hard timeout, non-blocking failures.
#
# Environment variables injected by Claude Code:
#   CLAUDE_TOOL_NAME        — e.g. "Bash", "Write", "Edit"
#   CLAUDE_TOOL_INPUT_JSON  — raw JSON of the tool input
#
# Exit 0 always so Claude Code is never blocked.

set -euo pipefail

TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT_JSON:-}"

WOL_URL="http://orchestrator.trex-fiordland.ts.net:8095/hook/worker-needed"
TIMEOUT=3

# Helper: fire-and-forget WoL request with hard timeout
wol_ping() {
    local worker="$1"
    local reason="$2"
    curl -sf \
        --max-time "${TIMEOUT}" \
        -H "Content-Type: application/json" \
        -d "{\"worker\":\"${worker}\",\"reason\":\"${reason}\"}" \
        "${WOL_URL}" \
        >/dev/null 2>&1 &
}

# Check if tool input references worker-rtx3090ti or openclaw
needs_3090ti() {
    echo "${TOOL_INPUT}" | grep -qiE "worker.?rtx3090ti|openclaw|worker.?3090" 2>/dev/null
}

# Check if tool input references a docker context switch to worker-rtx5090
is_5090_context_switch() {
    [ "${TOOL_NAME}" = "Bash" ] && \
        echo "${TOOL_INPUT}" | grep -q "docker context use worker-rtx5090" 2>/dev/null
}

# Check reachability of worker-rtx5090 vLLM port (fast probe, no DNS wait)
check_5090_online() {
    # Try the Tailscale IP directly; DNS lookup adds latency
    curl -sf --max-time 2 --connect-timeout 1 \
        "http://100.64.0.11:8000/health" \
        >/dev/null 2>&1
}

# --- Main dispatch ---

if needs_3090ti; then
    wol_ping "worker-rtx3090ti" "inference"
fi

if is_5090_context_switch; then
    if ! check_5090_online; then
        # Worker appears offline — emit a warning to stderr (non-blocking)
        echo "[pre-tool-use] WARNING: worker-rtx5090 did not respond on :8000. Docker context switch may fail." >&2
        # Still trigger WoL so it wakes up
        wol_ping "worker-rtx5090" "docker-context-switch"
    fi
fi

exit 0
