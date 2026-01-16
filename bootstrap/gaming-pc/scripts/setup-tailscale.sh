#!/bin/bash
#
# Tailscale Setup Script for Gaming PC (Worker Node)
# Project Nyra - Distributed 4PC Architecture
#
# This script configures Tailscale as a standard worker node with:
# - MagicDNS
# - Subnet route acceptance
# - Worker node configuration
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
LOG_FILE="$PROJECT_ROOT/logs/tailscale-setup.log"
NODE_TYPE="gaming-pc"
NODE_NAME="${HOSTNAME:-gaming-pc}"

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

print_header() { echo -e "${BLUE}================================\n$1\n================================${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; log "INFO" "$1"; }
print_error() { echo -e "${RED}✗ $1${NC}"; log "ERROR" "$1"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; log "WARN" "$1"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; log "INFO" "$1"; }

check_privileges() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

detect_network_info() {
    print_header "Detecting Network Information"
    PRIMARY_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
    IP_ADDRESS=$(ip addr show "$PRIMARY_INTERFACE" | grep "inet " | awk '{print $2}' | cut -d/ -f1)
    MAC_ADDRESS=$(ip link show "$PRIMARY_INTERFACE" | grep "link/ether" | awk '{print $2}')
    print_info "Interface: $PRIMARY_INTERFACE | IP: $IP_ADDRESS | MAC: $MAC_ADDRESS"
    export PRIMARY_INTERFACE IP_ADDRESS MAC_ADDRESS
    print_success "Network information detected"
}

check_infisical() {
    if ! command -v infisical &> /dev/null; then
        print_warning "Infisical CLI not found"
        return 1
    fi
    return 0
}

get_auth_key() {
    print_header "Retrieving Tailscale Auth Key"
    local auth_key=""
    
    if check_infisical; then
        auth_key=$(infisical secrets get TAILSCALE_AUTH_KEY_GAMING_PC --env prod --path /project-nyra/tailscale --silent 2>/dev/null || echo "")
        if [[ -n "$auth_key" ]]; then
            print_success "Auth key retrieved from Infisical"
            echo "$auth_key"
            return 0
        fi
    fi
    
    if [[ -n "${TAILSCALE_AUTH_KEY:-}" ]]; then
        print_info "Using auth key from environment variable"
        echo "$TAILSCALE_AUTH_KEY"
        return 0
    fi
    
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

install_tailscale() {
    if command -v tailscale &> /dev/null; then
        print_info "Tailscale already installed: $(tailscale version | head -n1)"
        return 0
    fi
    
    print_header "Installing Tailscale"
    curl -fsSL https://tailscale.com/install.sh | sh
    print_success "Tailscale installed successfully"
}

configure_tailscale() {
    print_header "Configuring Tailscale"
    local auth_key=$(get_auth_key)
    
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
    
    print_info "Starting Tailscale with worker node configuration..."
    
    tailscale up \
        --authkey="$auth_key" \
        --hostname="$NODE_NAME-tailscale" \
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

verify_status() {
    print_header "Verifying Tailscale Status"
    
    if ! tailscale status &> /dev/null; then
        print_error "Tailscale is not running"
        exit 1
    fi
    
    tailscale status | tee -a "$LOG_FILE"
    
    local tailscale_ip=$(tailscale ip -4 2>/dev/null || echo "N/A")
    print_success "Tailscale IP: $tailscale_ip"
    
    store_node_info "$tailscale_ip"
}

store_node_info() {
    local ts_ip=$1
    print_header "Storing Node Information"
    
    if check_infisical; then
        print_info "Storing node info in Infisical..."
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_IP" "$ts_ip" --env prod --path /project-nyra/tailscale || true
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_MAC" "$MAC_ADDRESS" --env prod --path /project-nyra/tailscale || true
        infisical secrets set "TAILSCALE_NODE_${NODE_TYPE^^}_NAME" "$NODE_NAME" --env prod --path /project-nyra/tailscale || true
        print_success "Node information stored in Infisical"
    fi
    
    local info_file="$PROJECT_ROOT/data/tailscale-node-info.json"
    mkdir -p "$(dirname "$info_file")"
    
    cat > "$info_file" <<EOF
{
  "node_type": "$NODE_TYPE",
  "node_name": "$NODE_NAME",
  "tailscale_ip": "$ts_ip",
  "mac_address": "$MAC_ADDRESS",
  "primary_interface": "$PRIMARY_INTERFACE",
  "local_ip": "$IP_ADDRESS",
  "exit_node": false,
  "worker": true,
  "updated_at": "$(date -Iseconds)"
}
EOF
    
    print_success "Node information saved to $info_file"
}

configure_firewall() {
    print_header "Configuring Firewall"
    if command -v ufw &> /dev/null; then
        ufw allow 41641/udp comment "Tailscale" || true
        print_success "UFW configured"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-port=41641/udp || true
        firewall-cmd --reload || true
        print_success "firewalld configured"
    else
        print_info "No firewall detected, skipping"
    fi
}

enable_service() {
    print_header "Enabling Tailscale Service"
    if command -v systemctl &> /dev/null; then
        systemctl enable tailscaled
        systemctl start tailscaled
        print_success "Tailscale service enabled and started"
    fi
}

print_summary() {
    print_header "Setup Complete"
    echo ""
    print_success "Tailscale setup completed successfully!"
    echo ""
    print_info "Node Type: $NODE_TYPE (Worker Node)"
    print_info "Node Name: $NODE_NAME-tailscale"
    print_info "Configuration: Standard worker with route acceptance"
    echo ""
    print_info "For status: tailscale status"
    print_info "For logs: journalctl -u tailscaled -f"
    echo ""
}

main() {
    print_header "Tailscale Setup - Gaming PC (Worker)"
    check_privileges
    detect_network_info
    install_tailscale
    configure_tailscale
    verify_status
    configure_firewall
    enable_service
    print_summary
    log "INFO" "Tailscale setup completed successfully"
}

main "$@"
