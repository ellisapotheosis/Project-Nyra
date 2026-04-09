FROM node:20-bookworm-slim
WORKDIR /srv/openclaw
RUN apt-get update && apt-get install -y --no-install-recommends git curl ca-certificates bash python3 make g++ && rm -rf /var/lib/apt/lists/*
ARG OPENCLAW_REPO=https://github.com/openclaw/clawhub.git
RUN git clone --depth=1 ${OPENCLAW_REPO} /srv/openclaw/src
WORKDIR /srv/openclaw/src
# Install is best-effort (upstream may change package manager/workspace)
RUN (corepack enable && pnpm -v && pnpm install --frozen-lockfile) || \
    (npm install) || true
COPY entrypoint.sh /usr/local/bin/openclaw-entrypoint.sh
RUN chmod +x /usr/local/bin/openclaw-entrypoint.sh
EXPOSE 3010 3011
ENTRYPOINT ["/usr/local/bin/openclaw-entrypoint.sh"]
