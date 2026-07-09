FROM node:22-slim

RUN apt-get update && apt-get install -y \
    curl \
    gettext-base \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install openclaw globally
RUN npm install -g openclaw@latest

# Install the FalkorDB mem0 memory plugin
RUN openclaw plugins install @falkordb/openclaw-mem0

# Install the MemoryTensor memOS memory plugin
RUN openclaw plugins install @memtensor/memos-cloud-openclaw-plugin

# Install the Open WebUI channels plugin
# RUN openclaw plugins install https://github.com/Skyzi000/openclaw-open-webui-channels

COPY openclaw.json.template /etc/openclaw/openclaw.json.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 18789

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:18789/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
