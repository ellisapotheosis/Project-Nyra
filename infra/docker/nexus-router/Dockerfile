FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

COPY services/nexus-router/package*.json ./
RUN npm install --omit=dev

COPY services/nexus-router/tsconfig.json ./tsconfig.json
COPY services/nexus-router/src ./src

RUN npm run build

EXPOSE 7000 8080 9091

CMD ["npm", "run", "start"]
