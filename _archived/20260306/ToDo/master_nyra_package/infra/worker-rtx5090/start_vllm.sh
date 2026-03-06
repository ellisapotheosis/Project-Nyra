#!/usr/bin/env bash
#
# start_vllm.sh – launch vLLM with LMCache integration on an RTX 5090.
#
# vLLM will serve an OpenAI‑compatible API on the port specified by
# $VLLM_PORT.  It uses LMCache to offload KV cache entries to a local
# LMCache server (which in turn uses Redis for persistence).  Tune
# GPU_MEMORY_UTIL and MAX_MODEL_LEN in your .env file according to your
# available VRAM and desired context window.

set -euo pipefail

MODEL_NAME=${MODEL_NAME:-"deepseek-ai/deepseek-v3.2"}
PORT=${VLLM_PORT:-8000}
GPU_MEMORY_UTIL=${GPU_MEMORY_UTIL:-0.90}
MAX_MODEL_LEN=${MAX_MODEL_LEN:-32768}
TP_SIZE=${TP_SIZE:-1}

# LMCache transfer configuration
KV_TRANSFER_CONFIG='{"kv_connector":"LMCacheConnectorV1","kv_role":"kv_both"}'

echo "[vLLM] Starting model $MODEL_NAME on port $PORT (TP=$TP_SIZE, GPU mem util=$GPU_MEMORY_UTIL, max len=$MAX_MODEL_LEN)"
echo "[vLLM] Using LMCache transfer config: $KV_TRANSFER_CONFIG"

exec python3.12 -m vllm.entrypoints.openai.api_server \
  --model "$MODEL_NAME" \
  --host 0.0.0.0 \
  --port "$PORT" \
  --tensor-parallel-size "$TP_SIZE" \
  --gpu-memory-utilization "$GPU_MEMORY_UTIL" \
  --max-model-len "$MAX_MODEL_LEN" \
  --kv-transfer-config "$KV_TRANSFER_CONFIG" \
  --trust-remote-code