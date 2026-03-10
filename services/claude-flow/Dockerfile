# ============================================================================
# Claude Flow Brain - Multi-Stage Build
# Node 20 + MCP Server + Memory Integration
# ============================================================================

# Stage 1: Base Image
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    ca-certificates \
    sqlite \
    sqlite-dev \
    python3 \
    py3-pip \
    make \
    g++ \
    bash

# Install pnpm globally
RUN npm install -g pnpm@latest

# Stage 2: Dependencies
FROM base AS dependencies

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile when available
RUN if [ -f "pnpm-lock.yaml" ]; then \
      pnpm install --frozen-lockfile; \
    else \
      pnpm install; \
    fi

# Stage 3: Builder
FROM dependencies AS builder

WORKDIR /app

# Copy source code
COPY . .

# Build TypeScript if present
RUN if [ -f "tsconfig.json" ]; then pnpm build || true; fi

# Prune dev dependencies
RUN pnpm prune --prod

# Stage 4: Runtime
FROM node:20-alpine AS runtime

# Install runtime dependencies only
RUN apk add --no-cache \
    curl \
    ca-certificates \
    sqlite \
    bash

# Create non-root user
RUN addgroup -S claudeflow && \
    adduser -S -G claudeflow -s /bin/bash -h /app claudeflow

WORKDIR /app

# Copy node_modules and built application
COPY --from=builder --chown=claudeflow:claudeflow /app/node_modules ./node_modules
COPY --from=builder --chown=claudeflow:claudeflow /app/dist ./dist
COPY --from=builder --chown=claudeflow:claudeflow /app/src ./src
COPY --from=builder --chown=claudeflow:claudeflow /app/package.json ./

# Create necessary directories
RUN mkdir -p /app/data/agentdb /app/data/memory /app/data/logs /app/data/cache /app/.claude-flow && \
    chown -R claudeflow:claudeflow /app

# Switch to non-root user
USER claudeflow

# Expose ports
# MCP Server: 8080
# Dashboard/Metrics: 3333
EXPOSE 8080 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV NODE_ENV=production \
    CLAUDE_FLOW_MODE=server \
    CLAUDE_FLOW_PORT=8080 \
    CLAUDE_FLOW_HOST=0.0.0.0 \
    CLAUDE_FLOW_ENABLE_REASONING_BANK=true \
    CLAUDE_FLOW_ENABLE_AGENT_DB=true \
    CLAUDE_FLOW_ENABLE_RUVECTOR=true

# Start command
CMD ["node", "dist/index.js"]

# Labels
LABEL maintainer="Project Nyra <dev@projectnyra.com>" \
      org.opencontainers.image.title="Claude Flow Brain" \
      org.opencontainers.image.description="Multi-agent orchestration brain with MCP server and memory integration" \
      org.opencontainers.image.version="3.0.0" \
      org.opencontainers.image.vendor="Project Nyra"
