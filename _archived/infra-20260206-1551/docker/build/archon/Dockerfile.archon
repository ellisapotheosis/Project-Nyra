# Archon MCP Server - Advanced AI Orchestration
FROM node:24.11.0-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    bash \
    python3 \
    py3-pip \
    build-base \
    tini

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S archon -u 1001

# Set working directory
WORKDIR /app

# Install Archon MCP server
RUN npm install -g @archon/mcp-server@latest

# Create necessary directories
RUN mkdir -p {config,cache,logs,models} && \
    chown -R archon:nodejs /app

# Switch to app user
USER archon

# Copy configuration files
COPY --chown=archon:nodejs config/ ./config/

# Expose MCP port
EXPOSE 8004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8004/health || exit 1

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start Archon MCP server
CMD ["archon-mcp", "start", "--port", "8004", "--host", "0.0.0.0"]