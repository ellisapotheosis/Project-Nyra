# Custom Nexus image with curl/jq/bash + config mount
FROM ghcr.io/grafbase/nexus:latest
USER root
RUN (apt-get update && apt-get install -y --no-install-recommends curl jq ca-certificates bash && rm -rf /var/lib/apt/lists/*) || true
COPY nexus.toml /etc/nexus.toml
COPY intelligent-routing-config.json /etc/nyra/intelligent-routing-config.json
COPY mcp-registry.yaml /etc/nyra/mcp-registry.yaml
COPY sentinel.py /opt/nyra/sentinel.py
USER 65532:65532
ENTRYPOINT ["nexus", "--config", "/etc/nexus.toml"]
