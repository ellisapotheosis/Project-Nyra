FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl git ca-certificates && rm -rf /var/lib/apt/lists/*
COPY server.js /app/server.js
RUN npm i express ws
EXPOSE 8072
CMD ["node","/app/server.js"]
