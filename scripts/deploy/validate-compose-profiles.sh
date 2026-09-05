#!/usr/bin/env bash
# Static validation of every root Compose profile.
#
# Renders each profile with placeholder values for the variables that are
# host-specific and deliberately have no default (model ids, max_model_len,
# LMCache Redis sizing, agent images). A real deployment supplies these from
# infra/env/<host>.env; this script only proves the Compose file itself is
# syntactically valid and that no ${VAR:?} is unaccounted for.
#
# Usage: ./scripts/deploy/validate-compose-profiles.sh
set -uo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)" || exit 1

# Real pinned digests from .env.example.
LITELLM_IMAGE="$(grep -E '^LITELLM_IMAGE=' .env.example | cut -d= -f2-)"
REDIS_IMAGE="$(grep -E '^REDIS_IMAGE=' .env.example | cut -d= -f2-)"
VLLM_IMAGE="$(grep -E '^VLLM_IMAGE=' .env.example | cut -d= -f2-)"
LLAMACPP_SERVER_IMAGE="$(grep -E '^LLAMACPP_SERVER_IMAGE=' infra/env/orchestrator.env.example | cut -d= -f2-)"
export LITELLM_IMAGE REDIS_IMAGE VLLM_IMAGE LLAMACPP_SERVER_IMAGE

# Validation-only placeholders. Never used for a real deployment.
export OMNIROUTE_IMAGE="validate-only/omniroute:placeholder"
export CLAWTEAM_IMAGE="validate-only/clawteam:placeholder"
export OPENHARNESS_IMAGE="validate-only/openharness:placeholder"
export NYRA_ORACLE_RUNTIME_ENV="./infra/env/oracle.env.example"
export NYRA_AGENT_RUNTIME_ENV="./infra/env/agent.env.example"
export LMCACHE_REDIS_MAXMEMORY="8gb"
export VLLM_MODEL_5090="validate-only/model"
export VLLM_SERVED_NAME_5090="nyra-primary"
export VLLM_MAX_MODEL_LEN_5090="8192"
export VLLM_MODEL_3090TI="validate-only/model"
export VLLM_SERVED_NAME_3090TI="nyra-secondary"
export VLLM_MAX_MODEL_LEN_3090TI="8192"

rc=0
for profile in oracle orchestrator worker-5090 worker-3090ti agent-containerized; do
  printf '=== profile %-20s ' "${profile}"
  if err="$(docker compose --profile "${profile}" config 2>&1 >/dev/null)"; then
    printf 'VALID   services: %s\n' \
      "$(docker compose --profile "${profile}" config --services 2>/dev/null | tr '\n' ' ')"
  else
    printf 'FAILED\n%s\n' "${err}"
    rc=1
  fi
done

printf '\n=== port bindings across all profiles ===\n'
docker compose --profile oracle --profile orchestrator --profile worker-5090 --profile worker-3090ti config 2>/dev/null |
  grep -E 'published|host_ip' || true

exit "${rc}"
