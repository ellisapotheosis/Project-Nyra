FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
# Replace with your preferred n8n MCP server package when pinning exact upstream
RUN npm i -g @modelcontextprotocol/sdk express || true
COPY server.js /app/server.js
EXPOSE 8071
CMD ["node","/app/server.js"]
