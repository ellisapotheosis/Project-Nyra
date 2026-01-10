#!/bin/bash
set -euo pipefail

# Tailscale VPN setup script for Project-Nyra orchestrator-mini

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "=========================================="
echo "  Tailscale VPN Setup"
echo "=========================================="
echo ""

# Check if Tailscale is installed
if ! command -v tailscale >/dev/null 2>&1; then
    log_error "Tailscale not installed"
    log_info "Run setup-ubuntu.sh to install Tailscale"
    exit 1
fi

# Check if already connected
if tailscale status >/dev/null 2>&1; then
    log_success "Tailscale is already running"
    tailscale status
    echo ""
    log_info "Your Tailscale IP addresses:"
    tailscale status --json | jq -r '.Self.TailscaleIPs[]'
    echo ""

    read -p "Reconfigure Tailscale? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi

    log_info "Disconnecting from Tailscale..."
    sudo tailscale down
fi

# Configure Tailscale
log_info "Starting Tailscale..."
log_info "This will open a browser window for authentication"
echo ""

# Tailscale up with recommended flags
sudo tailscale up \
    --accept-routes \
    --accept-dns=true \
    --hostname=orchestrator-mini \
    --advertise-tags=tag:server,tag:nyra

if [[ $? -eq 0 ]]; then
    log_success "Tailscale connected successfully!"
    echo ""

    log_info "Network status:"
    tailscale status
    echo ""

    log_info "Your Tailscale IP addresses:"
    TAILSCALE_IPS=$(tailscale status --json | jq -r '.Self.TailscaleIPs[]')
    echo "$TAILSCALE_IPS"
    echo ""

    log_success "Configuration complete!"
    echo ""
    log_info "Useful commands:"
    log_info "  tailscale status        - Show connection status"
    log_info "  tailscale ip            - Show your Tailscale IPs"
    log_info "  tailscale ping <device> - Ping other devices"
    log_info "  tailscale netcheck      - Check network connectivity"
    log_info "  sudo tailscale down     - Disconnect"
    log_info "  sudo tailscale up       - Reconnect"
    echo ""

    # Save IP to file for easy access
    echo "$TAILSCALE_IPS" | head -1 > /tmp/tailscale-ip.txt
    log_info "Primary IP saved to /tmp/tailscale-ip.txt"
else
    log_error "Failed to connect to Tailscale"
    log_info "Check your internet connection and try again"
    exit 1
fi
