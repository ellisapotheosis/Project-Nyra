FROM node:20-bookworm-slim

ARG RUFLO_VERSION=3.5.15
ARG CLAUDE_FLOW_VERSION=3.5.15
ARG AGENTIC_FLOW_VERSION=2.0.7
ARG AGENTDB_VERSION=3.0.0-alpha.10
ARG RUVECTOR_VERSION=0.2.12
ARG AGENT_BOOSTER_VERSION=0.2.2
ARG CLAUDE_FLOW_MEMORY_VERSION=3.0.0-alpha.11
ARG CLAUDE_FLOW_MCP_VERSION=3.0.0-alpha.8
ARG CLAUDE_FLOW_NEURAL_VERSION=3.0.0-alpha.7
ARG CLAUDE_FLOW_CODEX_VERSION=3.0.0-alpha.9
ARG EPIC_SDK_SPEC=

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash curl git ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/ruflo

COPY package.json ./package.json
COPY scripts ./scripts
RUN npm install --omit=dev \
  && npm install --omit=dev \
    "ruflo@${RUFLO_VERSION}" \
    "claude-flow@${CLAUDE_FLOW_VERSION}" \
    "agentic-flow@${AGENTIC_FLOW_VERSION}" \
    "agentdb@${AGENTDB_VERSION}" \
    "ruvector@${RUVECTOR_VERSION}" \
    "agent-booster@${AGENT_BOOSTER_VERSION}" \
    "@claude-flow/memory@${CLAUDE_FLOW_MEMORY_VERSION}" \
    "@claude-flow/mcp@${CLAUDE_FLOW_MCP_VERSION}" \
    "@claude-flow/neural@${CLAUDE_FLOW_NEURAL_VERSION}" \
    "@claude-flow/codex@${CLAUDE_FLOW_CODEX_VERSION}" \
  && if [ -n "$EPIC_SDK_SPEC" ]; then npm install --omit=dev "$EPIC_SDK_SPEC"; fi \
  && npm cache clean --force

COPY entrypoint.sh /usr/local/bin/ruflo-entrypoint.sh
RUN chmod +x /usr/local/bin/ruflo-entrypoint.sh

USER node
WORKDIR /workspace
ENV PATH="/opt/ruflo/node_modules/.bin:${PATH}"
ENTRYPOINT ["/usr/local/bin/ruflo-entrypoint.sh"]
