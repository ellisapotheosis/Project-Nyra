# ===== OPENCLAW DOCKERFILE =====
# Borrower-facing mortgage assistant agent
# Integrates with Mem0 for borrower context + Nexus for tool access

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

# Create non-root user
RUN useradd -m -u 1000 app && chown -R app:app /app
USER app

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${OPENCLAW_PORT:-9000}/health || exit 1

# Environment
ENV PYTHONUNBUFFERED=1
ENV OPENCLAW_PORT=9000

# Expose
EXPOSE 9000

# Entry
CMD ["python", "-m", "openclaw.server"]

LABEL org.opencontainers.image.title="OpenClaw"
LABEL org.opencontainers.image.description="Mortgage assistant agent with memory"
