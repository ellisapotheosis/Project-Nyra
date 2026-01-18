# Sequential Thinking MCP Server - Dockerfile
FROM node:20-alpine

LABEL maintainer="Project Nyra"
LABEL description="Sequential Thinking MCP server for structured problem-solving"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    bash

# Install Sequential Thinking MCP server globally
RUN npm install -g @modelcontextprotocol/server-sequential-thinking@latest

# Create directories for persistent data
RUN mkdir -p /app/data/{thoughts,sessions,revisions}

# Environment variables
ENV NODE_ENV=production
ENV MCP_SERVER_NAME=sequential-thinking
ENV MCP_SERVER_VERSION=1.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep -f "sequential-thinking" || exit 1

# Expose MCP port for monitoring
EXPOSE 8093

# Non-root user for security
RUN addgroup -g 1001 mcp && \
    adduser -D -u 1001 -G mcp mcp && \
    chown -R mcp:mcp /app
USER mcp

# Run Sequential Thinking MCP server
CMD ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
