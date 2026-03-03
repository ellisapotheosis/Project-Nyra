FROM vllm/vllm-openai:latest

# -----------------------------------------------------------------------------
# Extends the official vLLM image and installs LMCache
#
# The RTX 3090 Ti (Ampere architecture) is supported by the standard vLLM
# image.  We simply add LMCache on top so that vLLM can offload its KV
# cache via the `--kv-transfer-config` flag.
# -----------------------------------------------------------------------------

RUN pip install --no-cache-dir lmcache

WORKDIR /workspace

COPY start_vllm.sh /workspace/start_vllm.sh
RUN chmod +x /workspace/start_vllm.sh

ENV PYTHONUNBUFFERED=1

CMD ["/bin/bash"]