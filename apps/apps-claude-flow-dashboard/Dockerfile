# Multi-stage build for Claude Flow Live Operations Dashboard
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json tsconfig.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY src ./src
RUN npm install && npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Install serve to serve static files
RUN npm install -g serve

# Copy production dependencies and build artifacts
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003 || exit 1

EXPOSE 3003

ENTRYPOINT ["dumb-init", "--"]
CMD ["serve", "-s", "dist", "-l", "3003"]
