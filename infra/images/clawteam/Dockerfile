# infra/docker/Dockerfile.clawteam
# ClawTeam Python CLI wrapped in Docker for Portainer management

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tmux \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install ClawTeam from source
RUN git clone https://github.com/HKUDS/ClawTeam.git /tmp/clawteam && \
    cd /tmp/clawteam && \
    pip install --no-cache-dir -e . && \
    cd / && \
    rm -rf /tmp/clawteam

# Create state directory
RUN mkdir -p /root/.clawteam

# Expose web UI port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start ClawTeam board UI
CMD ["clawteam", "board", "serve", "--port", "8080", "--host", "0.0.0.0"]
