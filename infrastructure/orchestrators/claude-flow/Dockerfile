# Claude-Flow Orchestrator Dockerfile
# Workflow and Backend Orchestration Service

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++ \
    docker-cli \
    && npm install -g pnpm@9.0.0

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod=false

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install claude-flow CLI and dependencies
RUN pnpm add claude-flow@alpha \
    @anthropic-ai/sdk \
    amqplib \
    ioredis \
    @grpc/grpc-js \
    @grpc/proto-loader \
    express \
    winston \
    prom-client \
    && pnpm build || echo "No build script found, skipping..."

# Production stage
FROM base AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs orchestrator

# Copy built application
COPY --from=builder --chown=orchestrator:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=orchestrator:nodejs /app/package.json ./
COPY --from=builder --chown=orchestrator:nodejs /app/dist ./dist
COPY --from=builder --chown=orchestrator:nodejs /app/src ./src

# Copy orchestrator scripts
COPY --chown=orchestrator:nodejs scripts/ ./scripts/
COPY --chown=orchestrator:nodejs config/ ./config/

# Health check script
COPY --chown=orchestrator:nodejs healthcheck.sh ./
RUN chmod +x healthcheck.sh

USER orchestrator

# Expose ports
EXPOSE 3000   # HTTP API
EXPOSE 50051  # gRPC
EXPOSE 9090   # Metrics

ENV NODE_ENV=production \
    PORT=3000 \
    GRPC_PORT=50051 \
    METRICS_PORT=9090

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["./healthcheck.sh"]

CMD ["node", "src/orchestrator/index.js"]
