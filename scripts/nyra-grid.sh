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
LLXPRT_PACKAGE="${NYRA_LLXPRT_PACKAGE:-@vybestack/llxprt-code}"
LLXPRT_HOST="${NYRA_LLXPRT_HOST:-5090}"
LLXPRT_PROVIDER="${NYRA_LLXPRT_PROVIDER:-openai}"
LLXPRT_MODEL="${NYRA_LLXPRT_MODEL:-local-cluster}"
NEXUS_BASE_URL="${NYRA_NEXUS_BASE_URL:-http://orchestrator.trex-fiordland.ts.net:6000/v1}"
CF_APP_DIR="${NYRA_CF_APP_DIR:-${PROJECT_ROOT}/apps/landing/ratehunter-landing}"
CF_PROJECT_NAME="${NYRA_CF_PROJECT_NAME:-project-nyra}"
CF_ENVIRONMENT="${NYRA_CF_ENVIRONMENT:-production}"
REMOTE_PROJECT_ROOT="${NYRA_REMOTE_PROJECT_ROOT:-/home/ellisapotheosis/repos/project-nyra}"
HOST_ORCH="${NYRA_HOST_ORCH:-orch}"
HOST_3090="${NYRA_HOST_3090:-3090}"
HOST_3060="${NYRA_HOST_3060:-3060}"
HOST_5090="${NYRA_HOST_5090:-5090}"
SOURCEGIT_PATH="${SOURCEGIT_CMD:-/usr/bin/sourcegit}"
CF_NODE_ENV="${NYRA_CF_NODE_ENV:-production}"
CF_NODE_VERSION="${NYRA_CF_NODE_VERSION:-20}"
CF_NEXT_TELEMETRY_DISABLED="${NYRA_CF_NEXT_TELEMETRY_DISABLED:-1}"
CF_NEXT_PUBLIC_SITE_URL="${NYRA_CF_NEXT_PUBLIC_SITE_URL:-https://ratehunter.com}"
CF_NEXT_PUBLIC_SITE_NAME="${NYRA_CF_NEXT_PUBLIC_SITE_NAME:-RateHunter}"

# ── REQ-3: Docker Context Sanitization ────────────────────────────────────────
# Must run BEFORE any tmux session is created. A stale DOCKER_HOST exported in
# any ancestor shell (e.g., from a previous `docker context use remote`) will
# be inherited by every tmux pane and route all Docker CLI calls to a dead host.
docker context use default 2>/dev/null || true
unset DOCKER_HOST    || true
unset DOCKER_CONTEXT || true

# ── Helpers ───────────────────────────────────────────────────────────────────

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

resolve_wrangler() {
  local local_wrangler="${CF_APP_DIR}/node_modules/.bin/wrangler"
  if [[ -x "${local_wrangler}" ]]; then
    printf '%s\n' "${local_wrangler}"
    return 0
  fi
  if command -v wrangler >/dev/null 2>&1; then
    command -v wrangler
    return 0
  fi
  printf 'npx -y wrangler\n'
}

resolve_cf_compatibility_date() {
  local wrangler_file="${CF_APP_DIR}/wrangler.toml"
  local compatibility_date
  compatibility_date="$(sed -nE 's/^compatibility_date = "([0-9-]+)"/\1/p' "${wrangler_file}" | head -n 1)"
  if [[ -n "${compatibility_date}" ]]; then
    printf '%s\n' "${compatibility_date}"
    return 0
  fi
  printf '2026-03-06\n'
}

# ── REQ-2: SSH Permission Pre-flight ──────────────────────────────────────────
# sshd StrictModes (on by default) refuses public-key auth when remote ~/.ssh
# or ~/.ssh/authorized_keys have too-permissive modes (group/world writable).
# This is silent: sshd logs "Authentication refused: bad ownership or modes"
# locally on the remote host but the client only sees "Permission denied".
# Running a quick chmod via SSH before the grid starts prevents the password loop.
#
# Flags used here (and on every pane SSH below):
#   -A   Forward the local SSH agent so the remote node can chain to other hosts.
#   -t   Allocate a pseudo-terminal. Critical: without it, a dropped TCP
#        connection leaves the SSH client stuck and produces Zl <defunct>.
#   -o BatchMode=yes     Never hang waiting for a password prompt.
#   -o ConnectTimeout=5  Don't block startup for offline nodes.
#   -o StrictHostKeyChecking=accept-new   Trust new hosts on first connect
#                                         without an interactive prompt.
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

require_command tmux
require_command ssh

WRANGLER_CMD="$(resolve_wrangler)"
CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE:-$(resolve_cf_compatibility_date)}"

# Run pre-flight checks in parallel against all remote grid nodes.
# Backgrounded so all four SSH handshakes happen concurrently; `wait` ensures
# they complete before we touch tmux.
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

if ! command -v "${SOURCEGIT_PATH}" >/dev/null 2>&1 && [[ ! -x "${SOURCEGIT_PATH}" ]]; then
  echo "SourceGit was not found at ${SOURCEGIT_PATH}." >&2
  echo "Set SOURCEGIT_CMD if the binary lives elsewhere on this machine." >&2
else
  echo "SourceGit detected at ${SOURCEGIT_PATH}." >&2
  echo "Pane 0 runs on ${LLXPRT_HOST}; set NYRA_LLXPRT_HOST=local for local LLXPRT+SourceGit." >&2
fi

# ── Build pane commands ────────────────────────────────────────────────────────

REMOTE_LLXPRT_CMD="$(cat <<EOF
cd "${REMOTE_PROJECT_ROOT}" && export SOURCEGIT_CMD="${SOURCEGIT_PATH}" LLXPRT_SOURCEGIT="${SOURCEGIT_PATH}" OPENAI_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_BASE="${NEXUS_BASE_URL}" LLM_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_KEY="\${OPENAI_API_KEY:-local-key}" NYRA_NEXUS_HOST="${HOST_ORCH}" NYRA_LOCAL_CLUSTER_MODEL="local-cluster" NYRA_REMOTE_OPENAI_MODEL="remote/openai-codex" NYRA_REMOTE_GEMINI_MODEL="remote/gemini-1.5-pro" CLOUDFLARE_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" CF_PAGES_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" NODE_ENV="${CF_NODE_ENV}" NODE_VERSION="${CF_NODE_VERSION}" NEXT_TELEMETRY_DISABLED="${CF_NEXT_TELEMETRY_DISABLED}" NEXT_PUBLIC_SITE_URL="${CF_NEXT_PUBLIC_SITE_URL}" NEXT_PUBLIC_SITE_NAME="${CF_NEXT_PUBLIC_SITE_NAME}" && npx -y ${LLXPRT_PACKAGE} --provider ${LLXPRT_PROVIDER} --expert --baseurl "${NEXUS_BASE_URL}" --model "${LLXPRT_MODEL}"
EOF
)"

LOCAL_LLXPRT_CMD="$(cat <<EOF
cd "${PROJECT_ROOT}" && export SOURCEGIT_CMD="${SOURCEGIT_PATH}" LLXPRT_SOURCEGIT="${SOURCEGIT_PATH}" OPENAI_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_BASE="${NEXUS_BASE_URL}" LLM_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_KEY="\${OPENAI_API_KEY:-local-key}" NYRA_NEXUS_HOST="${HOST_ORCH}" NYRA_LOCAL_CLUSTER_MODEL="local-cluster" NYRA_REMOTE_OPENAI_MODEL="remote/openai-codex" NYRA_REMOTE_GEMINI_MODEL="remote/gemini-1.5-pro" CLOUDFLARE_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" CF_PAGES_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" NODE_ENV="${CF_NODE_ENV}" NODE_VERSION="${CF_NODE_VERSION}" NEXT_TELEMETRY_DISABLED="${CF_NEXT_TELEMETRY_DISABLED}" NEXT_PUBLIC_SITE_URL="${CF_NEXT_PUBLIC_SITE_URL}" NEXT_PUBLIC_SITE_NAME="${CF_NEXT_PUBLIC_SITE_NAME}" && npx -y ${LLXPRT_PACKAGE} --provider ${LLXPRT_PROVIDER} --expert --baseurl "${NEXUS_BASE_URL}" --model "${LLXPRT_MODEL}"
EOF
)"

# REQ-1: -A and -t on ALL remote SSH invocations.
if [[ "${LLXPRT_HOST}" == "local" || "${LLXPRT_HOST}" == "localhost" ]]; then
  PANE_0_CMD="${LOCAL_LLXPRT_CMD}"
else
  PANE_0_CMD="ssh -A -t ${LLXPRT_HOST} bash -lc $(printf '%q' "${REMOTE_LLXPRT_CMD}")"
fi

# REQ-1: -A -t added. Original lacked both, causing zombies on tunnel drop.
PANE_1_CMD="ssh -A -t ${HOST_5090} 'bash -lc '\''container=\"\${NYRA_5090_CONTAINER:-}\"; if [[ -z \"\$container\" ]]; then for candidate in nyra-vllm-5090 nyra-worker-5090-vllm vllm; do if docker inspect \"\$candidate\" >/dev/null 2>&1; then container=\"\$candidate\"; break; fi; done; fi; container=\"\${container:-nyra-vllm-5090}\"; echo \"Streaming docker logs from \$container on ${HOST_5090}\"; exec docker logs -f \"\$container\"\'''"

PANE_2_CMD="ssh -A -t ${HOST_3090} 'nvidia-smi -l 1'"

PANE_3_CMD="cd \"${CF_APP_DIR}\" && echo \"Cloudflare project: ${CF_PROJECT_NAME}\" && echo \"Build compatibility date: ${CF_COMPATIBILITY_DATE}\" && if ! ${WRANGLER_CMD} whoami >/dev/null 2>&1; then echo \"wrangler is not authenticated. Run: npx wrangler login\"; else CLOUDFLARE_COMPATIBILITY_DATE=\"${CF_COMPATIBILITY_DATE}\" CF_PAGES_COMPATIBILITY_DATE=\"${CF_COMPATIBILITY_DATE}\" ${WRANGLER_CMD} pages deployment tail --project-name \"${CF_PROJECT_NAME}\" --environment \"${CF_ENVIRONMENT}\" --format pretty; fi"

PANE_4_CMD="ssh -A -t ${HOST_3060} 'nvidia-smi -l 1'"

# ── Tmux session bootstrap ─────────────────────────────────────────────────────
tmux new-session -d -s "${SESSION_NAME}" -c "${PROJECT_ROOT}"
tmux set-option -t "${SESSION_NAME}" remain-on-exit on
tmux set-option -t "${SESSION_NAME}" pane-border-status top

# ── Pane spawning with layout guards ──────────────────────────────────────────
# REQ-4: Each split-window is followed by a sleep before the next tmux command.
# tmux split-window returns immediately after forking the new shell process, but
# the shell inside the pane may not have finished its startup sequence. Sending
# keys too quickly can race the pane's readiness. The final sleep 0.5 before
# select-layout tiled ensures all five panes have reported stable geometry to
# tmux's layout engine — without it, tiled can throw "Window too small" because
# it sees an incomplete pane tree.

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
