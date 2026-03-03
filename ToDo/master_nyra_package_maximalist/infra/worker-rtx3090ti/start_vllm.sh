#!/usr/bin/env bash
#
# start_vllm.sh – launch vLLM with LMCache integration on an RTX 3090 Ti.
#
# This script reads configuration from environment variables set by
# docker‑compose and starts vLLM in OpenAI API mode, forwarding KV cache
# operations to a local LMCache server.  Adjust GPU_MEMORY_UTIL and
# MAX_MODEL_LEN in your `.env` file as needed for your GPU.

set -euo pipefail

MODEL_NAME=${MODEL_NAME:-"deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"}
PORT=${VLLM_PORT:-8000}
GPU_MEMORY_UTIL=${GPU_MEMORY_UTIL:-0.88}
MAX_MODEL_LEN=${MAX_MODEL_LEN:-16384}
TP_SIZE=${TP_SIZE:-1}

# LMCache transfer configuration
KV_TRANSFER_CONFIG='{"kv_connector":"LMCacheConnectorV1","kv_role":"kv_both"}'

echo "[vLLM] Starting model $MODEL_NAME on port $PORT (TP=$TP_SIZE, GPU mem util=$GPU_MEMORY_UTIL, max len=$MAX_MODEL_LEN)"

exec python -m vllm.entrypoints.openai.api_server \
  --model "$MODEL_NAME" \
  --host 0.0.0.0 \
  --port "$PORT" \
  --tensor-parallel-size "$TP_SIZE" \
  --gpu-memory-utilization "$GPU_MEMORY_UTIL" \
  --max-model-len "$MAX_MODEL_LEN" \
  --kv-transfer-config "$KV_TRANSFER_CONFIG" \
  --trust-remote-code