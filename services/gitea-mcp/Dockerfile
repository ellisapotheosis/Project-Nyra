# ============================================================================
# Gitea MCP Server - Enhanced
# ============================================================================
# Model Context Protocol server for Gitea repository operations
# Provides file management, branch operations, and PR functionality
# ============================================================================

FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    dumb-init

# Create app user for security
RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY --chown=app:app package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /root/.npm

# Copy application code
COPY --chown=app:app server.js ./

# Switch to app user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3100}/health || exit 1

# Environment variables
ENV NODE_ENV=production \
    PORT=3100 \
    LOG_LEVEL=info

# Expose port (updated to match docker-compose)
EXPOSE 3100

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]