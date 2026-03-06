# Bitwarden MCP Server Dockerfile
# Provides secure secrets management as MCP tools

FROM node:20-slim

# Set working directory
WORKDIR /app

# Install Bitwarden CLI
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://vault.bitwarden.com/download/?app=cli&platform=linux -O bw.zip && \
    unzip bw.zip && \
    chmod +x bw && \
    mv bw /usr/local/bin/ && \
    rm bw.zip && \
    rm -rf /var/lib/apt/lists/*

# Install MCP server package
RUN npm install -g @modelcontextprotocol/server-bitwarden

# Create non-root user
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

# Create session directory
RUN mkdir -p /home/mcpuser/.config/Bitwarden\ CLI && \
    chown -R mcpuser:mcpuser /home/mcpuser /app

# Switch to non-root user
USER mcpuser

# Expose HTTP port
EXPOSE 8087

# Environment variables
ENV BW_SESSION=""
ENV BITWARDEN_SERVER_URL=""
ENV BITWARDEN_CLIENT_ID=""
ENV BITWARDEN_CLIENT_SECRET=""

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -q --spider http://localhost:8087/health || exit 1

# Run the MCP server
CMD ["bitwarden-mcp-server", "--port", "8087"]
