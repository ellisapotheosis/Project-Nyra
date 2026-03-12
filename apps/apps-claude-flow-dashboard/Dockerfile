# Multi-stage build for Claude Flow Live Operations Dashboard

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init curl \
  && npm install -g serve

COPY --from=builder /app/dist ./dist
COPY package.json ./package.json

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3003 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["serve", "-s", "dist", "-l", "3003"]
