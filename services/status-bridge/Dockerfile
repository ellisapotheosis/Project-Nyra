FROM node:20-alpine

WORKDIR /app
COPY services/status-bridge/package.json ./package.json
COPY services/status-bridge/src ./src

ENV NODE_ENV=production
EXPOSE 8787

CMD ["node", "src/server.js"]
