#!/usr/bin/env bash
set -euo pipefail

cd "${BITNET_DIR:-/opt/bitnet}"

MODEL_DIR="${BITNET_MODEL_DIR:-/models/bitnet-b1.58-2B-4T}"
MODEL_FILE="${BITNET_MODEL_FILE:-${MODEL_DIR}/ggml-model-i2_s.gguf}"
MODEL_REPO="${BITNET_MODEL_REPO:-microsoft/bitnet-b1.58-2B-4T-gguf}"
MODEL_REVISION="${BITNET_MODEL_REVISION:-a1f2f1c765812aa8af3f6eda4a313707064bba15}"
QUANT_TYPE="${BITNET_QUANT_TYPE:-i2_s}"
THREADS="${BITNET_THREADS:-6}"
CTX_SIZE="${BITNET_CTX_SIZE:-4096}"
PORT="${BITNET_PORT:-8080}"

mkdir -p "$MODEL_DIR"

# Upstream ggml-bitnet-mad.cpp passes a non-const int8_t* where a const pointer
# is required, which fails under the clang version in ubuntu:24.04. The
# substitution is idempotent: re-running it on already-patched source is a
# no-op, so a rebuilt image or a warm build volume is safe.
perl -0pi -e 's/(?<!const )int8_t\s*\*\s*y_col/const int8_t * y_col/g' src/ggml-bitnet-mad.cpp

# Pinned revision. The weights are a fixed artifact, not a moving tag.
if [ ! -f "$MODEL_FILE" ]; then
  /opt/bitnet-venv/bin/huggingface-cli download \
    "$MODEL_REPO" \
    --revision "$MODEL_REVISION" \
    --local-dir "$MODEL_DIR"
fi

if [ ! -x build/bin/llama-server ]; then
  /opt/bitnet-venv/bin/python setup_env.py \
    -md "$MODEL_DIR" \
    -q "$QUANT_TYPE"
fi

# 0.0.0.0 is the CONTAINER namespace. The host-side exposure is narrowed to
# 100.64.0.10 by the compose `ports:` mapping — never published on 0.0.0.0.
exec /opt/bitnet-venv/bin/python run_inference_server.py \
  -m "$MODEL_FILE" \
  -t "$THREADS" \
  -c "$CTX_SIZE" \
  --host 0.0.0.0 \
  --port "$PORT"
