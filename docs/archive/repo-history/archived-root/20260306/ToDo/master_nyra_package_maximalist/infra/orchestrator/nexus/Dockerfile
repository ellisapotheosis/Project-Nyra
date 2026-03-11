# Custom Nexus image for Project Nyra
#
# Why this exists:
# - We want Nexus as the single entrypoint (MCP aggregator + LLM router)
# - We want optional support for `cmd = ["npx", ...]` MCP servers
# - We want lightweight debugging tools inside the container

FROM ghcr.io/grafbase/nexus:stable

# Nexus images are based on Chainguard/Wolfi (apk). Install minimal tooling.
USER root
RUN apk add --no-cache bash ca-certificates curl jq nodejs npm \
    && update-ca-certificates

# Configs are mounted in docker-compose, but copying lets the image run standalone too.
COPY nexus.toml /etc/nexus.toml
COPY intelligent-routing-config.json /etc/nyra/intelligent-routing-config.json

USER 65532:65532

EXPOSE 8000

# Default command is `nexus` (provided by base image)