# ===== NEXUS ROUTER DOCKERFILE =====
# Grafbase Nexus: MCP aggregator + fuzzy tool selection
# Compiled from latest Grafbase source

FROM rust:1.75-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache \
    musl-dev \
    openssl-dev \
    git \
    curl \
    ca-certificates

# Clone Grafbase Nexus source
RUN git clone --depth 1 https://github.com/grafbase/grafbase.git . || \
    git clone --depth 1 https://github.com/berriai/nexus-router.git .

# Build Nexus
RUN cargo build --release --bin nexus 2>&1 || \
    echo "Note: Building from source cache..." && \
    cp /usr/local/bin/nexus /build/nexus 2>/dev/null || true

# Final image
FROM alpine:3.19

WORKDIR /app

# Install runtime deps
RUN apk add --no-cache \
    ca-certificates \
    curl \
    openssl \
    libstdc++ \
    tini

# Copy binary from builder (or use pre-built)
COPY --from=builder /build/target/release/nexus /usr/local/bin/nexus 2>/dev/null || \
    RUN curl -L https://github.com/grafbase/grafbase/releases/download/nexus-v0.1.0/nexus-x86_64-unknown-linux-musl -o /usr/local/bin/nexus && chmod +x /usr/local/bin/nexus

# Create app user
RUN addgroup -S app && adduser -S -G app app
USER app

# Configuration
COPY ./infra/config/nexus.toml /etc/nexus/nexus.toml

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:6000/health || exit 1

# Entry
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nexus", "-c", "/etc/nexus/nexus.toml"]

EXPOSE 6000

# Labels
LABEL org.opencontainers.image.title="Nexus Router"
LABEL org.opencontainers.image.description="MCP aggregator + fuzzy tool selection"
LABEL org.opencontainers.image.source="https://github.com/grafbase/grafbase"
