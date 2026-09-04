#!/usr/bin/env bash
# Fleet deployment across all three hosts.
#
# This script does NOT start remote containers with a local compose call. It
# reaches each host over SSH/Tailscale and invokes that host's own profile
# script there.
#
# Order matters: LMCache Redis and vLLM come up before the gateway that routes
# to them, so LiteLLM does not spend its startup window cooling down dead
# deployments.
#
# SSH aliases come from ~/.ssh/config (oracle-vps, worker-rtx5090,
# worker-rtx3090ti). worker-rtx3060 is RETIRED and is not a deployment target.
set -euo pipefail
# shellcheck source=scripts/deploy/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

REMOTE_REPO="${NYRA_REMOTE_REPO:-~/project-nyra}"

deploy_remote() {
  local host_alias="$1" script="$2"
  log "=== ${host_alias} ==="
  if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "${host_alias}" true 2>/dev/null; then
    warn "${host_alias} unreachable - skipping. This host will be left at its previous state."
    return 1
  fi
  ssh -o ConnectTimeout=10 "${host_alias}" \
    "cd ${REMOTE_REPO} && ./scripts/deploy/${script}"
}

failed=()

deploy_remote worker-rtx5090 deploy-worker-5090.sh || failed+=("worker-rtx5090")
deploy_remote worker-rtx3090ti deploy-worker-3090ti.sh || failed+=("worker-rtx3090ti")
deploy_remote oracle-vps deploy-oracle.sh || failed+=("oracle-vps")

if [ ${#failed[@]} -gt 0 ]; then
  warn "hosts not deployed: ${failed[*]}"
  warn "LiteLLM routes around missing local workers via OmniRoute and OpenRouter fallbacks, but capacity is reduced."
  exit 1
fi

log "fleet deployment complete"
