#!/usr/bin/env bash
# Fleet deployment across all four hosts.
#
# This script does NOT start remote containers with a local compose call. It
# reaches each host over SSH/Tailscale and invokes that host's own profile
# script there.
#
# Order matters: every origin comes up before the gateway that routes to it, so
# LiteLLM does not spend its startup window cooling down dead deployments. The
# orchestrator memory-manager plane is an origin too - if `nyra-embedding` is
# not answering when LiteLLM starts with mcp_semantic_tool_filter enabled, the
# semantic index has nothing to build from.
#
# SSH aliases come from ~/.ssh/config (oracle-vps, orchestrator,
# worker-rtx5090, worker-rtx3090ti). The third GPU worker (RTX 3060) is RETIRED
# and is not a deployment target.
#
# orchestrator is CPU-only; it hosts embeddings and the BitNet memory manager,
# NOT a second LiteLLM.
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

# Some hosts run Windows OpenSSH, so an inbound `ssh <alias> '<posix command>'`
# lands in cmd.exe, not a shell that can run these scripts. VERIFIED on
# orchestrator: `ssh orchestrator 'hostname -s'` returns
# "hostname -s is not supported", and `wsl -l -v` lists a running Ubuntu-24.04.
# The deployment therefore has to be re-entered into the WSL distro explicitly.
deploy_remote_wsl() {
  local host_alias="$1" script="$2" distro="$3"
  log "=== ${host_alias} (via WSL distro ${distro}) ==="
  if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "${host_alias}" "wsl -d ${distro} -e true" 2>/dev/null; then
    warn "${host_alias} unreachable, or WSL distro ${distro} is not running - skipping."
    return 1
  fi
  ssh -o ConnectTimeout=10 "${host_alias}" \
    "wsl -d ${distro} -e bash -lc 'cd ${REMOTE_REPO} && ./scripts/deploy/${script}'"
}

failed=()

deploy_remote worker-rtx5090 deploy-worker-5090.sh || failed+=("worker-rtx5090")
deploy_remote worker-rtx3090ti deploy-worker-3090ti.sh || failed+=("worker-rtx3090ti")
deploy_remote_wsl orchestrator deploy-orchestrator.sh \
  "${ORCHESTRATOR_WSL_DISTRO:-Ubuntu-24.04}" || failed+=("orchestrator")
deploy_remote oracle-vps deploy-oracle.sh || failed+=("oracle-vps")

if [ ${#failed[@]} -gt 0 ]; then
  warn "hosts not deployed: ${failed[*]}"
  warn "LiteLLM routes around missing local workers via OmniRoute and OpenRouter fallbacks, but capacity is reduced."
  exit 1
fi

log "fleet deployment complete"
