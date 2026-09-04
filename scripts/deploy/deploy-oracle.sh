#!/usr/bin/env bash
# Deploy the Project-Nyra control plane on oracle-vps (100.64.0.3).
#
# Services: litellm-redis, litellm, omniroute.
# MUST run on oracle-vps.
set -euo pipefail
# shellcheck source=scripts/deploy/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"
cd "${REPO_ROOT}"

require_host "${ORACLE_IP}" "oracle-vps"
require_env_file "${NYRA_ORACLE_RUNTIME_ENV:-./runtime-secrets/oracle.runtime.env}"

# Preflight: a `tailscale serve` TCP forward on 100.64.0.3:4000 will collide
# with this profile's port publish. As of 2026-09-04 such a forward existed and
# pointed at localhost:4000, where nothing listened - so the documented internal
# base URL http://100.64.0.3:4000 was a dead forward. Remove it before deploying.
if command -v tailscale >/dev/null 2>&1 &&
  tailscale serve status 2>/dev/null | grep -q "tcp://${ORACLE_IP}:4000"; then
  die "a 'tailscale serve' TCP forward already occupies ${ORACLE_IP}:4000 and will collide with this profile.
     Inspect it:  tailscale serve status
     Remove it:   sudo tailscale serve --tcp 4000 off
     Then re-run this script. See docs/refactor/NYRA_REFACTOR_VALIDATION.md."
fi

compose_up oracle "$@"

log "waiting for LiteLLM readiness"
for _ in $(seq 1 30); do
  if curl -fsS -m5 "http://127.0.0.1:4000/health/readiness" >/dev/null 2>&1; then
    log "LiteLLM ready on ${ORACLE_IP}:4000"
    exit 0
  fi
  sleep 5
done
die "LiteLLM did not become ready. Inspect: docker compose --profile oracle logs litellm"
