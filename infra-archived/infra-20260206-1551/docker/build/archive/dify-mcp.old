# Dify MCP Proxy Dockerfile
# Custom proxy to expose Dify apps as MCP tools
# Dify v1.6.0+ has native MCP support

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Create non-root user
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser
RUN chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Expose HTTP port
EXPOSE 8083

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8083/health')" || exit 1

# Run the MCP proxy
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8083"]
