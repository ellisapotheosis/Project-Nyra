#!/usr/bin/env bash
# Canonical heterogeneous vLLM + LMCache launcher for Nyra GPU workers.
set -Eeuo pipefail

log() { printf '[vLLM bootstrap] %s\n' "$*"; }
fail() { printf '[vLLM bootstrap] ERROR: %s\n' "$*" >&2; exit 1; }

NODE_NAME="${NYRA_NODE_NAME:-$(hostname -s)}"
CONFIG_ROOT="${NYRA_VLLM_CONFIG_ROOT:-/etc/vllm}"
LMCACHE_CONFIG_FILE="${LMCACHE_CONFIG_FILE:-$CONFIG_ROOT/lmcache.yaml}"
LMCACHE_REMOTE_URL="${LMCACHE_REMOTE_URL:-redis://127.0.0.1:6379}"
LMCACHE_CHUNK_SIZE="${LMCACHE_CHUNK_SIZE:-256}"
LMCACHE_REMOTE_SERDE="${LMCACHE_REMOTE_SERDE:-naive}"
VLLM_HOST="${VLLM_HOST:-0.0.0.0}"
VLLM_PORT="${VLLM_PORT:-8000}"

case "$NODE_NAME" in
  *5090*)
    MODEL_ID="${VLLM_MODEL_ID:-Qwen/Qwen3.8-27B}"
    GPU_MEMORY_UTILIZATION="${VLLM_GPU_MEMORY_UTILIZATION:-0.90}"
    MAX_MODEL_LEN="${VLLM_MAX_MODEL_LEN:-32768}"
    MAX_LOCAL_CPU_SIZE="${LMCACHE_MAX_LOCAL_CPU_SIZE:-8}"
    ;;
  *3090*)
    MODEL_ID="${VLLM_MODEL_ID:-Qwen/Qwen3.8-27B}"
    GPU_MEMORY_UTILIZATION="${VLLM_GPU_MEMORY_UTILIZATION:-0.88}"
    MAX_MODEL_LEN="${VLLM_MAX_MODEL_LEN:-16384}"
    MAX_LOCAL_CPU_SIZE="${LMCACHE_MAX_LOCAL_CPU_SIZE:-4}"
    ;;
  *)
    if [[ "${NYRA_ALLOW_UNKNOWN_VLLM_NODE:-0}" != "1" ]]; then
      fail "unsupported node '$NODE_NAME'; set NYRA_NODE_NAME or NYRA_ALLOW_UNKNOWN_VLLM_NODE=1"
    fi
    MODEL_ID="${VLLM_MODEL_ID:?VLLM_MODEL_ID is required for an unknown node}"
    GPU_MEMORY_UTILIZATION="${VLLM_GPU_MEMORY_UTILIZATION:-0.80}"
    MAX_MODEL_LEN="${VLLM_MAX_MODEL_LEN:-8192}"
    MAX_LOCAL_CPU_SIZE="${LMCACHE_MAX_LOCAL_CPU_SIZE:-2}"
    ;;
esac

[[ "$LMCACHE_REMOTE_URL" == redis://* || "$LMCACHE_REMOTE_URL" == redis-sentinel://* ]] \
  || fail "LMCACHE_REMOTE_URL must use redis:// or redis-sentinel://"
[[ "$LMCACHE_CHUNK_SIZE" =~ ^[0-9]+$ ]] || fail "LMCACHE_CHUNK_SIZE must be an integer"
[[ "$MAX_MODEL_LEN" =~ ^[0-9]+$ ]] || fail "VLLM_MAX_MODEL_LEN must be an integer"
command -v vllm >/dev/null 2>&1 || fail "vllm executable not found"

install -d -m 0750 "$CONFIG_ROOT"
umask 027
cat >"$LMCACHE_CONFIG_FILE" <<EOF
chunk_size: $LMCACHE_CHUNK_SIZE
local_cpu: true
max_local_cpu_size: $MAX_LOCAL_CPU_SIZE
remote_url: "$LMCACHE_REMOTE_URL"
remote_serde: "$LMCACHE_REMOTE_SERDE"
EOF

export LMCACHE_CONFIG_FILE
log "node=$NODE_NAME model=$MODEL_ID port=$VLLM_PORT lmcache=enabled"

exec vllm serve "$MODEL_ID" \
  --host "$VLLM_HOST" \
  --port "$VLLM_PORT" \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization "$GPU_MEMORY_UTILIZATION" \
  --max-model-len "$MAX_MODEL_LEN" \
  --enable-prefix-caching \
  --enable-chunked-prefill \
  --kv-transfer-config '{"kv_connector":"LMCacheConnectorV1","kv_role":"kv_both"}'
