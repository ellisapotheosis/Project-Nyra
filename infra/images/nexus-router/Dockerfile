FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git curl

COPY package*.json tsconfig.json ./

RUN npm ci --legacy-peer-deps 2>/dev/null || npm install

COPY src ./src

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7000/health || exit 1

EXPOSE 7000

CMD ["npm", "start"]
