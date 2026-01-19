# RuV Swarm - MCP Server Dockerfile
FROM node:20-alpine

LABEL maintainer="Project Nyra"
LABEL description="RuV Swarm distributed agent coordination MCP server"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    bash

# Install RuV Swarm globally
RUN npm install -g @rUv/ruv-swarm@latest

# Create directories for persistent data
RUN mkdir -p /app/data/{swarms,agents,tasks,metrics}

# Environment variables
ENV RUV_SWARM_DISTRIBUTED=true
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD npx @rUv/ruv-swarm@latest health || exit 1

# Expose MCP port for monitoring
EXPOSE 8092

# Non-root user for security
RUN addgroup -g 1000 mcp && \
    adduser -D -u 1000 -G mcp mcp && \
    chown -R mcp:mcp /app
USER mcp

# Run RuV Swarm MCP server
CMD ["npx", "@rUv/ruv-swarm@latest", "mcp", "start"]
