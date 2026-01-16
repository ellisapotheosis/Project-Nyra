#!/usr/bin/env bash
# Koyeb Deployment Script for Project Nyra
# Authenticates, deploys services, configures domains, monitors deployments
# Documentation: https://www.koyeb.com/docs/cli

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/../configs/koyeb"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
KOYEB_APP_NAME="${KOYEB_APP_NAME:-nyra}"
KOYEB_REGION="${KOYEB_REGION:-was}"  # Washington, D.C.
DEPLOYMENT_TIMEOUT="${DEPLOYMENT_TIMEOUT:-600}"  # 10 minutes

# Logging functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if koyeb CLI is installed
    if ! command -v koyeb &> /dev/null; then
        log_error "Koyeb CLI not found. Installing..."
        install_koyeb_cli
    else
        log_success "Koyeb CLI found: $(koyeb version)"
    fi

    # Check if infisical CLI is installed
    if ! command -v infisical &> /dev/null; then
        log_warning "Infisical CLI not found. Secret management will be limited."
        log_info "Install Infisical: https://infisical.com/docs/cli/overview"
    else
        log_success "Infisical CLI found: $(infisical --version)"
    fi

    # Check configuration files
    if [[ ! -f "${CONFIG_DIR}/koyeb.yaml" ]]; then
        log_error "Configuration file not found: ${CONFIG_DIR}/koyeb.yaml"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Install Koyeb CLI
install_koyeb_cli() {
    log_info "Installing Koyeb CLI..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install koyeb/tap/koyeb-cli
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://cli.koyeb.com/install.sh | bash
    else
        log_error "Unsupported OS: $OSTYPE"
        log_info "Please install manually: https://www.koyeb.com/docs/cli"
        exit 1
    fi

    log_success "Koyeb CLI installed successfully"
}

# Authenticate with Koyeb
authenticate_koyeb() {
    log_info "Authenticating with Koyeb..."

    # Check if already authenticated
    if koyeb whoami &> /dev/null; then
        log_success "Already authenticated as: $(koyeb whoami)"
        return 0
    fi

    # Check for API token in environment
    if [[ -z "${KOYEB_API_TOKEN:-}" ]]; then
        log_error "KOYEB_API_TOKEN not set"
        log_info "Get your token from: https://app.koyeb.com/account/api"
        log_info "Then set: export KOYEB_API_TOKEN=your_token"
        exit 1
    fi

    # Authenticate using token
    echo "$KOYEB_API_TOKEN" | koyeb login

    if koyeb whoami &> /dev/null; then
        log_success "Authenticated successfully as: $(koyeb whoami)"
    else
        log_error "Authentication failed"
        exit 1
    fi
}

# Pull secrets from Infisical
pull_secrets_from_infisical() {
    log_info "Pulling secrets from Infisical..."

    if ! command -v infisical &> /dev/null; then
        log_warning "Infisical CLI not installed. Skipping secret sync."
        return 0
    fi

    # Export secrets to .env file
    local env_file="${SCRIPT_DIR}/.env.koyeb"

    infisical export \
        --env production \
        --path /koyeb \
        --format dotenv \
        > "$env_file"

    log_success "Secrets exported to: $env_file"

    # Create Koyeb secrets from Infisical
    log_info "Creating Koyeb secrets..."

    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] && continue

        # Create or update secret in Koyeb
        if koyeb secret list | grep -q "$key"; then
            log_info "Updating secret: $key"
            koyeb secret update "$key" --value "$value" --overwrite
        else
            log_info "Creating secret: $key"
            koyeb secret create "$key" --value "$value"
        fi
    done < "$env_file"

    # Clean up env file
    rm -f "$env_file"

    log_success "Koyeb secrets synchronized with Infisical"
}

# Deploy n8n orchestrator
deploy_n8n() {
    log_info "Deploying n8n Orchestrator..."

    local service_name="nyra-n8n-orchestrator"

    # Check if service exists
    if koyeb service list | grep -q "$service_name"; then
        log_info "Service exists. Updating..."
        koyeb service update "$service_name" \
            --definition "${CONFIG_DIR}/koyeb.yaml" \
            --wait
    else
        log_info "Creating new service..."
        koyeb service create "$service_name" \
            --definition "${CONFIG_DIR}/koyeb.yaml" \
            --app "$KOYEB_APP_NAME" \
            --region "$KOYEB_REGION" \
            --wait
    fi

    log_success "n8n Orchestrator deployed successfully"
}

# Deploy webapp backend
deploy_webapp_backend() {
    log_info "Deploying Webapp Backend..."

    local service_name="nyra-webapp-backend"

    # Check if service exists
    if koyeb service list | grep -q "$service_name"; then
        log_info "Service exists. Updating..."
        koyeb service update "$service_name" \
            --definition "${CONFIG_DIR}/webapp-backend.yaml" \
            --wait
    else
        log_info "Creating new service..."
        koyeb service create "$service_name" \
            --definition "${CONFIG_DIR}/webapp-backend.yaml" \
            --app "$KOYEB_APP_NAME" \
            --region "$KOYEB_REGION" \
            --wait
    fi

    log_success "Webapp Backend deployed successfully"
}

# Configure custom domains
configure_domains() {
    log_info "Configuring custom domains..."

    # n8n domain
    local n8n_domain="n8n.nyra.koyeb.app"
    if ! koyeb domain list | grep -q "$n8n_domain"; then
        log_info "Adding domain: $n8n_domain"
        koyeb domain create "$n8n_domain" --service nyra-n8n-orchestrator
    else
        log_info "Domain already configured: $n8n_domain"
    fi

    # API domain
    local api_domain="api.nyra.koyeb.app"
    if ! koyeb domain list | grep -q "$api_domain"; then
        log_info "Adding domain: $api_domain"
        koyeb domain create "$api_domain" --service nyra-webapp-backend
    else
        log_info "Domain already configured: $api_domain"
    fi

    # Display DNS configuration instructions
    log_info "Domain DNS Configuration:"
    echo ""
    echo "Add these DNS records to your domain provider:"
    echo "  $n8n_domain     CNAME   $(koyeb service get nyra-n8n-orchestrator --output json | jq -r '.domain')"
    echo "  $api_domain     CNAME   $(koyeb service get nyra-webapp-backend --output json | jq -r '.domain')"
    echo ""

    log_success "Domains configured"
}

# Set up health checks
setup_health_checks() {
    log_info "Setting up health checks..."

    # n8n health check
    log_info "Configuring n8n health check..."
    koyeb service update nyra-n8n-orchestrator \
        --health-check-path "/healthz" \
        --health-check-port 5678 \
        --health-check-protocol http \
        --health-check-initial-delay 30 \
        --health-check-period 10 \
        --health-check-timeout 5 \
        --health-check-failure-threshold 3

    # Webapp backend health check
    log_info "Configuring webapp backend health check..."
    koyeb service update nyra-webapp-backend \
        --health-check-path "/api/health" \
        --health-check-port 8000 \
        --health-check-protocol http \
        --health-check-initial-delay 30 \
        --health-check-period 15 \
        --health-check-timeout 5 \
        --health-check-failure-threshold 3

    log_success "Health checks configured"
}

# Monitor deployment status
monitor_deployment() {
    local service_name="$1"
    local timeout="$2"

    log_info "Monitoring deployment: $service_name (timeout: ${timeout}s)"

    local elapsed=0
    local interval=5

    while [[ $elapsed -lt $timeout ]]; do
        local status=$(koyeb service get "$service_name" --output json | jq -r '.status')

        case "$status" in
            "healthy")
                log_success "Service is healthy: $service_name"
                return 0
                ;;
            "unhealthy"|"error")
                log_error "Service deployment failed: $service_name"
                log_error "Status: $status"

                # Display logs for debugging
                log_info "Recent logs:"
                koyeb service logs "$service_name" --tail 50
                return 1
                ;;
            "starting"|"updating")
                echo -ne "\r${BLUE}[INFO]${NC} Status: $status... (${elapsed}s/${timeout}s)"
                sleep $interval
                elapsed=$((elapsed + interval))
                ;;
            *)
                log_warning "Unknown status: $status"
                sleep $interval
                elapsed=$((elapsed + interval))
                ;;
        esac
    done

    echo ""
    log_error "Deployment timeout reached: $service_name"
    return 1
}

# Display deployment summary
display_summary() {
    log_info "Deployment Summary"
    echo ""
    echo "Services:"
    koyeb service list --app "$KOYEB_APP_NAME"
    echo ""
    echo "Domains:"
    koyeb domain list
    echo ""
    echo "URLs:"
    echo "  n8n:         https://n8n.nyra.koyeb.app"
    echo "  API:         https://api.nyra.koyeb.app"
    echo "  Health:      https://api.nyra.koyeb.app/api/health"
    echo ""
    log_success "Deployment complete!"
}

# Rollback deployment
rollback_deployment() {
    local service_name="$1"

    log_warning "Rolling back deployment: $service_name"

    # Get previous deployment ID
    local previous_deployment=$(koyeb deployment list "$service_name" --output json | jq -r '.[1].id')

    if [[ -z "$previous_deployment" ]]; then
        log_error "No previous deployment found for rollback"
        return 1
    fi

    log_info "Rolling back to deployment: $previous_deployment"
    koyeb service redeploy "$service_name" --deployment "$previous_deployment"

    log_success "Rollback initiated"
}

# Main deployment flow
main() {
    log_info "Starting Koyeb deployment for Project Nyra"
    echo ""

    # Parse command line arguments
    local skip_secrets=false
    local deploy_only=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-secrets)
                skip_secrets=true
                shift
                ;;
            --service)
                deploy_only="$2"
                shift 2
                ;;
            --rollback)
                rollback_deployment "$2"
                exit 0
                ;;
            --help)
                cat <<EOF
Usage: $0 [OPTIONS]

Deploy Project Nyra services to Koyeb

OPTIONS:
    --skip-secrets          Skip Infisical secret synchronization
    --service <name>        Deploy only specified service (n8n|webapp)
    --rollback <service>    Rollback specified service to previous deployment
    --help                  Display this help message

ENVIRONMENT VARIABLES:
    KOYEB_API_TOKEN         Koyeb API token (required)
    KOYEB_APP_NAME          Koyeb app name (default: nyra)
    KOYEB_REGION            Deployment region (default: was)
    DEPLOYMENT_TIMEOUT      Deployment timeout in seconds (default: 600)

EXAMPLES:
    # Full deployment
    export KOYEB_API_TOKEN=your_token
    $0

    # Deploy only webapp backend
    $0 --service webapp

    # Skip secret sync
    $0 --skip-secrets

    # Rollback n8n service
    $0 --rollback nyra-n8n-orchestrator
EOF
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Execute deployment steps
    check_prerequisites
    authenticate_koyeb

    if [[ "$skip_secrets" == false ]]; then
        pull_secrets_from_infisical
    else
        log_warning "Skipping secret synchronization"
    fi

    # Deploy services
    case "$deploy_only" in
        "n8n")
            deploy_n8n
            monitor_deployment "nyra-n8n-orchestrator" "$DEPLOYMENT_TIMEOUT"
            ;;
        "webapp")
            deploy_webapp_backend
            monitor_deployment "nyra-webapp-backend" "$DEPLOYMENT_TIMEOUT"
            ;;
        "")
            deploy_n8n
            monitor_deployment "nyra-n8n-orchestrator" "$DEPLOYMENT_TIMEOUT" || {
                log_error "n8n deployment failed. Skipping webapp deployment."
                exit 1
            }

            deploy_webapp_backend
            monitor_deployment "nyra-webapp-backend" "$DEPLOYMENT_TIMEOUT" || {
                log_error "Webapp deployment failed."
                exit 1
            }
            ;;
        *)
            log_error "Invalid service name: $deploy_only"
            exit 1
            ;;
    esac

    configure_domains
    setup_health_checks
    display_summary

    log_success "All deployments completed successfully!"
}

# Run main function
main "$@"
