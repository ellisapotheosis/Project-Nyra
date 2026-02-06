FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies first to leverage Docker cache
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy the application code
COPY server.js ./

EXPOSE 8054

CMD ["node", "server.js"]