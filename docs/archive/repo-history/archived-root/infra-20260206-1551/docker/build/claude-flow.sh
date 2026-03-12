#!/bin/bash
# Claude Flow V3 Alpha - Docker Management Script
# Quick commands for building, deploying, and managing the container

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/infra/docker/apps/docker-compose.apps.yml"
DOCKERFILE="$PROJECT_ROOT/infra/docker/build/claude-flow.Dockerfile"
SERVICE_NAME="claude-flow-alpha"
CONTAINER_NAME="nyra-claude-flow-alpha"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if docker and docker-compose are installed
check_requirements() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
}

# Build the container
build() {
    info "Building Claude Flow Alpha container..."
    cd "$PROJECT_ROOT"

    docker build \
        -f "$DOCKERFILE" \
        --target production \
        --build-arg VERSION=3.0.0-alpha \
        --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
        --build-arg GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") \
        -t claude-flow:alpha \
        .

    success "Container built successfully"
}

# Build using docker-compose
compose_build() {
    info "Building using docker-compose..."
    docker-compose -f "$COMPOSE_FILE" build "$SERVICE_NAME"
    success "Docker Compose build completed"
}

# Start the service
start() {
    info "Starting Claude Flow Alpha service..."
    docker-compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"
    success "Service started"

    info "Waiting for service to be healthy..."
    sleep 10
    docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME"
}

# Stop the service
stop() {
    info "Stopping Claude Flow Alpha service..."
    docker-compose -f "$COMPOSE_FILE" stop "$SERVICE_NAME"
    success "Service stopped"
}

# Restart the service
restart() {
    info "Restarting Claude Flow Alpha service..."
    docker-compose -f "$COMPOSE_FILE" restart "$SERVICE_NAME"
    success "Service restarted"
}

# View logs
logs() {
    info "Showing logs for Claude Flow Alpha..."
    docker-compose -f "$COMPOSE_FILE" logs -f "$SERVICE_NAME"
}

# Show status
status() {
    info "Checking Claude Flow Alpha status..."

    # Check if container is running
    if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        success "Container is running"
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        # Check health
        info "Checking health status..."
        docker exec "$CONTAINER_NAME" npx @claude-flow/cli@latest status || warning "Health check command failed"
    else
        warning "Container is not running"
    fi
}

# Access shell
shell() {
    info "Opening shell in Claude Flow Alpha container..."
    docker exec -it "$CONTAINER_NAME" sh
}

# View application logs (not docker logs)
app_logs() {
    info "Viewing application logs..."
    docker exec "$CONTAINER_NAME" tail -f /app/logs/claude-flow.log
}

# Check configuration
config() {
    info "Viewing Claude Flow configuration..."
    docker exec "$CONTAINER_NAME" cat /app/claude-flow.config.json | jq .
}

# Health check
health() {
    info "Running health check..."

    # Check container health
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        success "Container health: $HEALTH_STATUS"
    elif [ "$HEALTH_STATUS" = "starting" ]; then
        warning "Container health: $HEALTH_STATUS (waiting for startup)"
    else
        error "Container health: $HEALTH_STATUS"
    fi

    # Check MCP endpoint
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        success "MCP endpoint is responding"
    else
        warning "MCP endpoint is not responding"
    fi
}

# Clean up volumes
clean() {
    warning "This will remove all Claude Flow volumes and data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        info "Stopping service..."
        docker-compose -f "$COMPOSE_FILE" down -v "$SERVICE_NAME"

        info "Removing volumes..."
        docker volume rm claude-flow-alpha-data 2>/dev/null || true
        docker volume rm claude-flow-alpha-logs 2>/dev/null || true
        docker volume rm claude-flow-alpha-claude-flow 2>/dev/null || true
        docker volume rm claude-flow-alpha-cache 2>/dev/null || true
        docker volume rm claude-flow-alpha-sessions 2>/dev/null || true
        docker volume rm claude-flow-alpha-memory 2>/dev/null || true

        success "Cleanup completed"
    else
        info "Cleanup cancelled"
    fi
}

# Backup volumes
backup() {
    BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
    BACKUP_FILE="$BACKUP_DIR/claude-flow-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"

    info "Backing up Claude Flow volumes to $BACKUP_FILE..."
    docker run --rm \
        -v claude-flow-alpha-data:/data \
        -v claude-flow-alpha-logs:/logs \
        -v claude-flow-alpha-memory:/memory \
        -v "$BACKUP_DIR:/backup" \
        alpine tar czf "/backup/$(basename $BACKUP_FILE)" /data /logs /memory

    success "Backup created: $BACKUP_FILE"
}

# Restore from backup
restore() {
    if [ -z "$1" ]; then
        error "Usage: $0 restore <backup-file>"
    fi

    BACKUP_FILE="$1"

    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
    fi

    warning "This will overwrite current data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        info "Restoring from $BACKUP_FILE..."
        docker run --rm \
            -v claude-flow-alpha-data:/data \
            -v claude-flow-alpha-logs:/logs \
            -v claude-flow-alpha-memory:/memory \
            -v "$(dirname $BACKUP_FILE):/backup" \
            alpine tar xzf "/backup/$(basename $BACKUP_FILE)"

        success "Restore completed"
        info "Restarting service..."
        restart
    else
        info "Restore cancelled"
    fi
}

# Update to latest alpha
update() {
    info "Updating to latest Claude Flow Alpha..."

    # Backup before update
    info "Creating backup before update..."
    backup

    # Rebuild container
    info "Rebuilding container with latest alpha..."
    compose_build

    # Restart service
    info "Restarting service..."
    restart

    success "Update completed"
}

# Show help
help() {
    cat <<EOF
Claude Flow V3 Alpha - Docker Management Script

Usage: $0 <command> [arguments]

Commands:
    build           Build the container using Docker
    compose-build   Build using docker-compose
    start           Start the service
    stop            Stop the service
    restart         Restart the service
    logs            View Docker logs (follow mode)
    app-logs        View application logs (follow mode)
    status          Show container status
    health          Run health checks
    shell           Open a shell in the container
    config          View configuration file
    clean           Remove all volumes and data (DESTRUCTIVE!)
    backup          Backup volumes to tar.gz
    restore <file>  Restore from backup file
    update          Update to latest alpha version
    help            Show this help message

Examples:
    # Build and start
    $0 build
    $0 start

    # Check status and logs
    $0 status
    $0 logs

    # Backup and restore
    $0 backup
    $0 restore backups/claude-flow-backup-20260122-120000.tar.gz

    # Update to latest
    $0 update

Environment Variables:
    BACKUP_DIR      Backup directory (default: $PROJECT_ROOT/backups)

EOF
}

# Main script
main() {
    check_requirements

    case "${1:-help}" in
        build)
            build
            ;;
        compose-build|cb)
            compose_build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        app-logs|al)
            app_logs
            ;;
        status)
            status
            ;;
        health)
            health
            ;;
        shell|sh)
            shell
            ;;
        config)
            config
            ;;
        clean)
            clean
            ;;
        backup)
            backup
            ;;
        restore)
            restore "$2"
            ;;
        update)
            update
            ;;
        help|-h|--help)
            help
            ;;
        *)
            error "Unknown command: $1"
            help
            ;;
    esac
}

main "$@"
