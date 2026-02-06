# Multi-stage Dockerfile for Claude-Flow
# Optimized for production with security hardening

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build 2>/dev/null || echo "No build script"

# Stage 3: Runner (Production)
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install production dependencies only
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy configuration (will be overridden by volume mounts)
COPY --chown=nodejs:nodejs config/production ./config/production

# Security: Remove unnecessary files
RUN rm -rf /var/cache/apk/* /tmp/* /root/.npm

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/index.js"]

# Stage 4: Development
FROM node:20-alpine AS development
WORKDIR /app

# Install all dependencies including dev
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose debug port
EXPOSE 3000 9229

# Start with hot reload and debugging
CMD ["npm", "run", "dev"]

# Build arguments
ARG VERSION
ARG BUILD_DATE
ARG NODE_ENV=production

# Labels
LABEL org.opencontainers.image.title="Claude-Flow"
LABEL org.opencontainers.image.description="Multi-agent orchestration platform"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.source="https://github.com/ellisapotheosis/claude-flow"
LABEL org.opencontainers.image.vendor="Project-Nyra"
