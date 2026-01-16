#!/bin/bash
#
# Tailscale Setup Script for Orchestrator Mini
# Project Nyra - Distributed 4PC Architecture
#
# This script configures Tailscale on the orchestrator node with:
# - Exit node capability
# - Subnet routing for 10.0.0.0/24
# - MagicDNS
# - ACL configuration
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TAILSCALE_CONFIG_DIR="$PROJECT_ROOT/bootstrap/configs/tailscale"
LOG_FILE="$PROJECT_ROOT/logs/tailscale-setup.log"
NODE_TYPE="orchestrator"
NODE_NAME="${HOSTNAME:-orchestrator-mini}"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Print functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "INFO" "$1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    log "ERROR" "$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARN" "$1"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
    log "INFO" "$1"
}

# Check if running as root/sudo
check_privileges() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Detect network information
detect_network_info() {
    print_header "Detecting Network Information"

    # Get primary network interface
    PRIMARY_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
    print_info "Primary interface: $PRIMARY_INTERFACE"

    # Get IP address
    IP_ADDRESS=$(ip addr show "$PRIMARY_INTERFACE" | grep "inet " | awk '{print $2}' | cut -d/ -f1)
    print_info "IP address: $IP_ADDRESS"

    # Get MAC address
    MAC_ADDRESS=$(ip link show "$PRIMARY_INTERFACE" | grep "link/ether" | awk '{print $2}')
    print_info "MAC address: $MAC_ADDRESS"

    # Store in environment
    export PRIMARY_INTERFACE IP_ADDRESS MAC_ADDRESS

    print_success "Network information detected"
}

# Check if Infisical is available
check_infisical() {
    if ! command -v infisical &> /dev/null; then
        print_warning "Infisical CLI not found. Install from: https://infisical.com/docs/cli/overview"
        return 1
    fi
    return 0
}

# Retrieve auth key from Infisical
get_auth_key() {
    print_header "Retrieving Tailscale Auth Key"

    local auth_key=""

    if check_infisical; then
        print_info "Attempting to retrieve auth key from Infisical..."
        auth_key=$(infisical secrets get TAILSCALE_AUTH_KEY_ORCHESTRATOR \
            --env prod \
            --path /project-nyra/tailscale \
            --silent 2>/dev/null || echo "")

        if [[ -n "$auth_key" ]]; then
            print_success "Auth key retrieved from Infisical"
            echo "$auth_key"
            return 0
        fi
    fi

    # Fallback to environment variable
    if [[ -n "${TAILSCALE_AUTH_KEY:-}" ]]; then
        print_info "Using auth key from TAILSCALE_AUTH_KEY environment variable"
        echo "$TAILSCALE_AUTH_KEY"
        return 0
    fi

    # Fallback to .env file
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        auth_key=$(grep "^TAILSCALE_AUTH_KEY=" "$PROJECT_ROOT/.env" | cut -d= -f2- | tr -d '"' || echo "")
        if [[ -n "$auth_key" ]]; then
            print_info "Using auth key from .env file"
            echo "$auth_key"
            return 0
        fi
    fi

    print_error "No auth key found. Please set TAILSCALE_AUTH_KEY or store in Infisical"
    exit 1
}

# Install Tailscale if not present
install_tailscale() {
    if command -v tailscale &> /dev/null; then
        local version=$(tailscale version | head -n1)
        print_info "Tailscale already installed: $version"
        return 0
    fi

    print_header "Installing Tailscale"

    # Install Tailscale based on OS
    if [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        curl -fsSL https://tailscale.com/install.sh | sh
    elif [[ -f /etc/redhat-release ]]; then
        # RHEL/CentOS/Fedora
        curl -fsSL https://tailscale.com/install.sh | sh
    elif [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        print_error "Please install Tailscale from: https://tailscale.com/download/mac"
        exit 1
    else
        print_error "Unsupported operating system"
        exit 1
    fi

    print_success "Tailscale installed successfully"
}

# Configure Tailscale
configure_tailscale() {
    print_header "Configuring Tailscale"

    local auth_key=$(get_auth_key)

    # Check if already connected
    if tailscale status &> /dev/null; then
        print_warning "Tailscale is already connected. Run 'tailscale down' to reconfigure."
        read -p "Do you want to reconfigure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping configuration"
            return 0
        fi
        tailscale down
    fi

    print_info "Starting Tailscale with orchestrator configuration..."

    # Tailscale up with orchestrator-specific flags
    tailscale up \
        --authkey="$auth_key" \
        --hostname="$NODE_NAME-tailscale" \
        --advertise-exit-node \
        --advertise-routes=10.0.0.0/24 \
        --accept-routes \
        --accept-dns \
        --ssh \
        --shields-up=false \
        --operator="$SUDO_USER" \
        2>&1 | tee -a "$LOG_FILE"

    if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
        print_success "Tailscale configured successfully"
    else
        print_error "Failed to configure Tailscale"
        exit 1
    fi
}

# Enable exit node (requires admin approval)
enable_exit_node() {
    print_header "Enabling Exit Node"

    print_info "Exit node advertised. Approval required in Tailscale admin console:"
    print_info "https://login.tailscale.com/admin/machines"
    print_info ""
    print_info "Steps to approve:"
    print_info "1. Find the machine: $NODE_NAME-tailscale"
    print_info "2. Click on the machine"
    print_info "3. Go to 'Edit route settings'"
    print_info "4. Enable 'Use as exit node'"
    print_info "5. Approve subnet routes: 10.0.0.0/24"

    print_warning "Please approve the exit node and subnet routes before continuing"
}

# Verify Tailscale status
verify_status() {
    print_header "Verifying Tailscale Status"

    if ! tailscale status &> /dev/null; then
        print_error "Tailscale is not running"
        exit 1
    fi

    local status_output=$(tailscale status 2>&1)
    echo "$status_output" | tee -a "$LOG_FILE"

    # Get Tailscale IP
    local tailscale_ip=$(tailscale ip -4 2>/dev/null || echo "N/A")
    print_success "Tailscale IP: $tailscale_ip"

    # Get Tailscale IPv6
    local tailscale_ip6=$(tailscale ip -6 2>/dev/null || echo "N/A")
    print_info "Tailscale IPv6: $tailscale_ip6"

    # Store node info for orchestration
    store_node_info "$tailscale_ip" "$tailscale_ip6"
}

# Store node information in Infisical
store_node_info() {
    local ts_ip=$1
    local ts_ip6=$2

    print_header "Storing Node Information"

    if check_infisical; then
        print_info "Storing node info in Infisical..."

        # Store node information
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_IP" "$ts_ip" \
            --env prod --path /project-nyra/tailscale || true
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_IP6" "$ts_ip6" \
            --env prod --path /project-nyra/tailscale || true
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_MAC" "$MAC_ADDRESS" \
            --env prod --path /project-nyra/tailscale || true
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_NAME" "$NODE_NAME" \
            --env prod --path /project-nyra/tailscale || true

        print_success "Node information stored in Infisical"
    else
        print_warning "Skipping Infisical storage"
    fi

    # Also store in local file for backup
    local info_file="$PROJECT_ROOT/data/tailscale-node-info.json"
    mkdir -p "$(dirname "$info_file")"

    cat > "$info_file" <<EOF
{
  "node_type": "$NODE_TYPE",
  "node_name": "$NODE_NAME",
  "tailscale_ip": "$ts_ip",
  "tailscale_ip6": "$ts_ip6",
  "mac_address": "$MAC_ADDRESS",
  "primary_interface": "$PRIMARY_INTERFACE",
  "local_ip": "$IP_ADDRESS",
  "exit_node": true,
  "subnet_routes": ["10.0.0.0/24"],
  "updated_at": "$(date -Iseconds)"
}
EOF

    print_success "Node information saved to $info_file"
}

# Configure firewall (if applicable)
configure_firewall() {
    print_header "Configuring Firewall"

    if command -v ufw &> /dev/null; then
        print_info "Configuring UFW firewall..."
        ufw allow 41641/udp comment "Tailscale" || true
        print_success "UFW configured"
    elif command -v firewall-cmd &> /dev/null; then
        print_info "Configuring firewalld..."
        firewall-cmd --permanent --add-port=41641/udp || true
        firewall-cmd --reload || true
        print_success "firewalld configured"
    else
        print_info "No firewall detected, skipping"
    fi
}

# Enable Tailscale service
enable_service() {
    print_header "Enabling Tailscale Service"

    if command -v systemctl &> /dev/null; then
        systemctl enable tailscaled
        systemctl start tailscaled
        print_success "Tailscale service enabled and started"
    else
        print_warning "systemctl not available, skipping service configuration"
    fi
}

# Print summary
print_summary() {
    print_header "Setup Complete"

    echo ""
    print_success "Tailscale setup completed successfully!"
    echo ""
    print_info "Node Type: $NODE_TYPE (Exit Node + Subnet Router)"
    print_info "Node Name: $NODE_NAME-tailscale"
    print_info "Subnet Routes: 10.0.0.0/24"
    print_info "Exit Node: Enabled (requires admin approval)"
    echo ""
    print_info "Next Steps:"
    print_info "1. Approve exit node in Tailscale admin console"
    print_info "2. Approve subnet routes in Tailscale admin console"
    print_info "3. Configure ACLs using: $TAILSCALE_CONFIG_DIR/tailscale-acls.json"
    print_info "4. Test connectivity with: tailscale ping <node-name>"
    echo ""
    print_info "For status: tailscale status"
    print_info "For logs: journalctl -u tailscaled -f"
    echo ""
}

# Main execution
main() {
    print_header "Tailscale Setup - Orchestrator Mini"

    # Check prerequisites
    check_privileges
    detect_network_info

    # Install and configure
    install_tailscale
    configure_tailscale
    enable_exit_node
    verify_status
    configure_firewall
    enable_service

    # Finish
    print_summary

    log "INFO" "Tailscale setup completed successfully"
}

# Run main function
main "$@"
