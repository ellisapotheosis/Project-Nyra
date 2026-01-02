#!/bin/bash
# Claude-Flow Orchestrator Entrypoint Script
set -e

echo "=================================================="
echo "  Claude-Flow Orchestrator Starting"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wait for service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local max_attempts=30
    local attempt=1

    log_info "Waiting for $service at $host:$port..."

    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            log_info "$service is ready!"
            return 0
        fi

        log_warn "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "$service failed to become ready after $max_attempts attempts"
    return 1
}

# Check required environment variables
check_env_vars() {
    log_info "Checking required environment variables..."

    local required_vars=(
        "LITELLM_API_KEY"
        "RABBITMQ_PASSWORD"
        "REDIS_PASSWORD"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi

    log_info "All required environment variables are set"
}

# Initialize directories
init_directories() {
    log_info "Initializing directories..."

    local dirs=(
        "$CLAUDE_FLOW_DATA_DIR"
        "$CLAUDE_FLOW_LOGS_DIR"
        "$CLAUDE_FLOW_SESSIONS_DIR"
        "$CLAUDE_FLOW_MEMORY_DIR"
    )

    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        fi
    done
}

# Wait for dependencies
wait_for_dependencies() {
    log_info "Waiting for required services..."

    wait_for_service "rabbitmq" 5672 "RabbitMQ" || exit 1
    wait_for_service "redis" 6379 "Redis" || exit 1
    wait_for_service "litellm" 4000 "LiteLLM" || exit 1

    # MetaMCP is optional but recommended
    if wait_for_service "metamcp" 12008 "MetaMCP"; then
        log_info "MetaMCP integration enabled"
    else
        log_warn "MetaMCP not available, continuing without it"
    fi
}

# Initialize RabbitMQ resources
init_rabbitmq() {
    log_info "Initializing RabbitMQ resources..."

    # Wait a bit for RabbitMQ to be fully ready
    sleep 5

    # Check if rabbitmqadmin is available
    if command -v rabbitmqadmin &> /dev/null; then
        # Declare exchange
        rabbitmqadmin -H rabbitmq -u "$RABBITMQ_USER" -p "$RABBITMQ_PASSWORD" \
            declare exchange name="$RABBITMQ_EXCHANGE" type=topic durable=true || true

        # Declare queues
        rabbitmqadmin -H rabbitmq -u "$RABBITMQ_USER" -p "$RABBITMQ_PASSWORD" \
            declare queue name=claude-flow-tasks durable=true || true

        rabbitmqadmin -H rabbitmq -u "$RABBITMQ_USER" -p "$RABBITMQ_PASSWORD" \
            declare queue name=claude-flow-events durable=true || true

        rabbitmqadmin -H rabbitmq -u "$RABBITMQ_USER" -p "$RABBITMQ_PASSWORD" \
            declare queue name=archon-bridge durable=true || true

        log_info "RabbitMQ resources initialized"
    else
        log_warn "rabbitmqadmin not available, skipping RabbitMQ initialization"
    fi
}

# Health check
health_check() {
    log_info "Running health check..."

    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found"
        exit 1
    fi

    # Check if claude-flow is installed
    if ! command -v claude-flow &> /dev/null; then
        log_error "claude-flow not found"
        exit 1
    fi

    log_info "Health check passed"
}

# Start metrics server
start_metrics() {
    if [ "${METRICS_ENABLED}" = "true" ]; then
        log_info "Starting Prometheus metrics server on port ${METRICS_PORT}..."
        # Metrics will be exposed by the main application
    fi
}

# Start the main application
start_app() {
    log_info "Starting Claude-Flow orchestrator..."
    log_info "API Server: http://0.0.0.0:${CLAUDE_FLOW_PORT}"
    log_info "Metrics: http://0.0.0.0:${METRICS_PORT}/metrics"
    log_info "Health: http://0.0.0.0:${CLAUDE_FLOW_PORT}/health"

    echo "=================================================="

    # Start the application using npx
    exec npx claude-flow@alpha server start \
        --config "/app/config/claude-flow-config.yml" \
        --port "${CLAUDE_FLOW_PORT}" \
        --host "${CLAUDE_FLOW_HOST}"
}

# Graceful shutdown handler
shutdown_handler() {
    log_info "Received shutdown signal, stopping gracefully..."

    # Close active sessions
    if command -v claude-flow &> /dev/null; then
        claude-flow hooks session-end --export-metrics true || true
    fi

    log_info "Claude-Flow orchestrator stopped"
    exit 0
}

# Set up signal handlers
trap shutdown_handler SIGTERM SIGINT

# Main execution
main() {
    log_info "Claude-Flow Orchestrator v2.0.0"

    # Run initialization steps
    check_env_vars
    init_directories
    health_check
    wait_for_dependencies
    init_rabbitmq
    start_metrics

    # Start the application
    start_app
}

# Run main function
main
