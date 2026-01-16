# ============================================================================
# Claude Flow Dockerfile - Multi-Stage Build
# Node 20 + Volta + Claude Flow V3
# ============================================================================

# Stage 1: Base Image with Volta
FROM node:20-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Volta
ARG VOLTA_VERSION=1.1.1
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH

RUN curl https://get.volta.sh | bash -s -- --version ${VOLTA_VERSION} \
    && volta install node@20 \
    && volta install npm@latest \
    && volta install pnpm@latest

# ============================================================================
# Stage 2: Dependencies
FROM base AS dependencies

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY submodules/claude-flow/package.json ./submodules/claude-flow/

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --prefer-offline

# ============================================================================
# Stage 3: Builder
FROM dependencies AS builder

WORKDIR /app

# Copy source code
COPY . .
COPY submodules/claude-flow ./submodules/claude-flow

# Build Claude Flow
WORKDIR /app/submodules/claude-flow
RUN pnpm install --frozen-lockfile && \
    pnpm build && \
    pnpm prune --prod

# ============================================================================
# Stage 4: Runtime
FROM node:20-slim AS runtime

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r claudeflow && \
    useradd -r -g claudeflow -s /bin/bash -d /app claudeflow

WORKDIR /app

# Copy Volta and Node from base
COPY --from=base /root/.volta /home/claudeflow/.volta
ENV VOLTA_HOME=/home/claudeflow/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH

# Copy built application
COPY --from=builder --chown=claudeflow:claudeflow /app/submodules/claude-flow/dist ./dist
COPY --from=builder --chown=claudeflow:claudeflow /app/submodules/claude-flow/node_modules ./node_modules
COPY --from=builder --chown=claudeflow:claudeflow /app/submodules/claude-flow/package.json ./

# Create necessary directories
RUN mkdir -p /app/data /app/logs /app/.claude-flow && \
    chown -R claudeflow:claudeflow /app

# Switch to non-root user
USER claudeflow

# Expose ports
EXPOSE 3000 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Set environment variables
ENV NODE_ENV=production \
    CLAUDE_FLOW_MODE=mcp \
    CLAUDE_FLOW_CONFIG=/app/claude-flow.config.json

# Start command
CMD ["node", "dist/index.js"]

# Labels
LABEL maintainer="Project Nyra <dev@projectnyra.com>" \
      org.opencontainers.image.title="Claude Flow" \
      org.opencontainers.image.description="Multi-agent orchestration framework with MCP support" \
      org.opencontainers.image.version="3.0.0" \
      org.opencontainers.image.vendor="Project Nyra" \
      org.opencontainers.image.source="https://github.com/projectnyra/nyra"
