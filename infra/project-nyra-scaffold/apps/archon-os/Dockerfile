# ===== ARCHON-OS DOCKERFILE =====
# Knowledge base + task management + planning engine

FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create app directory for knowledge base
RUN mkdir -p /data/archon-kb && chown -R 1000:1000 /data

# Create non-root user
RUN useradd -m -u 1000 app && chown -R app:app /app
USER app

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${ARCHON_PORT:-4001}/health || exit 1

# Environment
ENV PYTHONUNBUFFERED=1
ENV ARCHON_PORT=4001

# Expose
EXPOSE 4001

# Volumes
VOLUME ["/data/archon-kb"]

# Entry
CMD ["python", "-m", "archon.server"]

LABEL org.opencontainers.image.title="Archon OS"
LABEL org.opencontainers.image.description="Knowledge base and planning engine"
