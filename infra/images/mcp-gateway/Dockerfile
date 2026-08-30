FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps 2>/dev/null || npm install

COPY src ./src

EXPOSE 3002

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

CMD ["node", "src/index.js"]
