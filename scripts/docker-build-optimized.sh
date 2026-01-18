#!/bin/bash
# ==================================================================
# Optimized Docker Build Script with Layer Caching
# ==================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
REPO_NAME="${GITHUB_REPOSITORY:-project-nyra}"
BUILD_CACHE_DIR="${BUILD_CACHE_DIR:-.docker-cache}"

# Function to print colored messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Create cache directory
mkdir -p "$BUILD_CACHE_DIR"

log_info "Starting optimized Docker build..."

# Get Git information for tagging
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log_info "Build Info:"
log_info "  Branch: $GIT_BRANCH"
log_info "  SHA: $GIT_SHA"
log_info "  Date: $BUILD_DATE"

# Function to build an image with caching
build_image() {
    local SERVICE=$1
    local TARGET=$2
    local IMAGE_NAME="$REGISTRY/$REPO_NAME/$SERVICE"
    local CACHE_FROM="type=local,src=$BUILD_CACHE_DIR/$SERVICE"
    local CACHE_TO="type=local,dest=$BUILD_CACHE_DIR/$SERVICE,mode=max"

    log_info "Building $SERVICE ($TARGET)..."

    docker buildx build \
        --file Dockerfile.optimized \
        --target "$TARGET" \
        --cache-from "$CACHE_FROM" \
        --cache-to "$CACHE_TO" \
        --tag "$IMAGE_NAME:latest" \
        --tag "$IMAGE_NAME:$GIT_BRANCH" \
        --tag "$IMAGE_NAME:$GIT_SHA" \
        --build-arg NODE_ENV=production \
        --build-arg VERSION="$GIT_SHA" \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --load \
        .

    log_info "✓ Built $SERVICE successfully"
}

# Function to measure build time
time_build() {
    local START_TIME=$(date +%s)
    "$@"
    local END_TIME=$(date +%s)
    local DURATION=$((END_TIME - START_TIME))
    log_info "Build completed in ${DURATION}s"
}

# Parse command line arguments
SERVICES="${1:-all}"
TARGET="${2:-runner-nextjs}"

case "$SERVICES" in
    all)
        log_info "Building all services..."
        time_build build_image "ratehunter" "runner-nextjs"
        time_build build_image "nyra-admin" "runner-nextjs"
        time_build build_image "quote-api" "runner-python"
        time_build build_image "nexus-router" "runner-nextjs"
        ;;
    ratehunter|nyra-admin|nexus-router)
        time_build build_image "$SERVICES" "runner-nextjs"
        ;;
    quote-api|campaign-engine)
        time_build build_image "$SERVICES" "runner-python"
        ;;
    dev)
        log_info "Building development image..."
        time_build build_image "dev" "development"
        ;;
    *)
        log_error "Unknown service: $SERVICES"
        log_info "Usage: $0 [all|ratehunter|nyra-admin|quote-api|nexus-router|dev] [target]"
        exit 1
        ;;
esac

log_info "All builds completed successfully!"
log_info "Cache stored in: $BUILD_CACHE_DIR"

# Show cache size
if [ -d "$BUILD_CACHE_DIR" ]; then
    CACHE_SIZE=$(du -sh "$BUILD_CACHE_DIR" | cut -f1)
    log_info "Cache size: $CACHE_SIZE"
fi
