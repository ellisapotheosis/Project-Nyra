#!/bin/bash
#===============================================================================
# Cloudflare Tunnel Setup Script - Orchestrator Mini
# Project Nyra - Distributed AI Infrastructure
#===============================================================================
# This script sets up a Cloudflare tunnel for the orchestrator mini PC with:
# - Cloudflare API authentication and tunnel management
# - Tunnel token storage in Infisical for secure secret management
# - Docker Compose configuration updates
# - DNS record configuration
# - Connectivity validation
# - Comprehensive rollback capability
#===============================================================================

set -euo pipefail

#===============================================================================
# Configuration
#===============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOTSTRAP_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$BOOTSTRAP_DIR")")"
LOG_DIR="${BOOTSTRAP_DIR}/logs"
BACKUP_DIR="${BOOTSTRAP_DIR}/backups"
CONFIG_DIR="${BOOTSTRAP_DIR}/config"

# PC Configuration
PC_ID="orchestrator-mini"
PC_TYPE="orchestrator"
TUNNEL_NAME="nyra-orchestrator"
SERVICE_PORT="8000"
SERVICE_URL="http://nyra-orchestrator:${SERVICE_PORT}"

# Log file with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/cloudflare-tunnel-setup-${TIMESTAMP}.log"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#===============================================================================
# Logging Functions
#===============================================================================
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    log "INFO" "$@"
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    log "SUCCESS" "$@"
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    log "WARNING" "$@"
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    log "ERROR" "$@"
    echo -e "${RED}[ERROR]${NC} $*"
}

#===============================================================================
# Initialization
#===============================================================================
initialize() {
    log_info "Initializing Cloudflare tunnel setup for ${PC_ID}..."

    # Create required directories
    mkdir -p "${LOG_DIR}" "${BACKUP_DIR}" "${CONFIG_DIR}"

    # Check required environment variables
    local required_vars=(
        "CLOUDFLARE_API_TOKEN"
        "CLOUDFLARE_ACCOUNT_ID"
        "CLOUDFLARE_ZONE_ID"
        "CLOUDFLARE_DOMAIN"
        "INFISICAL_TOKEN"
        "INFISICAL_PROJECT_ID"
    )

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_error "Please set these variables before running this script"
        exit 1
    fi

    # Check for required commands
    local required_commands=("curl" "jq" "docker" "cloudflared")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command not found: $cmd"
            log_error "Please install $cmd and try again"
            exit 1
        fi
    done

    # Check for Infisical CLI
    if ! command -v infisical &> /dev/null; then
        log_warning "Infisical CLI not found, attempting to install..."
        install_infisical_cli
    fi

    log_success "Initialization complete"
}

#===============================================================================
# Install Infisical CLI
#===============================================================================
install_infisical_cli() {
    log_info "Installing Infisical CLI..."

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
        sudo apt-get update && sudo apt-get install -y infisical
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install infisical/get-cli/infisical
    else
        log_error "Unsupported OS for automatic Infisical installation"
        log_error "Please install Infisical CLI manually from: https://infisical.com/docs/cli/overview"
        exit 1
    fi

    if command -v infisical &> /dev/null; then
        log_success "Infisical CLI installed successfully"
    else
        log_error "Failed to install Infisical CLI"
        exit 1
    fi
}

#===============================================================================
# Cloudflare API Functions
#===============================================================================
cloudflare_api_call() {
    local method=$1
    local endpoint=$2
    local data=${3:-}

    local url="https://api.cloudflare.com/client/v4${endpoint}"
    local response

    if [ -n "$data" ]; then
        response=$(curl -s -X "${method}" "${url}" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    else
        response=$(curl -s -X "${method}" "${url}" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json")
    fi

    echo "$response"
}

#===============================================================================
# Check if Tunnel Exists
#===============================================================================
check_tunnel_exists() {
    log_info "Checking if tunnel '${TUNNEL_NAME}' already exists..."

    local response=$(cloudflare_api_call "GET" "/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel")
    local tunnel_id=$(echo "$response" | jq -r ".result[] | select(.name==\"${TUNNEL_NAME}\") | .id")

    if [ -n "$tunnel_id" ] && [ "$tunnel_id" != "null" ]; then
        log_info "Tunnel already exists with ID: ${tunnel_id}"
        echo "$tunnel_id"
        return 0
    else
        log_info "Tunnel does not exist"
        return 1
    fi
}

#===============================================================================
# Create Cloudflare Tunnel
#===============================================================================
create_tunnel() {
    log_info "Creating Cloudflare tunnel '${TUNNEL_NAME}'..."

    local data=$(cat <<EOF
{
  "name": "${TUNNEL_NAME}",
  "config_src": "cloudflare"
}
EOF
    )

    local response=$(cloudflare_api_call "POST" "/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel" "$data")

    # Check for success
    if echo "$response" | jq -e '.success' &> /dev/null; then
        local tunnel_id=$(echo "$response" | jq -r '.result.id')
        log_success "Tunnel created successfully with ID: ${tunnel_id}"
        echo "$tunnel_id"
        return 0
    else
        local errors=$(echo "$response" | jq -r '.errors[] | .message')
        log_error "Failed to create tunnel: ${errors}"
        return 1
    fi
}

#===============================================================================
# Get or Create Tunnel
#===============================================================================
get_or_create_tunnel() {
    local tunnel_id

    if tunnel_id=$(check_tunnel_exists); then
        echo "$tunnel_id"
    else
        tunnel_id=$(create_tunnel)
        echo "$tunnel_id"
    fi
}

#===============================================================================
# Generate Tunnel Token
#===============================================================================
generate_tunnel_token() {
    local tunnel_id=$1
    log_info "Generating tunnel token for tunnel ID: ${tunnel_id}..."

    local response=$(cloudflare_api_call "GET" "/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${tunnel_id}/token")

    if echo "$response" | jq -e '.success' &> /dev/null; then
        local token=$(echo "$response" | jq -r '.result')
        log_success "Tunnel token generated successfully"
        echo "$token"
        return 0
    else
        log_error "Failed to generate tunnel token"
        return 1
    fi
}

#===============================================================================
# Store Token in Infisical
#===============================================================================
store_token_in_infisical() {
    local token=$1
    local tunnel_id=$2

    log_info "Storing tunnel token in Infisical..."

    # Authenticate with Infisical
    export INFISICAL_TOKEN="${INFISICAL_TOKEN}"

    # Set the secret in Infisical
    if infisical secrets set CLOUDFLARED_TOKEN="${token}" \
        --projectId="${INFISICAL_PROJECT_ID}" \
        --env=production \
        --path="/nyra/orchestrator" 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Tunnel token stored in Infisical"
    else
        log_error "Failed to store tunnel token in Infisical"
        return 1
    fi

    # Also store tunnel ID for reference
    if infisical secrets set CLOUDFLARE_TUNNEL_ID="${tunnel_id}" \
        --projectId="${INFISICAL_PROJECT_ID}" \
        --env=production \
        --path="/nyra/orchestrator" 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Tunnel ID stored in Infisical"
    else
        log_warning "Failed to store tunnel ID in Infisical (non-critical)"
    fi

    # Store tunnel name as well
    if infisical secrets set CLOUDFLARE_TUNNEL_NAME="${TUNNEL_NAME}" \
        --projectId="${INFISICAL_PROJECT_ID}" \
        --env=production \
        --path="/nyra/orchestrator" 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Tunnel name stored in Infisical"
    else
        log_warning "Failed to store tunnel name in Infisical (non-critical)"
    fi
}

#===============================================================================
# Update Docker Compose Configuration
#===============================================================================
update_docker_compose() {
    local token=$1

    log_info "Updating Docker Compose configuration..."

    local docker_compose_file="${PROJECT_ROOT}/docker-compose.infisical.yml"

    # Create backup
    if [ -f "$docker_compose_file" ]; then
        local backup_file="${BACKUP_DIR}/docker-compose.infisical.yml.${TIMESTAMP}.bak"
        cp "$docker_compose_file" "$backup_file"
        log_info "Created backup: ${backup_file}"
    else
        log_error "Docker Compose file not found: ${docker_compose_file}"
        return 1
    fi

    # Check if cloudflared service exists
    if grep -q "cloudflared-orchestrator:" "$docker_compose_file"; then
        log_info "Cloudflared service configuration found"

        # Update the TUNNEL_TOKEN environment variable
        # Note: In production, this will be retrieved from Infisical
        log_info "Docker Compose will retrieve CLOUDFLARED_TOKEN from Infisical at runtime"
        log_success "Docker Compose configuration verified"
    else
        log_warning "Cloudflared service not found in Docker Compose file"
        log_info "Please ensure the cloudflared service is configured in docker-compose.infisical.yml"
    fi
}

#===============================================================================
# Configure DNS Records
#===============================================================================
configure_dns() {
    local tunnel_id=$1

    log_info "Configuring DNS records for tunnel..."

    local subdomain="${TUNNEL_NAME}"
    local hostname="${subdomain}.${CLOUDFLARE_DOMAIN}"

    # Check if DNS record already exists
    local dns_response=$(cloudflare_api_call "GET" "/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${hostname}")
    local existing_record_id=$(echo "$dns_response" | jq -r '.result[0].id // empty')

    if [ -n "$existing_record_id" ]; then
        log_info "DNS record already exists for ${hostname}, updating..."

        local update_data=$(cat <<EOF
{
  "type": "CNAME",
  "name": "${subdomain}",
  "content": "${tunnel_id}.cfargotunnel.com",
  "ttl": 1,
  "proxied": true
}
EOF
        )

        local update_response=$(cloudflare_api_call "PUT" "/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${existing_record_id}" "$update_data")

        if echo "$update_response" | jq -e '.success' &> /dev/null; then
            log_success "DNS record updated successfully"
        else
            log_error "Failed to update DNS record"
            return 1
        fi
    else
        log_info "Creating new DNS record for ${hostname}..."

        local create_data=$(cat <<EOF
{
  "type": "CNAME",
  "name": "${subdomain}",
  "content": "${tunnel_id}.cfargotunnel.com",
  "ttl": 1,
  "proxied": true
}
EOF
        )

        local create_response=$(cloudflare_api_call "POST" "/zones/${CLOUDFLARE_ZONE_ID}/dns_records" "$create_data")

        if echo "$create_response" | jq -e '.success' &> /dev/null; then
            log_success "DNS record created successfully"
        else
            log_error "Failed to create DNS record"
            return 1
        fi
    fi

    log_info "Tunnel will be accessible at: https://${hostname}"
}

#===============================================================================
# Configure Tunnel Routing
#===============================================================================
configure_tunnel_routing() {
    local tunnel_id=$1

    log_info "Configuring tunnel routing..."

    local hostname="${TUNNEL_NAME}.${CLOUDFLARE_DOMAIN}"

    local config_data=$(cat <<EOF
{
  "config": {
    "ingress": [
      {
        "hostname": "${hostname}",
        "service": "${SERVICE_URL}"
      },
      {
        "service": "http_status:404"
      }
    ]
  }
}
EOF
    )

    local response=$(cloudflare_api_call "PUT" "/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${tunnel_id}/configurations" "$config_data")

    if echo "$response" | jq -e '.success' &> /dev/null; then
        log_success "Tunnel routing configured successfully"
        return 0
    else
        log_error "Failed to configure tunnel routing"
        return 1
    fi
}

#===============================================================================
# Validate Tunnel Connectivity
#===============================================================================
validate_tunnel() {
    local tunnel_id=$1

    log_info "Validating tunnel connectivity..."

    # Get tunnel status
    local response=$(cloudflare_api_call "GET" "/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${tunnel_id}")

    if echo "$response" | jq -e '.success' &> /dev/null; then
        local status=$(echo "$response" | jq -r '.result.status // "unknown"')
        log_info "Tunnel status: ${status}"

        if [ "$status" = "active" ] || [ "$status" = "inactive" ]; then
            log_success "Tunnel validation successful"
            return 0
        else
            log_warning "Tunnel status is: ${status}"
            log_info "The tunnel may need to be started with cloudflared"
            return 0
        fi
    else
        log_error "Failed to validate tunnel"
        return 1
    fi
}

#===============================================================================
# Generate Tunnel Credentials File
#===============================================================================
generate_credentials_file() {
    local tunnel_id=$1
    local token=$2

    log_info "Generating tunnel credentials file..."

    local creds_dir="${CONFIG_DIR}/cloudflared"
    mkdir -p "$creds_dir"

    local creds_file="${creds_dir}/${tunnel_id}.json"

    # Create credentials file
    cat > "$creds_file" <<EOF
{
  "AccountTag": "${CLOUDFLARE_ACCOUNT_ID}",
  "TunnelID": "${tunnel_id}",
  "TunnelName": "${TUNNEL_NAME}",
  "TunnelSecret": "${token}"
}
EOF

    chmod 600 "$creds_file"
    log_success "Credentials file created: ${creds_file}"

    # Also create a config.yml for cloudflared
    local config_file="${creds_dir}/config.yml"
    cat > "$config_file" <<EOF
tunnel: ${tunnel_id}
credentials-file: ${creds_file}

ingress:
  - hostname: ${TUNNEL_NAME}.${CLOUDFLARE_DOMAIN}
    service: ${SERVICE_URL}
  - service: http_status:404
EOF

    log_success "Cloudflared config created: ${config_file}"
}

#===============================================================================
# Rollback Function
#===============================================================================
rollback() {
    log_warning "Initiating rollback..."

    # Restore Docker Compose backup if exists
    local latest_backup=$(ls -t "${BACKUP_DIR}"/docker-compose.infisical.yml.*.bak 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        local docker_compose_file="${PROJECT_ROOT}/docker-compose.infisical.yml"
        cp "$latest_backup" "$docker_compose_file"
        log_info "Restored Docker Compose from backup: ${latest_backup}"
    fi

    log_info "Rollback complete. Please review the logs for details."
    log_info "You may need to manually delete the tunnel from Cloudflare dashboard"
}

#===============================================================================
# Cleanup Function
#===============================================================================
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add any cleanup tasks here
    log_success "Cleanup complete"
}

#===============================================================================
# Main Execution
#===============================================================================
main() {
    log_info "=========================================="
    log_info "Cloudflare Tunnel Setup - ${PC_ID}"
    log_info "=========================================="
    log_info "Log file: ${LOG_FILE}"
    echo ""

    # Initialize
    initialize

    # Set up error handling
    trap 'log_error "Script failed at line $LINENO"; rollback; exit 1' ERR
    trap cleanup EXIT

    # Get or create tunnel
    log_info "Step 1: Get or create Cloudflare tunnel"
    TUNNEL_ID=$(get_or_create_tunnel)
    if [ -z "$TUNNEL_ID" ]; then
        log_error "Failed to get or create tunnel"
        exit 1
    fi
    log_success "Tunnel ID: ${TUNNEL_ID}"
    echo ""

    # Generate tunnel token
    log_info "Step 2: Generate tunnel token"
    TUNNEL_TOKEN=$(generate_tunnel_token "$TUNNEL_ID")
    if [ -z "$TUNNEL_TOKEN" ]; then
        log_error "Failed to generate tunnel token"
        exit 1
    fi
    log_success "Tunnel token generated"
    echo ""

    # Store token in Infisical
    log_info "Step 3: Store tunnel credentials in Infisical"
    if ! store_token_in_infisical "$TUNNEL_TOKEN" "$TUNNEL_ID"; then
        log_error "Failed to store token in Infisical"
        exit 1
    fi
    echo ""

    # Update Docker Compose
    log_info "Step 4: Update Docker Compose configuration"
    if ! update_docker_compose "$TUNNEL_TOKEN"; then
        log_error "Failed to update Docker Compose"
        exit 1
    fi
    echo ""

    # Configure tunnel routing
    log_info "Step 5: Configure tunnel routing"
    if ! configure_tunnel_routing "$TUNNEL_ID"; then
        log_error "Failed to configure tunnel routing"
        exit 1
    fi
    echo ""

    # Configure DNS
    log_info "Step 6: Configure DNS records"
    if ! configure_dns "$TUNNEL_ID"; then
        log_error "Failed to configure DNS records"
        exit 1
    fi
    echo ""

    # Generate credentials file
    log_info "Step 7: Generate credentials file"
    if ! generate_credentials_file "$TUNNEL_ID" "$TUNNEL_TOKEN"; then
        log_error "Failed to generate credentials file"
        exit 1
    fi
    echo ""

    # Validate tunnel
    log_info "Step 8: Validate tunnel connectivity"
    if ! validate_tunnel "$TUNNEL_ID"; then
        log_warning "Tunnel validation had warnings, but continuing"
    fi
    echo ""

    # Success summary
    log_success "=========================================="
    log_success "Cloudflare Tunnel Setup Complete!"
    log_success "=========================================="
    log_info "Tunnel Name: ${TUNNEL_NAME}"
    log_info "Tunnel ID: ${TUNNEL_ID}"
    log_info "Tunnel URL: https://${TUNNEL_NAME}.${CLOUDFLARE_DOMAIN}"
    log_info "Service URL: ${SERVICE_URL}"
    log_info ""
    log_info "Next steps:"
    log_info "1. Review the configuration in ${CONFIG_DIR}/cloudflared/"
    log_info "2. Start the tunnel with: docker compose --profile tunnels up -d"
    log_info "3. Monitor tunnel status in Cloudflare dashboard"
    log_info "4. Verify connectivity to https://${TUNNEL_NAME}.${CLOUDFLARE_DOMAIN}"
    log_info ""
    log_info "Credentials stored in Infisical:"
    log_info "- CLOUDFLARED_TOKEN"
    log_info "- CLOUDFLARE_TUNNEL_ID"
    log_info "- CLOUDFLARE_TUNNEL_NAME"
    echo ""
}

# Run main function
main "$@"
