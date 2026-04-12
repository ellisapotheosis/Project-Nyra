# ============================================================================
# GitHub <-> Gitea Synchronization Service
# ============================================================================
# Handles bidirectional sync between GitHub and Gitea repositories
# Supports conflict resolution and automated mirroring
# ============================================================================

FROM alpine/git:2.40.1

# Install required packages
RUN apk add --no-cache \
    bash \
    curl \
    jq \
    python3 \
    py3-pip \
    py3-requests \
    openssh-client \
    && rm -rf /var/cache/apk/*

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Create app user
RUN adduser -D -s /bin/bash syncuser

# Set up directories
RUN mkdir -p /app /data /logs \
    && chown -R syncuser:syncuser /app /data /logs

# Copy application files
COPY sync-service.py /app/
COPY entrypoint.sh /app/
COPY config.yaml.template /app/

# Make scripts executable
RUN chmod +x /app/entrypoint.sh /app/sync-service.py

# Switch to app user
USER syncuser

# Working directory
WORKDIR /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Default environment variables
ENV SYNC_INTERVAL=300 \
    LOG_LEVEL=info \
    CONFLICT_RESOLUTION=gitea_wins \
    SYNC_DIRECTION=bidirectional

# Expose health check port
EXPOSE 8080

# Entry point
ENTRYPOINT ["/app/entrypoint.sh"]