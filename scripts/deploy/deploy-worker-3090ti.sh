#!/usr/bin/env bash
# Deploy secondary inference on worker-rtx3090ti (100.64.0.13).
#
# Service: vllm-3090ti. The LMCache Redis backend lives on worker-rtx5090 and
# must already be up, or KV reuse silently degrades.
# MUST run on worker-rtx3090ti.
set -euo pipefail
# shellcheck source=scripts/deploy/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"
cd "${REPO_ROOT}"

require_host "${WORKER_3090TI_IP}" "worker-rtx3090ti"

command -v nvidia-smi >/dev/null 2>&1 || die "nvidia-smi not found - GPU toolchain missing"
nvidia-smi -L >/dev/null 2>&1 || die "nvidia-smi cannot reach the GPU"

log "GPU inventory:"
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv

if ! (exec 3<>"/dev/tcp/${WORKER_5090_IP}/6379") 2>/dev/null; then
  warn "LMCache Redis at ${WORKER_5090_IP}:6379 is unreachable. vLLM will start but cross-host KV reuse will not work."
fi

compose_up worker-3090ti "$@"

log "waiting for vLLM /v1/models on ${WORKER_3090TI_IP}:8000"
for _ in $(seq 1 60); do
  if curl -fsS -m5 "http://${WORKER_3090TI_IP}:8000/v1/models" >/dev/null 2>&1; then
    log "vLLM ready"
    curl -fsS "http://${WORKER_3090TI_IP}:8000/v1/models"
    exit 0
  fi
  sleep 10
done
die "vLLM did not become ready. Inspect: docker compose --profile worker-3090ti logs vllm-3090ti"
