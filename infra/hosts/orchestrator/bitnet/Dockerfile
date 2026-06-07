FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    BITNET_DIR=/opt/bitnet \
    BITNET_MODEL_DIR=/models/BitNet-b1.58-2B-4T \
    BITNET_QUANT_TYPE=i2_s \
    BITNET_THREADS=10 \
    BITNET_CTX_SIZE=2048 \
    BITNET_PORT=8080

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

RUN git clone --recursive https://github.com/microsoft/BitNet.git "$BITNET_DIR"

WORKDIR /opt/bitnet

RUN python3 -m venv /opt/bitnet-venv \
    && /opt/bitnet-venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/bitnet-venv/bin/pip install --no-cache-dir -r requirements.txt "huggingface_hub[cli]"

COPY entrypoint.sh /usr/local/bin/bitnet-entrypoint.sh
RUN chmod +x /usr/local/bin/bitnet-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/bitnet-entrypoint.sh"]
