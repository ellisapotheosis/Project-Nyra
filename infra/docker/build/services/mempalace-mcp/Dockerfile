FROM python:3.11-slim

# Install system dependencies for ChromaDB and SQLite
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install MemPalace
RUN pip install --no-cache-dir mempalace

# Create workspace directories
RUN mkdir -p /root/.mempalace /data/vault

# Set default workdir
WORKDIR /app

# Environment variables
ENV PYTHONIOENCODING=utf-8
ENV MEMPAL_DIR=/data/vault

# Expose MCP port (default is 8000, but we can change it in compose)
EXPOSE 8000

# Default command starts the MCP server
# Note: Initial "init" and "mine" must be run once after deployment
CMD ["mempalace", "mcp"]
