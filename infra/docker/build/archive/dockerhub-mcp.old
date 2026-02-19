# Docker Hub MCP Server
FROM node:22-alpine

LABEL maintainer="Project Nyra Team" \
      version="1.0.0" \
      description="Docker Hub MCP Server for Nyra Distributed Infrastructure"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    jq \
    ca-certificates \
    git \
    docker-cli \
    tini

# Install Infisical CLI for secret injection
RUN curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add infisical

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dockerhub -u 1001 -G nodejs

# Create necessary directories
RUN mkdir -p /app/{config,cache,logs,secrets} && \
    chown -R dockerhub:nodejs /app

# Copy application code
COPY src/ ./src/
COPY config/ ./config/

# Set proper permissions
RUN chown -R dockerhub:nodejs /app

# Switch to non-root user
USER dockerhub

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${MCP_PORT:-8007}/health || exit 1

# Expose MCP port
EXPOSE ${MCP_PORT:-8007}

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start command with Infisical secret injection
CMD ["sh", "-c", "infisical run --env=production --path=/nyra/dockerhub -- node src/mcp-server.js"]
