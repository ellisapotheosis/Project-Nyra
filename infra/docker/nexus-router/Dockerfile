# Project Nyra - Nexus Router Multi-Arch Dockerfile
FROM --platform=$BUILDPLATFORM node:20-alpine AS base
WORKDIR /app

# Install dependencies for multi-arch build
RUN apk add --no-cache python3 make g++ git

FROM base AS deps
# Copy package files
COPY package*.json ./
COPY services/nexus-router/package*.json ./services/nexus-router/
COPY services/shared/ ./services/shared/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
# Copy source code
COPY . .
RUN npm ci

# Build the application
RUN npm run build:nexus-router 2>/dev/null || echo "No build script found"

# Production image
FROM --platform=$TARGETPLATFORM node:20-alpine
LABEL org.opencontainers.image.title="Nexus Router"
LABEL org.opencontainers.image.description="Project Nyra API Gateway and Router"
LABEL org.opencontainers.image.source="https://gitea.local:3100/admin/project-nyra"

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nexus -u 1001 -G nodejs

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache curl

# Copy built application
COPY --from=deps --chown=nexus:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nexus:nodejs /app/services/nexus-router ./
COPY --chown=nexus:nodejs infra/configs/nexus/nexus.toml /app/nexus.toml

# Create data directory
RUN mkdir -p /app/data && chown nexus:nodejs /app/data

# Switch to non-root user
USER nexus

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7000/health || exit 1

# Expose ports
EXPOSE 7000 8080 9091

# Start the application
CMD ["node", "index.js"]