# Sequential Thinking MCP Server - Multi-stage Dockerfile
# Builds from source for optimal security and control

# ============================================
# Builder Stage - Compile TypeScript
# ============================================
FROM node:22-alpine AS builder

LABEL stage=builder

# Set working directory
WORKDIR /build

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with npm cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production=false

# Copy source code and configuration
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build && \
    chmod +x dist/index.js

# ============================================
# Runtime Stage - Minimal production image
# ============================================
FROM node:22-alpine

LABEL maintainer="Project Nyra <https://github.com/ruvnet/Project-Nyra>"
LABEL description="Sequential Thinking MCP server for structured problem-solving"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/modelcontextprotocol/servers"
LABEL com.project-nyra.service="sequential-thinking-mcp"
LABEL com.project-nyra.type="mcp-server"
LABEL com.project-nyra.category="reasoning"

# Set working directory
WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    curl \
    bash \
    tini

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only with npm cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production && \
    npm cache clean --force

# Copy compiled application from builder
COPY --from=builder /build/dist ./dist

# Create directories for persistent data
RUN mkdir -p /app/data/{thoughts,sessions,revisions,branches}

# Environment variables
ENV NODE_ENV=production
ENV MCP_SERVER_NAME=sequential-thinking
ENV MCP_SERVER_VERSION=1.0.0
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json

# Feature flags (can be overridden via docker-compose)
ENV ENABLE_REVISIONS=true
ENV ENABLE_BRANCHING=true
ENV ENABLE_DYNAMIC_ADJUSTMENT=true

# Limits
ENV MAX_THOUGHTS=100
ENV MAX_BRANCHES=10
ENV TIMEOUT_MS=30000

# Health check - verify node process is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep -f "node.*dist/index.js" || exit 1

# Expose port for monitoring/metrics (optional)
EXPOSE 8093

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -D -u 1001 -S -G mcp mcp && \
    chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Run the MCP server
CMD ["node", "dist/index.js"]
