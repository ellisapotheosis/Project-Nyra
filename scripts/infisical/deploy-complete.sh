#!/bin/bash

# Nyra Infisical Complete Deployment Script
# Automated deployment of the entire Nyra infrastructure with Infisical integration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_ROOT/scripts/lib/infisical-token.sh"
cd "$PROJECT_ROOT"

# Colors and logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Deployment configuration
DEPLOYMENT_ENV="${1:-development}"
PC_ID="${2:-orchestrator}"
SKIP_TESTS="${SKIP_TESTS:-false}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

# Deployment steps tracking
STEP=0
TOTAL_STEPS=12

next_step() {
    STEP=$((STEP + 1))
    log_step "[$STEP/$TOTAL_STEPS] $1"
    echo "=================================================="
}

# Error handling
error_exit() {
    log_error "Deployment failed at step $STEP: $1"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check logs: docker-compose -f docker-compose.infisical.yml logs"
    echo "2. Verify INFISICAL_TOKEN is exported for this shell"
    echo "3. Check system requirements: ./scripts/infisical/test-integration.sh"
    echo "4. Review configuration: ls -la config/infisical/"
    exit 1
}

# Validate deployment environment
validate_environment() {
    next_step "Validating Deployment Environment"

    # Check valid environment
    case "$DEPLOYMENT_ENV" in
        development|staging|production)
            log_info "Deploying to: $DEPLOYMENT_ENV"
            ;;
        *)
            error_exit "Invalid environment: $DEPLOYMENT_ENV. Use: development, staging, or production"
            ;;
    esac

    # Check valid PC ID
    case "$PC_ID" in
        orchestrator|worker-1|worker-2|worker-3)
            log_info "Deploying for PC: $PC_ID"
            ;;
        *)
            error_exit "Invalid PC ID: $PC_ID. Use: orchestrator, worker-1, worker-2, or worker-3"
            ;;
    esac

    # Set environment variables
    export NYRA_PC_ID="$PC_ID"
    export NYRA_ENVIRONMENT="$DEPLOYMENT_ENV"

    log_success "Environment validation completed"
}

# Check prerequisites
check_prerequisites() {
    next_step "Checking Prerequisites"

    local missing_deps=()

    # Check required commands
    for cmd in docker docker-compose infisical jq curl; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error_exit "Missing dependencies: ${missing_deps[*]}"
    fi

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error_exit "Docker daemon not running"
    fi

    if ! nyra_require_infisical_token; then
        error_exit "INFISICAL_TOKEN is required"
    fi

    nyra_resolve_infisical_project_id

    log_success "Prerequisites check completed"
}

# Setup environment configuration
setup_environment() {
    next_step "Setting Up Environment Configuration"

    log_info "Running PC environment setup..."
    if ! ./scripts/infisical/setup-pc-environments.sh; then
        error_exit "Failed to setup PC environments"
    fi

    # Verify environment files exist
    local env_file="config/infisical/$PC_ID/.env.$DEPLOYMENT_ENV"
    if [[ ! -f "$env_file" ]]; then
        error_exit "Environment file not found: $env_file"
    fi

    log_success "Environment configuration completed"
}

# Build Docker images
build_images() {
    next_step "Building Docker Images"

    log_info "Building Infisical MCP server image..."
    if ! docker build -f infra/docker/infisical/Dockerfile.mcp -t nyra-infisical-mcp:latest infra/docker/infisical/; then
        error_exit "Failed to build Infisical MCP image"
    fi

    log_info "Building MetaMCP Gateway enhanced image..."
    if ! docker build -f infra/docker/metamcp/Dockerfile.gateway-enhanced -t nyra-metamcp-gateway-enhanced:latest infra/docker/metamcp/; then
        error_exit "Failed to build MetaMCP Gateway image"
    fi

    log_success "Docker images built successfully"
}

# Deploy core services
deploy_core_services() {
    next_step "Deploying Core Services"

    log_info "Starting Infisical MCP server..."
    if ! nyra_infisical_run "$DEPLOYMENT_ENV" "/nyra/$PC_ID" \
         docker-compose -f docker-compose.infisical.yml up -d infisical-mcp; then
        error_exit "Failed to start Infisical MCP server"
    fi

    log_info "Starting MetaMCP Gateway..."
    if ! nyra_infisical_run "$DEPLOYMENT_ENV" "/nyra/$PC_ID" \
         docker-compose -f docker-compose.infisical.yml up -d metamcp-gateway-enhanced; then
        error_exit "Failed to start MetaMCP Gateway"
    fi

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10

    log_success "Core services deployed"
}

# Deploy PC-specific services
deploy_pc_services() {
    next_step "Deploying PC-Specific Services"

    case "$PC_ID" in
        orchestrator)
            log_info "Deploying orchestrator services..."
            if ! nyra_infisical_run "$DEPLOYMENT_ENV" "/nyra/$PC_ID" \
                 docker-compose -f docker-compose.infisical.yml --profile orchestrator --profile shared up -d; then
                error_exit "Failed to deploy orchestrator services"
            fi
            ;;
        worker-*)
            log_info "Deploying worker services for $PC_ID..."
            if ! nyra_infisical_run "$DEPLOYMENT_ENV" "/nyra/$PC_ID" \
                 docker-compose -f docker-compose.infisical.yml --profile "$PC_ID" up -d; then
                error_exit "Failed to deploy worker services for $PC_ID"
            fi
            ;;
    esac

    log_success "PC-specific services deployed"
}

# Setup Cloudflare tunnels
setup_tunnels() {
    next_step "Setting Up Cloudflare Tunnels"

    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        log_info "Setting up Cloudflare tunnels for production..."

        # Check if cloudflared is available
        if command -v cloudflared &> /dev/null; then
            if ! ./scripts/infisical/setup-tunnels.sh "$PC_ID"; then
                log_warning "Tunnel setup failed, continuing without tunnels"
            fi
        else
            log_warning "Cloudflared not installed, skipping tunnel setup"
        fi
    else
        log_info "Skipping tunnel setup for $DEPLOYMENT_ENV environment"
    fi

    log_success "Tunnel setup completed"
}

# Register MCP servers
register_mcp_servers() {
    next_step "Registering MCP Servers"

    log_info "Waiting for MCP servers to be fully ready..."
    sleep 15

    # Check if Claude CLI is available
    if command -v claude &> /dev/null; then
        log_info "Registering MCP servers with Claude Code..."
        if ./scripts/infisical/register-mcp.sh; then
            log_success "MCP servers registered successfully"
        else
            log_warning "MCP registration failed, you may need to register manually"
        fi
    else
        log_warning "Claude CLI not available, skipping MCP registration"
        log_info "To register manually:"
        log_info "  claude mcp add infisical-mcp docker exec nyra-infisical-mcp node src/mcp-server.js"
        log_info "  claude mcp add metamcp-gateway http://localhost:8005/mcp"
    fi
}

# Health checks
run_health_checks() {
    next_step "Running Health Checks"

    log_info "Performing comprehensive health checks..."

    # Wait a bit more for services to stabilize
    sleep 10

    # Check service endpoints
    local endpoints=(
        "http://localhost:8006/health:Infisical MCP"
        "http://localhost:8005/health:MetaMCP Gateway"
    )

    for endpoint_info in "${endpoints[@]}"; do
        local endpoint="${endpoint_info%%:*}"
        local name="${endpoint_info##*:}"

        log_info "Checking $name: $endpoint"

        local retry_count=0
        local max_retries=5

        while [[ $retry_count -lt $max_retries ]]; do
            if curl -s -f "$endpoint" > /dev/null; then
                log_success "$name is healthy"
                break
            else
                retry_count=$((retry_count + 1))
                if [[ $retry_count -eq $max_retries ]]; then
                    log_warning "$name health check failed after $max_retries attempts"
                else
                    log_info "Retrying $name health check ($retry_count/$max_retries)..."
                    sleep 5
                fi
            fi
        done
    done

    log_success "Health checks completed"
}

# Run integration tests
run_integration_tests() {
    next_step "Running Integration Tests"

    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_info "Skipping integration tests (SKIP_TESTS=true)"
        return 0
    fi

    log_info "Running integration test suite..."

    # Make test script executable
    chmod +x scripts/infisical/test-integration.sh

    if ./scripts/infisical/test-integration.sh; then
        log_success "Integration tests passed"
    else
        log_warning "Some integration tests failed, but deployment continues"
        log_info "Review test results and fix issues as needed"
    fi
}

# Setup monitoring and maintenance
setup_monitoring() {
    next_step "Setting Up Monitoring and Maintenance"

    log_info "Creating monitoring scripts..."

    # Create health monitoring script
    cat > "scripts/infisical/health-monitor.sh" << 'EOF'
#!/bin/bash
# Nyra Health Monitor - Run every 5 minutes via cron

ENDPOINTS=(
    "http://localhost:8006/health:Infisical MCP"
    "http://localhost:8005/health:MetaMCP Gateway"
)

for endpoint_info in "${ENDPOINTS[@]}"; do
    endpoint="${endpoint_info%%:*}"
    name="${endpoint_info##*:}"

    if ! curl -s -f "$endpoint" > /dev/null; then
        echo "$(date): ALERT - $name health check failed" >> logs/health-alerts.log
    fi
done
EOF

    chmod +x "scripts/infisical/health-monitor.sh"

    # Create maintenance script
    cat > "scripts/infisical/maintenance.sh" << 'EOF'
#!/bin/bash
# Nyra Maintenance Script - Run weekly

echo "$(date): Starting maintenance tasks"

# Cleanup old logs
find logs/ -name "*.log" -mtime +30 -delete

# Cleanup old Docker images
docker image prune -f

# Update Infisical secrets if needed
# infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env=production --path=/nyra/maintenance "LAST_MAINTENANCE=$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "$(date): Maintenance tasks completed"
EOF

    chmod +x "scripts/infisical/maintenance.sh"

    log_success "Monitoring and maintenance setup completed"
}

# Final deployment verification
final_verification() {
    next_step "Final Deployment Verification"

    log_info "Performing final verification..."

    # Check all containers are running
    local running_containers
    running_containers=$(docker ps --filter "name=nyra-" --format "table {{.Names}}\t{{.Status}}" | grep -c "Up" || echo "0")

    log_info "Running Nyra containers: $running_containers"

    # Create deployment summary
    cat > "deployment-summary-$(date +%Y%m%d-%H%M%S).txt" << EOF
Nyra Infisical Deployment Summary
================================
Deployment Date: $(date)
Environment: $DEPLOYMENT_ENV
PC ID: $PC_ID
Running Containers: $running_containers

Services:
$(docker ps --filter "name=nyra-" --format "- {{.Names}}: {{.Status}}")

Health Endpoints:
- Infisical MCP: http://localhost:8006/health
- MetaMCP Gateway: http://localhost:8005/health

Next Steps:
1. Register MCP servers with Claude Code (if not done automatically)
2. Configure monitoring and alerting
3. Setup automated backups
4. Review security settings

Troubleshooting:
- Logs: docker-compose -f docker-compose.infisical.yml logs [service]
- Health: ./scripts/infisical/test-integration.sh health
- Secrets: infisical secrets get --projectId=$INFISICAL_PROJECT_ID --env=$DEPLOYMENT_ENV --path=/nyra/$PC_ID
EOF

    log_success "Deployment verification completed"
}

# Main deployment function
main() {
    echo ""
    echo "🚀 Nyra Infisical Complete Deployment"
    echo "====================================="
    echo "Environment: $DEPLOYMENT_ENV"
    echo "PC ID: $PC_ID"
    echo "Timestamp: $(date)"
    echo ""

    # Execute deployment steps
    validate_environment
    check_prerequisites
    setup_environment
    build_images
    deploy_core_services
    deploy_pc_services
    setup_tunnels
    register_mcp_servers
    run_health_checks
    run_integration_tests
    setup_monitoring
    final_verification

    # Success message
    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Access Points:"
    echo "- Infisical MCP: http://localhost:8006"
    echo "- MetaMCP Gateway: http://localhost:8005"
    if [[ "$PC_ID" == "orchestrator" ]]; then
        echo "- Orchestrator: http://localhost:8000"
        echo "- Web UI: http://localhost:3000"
    fi
    echo ""
    echo "Management Commands:"
    echo "- Health check: ./scripts/infisical/test-integration.sh health"
    echo "- View logs: docker-compose -f docker-compose.infisical.yml logs -f"
    echo "- Stop services: docker-compose -f docker-compose.infisical.yml down"
    echo "- Restart services: ./scripts/infisical/deploy-commands.sh $PC_ID $DEPLOYMENT_ENV"
    echo ""

    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        echo "Production Checklist:"
        echo "□ Configure monitoring alerts"
        echo "□ Setup automated backups"
        echo "□ Review security settings"
        echo "□ Configure SSL certificates"
        echo "□ Test disaster recovery procedures"
        echo ""
    fi
}

# Usage information
usage() {
    echo "Usage: $0 [environment] [pc_id]"
    echo ""
    echo "Arguments:"
    echo "  environment    Deployment environment (development|staging|production) [default: development]"
    echo "  pc_id          PC identifier (orchestrator|worker-1|worker-2|worker-3) [default: orchestrator]"
    echo ""
    echo "Environment Variables:"
    echo "  SKIP_TESTS     Skip integration tests (true|false) [default: false]"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy development orchestrator"
    echo "  $0 production orchestrator           # Deploy production orchestrator"
    echo "  $0 development worker-1              # Deploy development worker-1"
    echo "  SKIP_TESTS=true $0 staging worker-2  # Deploy staging worker-2, skip tests"
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    -h|--help|help)
        usage
        exit 0
        ;;
    *)
        # Run main deployment
        main "$@"
        ;;
esac
