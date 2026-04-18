FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache git
RUN git clone --depth=1 https://github.com/nyra-stack/mcp-openwebui-docker-orchestrator . \
 && npm ci --omit=dev || npm i --omit=dev
ENV NODE_ENV=production
EXPOSE 3001 4200
CMD ["npm", "start"]
