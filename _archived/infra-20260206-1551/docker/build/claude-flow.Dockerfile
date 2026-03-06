# ============================================================================
# Claude Flow V3 Production Container
# Uses @claude-flow/cli@alpha for latest alpha features
# ============================================================================
# Build stage: Install dependencies
# ============================================================================
FROM node:22-alpine AS builder

LABEL maintainer="Project Nyra Team" \
      version="3.0.0-alpha" \
      description="Claude Flow V3 Production Container with Alpha CLI" \
      org.opencontainers.image.title="Claude Flow V3 Alpha" \
      org.opencontainers.image.description="Multi-agent orchestration with alpha features" \
      org.opencontainers.image.source="https://github.com/ruvnet/claude-flow"

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
    tini

# Install Infisical CLI for secret injection
RUN curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add infisical

WORKDIR /app

# Install @claude-flow/cli@alpha globally
RUN npm install -g @claude-flow/cli@alpha pnpm@latest

# Copy claude-flow.config.json from project root
COPY claude-flow.config.json ./claude-flow.config.json

# ============================================================================
# Production stage: Minimal runtime
# ============================================================================
FROM node:22-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    bash \
    jq \
    ca-certificates \
    tini

# Install Infisical CLI for secret injection
RUN curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add infisical

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S claude-flow -u 1001 -G nodejs

WORKDIR /app

# Copy global npm packages from builder
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin/npx /usr/local/bin/
COPY --from=builder /usr/local/bin/pnpm /usr/local/bin/
COPY --from=builder /usr/local/bin/claude-flow /usr/local/bin/

# Copy configuration from builder
COPY --from=builder --chown=claude-flow:nodejs /app/claude-flow.config.json ./claude-flow.config.json

# Create necessary directories with proper permissions
RUN mkdir -p \
    /app/data \
    /app/logs \
    /app/.claude-flow \
    /app/cache \
    /app/sessions \
    /app/memory \
    /app/tmp && \
    chown -R claude-flow:nodejs /app

# Switch to non-root user
USER claude-flow

# Environment variables
ENV NODE_ENV=production \
    CLAUDE_FLOW_HOME=/app \
    CLAUDE_FLOW_DATA_DIR=/app/data \
    CLAUDE_FLOW_LOGS_DIR=/app/logs \
    CLAUDE_FLOW_MEMORY_DIR=/app/memory \
    CLAUDE_FLOW_SESSIONS_DIR=/app/sessions \
    CLAUDE_FLOW_CONFIG=/app/claude-flow.config.json \
    MCP_PORT=3000 \
    NEXUS_ROUTER_URL=http://nexus-router:6000 \
    PATH=/usr/local/bin:$PATH

# Expose MCP port
EXPOSE 3000

# Health check using claude-flow status
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD npx @claude-flow/cli@latest status 2>/dev/null || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Initialize with --docker flag and start MCP server with Infisical secret injection
CMD ["sh", "-c", "\
    echo 'Initializing Claude Flow with --docker flag...' && \
    npx @claude-flow/cli@latest init --docker --yes 2>/dev/null || true && \
    echo 'Starting Claude Flow MCP server on port 3000...' && \
    if [ -n \"$INFISICAL_TOKEN\" ]; then \
        echo 'Injecting secrets from Infisical...' && \
        infisical run \
            --token=${INFISICAL_TOKEN} \
            --env=${INFISICAL_ENV:-production} \
            --path=${INFISICAL_PATH:-/nyra/claude-flow} \
            -- npx @claude-flow/cli@latest mcp start --port ${MCP_PORT} --host 0.0.0.0; \
    else \
        echo 'No Infisical token found, starting without secret injection...' && \
        npx @claude-flow/cli@latest mcp start --port ${MCP_PORT} --host 0.0.0.0; \
    fi"]

# ============================================================================
# Build arguments for CI/CD
# ============================================================================
ARG VERSION=3.0.0-alpha
ARG BUILD_DATE
ARG GIT_COMMIT

LABEL org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_COMMIT}"
