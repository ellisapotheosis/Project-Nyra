#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SESSION_NAME="${NYRA_AI_GRID_SESSION:-nyra-ai-grid}"

CLAUDE_CMD="${NYRA_AI_GRID_CLAUDE_CMD:-claude}"
CODEX_CMD="${NYRA_AI_GRID_CODEX_CMD:-codex}"
GEMINI_CMD="${NYRA_AI_GRID_GEMINI_CMD:-gemini}"
JEFE_CMD="${NYRA_AI_GRID_JEFE_CMD:-./scripts/run-llxprt-jefe.sh}"
LLXPRT_CMD="${NYRA_AI_GRID_LLXPRT_CMD:-./scripts/run-llxprt-code.sh}"

HOST_5090="${NYRA_HOST_5090:-5090}"
HOST_3090="${NYRA_HOST_3090:-3090}"
HOST_3060="${NYRA_HOST_3060:-3060}"
REMOTE_PROJECT_ROOT="${NYRA_REMOTE_PROJECT_ROOT:-/home/ellisapotheosis/repos/project-nyra}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

shell_fallback_cmd() {
  local label="$1"
  local cmd="$2"
  local check_bin="${3:-}"

  if [[ -n "${check_bin}" ]] && ! command -v "${check_bin}" >/dev/null 2>&1; then
    printf "printf 'Missing required command: %s\\n'; exec ${SHELL:-/bin/bash} -l" "${check_bin}"
    return 0
  fi

  printf "cd %q && %s" "${PROJECT_ROOT}" "${cmd}"
}

remote_monitor_cmd() {
  local host="$1"
  local label="$2"
  local primary_container="$3"
  local fallback_container="${4:-}"

  printf "%s" \
    "ssh -A -t -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new ${host} " \
    "\"bash -lc 'cd ${REMOTE_PROJECT_ROOT}; " \
    "container=${primary_container}; " \
    "if ! docker inspect \\\"\\\$container\\\" >/dev/null 2>&1; then container=${fallback_container:-${primary_container}}; fi; " \
    "echo --- ${label} on ${host} ---; " \
    "if docker inspect \\\"\\\$container\\\" >/dev/null 2>&1; then docker logs --tail 40 -f \\\"\\\$container\\\"; " \
    "else echo Container not found: \\\"\\\$container\\\"; fi'\""
}

require_cmd tmux
require_cmd ssh

if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
  tmux attach-session -t "${SESSION_NAME}"
  exit 0
fi

PANE_0_CMD="$(shell_fallback_cmd "llxprt-jefe" "${JEFE_CMD}" "cargo")"
PANE_1_CMD="$(shell_fallback_cmd "llxprt-code" "${LLXPRT_CMD}" "npm")"
PANE_2_CMD="$(shell_fallback_cmd "claude" "${CLAUDE_CMD}" "claude")"
PANE_3_CMD="$(shell_fallback_cmd "codex" "${CODEX_CMD}" "codex")"
PANE_4_CMD="$(shell_fallback_cmd "gemini" "${GEMINI_CMD}" "gemini")"
PANE_5_CMD="$(remote_monitor_cmd "${HOST_5090}" "RTX 5090 vLLM" "worker-5090-vllm" "nyra-vllm-worker-rtx5090")"
PANE_6_CMD="$(remote_monitor_cmd "${HOST_3090}" "RTX 3090 Ti vLLM" "worker-3090-vllm" "nyra-worker-rtx3090ti-vllm")"

tmux new-session -d -s "${SESSION_NAME}" -c "${PROJECT_ROOT}"
tmux set-option -t "${SESSION_NAME}" remain-on-exit on
tmux set-option -t "${SESSION_NAME}" pane-border-status top
tmux set-option -t "${SESSION_NAME}" mouse on
tmux set-option -t "${SESSION_NAME}" allow-rename off

tmux send-keys -t "${SESSION_NAME}:0.0" "${PANE_0_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.0" -T "LLxprt Jefe"
sleep 0.15

tmux split-window -h -t "${SESSION_NAME}:0.0" -p 75
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.1" "${PANE_1_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.1" -T "LLxprt Code"
sleep 0.15

tmux split-window -h -t "${SESSION_NAME}:0.1" -p 66
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.2" "${PANE_2_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.2" -T "Claude Subscription"
sleep 0.15

tmux split-window -h -t "${SESSION_NAME}:0.2" -p 50
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.3" "${PANE_3_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.3" -T "Codex Subscription"
sleep 0.15

tmux split-window -v -t "${SESSION_NAME}:0.0" -p 50
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.4" "${PANE_4_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.4" -T "Gemini Subscription"
sleep 0.15

tmux split-window -v -t "${SESSION_NAME}:0.1" -p 50
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.5" "${PANE_5_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.5" -T "5090 Worker"
sleep 0.15

tmux split-window -v -t "${SESSION_NAME}:0.2" -p 50
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.6" "${PANE_6_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.6" -T "3090 Ti Worker"
sleep 0.15

tmux split-window -v -t "${SESSION_NAME}:0.3" -p 50
sleep 0.15
tmux send-keys -t "${SESSION_NAME}:0.7" "${PANE_7_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.7" -T "3060 Worker"

sleep 0.5
tmux select-layout -t "${SESSION_NAME}:0" tiled
tmux select-pane -t "${SESSION_NAME}:0.0"
tmux display-message -t "${SESSION_NAME}" "Nyra AI grid ready: jefe, llxprt, Claude, Codex, Gemini, and 3 worker panes"
tmux attach-session -t "${SESSION_NAME}"
