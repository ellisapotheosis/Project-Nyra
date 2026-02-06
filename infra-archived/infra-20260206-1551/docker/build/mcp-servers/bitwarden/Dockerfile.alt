# Bitwarden Secrets Manager MCP Server
# Base: Bitwarden CLI with MCP wrapper

# Stage 1: Bitwarden BWS base image
FROM bitwarden/bws@sha256:98004726b361f69419d939ec9a75c72805aec82c67643d0efc2f51dc88192e53 AS bws-base

# Stage 2: Node.js + BWS + MCP wrapper
FROM node:20-alpine

LABEL maintainer="Project Nyra"
LABEL description="Bitwarden Secrets Manager MCP Server for secure credential management"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    ca-certificates

# Copy BWS binary from base image
COPY --from=bws-base /usr/local/bin/bws /usr/local/bin/bws

# Verify BWS installation
RUN bws --version

# Copy package files
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy MCP server implementation
COPY src/ ./src/

# Create directories for persistent data
RUN mkdir -p /app/data/{cache,logs,secrets}

# Environment variables
ENV NODE_ENV=production
ENV MCP_PORT=8007
ENV BWS_ACCESS_TOKEN=""
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${MCP_PORT}/health || exit 1

# Expose MCP port
EXPOSE 8007

# Non-root user for security
RUN addgroup -g 1000 mcp && \
    adduser -D -u 1000 -G mcp mcp && \
    chown -R mcp:mcp /app

USER mcp

# Run MCP server
CMD ["node", "src/index.js"]
