#!/usr/bin/env bash
set -euo pipefail

# Project Nyra - Cluster Orchestration (tmux)
# Manages 3 GPU Workers + 4 High-Level Agent Panels

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SESSION_NAME="${NYRA_TMUX_SESSION:-NYRA-CLUSTER}"

# IP Mapping (Tailscale)
ORCH_IP="100.64.0.10"
RTX5090_IP="100.64.0.11"
RTX3060_IP="100.64.0.12"
RTX3090TI_IP="100.64.0.13"

# shellcheck source=scripts/llxprt-common.sh
source "${SCRIPT_DIR}/llxprt-common.sh"

# Preflight checks
nyra_require_command tmux
nyra_require_command ssh

# Function to create a monitor command for a worker
get_monitor_cmd() {
    local ip=$1
    local name=$2
    local container=$3
    # Use ssh to tail logs and show nvidia-smi
    printf "ssh -t edane@%s \"echo '--- %s (%s) ---'; docker logs --tail 10 -f %s & nvidia-smi -l 1\"" "$ip" "$name" "$ip" "$container"
}

# 1. Prepare Pane Commands
PANE_JEFE="./scripts/run-llxprt-jefe.sh"
PANE_CODE="./scripts/run-llxprt-code.sh"
PANE_CLAUDE_CLOUD="claude" # Cloud Subscription usage
PANE_CLAUDE_API="export CLAUDE_CODE_USE_API=true && claude" # Example API usage toggle

PANE_5090_MON=$(get_monitor_cmd "$RTX5090_IP" "RTX 5090" "nyra-worker-rtx5090-vllm")
PANE_3090TI_MON=$(get_monitor_cmd "$RTX3090TI_IP" "RTX 3090 Ti" "nyra-worker-rtx3090ti-vllm")
PANE_3060_MON=$(get_monitor_cmd "$RTX3060_IP" "RTX 3060" "nyra-worker-rtx3060-ollama")
PANE_ORCH_MON="docker stats"

# 2. Start tmux session
if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
    tmux attach-session -t "${SESSION_NAME}"
    exit 0
fi

echo "🚀 Launching Nyra Cluster Mesh (8 Panels)..."

tmux new-session -d -s "${SESSION_NAME}" -c "${PROJECT_ROOT}"
tmux set-option -t "${SESSION_NAME}" remain-on-exit on
tmux set-option -t "${SESSION_NAME}" pane-border-status top

# Row 1: Agents
# Pane 0.0: Jefe
tmux send-keys -t "${SESSION_NAME}:0.0" "${PANE_JEFE}" C-m
tmux select-pane -t "${SESSION_NAME}:0.0" -T "LLxprt Jefe (PM)"

# Pane 0.1: Code
tmux split-window -h -t "${SESSION_NAME}:0.0" -p 75
tmux send-keys -t "${SESSION_NAME}:0.1" "${PANE_CODE}" C-m
tmux select-pane -t "${SESSION_NAME}:0.1" -T "LLxprt Code (Dev)"

# Pane 0.2: Claude Cloud
tmux split-window -h -t "${SESSION_NAME}:0.1" -p 66
tmux send-keys -t "${SESSION_NAME}:0.2" "${PANE_CLAUDE_CLOUD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.2" -T "Claude (Cloud)"

# Pane 0.3: Claude API
tmux split-window -h -t "${SESSION_NAME}:0.2" -p 50
tmux send-keys -t "${SESSION_NAME}:0.3" "${PANE_CLAUDE_API}" C-m
tmux select-pane -t "${SESSION_NAME}:0.3" -T "Claude (API)"

# Row 2: Infrastructure
# Pane 0.4: 5090
tmux split-window -v -t "${SESSION_NAME}:0.0" -p 50
tmux send-keys -t "${SESSION_NAME}:0.4" "${PANE_5090_MON}" C-m
tmux select-pane -t "${SESSION_NAME}:0.4" -T "5090 - Gemma 4"

# Pane 0.5: 3090 Ti
tmux split-window -v -t "${SESSION_NAME}:0.1" -p 50
tmux send-keys -t "${SESSION_NAME}:0.5" "${PANE_3090TI_MON}" C-m
tmux select-pane -t "${SESSION_NAME}:0.5" -T "3090 Ti - Qwen 3.5"

# Pane 0.6: 3060
tmux split-window -v -t "${SESSION_NAME}:0.2" -p 50
tmux send-keys -t "${SESSION_NAME}:0.6" "${PANE_3060_MON}" C-m
tmux select-pane -t "${SESSION_NAME}:0.6" -T "3060 - Ollama"

# Pane 0.7: Orchestrator Stats
tmux split-window -v -t "${SESSION_NAME}:0.3" -p 50
tmux send-keys -t "${SESSION_NAME}:0.7" "${PANE_ORCH_MON}" C-m
tmux select-pane -t "${SESSION_NAME}:0.7" -T "Orchestrator Stats"

# Final adjustments
tmux select-layout -t "${SESSION_NAME}" tiled
tmux select-pane -t "${SESSION_NAME}:0.0"
tmux display-message -t "${SESSION_NAME}" "Nyra Cluster Ready: 4 Agents + 4 Monitors"
tmux attach-session -t "${SESSION_NAME}"
