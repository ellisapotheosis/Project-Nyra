# Infisical MCP Server - Secure Secret Management
FROM node:20-alpine AS base

LABEL maintainer="Project Nyra"
LABEL description="Infisical MCP Server for secure secret management"
LABEL version="1.0.0"

# Install system dependencies and Infisical CLI
RUN apk add --no-cache \
    curl \
    bash \
    git \
    ca-certificates \
    jq \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash \
    && apk add infisical

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Create directories for persistent data
RUN mkdir -p /app/{config,cache,logs,secrets,data}

# Copy application code
COPY src/ ./src/
COPY .env.example ./.env.example

# Non-root user for security
RUN addgroup -g 1000 mcp && \
    adduser -D -u 1000 -G mcp mcp && \
    chown -R mcp:mcp /app

USER mcp

# Environment variables
ENV NODE_ENV=production \
    MCP_PORT=8006 \
    LOG_LEVEL=info \
    INFISICAL_DISABLE_UPDATE_CHECK=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node src/health-check.js || exit 1

# Expose MCP port
EXPOSE 8006

# Run MCP server
CMD ["node", "src/index.js"]
