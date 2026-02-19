# Git MCP Server - Dockerfile
FROM node:20-alpine

LABEL maintainer="Project Nyra"
LABEL description="Git operations MCP server with workspace bind mount support"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies including git
RUN apk add --no-cache \
    curl \
    git \
    bash \
    openssh-client

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Create workspace mount point
RUN mkdir -p /workspace

# Environment variables
ENV NODE_ENV=production
ENV GIT_WORKSPACE=/workspace

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Non-root user for security
RUN addgroup -g 1000 mcp && \
    adduser -D -u 1000 -G mcp mcp && \
    chown -R mcp:mcp /app && \
    chown -R mcp:mcp /workspace

USER mcp

# Run Git MCP server
CMD ["node", "dist/index.js"]
