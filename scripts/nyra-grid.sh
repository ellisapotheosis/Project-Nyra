#!/usr/bin/env bash
# nyra-grid.sh — Tmux 4-node grid launcher for Project Nyra
#
# Fixes applied (2026-04-09):
#   REQ-1  All SSH commands now use -A (agent forwarding) and -t (force PTY).
#          Without -t, a dropped Tailscale tunnel leaves the SSH client stuck in
#          a blocking write() with no SIGHUP path → Zl <defunct> zombie.
#   REQ-2  preflight_fix_ssh_perms() corrects remote ~/.ssh permissions before
#          the grid starts. sshd StrictModes silently rejects keys when
#          ~/.ssh (700) or authorized_keys (600) have too-permissive modes.
#   REQ-3  Docker context/env reset runs before any tmux command to prevent
#          a stale DOCKER_HOST from routing CLI calls to a dead remote daemon.
#   REQ-4  sleep guards after every split-window prevent tmux from running
#          select-layout tiled before geometry is stable ("Window too small").
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SESSION_NAME="${NYRA_TMUX_SESSION:-NYRA-GRID}"
CF_APP_DIR="${NYRA_CF_APP_DIR:-${PROJECT_ROOT}/apps/ratehunter}"
CF_PROJECT_NAME="${NYRA_CF_PROJECT_NAME:-project-nyra}"
CF_ENVIRONMENT="${NYRA_CF_ENVIRONMENT:-production}"
REMOTE_PROJECT_ROOT="${NYRA_REMOTE_PROJECT_ROOT:-/home/ellisapotheosis/repos/project-nyra}"
LLXPRT_HOST="${NYRA_LLXPRT_HOST:-5090}"
HOST_ORCH="${NYRA_HOST_ORCH:-orch}"
HOST_5090="${NYRA_HOST_5090:-5090}"
HOST_3090="${NYRA_HOST_3090:-3090}"
HOST_3060="${NYRA_HOST_3060:-3060}"

# shellcheck source=scripts/llxprt-common.sh
source "${SCRIPT_DIR}/llxprt-common.sh"

preflight_fix_ssh_perms() {
  local host="$1"
  printf '[preflight] Fixing SSH permissions on %s ...\n' "${host}" >&2
  if ssh -A -t \
    -o BatchMode=yes \
    -o ConnectTimeout=5 \
    -o StrictHostKeyChecking=accept-new \
    "${host}" \
    'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys 2>/dev/null; echo __nyra_ok__' \
    2>/dev/null | grep -q '__nyra_ok__'; then
    printf '[preflight] %s: ssh permissions OK\n' "${host}" >&2
  else
    printf '[preflight] WARNING: could not reach %s (offline or key not yet trusted — continuing)\n' "${host}" >&2
  fi
}

nyra_require_command tmux
nyra_require_command ssh

# ── REQ-3: Docker Context Sanitization ────────────────────────────────────────
docker context use default 2>/dev/null || true
unset DOCKER_HOST    || true
unset DOCKER_CONTEXT || true

nyra_export_llxprt_env "${CF_APP_DIR}" "${CF_PROJECT_NAME}"
WRANGLER_CMD="$(nyra_resolve_wrangler_cmd "${CF_APP_DIR}")"

# Run pre-flight checks in parallel against all remote grid nodes.
GRID_HOSTS=("${HOST_5090}" "${HOST_3090}" "${HOST_3060}")
if [[ "${LLXPRT_HOST}" != "local" && "${LLXPRT_HOST}" != "localhost" ]]; then
  GRID_HOSTS+=("${LLXPRT_HOST}")
fi
for _h in "${GRID_HOSTS[@]}"; do
  preflight_fix_ssh_perms "${_h}" &
done
wait

# ── Session guard ─────────────────────────────────────────────────────────────
if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
  tmux attach-session -t "${SESSION_NAME}"
  exit 0
fi

# ── Build pane commands ────────────────────────────────────────────────────────

REMOTE_LLXPRT_CMD="$(cat <<EOF
cd "${REMOTE_PROJECT_ROOT}"
export NYRA_CF_PROJECT_NAME="${CF_PROJECT_NAME}"
export NYRA_CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE}"
export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED}"
export NODE_ENV="${NODE_ENV}"
export NODE_VERSION="${NODE_VERSION}"
export SOURCEGIT_CMD="${SOURCEGIT_CMD}"
export LLXPRT_SOURCEGIT="${LLXPRT_SOURCEGIT}"
export NYRA_NEXUS_BASE_URL="${NYRA_NEXUS_BASE_URL}"
export NYRA_LLXPRT_PROVIDER="${NYRA_LLXPRT_PROVIDER:-openai}"
export NYRA_LLXPRT_MODEL="${NYRA_LLXPRT_MODEL:-local-cluster}"
export NYRA_REMOTE_OPENAI_MODEL="${NYRA_REMOTE_OPENAI_MODEL}"
export NYRA_REMOTE_GEMINI_MODEL="${NYRA_REMOTE_GEMINI_MODEL}"
./scripts/run-llxprt-code.sh
EOF
)"

LOCAL_LLXPRT_CMD="$(cat <<EOF
cd "${PROJECT_ROOT}"
export NYRA_CF_PROJECT_NAME="${CF_PROJECT_NAME}"
export NYRA_CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE}"
export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED}"
export NODE_ENV="${NODE_ENV}"
export NODE_VERSION="${NODE_VERSION}"
export SOURCEGIT_CMD="${SOURCEGIT_CMD}"
export LLXPRT_SOURCEGIT="${LLXPRT_SOURCEGIT}"
export NYRA_NEXUS_BASE_URL="${NYRA_NEXUS_BASE_URL}"
export NYRA_LLXPRT_PROVIDER="${NYRA_LLXPRT_PROVIDER:-openai}"
export NYRA_LLXPRT_MODEL="${NYRA_LLXPRT_MODEL:-local-cluster}"
export NYRA_REMOTE_OPENAI_MODEL="${NYRA_REMOTE_OPENAI_MODEL}"
export NYRA_REMOTE_GEMINI_MODEL="${NYRA_REMOTE_GEMINI_MODEL}"
./scripts/run-llxprt-code.sh
EOF
)"

# REQ-1: -A and -t on ALL remote SSH invocations.
if [[ "${LLXPRT_HOST}" == "local" || "${LLXPRT_HOST}" == "localhost" ]]; then
  PANE_0_CMD="${LOCAL_LLXPRT_CMD}"
else
  PANE_0_CMD="ssh -A -t ${LLXPRT_HOST} bash -lc $(printf '%q' "${REMOTE_LLXPRT_CMD}")"
fi

# Dynamic container discovery: try known names before falling back to default.
PANE_1_CMD="ssh -A -t ${HOST_5090} 'bash -lc '\''container=\"\${NYRA_5090_CONTAINER:-}\"; if [[ -z \"\$container\" ]]; then for candidate in nyra-vllm-5090 nyra-worker-5090-vllm vllm; do if docker inspect \"\$candidate\" >/dev/null 2>&1; then container=\"\$candidate\"; break; fi; done; fi; container=\"\${container:-nyra-vllm-5090}\"; echo \"Streaming docker logs from \$container on ${HOST_5090}\"; exec docker logs -f \"\$container\"\'''"

PANE_2_CMD="ssh -A -t ${HOST_3090} 'nvidia-smi -l 1'"

PANE_3_CMD="cd \"${CF_APP_DIR}\" && echo \"Cloudflare project: ${CF_PROJECT_NAME}\" && echo \"Build compatibility date: ${NYRA_CF_COMPATIBILITY_DATE}\" && if ! ${WRANGLER_CMD} whoami >/dev/null 2>&1; then echo \"wrangler is not authenticated. Run: npx wrangler login\"; else CLOUDFLARE_COMPATIBILITY_DATE=\"${NYRA_CF_COMPATIBILITY_DATE}\" CF_PAGES_COMPATIBILITY_DATE=\"${NYRA_CF_COMPATIBILITY_DATE}\" ${WRANGLER_CMD} pages deployment tail --project-name \"${CF_PROJECT_NAME}\" --environment \"${CF_ENVIRONMENT}\" --format pretty; fi"

PANE_4_CMD="ssh -A -t ${HOST_3060} 'nvidia-smi -l 1'"

# ── Tmux session bootstrap ─────────────────────────────────────────────────────
tmux new-session -d -s "${SESSION_NAME}" -c "${PROJECT_ROOT}"
tmux set-option -t "${SESSION_NAME}" remain-on-exit on
tmux set-option -t "${SESSION_NAME}" pane-border-status top

# ── Pane spawning with layout guards ──────────────────────────────────────────
# REQ-4: Each split-window is followed by a sleep before the next tmux command.

# Pane 0 — initial pane, already exists after new-session
tmux send-keys -t "${SESSION_NAME}:0.0" "${PANE_0_CMD}" C-m
tmux select-pane  -t "${SESSION_NAME}:0.0" -T "Leader"
sleep 0.15

# Pane 1 — right half
tmux split-window -h -t "${SESSION_NAME}:0.0" -c "${PROJECT_ROOT}" -p 50
sleep 0.15
tmux send-keys   -t "${SESSION_NAME}:0.1" "${PANE_1_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.1" -T "5090 Monitor"
sleep 0.15

# Pane 2 — bottom-left
tmux split-window -v -t "${SESSION_NAME}:0.0" -c "${PROJECT_ROOT}" -p 40
sleep 0.15
tmux send-keys   -t "${SESSION_NAME}:0.2" "${PANE_2_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.2" -T "3090 Stats"
sleep 0.15

# Pane 3 — bottom-right
tmux split-window -v -t "${SESSION_NAME}:0.1" -c "${PROJECT_ROOT}" -p 40
sleep 0.15
tmux send-keys   -t "${SESSION_NAME}:0.3" "${PANE_3_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.3" -T "Deployment"
sleep 0.15

# Pane 4 — bottom-left third
tmux split-window -v -t "${SESSION_NAME}:0.2" -c "${PROJECT_ROOT}"
sleep 0.15
tmux send-keys   -t "${SESSION_NAME}:0.4" "${PANE_4_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.4" -T "3060 Stats"

# REQ-4: Longer pause before tiled layout. All 5 panes must have registered
# their geometry with the tmux server before the layout pass begins.
sleep 0.5
tmux select-layout -t "${SESSION_NAME}:0" tiled

tmux select-pane -t "${SESSION_NAME}:0.0"
tmux display-message -t "${SESSION_NAME}" \
  "NYRA grid ready — ${LLXPRT_HOST} | ${HOST_5090} | ${HOST_3090} | ${HOST_3060} | orch: ${HOST_ORCH}"
tmux attach-session -t "${SESSION_NAME}"
