# Claude Flow V3 - Best Practice Multi-Purpose Container
# Supports: MCP Server, Daemon Mode, Development
# Merged from 6 duplicate Dockerfiles across the repository

# ============================================================================
# Stage 1: Base - Common dependencies
# ============================================================================
FROM node:22-alpine AS base

LABEL maintainer="Project Nyra Team" \
      version="3.0.0-alpha.104" \
      description="Claude Flow V3 Unified Container (MCP/Daemon/Dev)" \
      org.opencontainers.image.title="Claude Flow V3" \
      org.opencontainers.image.description="Multi-agent orchestration platform" \
      org.opencontainers.image.source="https://github.com/ruvnet/claude-flow" \
      org.opencontainers.image.vendor="Project-Nyra"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    jq \
    ca-certificates \
    git \
    python3 \
    py3-pip \
    build-base \
    tini \
    docker-cli

# Install Infisical CLI for secret injection
RUN curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add infisical

# Install pnpm globally
RUN npm install -g pnpm@latest

WORKDIR /app

# ============================================================================
# Stage 2: Dependencies - Install node modules
# ============================================================================
FROM base AS deps

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Install Claude Flow CLI globally
RUN pnpm add -g @claude-flow/cli@3.0.0-alpha.104 claude-flow@alpha

# ============================================================================
# Stage 3: Builder - Build application
# ============================================================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install additional runtime dependencies
RUN pnpm add \
    @anthropic-ai/sdk \
    amqplib \
    ioredis \
    @grpc/grpc-js \
    @grpc/proto-loader \
    express \
    winston \
    prom-client \
    zod

# Build application if build script exists
RUN pnpm build 2>/dev/null || echo "No build script found, skipping..."

# ============================================================================
# Stage 4: Production - Minimal runtime image
# ============================================================================
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S claude-flow -u 1001 -G nodejs

# Copy dependencies and built application
COPY --from=deps --chown=claude-flow:nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=deps --chown=claude-flow:nodejs /usr/local/bin/npx /usr/local/bin/
COPY --from=deps --chown=claude-flow:nodejs /usr/local/bin/pnpm /usr/local/bin/
COPY --from=builder --chown=claude-flow:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=claude-flow:nodejs /app/package*.json ./
COPY --from=builder --chown=claude-flow:nodejs /app/dist ./dist 2>/dev/null || true
COPY --from=builder --chown=claude-flow:nodejs /app/src ./src 2>/dev/null || true

# Copy configuration files
COPY --chown=claude-flow:nodejs config/ ./config/ 2>/dev/null || true
COPY --chown=claude-flow:nodejs scripts/ ./scripts/ 2>/dev/null || true
COPY --chown=claude-flow:nodejs .claude/ ./.claude/ 2>/dev/null || true

# Create necessary directories
RUN mkdir -p /app/{data,logs,cache,secrets,sessions,memory,.claude-flow,.swarm} && \
    chown -R claude-flow:nodejs /app

# Security: Remove unnecessary files
RUN rm -rf /var/cache/apk/* /tmp/* /root/.npm

# Switch to non-root user
USER claude-flow

# Initialize Claude Flow with recommended topology
RUN npx @claude-flow/cli@latest init --yes \
    --topology hierarchical-mesh \
    --max-agents 15 \
    --strategy specialized 2>/dev/null || true

# Environment variables with sensible defaults
ENV NODE_ENV=production \
    CLAUDE_FLOW_HOME=/app \
    CLAUDE_FLOW_DATA_DIR=/app/data \
    CLAUDE_FLOW_LOGS_DIR=/app/logs \
    CLAUDE_FLOW_CONFIG_DIR=/app/config \
    CLAUDE_FLOW_SESSIONS_DIR=/app/sessions \
    CLAUDE_FLOW_MEMORY_DIR=/app/memory \
    MCP_PORT=8003 \
    DAEMON_PORT=6100 \
    API_PORT=3000 \
    GRPC_PORT=50051 \
    METRICS_PORT=9090

# Expose all potential ports
EXPOSE ${MCP_PORT} ${DAEMON_PORT} ${API_PORT} ${GRPC_PORT} ${METRICS_PORT}

# Health check (works for MCP, daemon, and API modes)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD npx @claude-flow/cli@latest status 2>/dev/null || \
        curl -f http://localhost:${MCP_PORT}/health 2>/dev/null || \
        curl -f http://localhost:${API_PORT}/health 2>/dev/null || \
        exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Default: Start MCP server with Infisical secret injection
# Override with environment variable MODE=daemon or MODE=api
CMD ["sh", "-c", "\
    if [ \"$MODE\" = \"daemon\" ]; then \
        npx @claude-flow/cli@latest daemon start --daemon; \
    elif [ \"$MODE\" = \"api\" ]; then \
        node src/index.js || node dist/index.js; \
    else \
        infisical run --env=${INFISICAL_ENV:-production} --path=${INFISICAL_PATH:-/nyra/claude-flow} -- \
            npx @claude-flow/cli@latest mcp start --port ${MCP_PORT} --host 0.0.0.0 || \
        npx @claude-flow/cli@latest mcp start --port ${MCP_PORT} --host 0.0.0.0; \
    fi"]

# ============================================================================
# Stage 5: Development - For local development
# ============================================================================
FROM base AS development

WORKDIR /app

# Install all dependencies including dev
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

# Expose debug port
EXPOSE 3000 9229

# Start with hot reload and debugging
CMD ["pnpm", "run", "dev"]

# ============================================================================
# Build Arguments (for CI/CD)
# ============================================================================
ARG VERSION=3.0.0-alpha.104
ARG BUILD_DATE
ARG GIT_COMMIT
ARG NODE_ENV=production

# Additional labels
LABEL org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_COMMIT}"
