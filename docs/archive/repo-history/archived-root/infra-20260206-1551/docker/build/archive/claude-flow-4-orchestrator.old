# Multi-stage Dockerfile for Claude-Flow Orchestrator
# Stage 1: Base image with Node.js and dependencies
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    curl \
    git \
    jq

# Set working directory
WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Install claude-flow globally
RUN npm install -g claude-flow@alpha

# Stage 3: Development dependencies (for testing)
FROM deps AS deps-dev

# Install all dependencies including dev
RUN npm ci && \
    npm cache clean --force

# Stage 4: Production image
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S claudeflow && \
    adduser -S claudeflow -u 1001

# Copy dependencies from deps stage
COPY --from=deps --chown=claudeflow:claudeflow /app/node_modules ./node_modules
COPY --from=deps --chown=claudeflow:claudeflow /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=deps --chown=claudeflow:claudeflow /usr/local/bin/claude-flow /usr/local/bin/

# Create necessary directories
RUN mkdir -p /app/{data,logs,config,sessions,memory} && \
    chown -R claudeflow:claudeflow /app

# Copy application files
COPY --chown=claudeflow:claudeflow config/ ./config/
COPY --chown=claudeflow:claudeflow scripts/ ./scripts/

# Make scripts executable
RUN chmod +x scripts/*.sh

# Set environment variables
ENV NODE_ENV=production \
    CLAUDE_FLOW_HOME=/app \
    CLAUDE_FLOW_DATA_DIR=/app/data \
    CLAUDE_FLOW_LOGS_DIR=/app/logs \
    CLAUDE_FLOW_CONFIG_DIR=/app/config \
    CLAUDE_FLOW_SESSIONS_DIR=/app/sessions \
    CLAUDE_FLOW_MEMORY_DIR=/app/memory

# Expose ports
EXPOSE 8090 8091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8090/health || exit 1

# Switch to non-root user
USER claudeflow

# Default command
CMD ["./scripts/entrypoint.sh"]
