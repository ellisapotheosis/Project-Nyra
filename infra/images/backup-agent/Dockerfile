# Project Nyra - Backup Agent Multi-Arch Dockerfile
FROM --platform=$TARGETPLATFORM alpine:3.18

LABEL org.opencontainers.image.title="Backup Agent"
LABEL org.opencontainers.image.description="Project Nyra Backup and Sync Agent"
LABEL org.opencontainers.image.source="https://git.projectnyra.com/admin/project-nyra"

# Install required packages
RUN apk add --no-cache \
    postgresql15-client \
    redis \
    aws-cli \
    curl \
    jq \
    tar \
    gzip \
    cron \
    bash \
    && rm -rf /var/cache/apk/*

# Create backup user
RUN addgroup -g 1001 -S backup && \
    adduser -S backup -u 1001 -G backup

# Create directories
RUN mkdir -p /backup/scripts /backup/data /backup/logs && \
    chown -R backup:backup /backup

WORKDIR /backup

# Copy backup scripts
COPY infra/scripts/backup/ ./scripts/
RUN chmod +x ./scripts/*.sh && \
    chown -R backup:backup ./scripts

# Copy cron configuration
COPY infra/configs/backup/crontab /etc/crontabs/backup

# Health check script
RUN echo '#!/bin/bash\n[ -f /backup/logs/last-success ] && [ $(($(date +%s) - $(cat /backup/logs/last-success))) -lt 86400 ]' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Switch to backup user
USER backup

# Health check
HEALTHCHECK --interval=300s --timeout=10s --start-period=30s --retries=3 \
  CMD /healthcheck.sh

# Start cron daemon
CMD ["crond", "-f", "-l", "2"]
