#!/usr/bin/env bash
# Deploy primary inference on worker-rtx5090 (100.64.0.11).
#
# Services: lmcache-redis (KV backend for BOTH GPU hosts), vllm-5090.
# MUST run on worker-rtx5090, and MUST have working GPU passthrough.
set -euo pipefail
# shellcheck source=scripts/deploy/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"
cd "${REPO_ROOT}"

require_host "${WORKER_5090_IP}" "worker-rtx5090"

command -v nvidia-smi >/dev/null 2>&1 || die "nvidia-smi not found - GPU toolchain missing"
nvidia-smi -L >/dev/null 2>&1 ||
  die "nvidia-smi cannot reach the GPU. Inside WSL2 this commonly reports 'GPU access blocked by the operating system'; run from a shell with GPU passthrough."

log "GPU inventory:"
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv

compose_up worker-5090 "$@"

log "waiting for vLLM /v1/models on ${WORKER_5090_IP}:8000"
for _ in $(seq 1 60); do
  if curl -fsS -m5 "http://${WORKER_5090_IP}:8000/v1/models" >/dev/null 2>&1; then
    log "vLLM ready"
    curl -fsS "http://${WORKER_5090_IP}:8000/v1/models"
    exit 0
  fi
  sleep 10
done
die "vLLM did not become ready. Inspect: docker compose --profile worker-5090 logs vllm-5090"
