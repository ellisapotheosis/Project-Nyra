# ===== QUOTE ENGINE DOCKERFILE =====
# Multi-stage build for lean production image

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build deps
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all deps (including dev for compilation)
RUN npm install

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only runtime deps
COPY package*.json ./
RUN npm install --omit=dev && \
    npm cache clean --force

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8089}/health || exit 1

# Non-root user
RUN addgroup -S app && adduser -S -G app app
USER app

# Environment
ENV NODE_ENV=production
ENV PORT=8089

# Expose port
EXPOSE 8089

# Run
CMD ["node", "dist/server.js"]

# Labels
LABEL org.opencontainers.image.title="Nyra Quote Engine"
LABEL org.opencontainers.image.description="Mortgage pricing & amortization microservice"
LABEL org.opencontainers.image.version="1.0.0"
