# Exa MCP Server Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Base dependencies
FROM node:20-alpine AS base
LABEL maintainer="Project Nyra <dev@project-nyra.com>"
LABEL description="Exa MCP Server - AI-powered search and research"

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Stage 3: Production image
FROM base AS production

# Set production environment
ENV NODE_ENV=production \
    MCP_PORT=8007 \
    LOG_LEVEL=info

# Create non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp

# Copy dependencies from dependencies stage
COPY --from=dependencies --chown=mcp:mcp /app/node_modules ./node_modules

# Copy application files
COPY --chown=mcp:mcp . .

# Create necessary directories
RUN mkdir -p /app/cache /app/logs /app/.exa && \
    chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose MCP port
EXPOSE 8007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
    CMD npx @modelcontextprotocol/server-exa health || exit 1

# Start MCP server
CMD ["npx", "@modelcontextprotocol/server-exa", "start", "--port", "8007"]
