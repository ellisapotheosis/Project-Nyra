#!/bin/bash

# Nyra Infisical Per-PC Environment Setup Script
# Creates and configures Infisical projects and environments for each PC in the cluster

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/config/infisical"
LOGS_DIR="$PROJECT_ROOT/logs/infisical"

# Environment definitions
declare -A PC_ENVIRONMENTS=(
    ["orchestrator"]="orchestrator development staging production"
    ["worker-1"]="worker-1 development staging production"
    ["worker-2"]="worker-2 development staging production"
    ["worker-3"]="worker-3 development staging production"
    ["shared"]="shared development staging production"
)

# GPU types for workers
declare -A GPU_TYPES=(
    ["worker-1"]="rtx_3060"
    ["worker-2"]="rtx_5090"
    ["worker-3"]="rtx_3090ti"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v infisical &> /dev/null; then
        log_error "Infisical CLI not found. Please install it first."
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Please install jq for JSON processing."
        exit 1
    fi

    # Check if logged in to Infisical
    if ! infisical secrets get __health_check__ 2>/dev/null; then
        log_warning "Not authenticated with Infisical. Please run 'infisical login' first."
        return 1
    fi

    log_success "Prerequisites check passed"
    return 0
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."

    mkdir -p "$CONFIG_DIR"/{orchestrator,worker-1,worker-2,worker-3,shared}
    mkdir -p "$LOGS_DIR"

    for pc_id in "${!PC_ENVIRONMENTS[@]}"; do
        mkdir -p "$CONFIG_DIR/$pc_id"/{secrets,templates,policies}
    done

    log_success "Directory structure created"
}

# Generate environment-specific secrets
generate_secrets() {
    local pc_id="$1"
    local environment="$2"
    local secrets_file="$CONFIG_DIR/$pc_id/secrets/$environment.json"

    log_info "Generating secrets for $pc_id/$environment..."

    # Base secrets for all environments
    cat > "$secrets_file" << EOF
{
    "NYRA_PC_ID": "$pc_id",
    "NYRA_ENVIRONMENT": "$environment",
    "NYRA_LOG_LEVEL": "info",
    "NODE_ENV": "$environment",
    "DATABASE_ENCRYPTION_KEY": "$(openssl rand -hex 32)",
    "JWT_SECRET": "$(openssl rand -hex 32)",
    "API_KEY": "$(openssl rand -hex 16)"
EOF

    # Add PC-specific secrets
    case "$pc_id" in
        "orchestrator")
            cat >> "$secrets_file" << EOF
    ,
    "ORCHESTRATOR_ID": "nyra-orchestrator-$(date +%s)",
    "CLUSTER_MASTER_KEY": "$(openssl rand -hex 32)",
    "POSTGRES_PASSWORD": "$(openssl rand -hex 16)",
    "CHROMA_TOKEN": "$(openssl rand -hex 24)",
    "FALKORDB_PASSWORD": "$(openssl rand -hex 16)",
    "ORCHESTRATOR_API_PORT": "8000",
    "ORCHESTRATOR_WS_PORT": "8001",
    "WORKER_AUTH_SECRET": "$(openssl rand -hex 32)"
EOF
            ;;
        "worker-"*)
            local worker_id="${pc_id##*-}"
            local gpu_type="${GPU_TYPES[$pc_id]}"
            cat >> "$secrets_file" << EOF
    ,
    "WORKER_ID": "$worker_id",
    "NYRA_GPU_TYPE": "$gpu_type",
    "WORKER_API_PORT": "800$worker_id",
    "GPU_METRICS_PORT": "900$worker_id",
    "WORKER_AUTH_TOKEN": "$(openssl rand -hex 32)",
    "GPU_MEMORY_LIMIT": "$(get_gpu_memory_limit "$gpu_type")",
    "CUDA_VISIBLE_DEVICES": "0"
EOF
            ;;
        "shared")
            cat >> "$secrets_file" << EOF
    ,
    "SHARED_CACHE_KEY": "$(openssl rand -hex 32)",
    "MONITORING_TOKEN": "$(openssl rand -hex 24)",
    "BACKUP_ENCRYPTION_KEY": "$(openssl rand -hex 32)"
EOF
            ;;
    esac

    # Add environment-specific secrets
    case "$environment" in
        "development")
            cat >> "$secrets_file" << EOF
    ,
    "DEBUG": "true",
    "LOG_LEVEL": "debug",
    "METRICS_ENABLED": "true"
EOF
            ;;
        "staging")
            cat >> "$secrets_file" << EOF
    ,
    "DEBUG": "false",
    "LOG_LEVEL": "info",
    "METRICS_ENABLED": "true",
    "PERFORMANCE_MONITORING": "true"
EOF
            ;;
        "production")
            cat >> "$secrets_file" << EOF
    ,
    "DEBUG": "false",
    "LOG_LEVEL": "warn",
    "METRICS_ENABLED": "true",
    "PERFORMANCE_MONITORING": "true",
    "SECURITY_SCAN": "true"
EOF
            ;;
    esac

    # Add Cloudflare tunnel configuration
    cat >> "$secrets_file" << EOF
    ,
    "CLOUDFLARE_TUNNEL_NAME": "nyra-$pc_id",
    "CLOUDFLARE_TUNNEL_TOKEN": "PLACEHOLDER_TUNNEL_TOKEN_$pc_id",
    "CLOUDFLARE_ZONE_ID": "PLACEHOLDER_ZONE_ID",
    "CLOUDFLARE_API_TOKEN": "PLACEHOLDER_API_TOKEN"
}
EOF

    log_success "Generated secrets for $pc_id/$environment"
}

# Get GPU memory limit based on GPU type
get_gpu_memory_limit() {
    local gpu_type="$1"
    case "$gpu_type" in
        "rtx_3060") echo "12288" ;;  # 12GB
        "rtx_5090") echo "32768" ;;  # 32GB
        "rtx_3090ti") echo "24576" ;; # 24GB
        *) echo "8192" ;;            # Default 8GB
    esac
}

# Create Docker environment files
create_docker_env() {
    local pc_id="$1"
    local environment="$2"
    local env_file="$CONFIG_DIR/$pc_id/.env.$environment"

    log_info "Creating Docker environment file for $pc_id/$environment..."

    cat > "$env_file" << EOF
# Nyra $pc_id Environment Configuration ($environment)
# Generated on $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Core Configuration
NYRA_PC_ID=$pc_id
NYRA_ENVIRONMENT=$environment
COMPOSE_PROJECT_NAME=nyra-$pc_id-$environment

# Infisical Configuration
INFISICAL_PROJECT_ID=\${INFISICAL_PROJECT_ID}
INFISICAL_TOKEN=\${INFISICAL_TOKEN}
INFISICAL_ENV=$environment
INFISICAL_PATH=/nyra/$pc_id

# Network Configuration
NETWORK_NAME=nyra-$pc_id-network

# Volume Configuration
VOLUME_PREFIX=nyra_${pc_id}_${environment}

# Service Profiles
COMPOSE_PROFILES=$pc_id$([ "$environment" = "production" ] && echo ",tunnels" || echo "")

EOF

    # Add PC-specific environment variables
    case "$pc_id" in
        "orchestrator")
            cat >> "$env_file" << EOF
# Orchestrator Specific
POSTGRES_DB=nyra_${environment}_db
POSTGRES_USER=nyra_${pc_id}
ORCHESTRATOR_PORT=8000
WEB_UI_PORT=3000

EOF
            ;;
        "worker-"*)
            local worker_id="${pc_id##*-}"
            cat >> "$env_file" << EOF
# Worker Specific
WORKER_ID=$worker_id
WORKER_PORT=800$worker_id
GPU_METRICS_PORT=900$worker_id
ORCHESTRATOR_URL=https://nyra-orchestrator.ratehunter.net

EOF
            ;;
    esac

    log_success "Created Docker environment file for $pc_id/$environment"
}

# Create Infisical project policies
create_infisical_policies() {
    local pc_id="$1"
    local policy_file="$CONFIG_DIR/$pc_id/policies/access-policy.json"

    log_info "Creating Infisical access policy for $pc_id..."

    cat > "$policy_file" << EOF
{
    "version": "1.0",
    "policy": {
        "name": "nyra-$pc_id-policy",
        "description": "Access policy for Nyra $pc_id",
        "rules": [
            {
                "resource": "/nyra/$pc_id/*",
                "actions": ["read", "write"],
                "conditions": {
                    "environment": ["development", "staging", "production"]
                }
            },
            {
                "resource": "/nyra/shared/*",
                "actions": ["read"],
                "conditions": {
                    "environment": ["development", "staging", "production"]
                }
            }
        ],
        "roleBindings": [
            {
                "role": "nyra-$pc_id-admin",
                "subjects": ["service-account:nyra-$pc_id"]
            }
        ]
    }
}
EOF

    log_success "Created Infisical access policy for $pc_id"
}

# Create deployment commands
create_deployment_commands() {
    local commands_file="$PROJECT_ROOT/scripts/infisical/deploy-commands.sh"

    log_info "Creating deployment commands..."

    cat > "$commands_file" << 'EOF'
#!/bin/bash

# Nyra Infisical Deployment Commands
# Quick commands for managing the Nyra infrastructure with Infisical

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Deploy orchestrator
deploy_orchestrator() {
    local env="${1:-development}"
    log_info "Deploying orchestrator in $env environment..."

    export NYRA_PC_ID=orchestrator
    export NYRA_ENVIRONMENT="$env"

    infisical run --env="$env" --path="/nyra/orchestrator" -- \
        docker-compose -f docker-compose.infisical.yml --profile orchestrator up -d

    log_success "Orchestrator deployed in $env environment"
}

# Deploy worker
deploy_worker() {
    local worker_id="$1"
    local env="${2:-development}"
    log_info "Deploying worker-$worker_id in $env environment..."

    export NYRA_PC_ID="worker-$worker_id"
    export NYRA_ENVIRONMENT="$env"

    infisical run --env="$env" --path="/nyra/worker-$worker_id" -- \
        docker-compose -f docker-compose.infisical.yml --profile "worker-$worker_id" up -d

    log_success "Worker-$worker_id deployed in $env environment"
}

# Deploy shared services
deploy_shared() {
    local env="${1:-development}"
    log_info "Deploying shared services in $env environment..."

    export NYRA_ENVIRONMENT="$env"

    infisical run --env="$env" --path="/nyra/shared" -- \
        docker-compose -f docker-compose.infisical.yml --profile shared up -d

    log_success "Shared services deployed in $env environment"
}

# Health check all services
health_check() {
    log_info "Running health checks..."

    # Check Infisical MCP
    curl -f http://localhost:8006/health || echo "Infisical MCP: FAILED"

    # Check MetaMCP Gateway
    curl -f http://localhost:8005/health || echo "MetaMCP Gateway: FAILED"

    # Check Orchestrator (if running)
    curl -f http://localhost:8000/health || echo "Orchestrator: Not running or FAILED"

    log_success "Health checks completed"
}

# Main command dispatcher
case "${1:-help}" in
    "orchestrator")
        deploy_orchestrator "${2:-development}"
        ;;
    "worker-1"|"worker-2"|"worker-3")
        worker_id="${1##*-}"
        deploy_worker "$worker_id" "${2:-development}"
        ;;
    "shared")
        deploy_shared "${2:-development}"
        ;;
    "health")
        health_check
        ;;
    "help"|*)
        echo "Nyra Infisical Deployment Commands"
        echo ""
        echo "Usage: $0 <command> [environment]"
        echo ""
        echo "Commands:"
        echo "  orchestrator [env]  Deploy orchestrator (default: development)"
        echo "  worker-1 [env]      Deploy worker-1 (default: development)"
        echo "  worker-2 [env]      Deploy worker-2 (default: development)"
        echo "  worker-3 [env]      Deploy worker-3 (default: development)"
        echo "  shared [env]        Deploy shared services (default: development)"
        echo "  health              Check health of all services"
        echo "  help                Show this help"
        echo ""
        echo "Environments: development, staging, production"
        echo ""
        echo "Examples:"
        echo "  $0 orchestrator production"
        echo "  $0 worker-1 development"
        echo "  $0 shared staging"
        ;;
esac
EOF

    chmod +x "$commands_file"
    log_success "Created deployment commands at $commands_file"
}

# Create Claude MCP registration script
create_mcp_registration() {
    local registration_file="$PROJECT_ROOT/scripts/infisical/register-mcp.sh"

    log_info "Creating MCP registration script..."

    cat > "$registration_file" << 'EOF'
#!/bin/bash

# Nyra Infisical MCP Registration Script
# Registers Infisical MCP server with Claude Code

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Register Infisical MCP with Claude Code
register_infisical_mcp() {
    log_info "Registering Infisical MCP server with Claude Code..."

    # Add Infisical MCP server
    claude mcp add infisical-mcp docker exec nyra-infisical-mcp node src/mcp-server.js

    # Verify registration
    if claude mcp list | grep -q "infisical-mcp"; then
        log_success "Infisical MCP server registered successfully"
    else
        echo "Error: Failed to register Infisical MCP server"
        exit 1
    fi
}

# Register enhanced MetaMCP gateway
register_metamcp_gateway() {
    log_info "Registering enhanced MetaMCP gateway..."

    # Add MetaMCP gateway
    claude mcp add metamcp-gateway http://localhost:8005/mcp

    # Verify registration
    if claude mcp list | grep -q "metamcp-gateway"; then
        log_success "MetaMCP gateway registered successfully"
    else
        echo "Error: Failed to register MetaMCP gateway"
        exit 1
    fi
}

# Main execution
main() {
    echo "Nyra MCP Registration"
    echo "===================="
    echo ""

    # Check if Docker containers are running
    if ! docker ps | grep -q "nyra-infisical-mcp"; then
        echo "Error: Infisical MCP container not running. Please start it first:"
        echo "  ./scripts/infisical/deploy-commands.sh shared development"
        exit 1
    fi

    register_infisical_mcp
    register_metamcp_gateway

    echo ""
    log_success "All MCP servers registered successfully!"
    echo ""
    echo "You can now use:"
    echo "  - infisical-mcp: For secret management"
    echo "  - metamcp-gateway: For unified MCP access"
    echo ""
    echo "Test with: claude mcp test infisical-mcp"
}

main "$@"
EOF

    chmod +x "$registration_file"
    log_success "Created MCP registration script at $registration_file"
}

# Main setup function
main() {
    echo "Nyra Infisical Per-PC Environment Setup"
    echo "======================================"
    echo ""

    # Check prerequisites
    if ! check_prerequisites; then
        echo ""
        echo "Please fix the prerequisites and run this script again."
        exit 1
    fi

    # Create directories
    create_directories

    # Generate configurations for each PC and environment
    for pc_id in "${!PC_ENVIRONMENTS[@]}"; do
        log_info "Setting up $pc_id environments..."

        # Create access policy
        create_infisical_policies "$pc_id"

        # Setup environments
        for env in ${PC_ENVIRONMENTS[$pc_id]}; do
            if [[ "$env" != "$pc_id" ]]; then  # Skip PC ID in environment list
                generate_secrets "$pc_id" "$env"
                create_docker_env "$pc_id" "$env"
            fi
        done

        log_success "Completed setup for $pc_id"
    done

    # Create deployment utilities
    create_deployment_commands
    create_mcp_registration

    echo ""
    log_success "Nyra Infisical setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review generated secrets in: $CONFIG_DIR"
    echo "2. Update Infisical projects with generated secrets"
    echo "3. Configure Cloudflare tunnel tokens"
    echo "4. Deploy services with: ./scripts/infisical/deploy-commands.sh"
    echo "5. Register MCP servers with: ./scripts/infisical/register-mcp.sh"
    echo ""
}

# Run main function
main "$@"