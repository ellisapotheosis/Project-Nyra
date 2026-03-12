# Xenova/Transformers Embedding Service
# WASM SIMD-accelerated embeddings for AgentDB integration
# Runs on orchestrator PC only

FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application files
COPY app/ /app/

# Create cache directory for models
RUN mkdir -p /app/models /app/cache

# Expose embedding API port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Run embedding service
CMD ["node", "server.js"]
