#!/usr/bin/env bash
set -euo pipefail

cd "${BITNET_DIR:-/opt/bitnet}"

MODEL_DIR="${BITNET_MODEL_DIR:-/models/BitNet-b1.58-2B-4T}"
MODEL_FILE="${BITNET_MODEL_FILE:-${MODEL_DIR}/ggml-model-i2_s.gguf}"
QUANT_TYPE="${BITNET_QUANT_TYPE:-i2_s}"
THREADS="${BITNET_THREADS:-10}"
CTX_SIZE="${BITNET_CTX_SIZE:-2048}"
PORT="${BITNET_PORT:-8080}"

mkdir -p "$MODEL_DIR"

perl -0pi -e 's/int8_t\s*\*\s*y_col/const int8_t * y_col/g' src/ggml-bitnet-mad.cpp

if [ ! -f "$MODEL_FILE" ]; then
  /opt/bitnet-venv/bin/huggingface-cli download \
    microsoft/BitNet-b1.58-2B-4T-gguf \
    --local-dir "$MODEL_DIR"
fi

if [ ! -x build/bin/llama-server ]; then
  /opt/bitnet-venv/bin/python setup_env.py \
    -md "$MODEL_DIR" \
    -q "$QUANT_TYPE"
fi

exec /opt/bitnet-venv/bin/python run_inference_server.py \
  -m "$MODEL_FILE" \
  -t "$THREADS" \
  -c "$CTX_SIZE" \
  --host 0.0.0.0 \
  --port "$PORT"
