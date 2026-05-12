# infra/docker/Dockerfile.paperclip
# Paperclip Node.js CLI wrapped in Docker for Portainer management

FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@9.15

# Install Paperclip from npm
RUN npm install -g paperclipai

# Create data directory for embedded postgres + state
RUN mkdir -p /data && chmod 777 /data

# Expose API port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:3100/health || exit 1

# Start Paperclip with database path pointing to /data
CMD ["sh", "-c", "paperclipai onboard --db-path /data --port 3100"]
