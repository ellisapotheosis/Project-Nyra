# VSCode MCP Server Dockerfile
# Based on: https://github.com/juehang/vscode-mcp-server
# Provides code editing operations as MCP tools

FROM node:20-slim

# Set working directory
WORKDIR /app

# Install vscode-mcp-server package
RUN npm install -g @juehang/vscode-mcp-server

# Create workspace directory
RUN mkdir -p /workspace

# Create non-root user
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

# Set permissions
RUN chown -R mcpuser:mcpuser /app /workspace

# Switch to non-root user
USER mcpuser

# Expose HTTP port
EXPOSE 8081

# Environment variables
ENV WORKSPACE_DIR=/workspace
ENV VSCODE_SERVER_PORT=8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -q --spider http://localhost:8081/health || exit 1

# Run the MCP server
CMD ["vscode-mcp-server", "--port", "8081", "--workspace", "/workspace"]
