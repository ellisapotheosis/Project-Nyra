#!/usr/bin/env bash
set -euo pipefail

RED="[0;31m"
GREEN="[0;32m"
YELLOW="[1;33m"
NC="[0m"

pass(){ echo -e "${GREEN}✔${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠${NC} $1"; }
fail(){ echo -e "${RED}✖${NC} $1"; }

require_cmd(){
  command -v "$1" >/dev/null 2>&1 || { fail "Missing command: $1"; exit 1; }
}

require_cmd docker
require_cmd curl

hosts=("${WORKER_1_HOST:-}" "${WORKER_2_HOST:-}" "${WORKER_3_HOST:-}")

echo "=== Nyra mesh preflight ==="

if command -v tailscale >/dev/null 2>&1; then
  tailscale status >/dev/null 2>&1 && pass "Tailscale connected" || warn "Tailscale installed but disconnected"
else
  warn "Tailscale CLI not installed on this host"
fi

for h in "${hosts[@]}"; do
  [ -z "$h" ] && continue
  if ping -c 1 -W 1 "$h" >/dev/null 2>&1; then
    pass "Reachable worker host: $h"
  else
    warn "Cannot reach worker host: $h"
  fi
done

if command -v nvidia-smi >/dev/null 2>&1; then
  if nvidia-smi >/dev/null 2>&1; then
    pass "nvidia-smi detected a CUDA-capable GPU"
  else
    warn "nvidia-smi present but failed (driver/runtime issue)"
  fi
else
  warn "nvidia-smi not found"
fi

for endpoint in "${LLXPERT_CODER_BASE_URL:-}" "${LLXPERT_JEFE_BASE_URL:-}"; do
  [ -z "$endpoint" ] && continue
  if curl -fsS --max-time 4 "$endpoint/models" >/dev/null 2>&1; then
    pass "OpenAI-compatible worker endpoint healthy: $endpoint"
  elif curl -fsS --max-time 4 "$endpoint" >/dev/null 2>&1; then
    pass "Worker endpoint reachable: $endpoint"
  else
    warn "Worker endpoint not reachable: $endpoint"
  fi
done

# Optional in-stack route check if stack is already up
nexus_openai="${NEXUS_OPENAI_BASE_URL:-http://localhost:4001/llm/openai/v1}"
if curl -fsS --max-time 3 "$nexus_openai/models" >/dev/null 2>&1; then
  pass "Nexus OpenAI route reachable: $nexus_openai"
else
  warn "Nexus OpenAI route not reachable yet: $nexus_openai"
fi

if docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.addons.yml config >/dev/null 2>&1; then
  pass "compose files validate (base+services+addons)"
else
  fail "compose validation failed"
  exit 1
fi

pass "Preflight complete"
