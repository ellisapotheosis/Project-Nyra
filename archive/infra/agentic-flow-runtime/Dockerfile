FROM node:20-bookworm-slim

ARG AGENTIC_FLOW_VERSION=2.0.7

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/agentic-flow
RUN npm install --omit=dev "agentic-flow@${AGENTIC_FLOW_VERSION}" \
  && npm cache clean --force

COPY entrypoint.sh /usr/local/bin/agentic-flow-entrypoint.sh
RUN chmod +x /usr/local/bin/agentic-flow-entrypoint.sh

ENV PATH="/opt/agentic-flow/node_modules/.bin:${PATH}"
USER node
WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/agentic-flow-entrypoint.sh"]
