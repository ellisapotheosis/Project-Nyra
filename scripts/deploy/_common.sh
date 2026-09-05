#!/usr/bin/env bash
# Shared helpers for Project-Nyra host-profile deployment.
#
# Docker Compose does not orchestrate across hosts. Each deploy script runs a
# single profile ON THE HOST THAT OWNS IT. deploy-all.sh reaches the other hosts
# over SSH/Tailscale; it never pretends a local compose call starts a remote
# host's GPU container.
set -euo pipefail

# These are consumed by the scripts that source this file, not by this file.
# shellcheck disable=SC2034
{
  REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  readonly REPO_ROOT

  # Tailnet addresses, verified live 2026-09-04.
  readonly ORACLE_IP="100.64.0.3"
  readonly ORCHESTRATOR_IP="100.64.0.10"
  readonly WORKER_5090_IP="100.64.0.11"
  readonly WORKER_3090TI_IP="100.64.0.13"
}

log() { printf '[nyra-deploy] %s\n' "$*"; }
warn() { printf '[nyra-deploy] WARNING: %s\n' "$*" >&2; }
die() {
  printf '[nyra-deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

# Refuse to run a host profile on the wrong machine.
require_host() {
  local expected_ip="$1" label="$2"
  if [ "${NYRA_SKIP_HOST_CHECK:-0}" = "1" ]; then
    warn "NYRA_SKIP_HOST_CHECK=1 - skipping host identity check for ${label}"
    return 0
  fi
  local ips
  ips="$(hostname -I 2>/dev/null || true)"
  case " ${ips} " in
  *" ${expected_ip} "*) return 0 ;;
  esac
  # Windows-hosted Tailscale (WSL2) does not surface the tailnet IP to the guest.
  if command -v tailscale >/dev/null 2>&1 && tailscale ip -4 2>/dev/null | grep -qx "${expected_ip}"; then
    return 0
  fi
  die "this script deploys the ${label} profile and must run ON ${label} (${expected_ip}). Current addresses: ${ips:-unknown}. Override with NYRA_SKIP_HOST_CHECK=1 only if you are certain."
}

require_env_file() {
  local f="$1"
  [ -f "${f}" ] || die "missing runtime env file: ${f} - render it with the Infisical Agent first. Do not hand-write secrets."
}

# Fail before `up` if any ${VAR:?} is unresolved.
render_check() {
  local profile="$1"
  log "validating profile '${profile}' with docker compose config"
  docker compose --profile "${profile}" config >/dev/null ||
    die "profile '${profile}' has unresolved variables or invalid syntax"
}

compose_up() {
  local profile="$1"
  shift
  render_check "${profile}"
  log "starting profile '${profile}'"
  docker compose --profile "${profile}" up -d "$@"
}
