# Archon OS Orchestrator Dockerfile
FROM python:3.11-slim

# Metadata
LABEL maintainer="Archon OS Team"
LABEL description="Archon OS - Advanced Multi-Agent Orchestration System"
LABEL version="1.0.0"

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive \
    ARCHON_HOME=/opt/archon \
    ARCHON_CONFIG=/opt/archon/config \
    ARCHON_DATA=/opt/archon/data

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    build-essential \
    libpq-dev \
    postgresql-client \
    redis-tools \
    netcat-traditional \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create archon user and directories
RUN useradd -m -u 1000 -s /bin/bash archon && \
    mkdir -p ${ARCHON_HOME} ${ARCHON_CONFIG} ${ARCHON_DATA} && \
    chown -R archon:archon ${ARCHON_HOME}

# Set working directory
WORKDIR ${ARCHON_HOME}

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3 \
    pydantic-settings==2.1.0 \
    sqlalchemy==2.0.25 \
    alembic==1.13.1 \
    asyncpg==0.29.0 \
    redis==5.0.1 \
    aioredis==2.0.1 \
    celery==5.3.6 \
    anthropic==0.18.1 \
    openai==1.12.0 \
    litellm==1.30.0 \
    httpx==0.26.0 \
    websockets==12.0 \
    python-multipart==0.0.7 \
    pyyaml==6.0.1 \
    python-dotenv==1.0.1 \
    prometheus-client==0.19.0 \
    structlog==24.1.0 \
    tenacity==8.2.3 \
    psutil==5.9.8

# Install MCP SDK and claude-flow
RUN pip install --no-cache-dir \
    mcp==0.9.0 \
    agentic-flow@latest

# Copy application code
COPY --chown=archon:archon src/ ${ARCHON_HOME}/src/
COPY --chown=archon:archon config/ ${ARCHON_CONFIG}/
COPY --chown=archon:archon init-scripts/ ${ARCHON_HOME}/init-scripts/

# Make init scripts executable
RUN chmod +x ${ARCHON_HOME}/init-scripts/*.sh

# Create necessary directories
RUN mkdir -p \
    ${ARCHON_DATA}/logs \
    ${ARCHON_DATA}/agents \
    ${ARCHON_DATA}/sessions \
    ${ARCHON_DATA}/metrics \
    ${ARCHON_DATA}/checkpoints && \
    chown -R archon:archon ${ARCHON_DATA}

# Switch to archon user
USER archon

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8092/health || exit 1

# Expose ports
EXPOSE 8092 8093

# Set entrypoint
ENTRYPOINT ["./init-scripts/entrypoint.sh"]

# Default command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8092", "--workers", "4"]
