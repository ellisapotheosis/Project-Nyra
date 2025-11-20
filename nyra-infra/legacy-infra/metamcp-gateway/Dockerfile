FROM node:20-alpine

WORKDIR /app

# Keep image small; install gateway as a dependency
RUN npm init -y && npm i @modelcontextprotocol/gateway@latest

# Copy config (written below)
COPY metamcp.config.json /app/metamcp.config.json

# Conventional port
EXPOSE 12008
ENV PORT=12008
ENV HOST=0.0.0.0

# Run the gateway listening publicly
CMD ["node", "./node_modules/@modelcontextprotocol/gateway/dist/index.js", \
     "--config", "/app/metamcp.config.json", "--host", "0.0.0.0", "--port", "12008"]
