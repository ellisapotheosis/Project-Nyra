# ===== CLAUDE-FLOW DOCKERFILE =====
# Development orchestrator agent for repo management + code automation

FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create non-root user
RUN useradd -m -u 1000 app && chown -R app:app /app
USER app

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${CLAUDE_FLOW_PORT:-8080}/health || exit 1

# Environment
ENV PYTHONUNBUFFERED=1
ENV CLAUDE_FLOW_PORT=8080

# Expose
EXPOSE 8080

# Entry
CMD ["python", "-m", "claude_flow.server"]

LABEL org.opencontainers.image.title="Claude-Flow"
LABEL org.opencontainers.image.description="Development orchestrator agent"
