# Epic SDK - Multi-tier Model Router
# Coordinates routing across Tier 1 (Agent Booster), Tier 2 (Haiku), Tier 3 (Sonnet/Opus)

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Expose port
EXPOSE 3011

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3011/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run server
CMD ["node", "src/server.js"]
