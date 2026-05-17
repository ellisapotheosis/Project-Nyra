FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY server.js /app/server.js
RUN npm i express
EXPOSE 8070
CMD ["node","/app/server.js"]
