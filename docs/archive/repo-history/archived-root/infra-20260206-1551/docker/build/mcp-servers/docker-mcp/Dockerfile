# Docker MCP Server Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine

# Install Docker CLI (for Docker-in-Docker scenarios)
RUN apk add --no-cache docker-cli

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 && \
    chown -R mcp:mcp /app

USER mcp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Default command
ENTRYPOINT ["node", "dist/index.js"]

# Labels for metadata
LABEL org.opencontainers.image.title="Docker MCP Server" \
      org.opencontainers.image.description="Model Context Protocol server for Docker operations" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Project Nyra" \
      org.opencontainers.image.source="https://github.com/yourusername/project-nyra"
