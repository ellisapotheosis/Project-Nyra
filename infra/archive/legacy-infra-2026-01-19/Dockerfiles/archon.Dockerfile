# ============================================================================
# Archon OS Dockerfile - Multi-Stage Build
# Python 3.11 + FastAPI + AI Framework
# ============================================================================

# Stage 1: Base Image
FROM python:3.11-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry for dependency management
ENV POETRY_VERSION=1.7.1 \
    POETRY_HOME=/opt/poetry \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry

# ============================================================================
# Stage 2: Dependencies
FROM base AS dependencies

WORKDIR /app

# Copy dependency files
COPY tools/archon-os/pyproject.toml tools/archon-os/poetry.lock* ./

# Install dependencies
RUN poetry install --no-root --only main && \
    rm -rf $POETRY_CACHE_DIR

# ============================================================================
# Stage 3: Builder
FROM dependencies AS builder

WORKDIR /app

# Copy source code
COPY tools/archon-os ./

# Install the application
RUN poetry install --only main

# ============================================================================
# Stage 4: Runtime
FROM python:3.11-slim AS runtime

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    libpq5 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r archon && \
    useradd -r -g archon -s /bin/bash -d /app archon

WORKDIR /app

# Copy virtual environment and application
COPY --from=builder --chown=archon:archon /app/.venv /app/.venv
COPY --from=builder --chown=archon:archon /app /app

# Create necessary directories
RUN mkdir -p /app/data /app/logs /app/config /app/.archon && \
    chown -R archon:archon /app

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Switch to non-root user
USER archon

# Expose ports
EXPOSE 8000 9091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"

# Set environment variables
ENV PYTHON_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=8000

# Start command using Uvicorn
CMD ["uvicorn", "archon.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# Labels
LABEL maintainer="Project Nyra <dev@projectnyra.com>" \
      org.opencontainers.image.title="Archon OS" \
      org.opencontainers.image.description="AI Operating System Framework" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Project Nyra" \
      org.opencontainers.image.source="https://github.com/projectnyra/nyra"
