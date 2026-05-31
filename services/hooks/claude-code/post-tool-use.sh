#!/usr/bin/env bash
# post-tool-use.sh — Claude Code PostToolUse hook
# Tracks docker context state.
# Runs async (fire-and-forget) to never block Claude Code.
#
# Environment variables injected by Claude Code:
#   CLAUDE_TOOL_NAME        — e.g. "Bash", "Write", "Edit"
#   CLAUDE_TOOL_INPUT_JSON  — raw JSON of the tool input
#   CLAUDE_TOOL_OUTPUT_JSON — raw JSON of the tool output
#   CLAUDE_SESSION_ID       — current session identifier

set -euo pipefail

TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT_JSON:-}"

STATE_FILE="${HOME}/.nyra/current-docker-context"

mkdir -p "${HOME}/.nyra"

# Helper: extract a string field from JSON without jq dependency
json_field() {
    local key="$1"
    local json="$2"
    echo "${json}" | grep -o "\"${key}\":\"[^\"]*\"" | head -1 | sed 's/.*":"\(.*\)"/\1/'
}

# ---- Bash: track docker context switches ----
if [ "${TOOL_NAME}" = "Bash" ]; then
    cmd="$(json_field "command" "${TOOL_INPUT}")"
    if echo "${cmd}" | grep -q "docker context use"; then
        new_ctx="$(echo "${cmd}" | grep -o 'docker context use [^ ]*' | awk '{print $NF}')"
        if [ -n "${new_ctx}" ]; then
            echo "${new_ctx}" > "${STATE_FILE}"
        fi
    fi
fi

exit 0
