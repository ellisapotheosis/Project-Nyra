# ==============================================================================
# Nexus Router with Infisical Integration
# ==============================================================================
# Extends the official Nexus Router image with Infisical CLI for secure
# secret management and environment variable injection at runtime.
#
# Features:
# - Infisical CLI for secrets management
# - Runtime secret injection via infisical run
# - Health checks for service availability
# - Non-root user execution (inherited from base image)
#
# Build Args:
#   NEXUS_VERSION - Version of Nexus Router to use (default: latest)
#
# Environment Variables Required:
#   INFISICAL_TOKEN - Infisical machine identity token
#
# Usage:
#   docker build -t nyra-nexus-router:latest .
#   docker run -e INFISICAL_TOKEN=xxx nyra-nexus-router:latest
# ==============================================================================

ARG NEXUS_VERSION=latest
FROM ghcr.io/grafbase/nexus:${NEXUS_VERSION} AS base

LABEL maintainer="Project Nyra Team" \
      version="1.0.0" \
      description="Nexus Router with Infisical secrets management" \
      com.nyra.service="nexus-router" \
      com.nyra.category="infrastructure" \
      com.nyra.security="infisical-enabled"

# ==============================================================================
# Stage 1: Install Infisical CLI
# ==============================================================================
USER root

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    ca-certificates \
    wget

# Install Infisical CLI binary directly (works with any Linux distro)
# Using official install script that works universally
RUN mkdir -p /usr/local/bin \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' \
    | distro=alpine codename=v3.19 bash \
    && apk add infisical \
    || ( \
        # Fallback: manual binary install if package installation fails
        wget -qO- https://get.infisical.com/cli | sh \
    )

# Create directories for configs and secrets
RUN mkdir -p /etc/nexus /app/config /app/secrets \
    && chown -R nobody:nobody /app

# ==============================================================================
# Stage 2: Setup Entrypoint with Infisical Wrapper
# ==============================================================================

# Copy entrypoint script
COPY --chown=nobody:nobody entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Verify Infisical installation
RUN infisical --version

# ==============================================================================
# Stage 3: Configuration and Runtime
# ==============================================================================

# Switch back to non-root user (nobody is already in base image)
USER nobody

# Set working directory
WORKDIR /app

# Expose Nexus Router port
EXPOSE 6000

# Health check endpoint (using curl for consistency)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:6000/health || exit 1

# Set entrypoint to use Infisical wrapper
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command (will be wrapped by infisical run in entrypoint)
CMD ["nexus"]
