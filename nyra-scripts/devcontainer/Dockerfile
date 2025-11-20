FROM mcr.microsoft.com/devcontainers/base:bookworm

# Install uv + pnpm + tooling for headless automation
RUN apt-get update && \
    apt-get install -y curl git python3 python3-venv python3-pip build-essential && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"
WORKDIR /workspace/Project-Nyra

CMD ["/bin/bash"]
