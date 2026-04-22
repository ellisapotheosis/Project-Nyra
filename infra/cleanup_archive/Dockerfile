FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build (if TypeScript)
RUN npm run build 2>/dev/null || true

# Production stage
FROM node:20-alpine

WORKDIR /app

# Runtime deps (curl for health checks)
RUN apk add --no-cache curl

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/nexus.toml ./nexus.toml

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:6000/health || exit 1

EXPOSE 6000

CMD ["node", "dist/index.js"]
