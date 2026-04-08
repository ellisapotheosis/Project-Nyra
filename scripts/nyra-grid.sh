#!/usr/bin/env bash
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

require_command tmux
require_command ssh

WRANGLER_CMD="$(resolve_wrangler)"
CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE:-$(resolve_cf_compatibility_date)}"

if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
  tmux attach-session -t "${SESSION_NAME}"
  exit 0
fi

if ! command -v "${SOURCEGIT_PATH}" >/dev/null 2>&1 && [[ ! -x "${SOURCEGIT_PATH}" ]]; then
  echo "SourceGit was not found at ${SOURCEGIT_PATH}." >&2
  echo "Set SOURCEGIT_CMD if the binary lives elsewhere on this machine." >&2
else
  echo "SourceGit detected at ${SOURCEGIT_PATH}." >&2
  echo "Pane 0 runs on ${LLXPRT_HOST}; set NYRA_LLXPRT_HOST=local if you want LLXPRT and SourceGit on this machine." >&2
fi

tmux new-session -d -s "${SESSION_NAME}" -c "${PROJECT_ROOT}"
tmux set-option -t "${SESSION_NAME}" remain-on-exit on
tmux set-option -t "${SESSION_NAME}" pane-border-status top

REMOTE_LLXPRT_CMD="$(cat <<EOF
cd "${REMOTE_PROJECT_ROOT}" && export SOURCEGIT_CMD="${SOURCEGIT_PATH}" LLXPRT_SOURCEGIT="${SOURCEGIT_PATH}" OPENAI_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_BASE="${NEXUS_BASE_URL}" LLM_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_KEY="\${OPENAI_API_KEY:-local-key}" NYRA_NEXUS_HOST="${HOST_ORCH}" NYRA_LOCAL_CLUSTER_MODEL="local-cluster" NYRA_REMOTE_OPENAI_MODEL="remote/openai-codex" NYRA_REMOTE_GEMINI_MODEL="remote/gemini-1.5-pro" CLOUDFLARE_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" CF_PAGES_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" NODE_ENV="${CF_NODE_ENV}" NODE_VERSION="${CF_NODE_VERSION}" NEXT_TELEMETRY_DISABLED="${CF_NEXT_TELEMETRY_DISABLED}" NEXT_PUBLIC_SITE_URL="${CF_NEXT_PUBLIC_SITE_URL}" NEXT_PUBLIC_SITE_NAME="${CF_NEXT_PUBLIC_SITE_NAME}" && npx -y ${LLXPRT_PACKAGE} --provider ${LLXPRT_PROVIDER} --expert --baseurl "${NEXUS_BASE_URL}" --model "${LLXPRT_MODEL}"
EOF
)"
LOCAL_LLXPRT_CMD="$(cat <<EOF
cd "${PROJECT_ROOT}" && export SOURCEGIT_CMD="${SOURCEGIT_PATH}" LLXPRT_SOURCEGIT="${SOURCEGIT_PATH}" OPENAI_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_BASE="${NEXUS_BASE_URL}" LLM_BASE_URL="${NEXUS_BASE_URL}" OPENAI_API_KEY="\${OPENAI_API_KEY:-local-key}" NYRA_NEXUS_HOST="${HOST_ORCH}" NYRA_LOCAL_CLUSTER_MODEL="local-cluster" NYRA_REMOTE_OPENAI_MODEL="remote/openai-codex" NYRA_REMOTE_GEMINI_MODEL="remote/gemini-1.5-pro" CLOUDFLARE_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" CF_PAGES_COMPATIBILITY_DATE="${CF_COMPATIBILITY_DATE}" NODE_ENV="${CF_NODE_ENV}" NODE_VERSION="${CF_NODE_VERSION}" NEXT_TELEMETRY_DISABLED="${CF_NEXT_TELEMETRY_DISABLED}" NEXT_PUBLIC_SITE_URL="${CF_NEXT_PUBLIC_SITE_URL}" NEXT_PUBLIC_SITE_NAME="${CF_NEXT_PUBLIC_SITE_NAME}" && npx -y ${LLXPRT_PACKAGE} --provider ${LLXPRT_PROVIDER} --expert --baseurl "${NEXUS_BASE_URL}" --model "${LLXPRT_MODEL}"
EOF
)"

if [[ "${LLXPRT_HOST}" == "local" || "${LLXPRT_HOST}" == "localhost" ]]; then
  PANE_0_CMD="${LOCAL_LLXPRT_CMD}"
else
  PANE_0_CMD="ssh ${LLXPRT_HOST} bash -lc $(printf '%q' "${REMOTE_LLXPRT_CMD}")"
fi
PANE_1_CMD="ssh ${HOST_5090} 'bash -lc '\''container=\"\${NYRA_5090_CONTAINER:-}\"; if [[ -z \"\$container\" ]]; then for candidate in nyra-vllm-5090 nyra-worker-5090-vllm vllm; do if docker inspect \"\$candidate\" >/dev/null 2>&1; then container=\"\$candidate\"; break; fi; done; fi; container=\"\${container:-nyra-vllm-5090}\"; echo \"Streaming docker logs from \$container on ${HOST_5090}\"; docker logs -f \"\$container\"\'''"
PANE_2_CMD="ssh ${HOST_3090} 'nvidia-smi -l 1'"
PANE_3_CMD="cd \"${CF_APP_DIR}\" && echo \"Cloudflare project: ${CF_PROJECT_NAME}\" && echo \"Build compatibility date: ${CF_COMPATIBILITY_DATE}\" && if ! ${WRANGLER_CMD} whoami >/dev/null 2>&1; then echo \"wrangler is not authenticated. Run: npx wrangler login\"; else CLOUDFLARE_COMPATIBILITY_DATE=\"${CF_COMPATIBILITY_DATE}\" CF_PAGES_COMPATIBILITY_DATE=\"${CF_COMPATIBILITY_DATE}\" ${WRANGLER_CMD} pages deployment tail --project-name \"${CF_PROJECT_NAME}\" --environment \"${CF_ENVIRONMENT}\" --format pretty; fi"
PANE_4_CMD="ssh ${HOST_3060} 'nvidia-smi -l 1'"

tmux send-keys -t "${SESSION_NAME}:0.0" \
  "${PANE_0_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.0" -T "Leader"

tmux split-window -h -t "${SESSION_NAME}:0.0" -c "${PROJECT_ROOT}" -p 50
tmux send-keys -t "${SESSION_NAME}:0.1" \
  "${PANE_1_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.1" -T "5090 Monitor"

tmux split-window -v -t "${SESSION_NAME}:0.0" -c "${PROJECT_ROOT}" -p 40
tmux send-keys -t "${SESSION_NAME}:0.2" \
  "${PANE_2_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.2" -T "3090 Stats"

tmux split-window -v -t "${SESSION_NAME}:0.1" -c "${PROJECT_ROOT}" -p 40
tmux send-keys -t "${SESSION_NAME}:0.3" \
  "${PANE_3_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.3" -T "Deployment"

tmux split-window -v -t "${SESSION_NAME}:0.2" -c "${PROJECT_ROOT}"
tmux send-keys -t "${SESSION_NAME}:0.4" \
  "${PANE_4_CMD}" C-m
tmux select-pane -t "${SESSION_NAME}:0.4" -T "3060 Stats"

tmux select-pane -t "${SESSION_NAME}:0.0"

tmux display-message -t "${SESSION_NAME}" "NYRA grid session started with ${LLXPRT_HOST}, ${HOST_5090}, ${HOST_3090}, ${HOST_3060}, and ${HOST_ORCH}"
tmux attach-session -t "${SESSION_NAME}"
