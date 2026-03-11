# ============================================================================
# Agentic-Flow Alpha - Core Orchestration Primitives
# ============================================================================
# Base Docker image for agentic-flow@alpha integration with claude-flow
# Provides core agent orchestration primitives that claude-flow extends
# ============================================================================

FROM node:20-alpine

LABEL maintainer="Project Nyra <nyra@project.local>"
LABEL description="Agentic-Flow Alpha - Core orchestration primitives for claude-flow"
LABEL version="alpha"

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    curl \
    bash \
    git

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy application source
COPY . .

# Create data directories
RUN mkdir -p \
    /app/data/agentdb \
    /app/data/memory \
    /app/data/logs \
    /app/data/agent-configs \
    /app/data/cache

# Set ownership
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose ports
EXPOSE 8080 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start agentic-flow MCP server
CMD ["pnpm", "start:mcp"]
