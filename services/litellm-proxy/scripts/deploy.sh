#!/bin/bash

# LiteLLM Proxy Deployment Script
# Usage: ./scripts/deploy.sh [start|stop|restart|status|logs]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check .env file
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log_error ".env file not found. Please copy .env.example to .env and configure it."
        exit 1
    fi

    log_success "All prerequisites met!"
}

start_stack() {
    log_info "Starting LiteLLM Proxy stack..."

    cd "$PROJECT_DIR"

    # Build images
    log_info "Building Docker images..."
    docker-compose build

    # Start services
    log_info "Starting services..."
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10

    # Check health
    check_health

    log_success "LiteLLM Proxy stack started successfully!"
    log_info ""
    log_info "Services:"
    log_info "  - LiteLLM Proxy: http://localhost:4000"
    log_info "  - Grafana Dashboard: http://localhost:3001"
    log_info "  - Prometheus: http://localhost:9091"
    log_info ""
    log_info "Run './scripts/deploy.sh status' to check service status"
}

start_dev() {
    log_info "Starting LiteLLM Proxy in development mode..."

    cd "$PROJECT_DIR"

    # Build and start dev stack
    docker-compose -f docker-compose.dev.yml build
    docker-compose -f docker-compose.dev.yml up -d

    sleep 5
    check_health

    log_success "LiteLLM Proxy (dev) started successfully!"
    log_info "Proxy: http://localhost:4000"
}

stop_stack() {
    log_info "Stopping LiteLLM Proxy stack..."

    cd "$PROJECT_DIR"
    docker-compose down

    log_success "LiteLLM Proxy stack stopped!"
}

stop_dev() {
    log_info "Stopping LiteLLM Proxy (dev)..."

    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.dev.yml down

    log_success "LiteLLM Proxy (dev) stopped!"
}

restart_stack() {
    log_info "Restarting LiteLLM Proxy stack..."
    stop_stack
    sleep 2
    start_stack
}

check_status() {
    log_info "Checking service status..."

    cd "$PROJECT_DIR"
    docker-compose ps

    echo ""
    log_info "Container logs (last 10 lines):"
    docker-compose logs --tail=10
}

check_health() {
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
            log_success "LiteLLM Proxy is healthy!"
            return 0
        fi

        log_warning "Waiting for LiteLLM Proxy to be healthy... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done

    log_error "LiteLLM Proxy failed to become healthy"
    return 1
}

show_logs() {
    cd "$PROJECT_DIR"

    if [ -z "$2" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$2"
    fi
}

test_proxy() {
    log_info "Testing LiteLLM Proxy..."

    # Check health
    log_info "1. Health check..."
    curl -s http://localhost:4000/health | jq .

    # List models
    log_info "2. List models..."
    curl -s http://localhost:4000/v1/models \
        -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" | jq .

    # Test chat completion
    log_info "3. Test chat completion..."
    curl -s http://localhost:4000/v1/chat/completions \
        -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "default",
            "messages": [{"role": "user", "content": "Hello! This is a test."}],
            "max_tokens": 50
        }' | jq .

    log_success "Tests completed!"
}

backup_data() {
    log_info "Backing up LiteLLM data..."

    local backup_dir="$PROJECT_DIR/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)

    mkdir -p "$backup_dir"

    # Backup PostgreSQL
    log_info "Backing up PostgreSQL database..."
    docker-compose exec -T postgres pg_dump -U litellm > "$backup_dir/postgres_$timestamp.sql"

    # Backup configuration
    log_info "Backing up configuration..."
    tar -czf "$backup_dir/config_$timestamp.tar.gz" -C "$PROJECT_DIR" config/

    log_success "Backup completed: $backup_dir"
}

show_metrics() {
    log_info "Fetching metrics..."

    echo ""
    log_info "Request metrics (last 24 hours):"
    curl -s http://localhost:4000/health | jq .metrics

    echo ""
    log_info "Worker health:"
    curl -s http://localhost:4000/health | jq .components.workers
}

# Main
case "$1" in
    start)
        check_prerequisites
        start_stack
        ;;
    start-dev)
        check_prerequisites
        start_dev
        ;;
    stop)
        stop_stack
        ;;
    stop-dev)
        stop_dev
        ;;
    restart)
        restart_stack
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs "$@"
        ;;
    health)
        check_health
        ;;
    test)
        test_proxy
        ;;
    backup)
        backup_data
        ;;
    metrics)
        show_metrics
        ;;
    *)
        echo "Usage: $0 {start|start-dev|stop|stop-dev|restart|status|logs|health|test|backup|metrics}"
        echo ""
        echo "Commands:"
        echo "  start       - Start full production stack"
        echo "  start-dev   - Start development stack"
        echo "  stop        - Stop production stack"
        echo "  stop-dev    - Stop development stack"
        echo "  restart     - Restart stack"
        echo "  status      - Show service status"
        echo "  logs        - Show logs (use 'logs <service>' for specific service)"
        echo "  health      - Check proxy health"
        echo "  test        - Run integration tests"
        echo "  backup      - Backup data and configuration"
        echo "  metrics     - Show usage metrics"
        exit 1
        ;;
esac

exit 0
