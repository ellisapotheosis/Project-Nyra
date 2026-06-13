FROM node:20-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

COPY server.mjs .

# Create cache directory for llxprt-code
RUN mkdir -p /tmp/.cache/nyra-llxprt-code && chmod -R 777 /tmp/.cache/nyra-llxprt-code

EXPOSE 8090

CMD ["node", "server.mjs"]
