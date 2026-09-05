# =============================================================================
# BitNet memory-manager runtime — orchestrator (MiniApotheosis, 100.64.0.10)
# =============================================================================
# CPU-only 1-bit inference for the `.agent/` memory consolidation lane
# (episodic -> candidate -> semantic). It is deliberately NOT a general
# inference endpoint: GPU work stays on worker-rtx5090 / worker-rtx3090ti.
#
# Everything upstream is pinned. `git clone` of a moving default branch is not
# reproducible, and this build applies a source patch that only makes sense
# against a known tree.
#
#   BitNet source  : microsoft/BitNet @ 0b341e582afbf9e1011f24744b554c96a3477eb5
#                    (default branch head 2026-07-27, verified via GitHub API)
#   Model weights  : microsoft/bitnet-b1.58-2B-4T-gguf @ a1f2f1c765812aa8af3f6eda4a313707064bba15
#                    (verified ungated; contains exactly ggml-model-i2_s.gguf)
#
# `run_inference_server.py` (present at the pinned commit) execs BitNet's fork
# of llama.cpp's `llama-server`, so the container speaks the llama.cpp HTTP API
# including the OpenAI-compatible /v1/chat/completions surface that LiteLLM's
# `openai/` provider expects.
# =============================================================================
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    BITNET_DIR=/opt/bitnet \
    BITNET_MODEL_DIR=/models/bitnet-b1.58-2B-4T \
    BITNET_MODEL_REPO=microsoft/bitnet-b1.58-2B-4T-gguf \
    BITNET_MODEL_REVISION=a1f2f1c765812aa8af3f6eda4a313707064bba15 \
    BITNET_QUANT_TYPE=i2_s \
    BITNET_THREADS=6 \
    BITNET_CTX_SIZE=4096 \
    BITNET_PORT=8080

# Pinned so the build is reproducible and so the ggml-bitnet-mad.cpp patch in
# the entrypoint is applied against a known tree.
ARG BITNET_COMMIT=0b341e582afbf9e1011f24744b554c96a3477eb5

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      clang \
      cmake \
      curl \
      git \
      libomp-dev \
      libgomp1 \
      make \
      ninja-build \
      python3 \
      python3-pip \
      python3-venv \
      wget \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/microsoft/BitNet.git "$BITNET_DIR" \
    && git -C "$BITNET_DIR" checkout --detach "$BITNET_COMMIT" \
    && git -C "$BITNET_DIR" submodule update --init --recursive

WORKDIR /opt/bitnet

RUN python3 -m venv /opt/bitnet-venv \
    && /opt/bitnet-venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/bitnet-venv/bin/pip install --no-cache-dir -r requirements.txt "huggingface_hub[cli]"

COPY entrypoint.sh /usr/local/bin/bitnet-entrypoint.sh
RUN chmod +x /usr/local/bin/bitnet-entrypoint.sh

EXPOSE 8080

# Binding 0.0.0.0 INSIDE the container is correct: the container has its own
# network namespace. The host-facing bind is narrowed to the Tailnet address by
# the `ports:` mapping in the root compose.yaml `orchestrator` profile.
ENTRYPOINT ["/usr/local/bin/bitnet-entrypoint.sh"]
