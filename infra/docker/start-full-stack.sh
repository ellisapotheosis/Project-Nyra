#!/bin/bash
# ============================================================================
# Project Nyra - Full Stack Startup Script
# ============================================================================
# Starts the complete Nyra infrastructure stack with proper dependency ordering
#
# Usage:
#   ./start-full-stack.sh [environment]
#
# Arguments:
#   environment - dev, prod, or full (default: full)
#
# Examples:
#   ./start-full-stack.sh          # Start full stack
#   ./start-full-stack.sh dev      # Start development stack
#   ./start-full-stack.sh prod     # Start production stack
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
ENVIRONMENT="${1:-full}"
COMPOSE_FILE=""
USE_INFISICAL="${USE_INFISICAL:-false}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
INFISICAL_ENV="${INFISICAL_ENV:-dev}"

# Functions
print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Determine compose file
case "$ENVIRONMENT" in
    dev)
        COMPOSE_FILE="docker-compose.dev.yml"
        ;;
    prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        USE_INFISICAL="true"  # Production requires Infisical
        ;;
    full)
        COMPOSE_FILE="docker-compose.full.yml"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        echo "Valid options: dev, prod, full"
        exit 1
        ;;
esac

# Main execution
print_header "Starting Project Nyra - $ENVIRONMENT Stack"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop or Docker daemon."
    exit 1
fi

print_info "Docker is running"

# Check if docker-compose file exists
if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
    print_error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi

print_info "Using compose file: $COMPOSE_FILE"

# Check for Infisical
if [ "$USE_INFISICAL" = "true" ]; then
    if ! command -v infisical &> /dev/null; then
        print_error "Infisical CLI not found. Production requires Infisical for secret management."
        print_info "Install from: https://infisical.com/docs/cli/overview"
        exit 1
    fi

    print_info "Infisical CLI detected"
    print_info "Project ID: $INFISICAL_PROJECT_ID"
    print_info "Environment: $INFISICAL_ENV"
fi

# Check for required environment variables if not using Infisical
if [ "$USE_INFISICAL" != "true" ] && [ ! -f "$SCRIPT_DIR/.env" ]; then
    print_warn "No .env file found. Using default values from compose file."
    print_warn "For production use, configure Infisical or create a .env file."
fi

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p "$SCRIPT_DIR/backups/postgres"
mkdir -p "$SCRIPT_DIR/backups/redis"
mkdir -p "$SCRIPT_DIR/backups/falkordb"
mkdir -p "$SCRIPT_DIR/backups/qdrant"
mkdir -p "$SCRIPT_DIR/logs/claude-flow"
mkdir -p "$SCRIPT_DIR/logs/archon-os"
mkdir -p "$SCRIPT_DIR/logs/nexus-router"
mkdir -p "$SCRIPT_DIR/logs/letta"

# Pull latest images
print_info "Pulling latest Docker images..."
if [ "$USE_INFISICAL" = "true" ]; then
    infisical run --projectId="$INFISICAL_PROJECT_ID" \
        --env="$INFISICAL_ENV" --path="/shared" -- \
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" pull
else
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" pull
fi

# Stop any running containers from previous runs
print_info "Stopping any existing containers..."
if [ "$USE_INFISICAL" = "true" ]; then
    infisical run --projectId="$INFISICAL_PROJECT_ID" \
        --env="$INFISICAL_ENV" --path="/shared" -- \
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" down
else
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" down
fi

# Start the stack
print_header "Starting Services"

if [ "$USE_INFISICAL" = "true" ]; then
    print_info "Starting with Infisical secret management..."
    infisical run --projectId="$INFISICAL_PROJECT_ID" \
        --env="$INFISICAL_ENV" --path="/shared" -- \
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d
else
    print_info "Starting stack..."
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d
fi

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
echo ""

sleep 10  # Give services time to start

# Check health status
print_header "Health Check Status"

# Function to check service health
check_service_health() {
    local service=$1
    local container=$2
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")

        if [ "$health_status" = "healthy" ]; then
            print_success "$service is healthy"
            return 0
        elif [ "$health_status" = "no-healthcheck" ]; then
            # Check if container is running
            if docker ps --filter "name=$container" --format '{{.Names}}' | grep -q "$container"; then
                print_success "$service is running (no health check configured)"
                return 0
            else
                print_error "$service is not running"
                return 1
            fi
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    print_warn "$service health check timeout (status: $health_status)"
    return 1
}

# Check core services
if [ "$ENVIRONMENT" = "full" ] || [ "$ENVIRONMENT" = "prod" ]; then
    check_service_health "PostgreSQL" "nyra-postgres*"
    check_service_health "Redis" "nyra-redis*"
    check_service_health "FalkorDB" "nyra-falkordb*"
    check_service_health "Qdrant" "nyra-qdrant*"
    check_service_health "Claude Flow" "nyra-claude-flow*"
    check_service_health "Archon OS" "nyra-archon-os*"
    check_service_health "Nexus Router" "nyra-nexus-router*"
    check_service_health "Letta" "nyra-letta*"
    check_service_health "Open-WebUI" "nyra-open-webui*"
fi

# Display service URLs
print_header "Service URLs"

if [ "$ENVIRONMENT" = "dev" ]; then
    echo -e "${GREEN}Development Stack:${NC}"
    echo ""
    echo -e "  Open-WebUI:       ${BLUE}http://localhost:3210${NC}"
    echo -e "  Claude Flow:      ${BLUE}http://localhost:9000${NC}"
    echo -e "  Nexus Router:     ${BLUE}http://localhost:8000${NC}"
    echo -e "  Letta:            ${BLUE}http://localhost:8283${NC}"
    echo -e "  n8n:              ${BLUE}http://localhost:5678${NC}"
    echo -e "  Grafana:          ${BLUE}http://localhost:3000${NC}"
    echo -e "  Prometheus:       ${BLUE}http://localhost:9090${NC}"
    echo -e "  pgAdmin:          ${BLUE}http://localhost:5050${NC}"
    echo -e "  Redis Commander:  ${BLUE}http://localhost:8081${NC}"
    echo -e "  Portainer:        ${BLUE}https://localhost:9443${NC}"
    echo -e "  Mailhog:          ${BLUE}http://localhost:8025${NC}"
elif [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${GREEN}Production Stack:${NC}"
    echo ""
    echo -e "  Open-WebUI:       ${BLUE}http://localhost:3210${NC}"
    echo -e "  Grafana:          ${BLUE}http://localhost:3000${NC}"
    echo -e "  ${YELLOW}(All other services bound to 127.0.0.1 only)${NC}"
elif [ "$ENVIRONMENT" = "full" ]; then
    echo -e "${GREEN}Full Stack:${NC}"
    echo ""
    echo -e "  Open-WebUI:       ${BLUE}http://localhost:3210${NC}"
    echo -e "  LobeChat:         ${BLUE}http://localhost:3211${NC}"
    echo -e "  Claude Flow:      ${BLUE}http://localhost:9000${NC}"
    echo -e "  Archon OS:        ${BLUE}http://localhost:9001${NC}"
    echo -e "  Nexus Router:     ${BLUE}http://localhost:8000${NC}"
    echo -e "  Letta:            ${BLUE}http://localhost:8283${NC}"
    echo -e "  n8n:              ${BLUE}http://localhost:5678${NC}"
    echo -e "  Grafana:          ${BLUE}http://localhost:3000${NC}"
    echo -e "  Prometheus:       ${BLUE}http://localhost:9090${NC}"
fi

echo ""
print_header "Startup Complete"
print_success "Project Nyra $ENVIRONMENT stack is running!"
echo ""
print_info "To view logs: ./logs-all.sh"
print_info "To check health: ./health-check.sh"
print_info "To stop all services: ./stop-all.sh"
echo ""
