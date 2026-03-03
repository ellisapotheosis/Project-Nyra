FROM nvidia/cuda:12.8.0-devel-ubuntu24.04

# -----------------------------------------------------------------------------
# vLLM + LMCache base image for RTX 5090
#
# The RTX 5090 (Blackwell architecture) requires CUDA 12.8 and a recent
# PyTorch/vLLM build.  We install Python 3.12 and use the `uv` package manager
# to compile vLLM and LMCache with the correct CUDA kernels.  Building this
# image can take 10–20 minutes depending on your CPU/GPU.
# -----------------------------------------------------------------------------

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3.12 \
        python3.12-venv \
        python3-pip \
        git \
        curl \
        build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install uv, a fast Python package manager that chooses appropriate wheels
RUN pip3 install --no-cache-dir uv

WORKDIR /workspace

# Copy entrypoint script
COPY start_vllm.sh /workspace/start_vllm.sh
RUN chmod +x /workspace/start_vllm.sh

# Install vLLM and LMCache.  uv will resolve compatible PyTorch versions.
# On Blackwell GPUs, this step compiles CUDA kernels; be patient.
RUN uv pip install --system --no-cache-dir vllm lmcache

ENV PYTHONUNBUFFERED=1

CMD ["/bin/bash"]