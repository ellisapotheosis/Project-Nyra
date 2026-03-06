#!/bin/bash

# Nyra Cloudflared Tunnel Setup with Infisical Integration
# Configures cloudflared tunnels for each PC with secret management

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TUNNELS_CONFIG="$PROJECT_ROOT/config/cloudflared/tunnel-configs.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Tunnel definitions
declare -A TUNNELS=(
    ["orchestrator"]="nyra-orchestrator.ratehunter.net,nyra.ratehunter.net,mcp.ratehunter.net,secrets.ratehunter.net"
    ["worker-1"]="worker-1.ratehunter.net,gpu-1.ratehunter.net"
    ["worker-2"]="worker-2.ratehunter.net,gpu-2.ratehunter.net"
    ["worker-3"]="worker-3.ratehunter.net,gpu-3.ratehunter.net"
)

# Check prerequisites
check_prerequisites() {
    log_info "Checking tunnel setup prerequisites..."

    if ! command -v cloudflared &> /dev/null; then
        log_error "cloudflared CLI not found. Please install it first."
        echo "  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
        echo "  sudo dpkg -i cloudflared.deb"
        exit 1
    fi

    if ! command -v infisical &> /dev/null; then
        log_error "Infisical CLI not found. Please install it first."
        exit 1
    fi

    if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -z "${CLOUDFLARE_EMAIL:-}" ]]; then
        log_error "Cloudflare credentials not found in environment."
        echo "Please set either:"
        echo "  - CLOUDFLARE_API_TOKEN (recommended)"
        echo "  - CLOUDFLARE_EMAIL and CLOUDFLARE_API_KEY"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Authenticate with Cloudflare
authenticate_cloudflare() {
    log_info "Authenticating with Cloudflare..."

    if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
        export CLOUDFLARE_API_TOKEN
        cloudflared tunnel login --api-token="$CLOUDFLARE_API_TOKEN"
    else
        cloudflared tunnel login
    fi

    log_success "Authenticated with Cloudflare"
}

# Create tunnel for PC
create_tunnel() {
    local pc_id="$1"
    local tunnel_name="nyra-${pc_id}"

    log_info "Creating tunnel: $tunnel_name"

    # Check if tunnel already exists
    if cloudflared tunnel list | grep -q "$tunnel_name"; then
        log_warning "Tunnel $tunnel_name already exists"
        return 0
    fi

    # Create tunnel
    cloudflared tunnel create "$tunnel_name"

    # Get tunnel ID
    local tunnel_id
    tunnel_id=$(cloudflared tunnel list | grep "$tunnel_name" | awk '{print $1}')

    if [[ -z "$tunnel_id" ]]; then
        log_error "Failed to get tunnel ID for $tunnel_name"
        return 1
    fi

    log_success "Created tunnel: $tunnel_name (ID: $tunnel_id)"

    # Store tunnel credentials in Infisical
    store_tunnel_credentials "$pc_id" "$tunnel_id"

    return 0
}

# Store tunnel credentials in Infisical
store_tunnel_credentials() {
    local pc_id="$1"
    local tunnel_id="$2"
    local tunnel_name="nyra-${pc_id}"

    log_info "Storing tunnel credentials for $pc_id in Infisical..."

    # Find the tunnel JSON file
    local creds_file="$HOME/.cloudflared/${tunnel_id}.json"
    if [[ ! -f "$creds_file" ]]; then
        log_error "Tunnel credentials file not found: $creds_file"
        return 1
    fi

    # Store in Infisical
    local tunnel_token
    if ! tunnel_token="$(cloudflared tunnel token "$tunnel_name")"; then
        log_error "Failed to retrieve tunnel token for $tunnel_name"
        return 1
    fi
    if [[ -z "$tunnel_token" ]]; then
        log_error "Tunnel token is empty for $tunnel_name"
        return 1
    fi

    infisical secrets set "CLOUDFLARE_TUNNEL_TOKEN" "$tunnel_token" \
        --env=production --path="/nyra/${pc_id}"

    infisical secrets set "CLOUDFLARE_TUNNEL_NAME" "$tunnel_name" \
        --env=production --path="/nyra/${pc_id}"

    infisical secrets set "CLOUDFLARE_TUNNEL_ID" "$tunnel_id" \
        --env=production --path="/nyra/${pc_id}"

    infisical secrets set "CLOUDFLARE_TUNNEL_CREDENTIALS" "$(base64 -w 0 < "$creds_file")" \
        --env=production --path="/nyra/${pc_id}"

    log_success "Stored tunnel credentials for $pc_id in Infisical"
}

# Configure DNS records
configure_dns() {
    local pc_id="$1"
    local tunnel_name="nyra-${pc_id}"

    log_info "Configuring DNS records for $pc_id..."

    # Get tunnel ID
    local tunnel_id
    tunnel_id=$(cloudflared tunnel list | grep "$tunnel_name" | awk '{print $1}')

    if [[ -z "$tunnel_id" ]]; then
        log_error "Tunnel ID not found for $tunnel_name"
        return 1
    fi

    # Configure DNS for each hostname
    local hostnames="${TUNNELS[$pc_id]}"
    IFS=',' read -ra hostname_array <<< "$hostnames"

    for hostname in "${hostname_array[@]}"; do
        log_info "Configuring DNS: $hostname -> $tunnel_name"

        # Create CNAME record pointing to tunnel
        cloudflared tunnel route dns "$tunnel_id" "$hostname" || {
            log_warning "Failed to create DNS record for $hostname (may already exist)"
        }
    done

    log_success "DNS configuration completed for $pc_id"
}

# Generate tunnel configuration file
generate_tunnel_config() {
    local pc_id="$1"
    local config_file="/tmp/tunnel-${pc_id}.yml"

    log_info "Generating tunnel configuration for $pc_id..."

    # Extract configuration from main config file
    python3 << EOF
import yaml
import sys

try:
    with open('$TUNNELS_CONFIG', 'r') as f:
        config = yaml.safe_load(f)

    pc_config = config.get('$pc_id', {})
    shared_config = config.get('shared_settings', {})

    # Merge configurations
    tunnel_config = {**shared_config, **pc_config}

    with open('$config_file', 'w') as f:
        yaml.dump(tunnel_config, f, default_flow_style=False)

    print(f"Generated config: $config_file")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
EOF

    if [[ ! -f "$config_file" ]]; then
        log_error "Failed to generate tunnel configuration for $pc_id"
        return 1
    fi

    log_success "Generated tunnel configuration: $config_file"
    echo "$config_file"
}

# Validate tunnel configuration
validate_tunnel() {
    local pc_id="$1"
    local config_file="$2"

    log_info "Validating tunnel configuration for $pc_id..."

    # Use cloudflared to validate the configuration
    if cloudflared tunnel --config "$config_file" ingress validate; then
        log_success "Tunnel configuration is valid for $pc_id"
        return 0
    else
        log_error "Invalid tunnel configuration for $pc_id"
        return 1
    fi
}

# Create systemd service for tunnel
create_systemd_service() {
    local pc_id="$1"
    local config_file="$2"
    local service_file="/tmp/cloudflared-${pc_id}.service"

    log_info "Creating systemd service for tunnel: $pc_id"

    cat > "$service_file" << EOF
[Unit]
Description=Nyra Cloudflared Tunnel - $pc_id
After=network.target
Wants=network.target

[Service]
Type=simple
User=cloudflared
Group=cloudflared
ExecStart=/usr/local/bin/cloudflared --config $config_file tunnel run
Restart=on-failure
RestartSec=10
KillMode=mixed
StandardOutput=journal
StandardError=journal

# Environment variables from Infisical
Environment=INFISICAL_PROJECT_ID=$INFISICAL_PROJECT_ID
Environment=INFISICAL_TOKEN=$INFISICAL_TOKEN

[Install]
WantedBy=multi-user.target
EOF

    log_success "Created systemd service file: $service_file"
    echo "To install the service:"
    echo "  sudo cp $service_file /etc/systemd/system/"
    echo "  sudo systemctl enable cloudflared-${pc_id}.service"
    echo "  sudo systemctl start cloudflared-${pc_id}.service"
}

# Test tunnel connectivity
test_tunnel() {
    local pc_id="$1"
    local hostnames="${TUNNELS[$pc_id]}"

    log_info "Testing tunnel connectivity for $pc_id..."

    IFS=',' read -ra hostname_array <<< "$hostnames"

    for hostname in "${hostname_array[@]}"; do
        log_info "Testing: https://$hostname"

        if curl -s -o /dev/null -w "%{http_code}" "https://$hostname" | grep -q "200\|404\|503"; then
            log_success "✓ $hostname is reachable"
        else
            log_warning "✗ $hostname is not reachable or returned unexpected status"
        fi
    done
}

# Main setup function
setup_pc_tunnel() {
    local pc_id="$1"

    log_info "Setting up tunnel for PC: $pc_id"
    echo "====================================="

    # Create tunnel
    if ! create_tunnel "$pc_id"; then
        log_error "Failed to create tunnel for $pc_id"
        return 1
    fi

    # Configure DNS
    if ! configure_dns "$pc_id"; then
        log_error "Failed to configure DNS for $pc_id"
        return 1
    fi

    # Generate configuration
    local config_file
    config_file=$(generate_tunnel_config "$pc_id")
    if [[ -z "$config_file" ]]; then
        log_error "Failed to generate configuration for $pc_id"
        return 1
    fi

    # Validate configuration
    if ! validate_tunnel "$pc_id" "$config_file"; then
        log_error "Tunnel configuration validation failed for $pc_id"
        return 1
    fi

    # Create systemd service
    create_systemd_service "$pc_id" "$config_file"

    log_success "Tunnel setup completed for $pc_id"
    echo ""
}

# Main script
main() {
    echo "Nyra Cloudflared Tunnel Setup with Infisical Integration"
    echo "======================================================="
    echo ""

    # Check command line arguments
    local target_pc="${1:-all}"

    # Check prerequisites
    check_prerequisites

    # Authenticate with Cloudflare
    authenticate_cloudflare

    if [[ "$target_pc" == "all" ]]; then
        # Setup tunnels for all PCs
        for pc_id in "${!TUNNELS[@]}"; do
            setup_pc_tunnel "$pc_id"
        done
    else
        # Setup tunnel for specific PC
        if [[ -z "${TUNNELS[$target_pc]:-}" ]]; then
            log_error "Unknown PC: $target_pc"
            echo "Available PCs: ${!TUNNELS[*]}"
            exit 1
        fi

        setup_pc_tunnel "$target_pc"
    fi

    echo ""
    log_success "Tunnel setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Copy generated systemd service files to /etc/systemd/system/"
    echo "2. Enable and start the services"
    echo "3. Test connectivity with: $0 test <pc_id>"
    echo "4. Update Docker Compose files with tunnel tokens"
    echo ""
}

# Handle test command
if [[ "${1:-}" == "test" ]]; then
    if [[ -n "${2:-}" ]]; then
        test_tunnel "$2"
    else
        for pc_id in "${!TUNNELS[@]}"; do
            test_tunnel "$pc_id"
        done
    fi
    exit 0
fi

# Run main function
main "$@"