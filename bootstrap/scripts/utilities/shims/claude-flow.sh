#!/usr/bin/env bash
# Claude Flow Docker Shim for WSL/Linux
# Routes CLI commands to Docker container with Infisical secret injection

set -euo pipefail

CONTAINER_NAME="nyra-claude-flow-mcp"
INFISICAL_ENV="${INFISICAL_ENV:-development}"
INFISICAL_PATH="${INFISICAL_PATH:-/nyra/claude-flow}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Please start Docker."
    exit 1
fi

# Check container status
CONTAINER_STATUS=$(docker ps -a -f "name=${CONTAINER_NAME}" --format "{{.Status}}" 2>/dev/null || echo "")

if [ -z "$CONTAINER_STATUS" ]; then
    error "Container ${CONTAINER_NAME} does not exist."
    error "Run: docker-compose -f docker-compose.infisical.yml up -d claude-flow-mcp"
    exit 1
fi

# Auto-start if container is stopped
if ! echo "$CONTAINER_STATUS" | grep -q "Up"; then
    info "Starting container ${CONTAINER_NAME}..."
    if ! docker start "${CONTAINER_NAME}" >/dev/null 2>&1; then
        error "Failed to start container ${CONTAINER_NAME}"
        exit 1
    fi
    sleep 3
    info "Container started successfully."
fi

# Execute command with Infisical secret injection
if [ $# -eq 0 ]; then
    # No arguments - show help
    docker exec "${CONTAINER_NAME}" npx @claude-flow/cli@latest --help
else
    # Pass all arguments with Infisical wrapping
    docker exec \
        -e INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-}" \
        -e INFISICAL_TOKEN="${INFISICAL_TOKEN:-}" \
        "${CONTAINER_NAME}" \
        sh -c "infisical run --env=${INFISICAL_ENV} --path=${INFISICAL_PATH} -- npx @claude-flow/cli@latest $*"
fi
