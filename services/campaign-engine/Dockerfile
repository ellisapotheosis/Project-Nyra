# Dockerfile for Campaign Engine (Node.js)

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 8002
CMD ["npm", "start"]
