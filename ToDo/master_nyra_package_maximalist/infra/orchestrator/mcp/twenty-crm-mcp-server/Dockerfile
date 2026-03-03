FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /app

# NOTE: This MCP server is distributed as source (MIT). We clone at build time.
# If you prefer a fully offline build, vendor the repo here and replace this block.
ARG TWENTY_MCP_REF=main
RUN git clone --depth 1 --branch "${TWENTY_MCP_REF}" https://github.com/mhenry3164/twenty-crm-mcp-server.git .

RUN npm ci --omit=dev

ENV NODE_ENV=production

# MCP servers commonly speak JSON-RPC over STDIO.
ENTRYPOINT ["node", "/app/index.js"]