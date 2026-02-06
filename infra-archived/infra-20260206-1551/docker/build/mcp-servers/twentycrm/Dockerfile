# TwentyCRM MCP Server Dockerfile
# Based on: https://github.com/mhenry3164/twenty-crm-mcp-server
# Provides TwentyCRM operations as MCP tools

FROM node:20-slim

# Set working directory
WORKDIR /app

# Install git (needed for npm install from GitHub)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Clone and install the twenty-crm-mcp-server
RUN git clone https://github.com/mhenry3164/twenty-crm-mcp-server.git . && \
    npm install && \
    npm run build

# Create non-root user
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

# Set permissions
RUN chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Expose HTTP port
EXPOSE 8082

# Environment variables
ENV TWENTY_API_URL=http://twentycrm:3000/graphql
ENV TWENTY_WORKSPACE_ID=default
ENV MCP_SERVER_PORT=8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -q --spider http://localhost:8082/health || exit 1

# Run the MCP server
CMD ["node", "dist/index.js", "--port", "8082"]
