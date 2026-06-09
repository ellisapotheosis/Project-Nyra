FROM node:20-alpine

WORKDIR /app

# Install dependencies (none needed besides standard node)
# But we need npm for the spawn command in server.mjs

RUN apk add --no-cache npm git

COPY server.mjs .

# Create cache directory for llxprt-code
RUN mkdir -p /tmp/.cache/nyra-llxprt-code && chmod -R 777 /tmp/.cache/nyra-llxprt-code

EXPOSE 8090

CMD ["node", "server.mjs"]
