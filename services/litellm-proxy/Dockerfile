# LiteLLM Proxy - Production Dockerfile
FROM python:3.11-slim

LABEL maintainer="Project Nyra <team@project-nyra.com>"
LABEL description="LiteLLM Proxy for unified LLM model access with cost optimization"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install LiteLLM
RUN pip install --no-cache-dir litellm[proxy]==1.54.0

# Create config directory
RUN mkdir -p /app/config

# Copy configuration files
COPY config/config.yaml /app/config/config.yaml

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Set environment variables
ENV LITELLM_MODE=PRODUCTION
ENV LITELLM_CONFIG_PATH=/app/config/config.yaml
ENV PORT=4000

# Run LiteLLM proxy
CMD ["litellm", "--config", "/app/config/config.yaml", "--port", "4000", "--num_workers", "4"]
