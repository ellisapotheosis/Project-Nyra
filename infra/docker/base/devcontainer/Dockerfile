FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ENV DEBIAN_FRONTEND=noninteractive

# Base OS + CLI tooling
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
       zsh \
       ripgrep \
       fd-find \
       fzf \
       direnv \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python environment management
RUN curl -fsSL https://astral.sh/uv/install.sh | sh

# Install Volta to manage Node.js and pnpm versions reproducibly
# Align with monorepo engines + Volta config (Node 22 LTS, pnpm 10.x)
ENV VOLTA_HOME="/root/.volta"
ENV PATH="$VOLTA_HOME/bin:/root/.local/bin:$PATH"
RUN curl https://get.volta.sh | bash -s -- --skip-setup \
    && /root/.volta/bin/volta install node@22.11.0 pnpm@10.27.0 turbo@latest

# Set zsh as the default shell for interactive sessions (best-effort)
RUN chsh -s /usr/bin/zsh root || true

# Nyra shell helpers for faster workflows inside the container
RUN mkdir -p /etc/profile.d \
 && cat << 'EOF' > /etc/profile.d/nyra.sh
# Nyra development shortcuts
export NYRA_ENV=development
export NYRA_REPO=/workspace/Project-Nyra

alias cproj='cd /workspace/Project-Nyra'
alias nyra-dev='cd /workspace/Project-Nyra && pnpm dev'
alias nyra-test='cd /workspace/Project-Nyra && pnpm test'
alias nyra-lint='cd /workspace/Project-Nyra && pnpm lint'
alias nyra-infra-up='cd /workspace/Project-Nyra && pnpm infra:up'
alias nyra-infra-down='cd /workspace/Project-Nyra && pnpm infra:down'
EOF

# Pre-create workspace directory
RUN mkdir -p /workspace/Project-Nyra
WORKDIR /workspace/Project-Nyra
