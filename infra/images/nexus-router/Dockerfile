FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY services/nexus-router/package*.json ./
RUN npm ci --legacy-peer-deps

COPY services/nexus-router/ ./

FROM node:20-alpine
LABEL org.opencontainers.image.title="Nexus Router"
LABEL org.opencontainers.image.description="Project Nyra API Gateway and Router"
LABEL org.opencontainers.image.source="https://git.projectnyra.com/admin/project-nyra"

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nexus -u 1001 -G nodejs && \
    apk add --no-cache curl

WORKDIR /app

COPY --from=deps --chown=nexus:nodejs /app/package*.json ./
COPY --from=deps --chown=nexus:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nexus:nodejs /app/src ./src
COPY --from=deps --chown=nexus:nodejs /app/tsconfig.json ./tsconfig.json

USER nexus

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7000/health || exit 1

EXPOSE 7000 8080 9091

CMD ["./node_modules/.bin/tsx", "src/index.ts"]
