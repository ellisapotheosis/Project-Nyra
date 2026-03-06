FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       curl \
       git \
       build-essential \
       pkg-config \
       libssl-dev \
       python3 \
       python3-venv \
       python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python environment management
RUN curl -fsSL https://astral.sh/uv/install.sh | sh

# Install Volta to manage Node.js and pnpm versions reproducibly
ENV VOLTA_HOME="/root/.volta"
ENV PATH="$VOLTA_HOME/bin:/root/.local/bin:$PATH"
RUN curl https://get.volta.sh | bash -s -- --skip-setup \
    && /root/.volta/bin/volta install node@20 pnpm@8

# Pre-create workspace directory
RUN mkdir -p /workspace/Project-Nyra
WORKDIR /workspace/Project-Nyra
