#!/bin/bash
#
# Project Nyra - Cloudflare Tunnel Setup Script (Worker)
# Sets up development tunnel on worker PCs
#
# Usage: sudo ./setup-worker-tunnel.sh <worker-id>
#        worker-id: rtx5090 | rtx3060 | rtx3090ti
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/opt/nyra/logs/cloudflared-setup.log"
CONFIG_DIR="/etc/cloudflared"
DOMAIN="nyra.yourdomain.com"  # CHANGE THIS

# Worker configuration
WORKER_ID="${1:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

# Validate worker ID
if [[ -z "$WORKER_ID" ]]; then
    log_error "Usage: sudo $0 <worker-id>"
    log_error "worker-id: rtx5090 | rtx3060 | rtx3090ti"
    exit 1
fi

case "$WORKER_ID" in
    rtx5090)
        TUNNEL_NAME="nyra-dev-worker-rtx5090"
        WORKER_IP="10.0.0.2"
        ;;
    rtx3060)
        TUNNEL_NAME="nyra-dev-worker-rtx3060"
        WORKER_IP="10.0.0.3"
        ;;
    rtx3090ti)
        TUNNEL_NAME="nyra-compute-rtx3090ti"
        WORKER_IP="10.0.0.4"
        ;;
    *)
        log_error "Invalid worker ID: $WORKER_ID"
        log_error "Valid options: rtx5090, rtx3060, rtx3090ti"
        exit 1
        ;;
esac

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (sudo)"
   exit 1
fi

# Create log directory
mkdir -p /opt/nyra/logs

log_info "========================================="
log_info "Cloudflare Tunnel Setup - Worker $WORKER_ID"
log_info "========================================="

# Step 1: Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    log_info "Installing cloudflared..."

    # Download latest cloudflared
    CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    curl -L --output /tmp/cloudflared.deb "$CLOUDFLARED_URL"

    # Install
    dpkg -i /tmp/cloudflared.deb
    rm /tmp/cloudflared.deb

    log_success "cloudflared installed successfully"
else
    log_info "cloudflared is already installed ($(cloudflared --version))"
fi

# Step 2: Authenticate with Cloudflare
log_info "Authenticating with Cloudflare..."
log_warning "A browser window will open. Please log in to your Cloudflare account."
log_warning "After authentication, return to this terminal."

# Get current user
CURRENT_USER=$(logname || echo $SUDO_USER)
sudo -u "$CURRENT_USER" cloudflared tunnel login

if [[ ! -f "/home/$CURRENT_USER/.cloudflared/cert.pem" ]]; then
    log_error "Authentication failed. cert.pem not found."
    exit 1
fi

log_success "Authentication successful"

# Step 3: Create tunnel
log_info "Creating tunnel: $TUNNEL_NAME"

# Check if tunnel already exists
EXISTING_TUNNEL=$(sudo -u "$CURRENT_USER" cloudflared tunnel list 2>/dev/null | grep -w "$TUNNEL_NAME" || true)

if [[ -n "$EXISTING_TUNNEL" ]]; then
    log_warning "Tunnel $TUNNEL_NAME already exists. Skipping creation."
    TUNNEL_ID=$(echo "$EXISTING_TUNNEL" | awk '{print $1}')
else
    sudo -u "$CURRENT_USER" cloudflared tunnel create "$TUNNEL_NAME"
    TUNNEL_ID=$(sudo -u "$CURRENT_USER" cloudflared tunnel list | grep -w "$TUNNEL_NAME" | awk '{print $1}')
    log_success "Tunnel created: $TUNNEL_ID"
fi

# Step 4: Copy credentials
log_info "Configuring tunnel credentials..."

mkdir -p "$CONFIG_DIR"

# Copy credentials
CRED_FILE="/home/$CURRENT_USER/.cloudflared/$TUNNEL_ID.json"
if [[ -f "$CRED_FILE" ]]; then
    cp "$CRED_FILE" "$CONFIG_DIR/"
    chmod 600 "$CONFIG_DIR/$TUNNEL_ID.json"
    chown "$CURRENT_USER:$CURRENT_USER" "$CONFIG_DIR/$TUNNEL_ID.json"
    log_success "Credentials copied to $CONFIG_DIR"
else
    log_error "Credentials file not found: $CRED_FILE"
    exit 1
fi

# Step 5: Create configuration file
log_info "Creating tunnel configuration..."

if [[ "$WORKER_ID" == "rtx3090ti" ]]; then
    # RTX3090Ti - Compute worker (on-demand)
    cat > "$CONFIG_DIR/config-$WORKER_ID.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

# Metrics for Prometheus monitoring
metrics: 0.0.0.0:2000

# Ingress rules for compute worker (on-demand)
ingress:
  # TensorBoard
  - hostname: tensorboard-$WORKER_ID.$DOMAIN
    service: http://localhost:6006

  # Compute Monitor
  - hostname: compute-$WORKER_ID.$DOMAIN
    service: http://localhost:8889

  # Catch-all rule (required)
  - service: http_status:404
EOF
else
    # RTX5090 / RTX3060 - Development workers
    cat > "$CONFIG_DIR/config-$WORKER_ID.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

# Metrics for Prometheus monitoring
metrics: 0.0.0.0:2000

# Ingress rules for development worker
ingress:
  # Jupyter Lab
  - hostname: jupyter-$WORKER_ID.$DOMAIN
    service: http://localhost:8888

  # Ollama UI
  - hostname: ollama-$WORKER_ID.$DOMAIN
    service: http://localhost:11434

  # Text Generation WebUI
  - hostname: textgen-$WORKER_ID.$DOMAIN
    service: http://localhost:7860

  # VS Code Server
  - hostname: code-$WORKER_ID.$DOMAIN
    service: http://localhost:8443

  # Catch-all rule (required)
  - service: http_status:404
EOF
fi

chmod 600 "$CONFIG_DIR/config-$WORKER_ID.yml"
chown "$CURRENT_USER:$CURRENT_USER" "$CONFIG_DIR/config-$WORKER_ID.yml"

log_success "Configuration file created: $CONFIG_DIR/config-$WORKER_ID.yml"

# Step 6: Create systemd service
log_info "Creating systemd service..."

if [[ "$WORKER_ID" == "rtx3090ti" ]]; then
    # On-demand service (no auto-restart)
    cat > /etc/systemd/system/cloudflared-$WORKER_ID.service << EOF
[Unit]
Description=Cloudflare Tunnel - Worker $WORKER_ID (On-Demand)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$CURRENT_USER
Group=$CURRENT_USER
ExecStart=/usr/bin/cloudflared tunnel --config $CONFIG_DIR/config-$WORKER_ID.yml run $TUNNEL_NAME
Restart=no
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared-$WORKER_ID

# Resource limits
MemoryLimit=256M
CPUQuota=50%

[Install]
WantedBy=multi-user.target
EOF
else
    # Always-on service
    cat > /etc/systemd/system/cloudflared-$WORKER_ID.service << EOF
[Unit]
Description=Cloudflare Tunnel - Worker $WORKER_ID
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$CURRENT_USER
Group=$CURRENT_USER
ExecStart=/usr/bin/cloudflared tunnel --config $CONFIG_DIR/config-$WORKER_ID.yml run $TUNNEL_NAME
Restart=always
RestartSec=10s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared-$WORKER_ID

# Resource limits
MemoryLimit=256M
CPUQuota=50%

[Install]
WantedBy=multi-user.target
EOF
fi

systemctl daemon-reload
log_success "Systemd service created"

# Step 7: Route DNS
log_info "Routing DNS records..."

if [[ "$WORKER_ID" == "rtx3090ti" ]]; then
    SERVICES=("tensorboard-$WORKER_ID" "compute-$WORKER_ID")
else
    SERVICES=("jupyter-$WORKER_ID" "ollama-$WORKER_ID" "textgen-$WORKER_ID" "code-$WORKER_ID")
fi

for service in "${SERVICES[@]}"; do
    log_info "Routing DNS: $service.$DOMAIN"
    sudo -u "$CURRENT_USER" cloudflared tunnel route dns "$TUNNEL_NAME" "$service.$DOMAIN" || log_warning "Failed to route $service.$DOMAIN (may already exist)"
done

log_success "DNS routing complete"

# Step 8: Enable and start service
if [[ "$WORKER_ID" != "rtx3090ti" ]]; then
    log_info "Starting cloudflared service..."

    systemctl enable cloudflared-$WORKER_ID.service
    systemctl start cloudflared-$WORKER_ID.service

    sleep 5

    # Check status
    if systemctl is-active --quiet cloudflared-$WORKER_ID.service; then
        log_success "Cloudflared service is running!"
    else
        log_error "Cloudflared service failed to start"
        log_info "Check logs: journalctl -u cloudflared-$WORKER_ID -n 50"
        exit 1
    fi
else
    log_warning "RTX3090Ti tunnel configured but not started (on-demand mode)"
    log_info "To start tunnel: sudo systemctl start cloudflared-$WORKER_ID"
fi

# Step 9: Verify tunnel
log_info "Verifying tunnel connectivity..."

TUNNEL_STATUS=$(sudo -u "$CURRENT_USER" cloudflared tunnel info "$TUNNEL_NAME" 2>&1 || true)
log_info "$TUNNEL_STATUS"

log_info "========================================="
log_success "Setup Complete!"
log_info "========================================="
log_info ""
log_info "Worker: $WORKER_ID ($WORKER_IP)"
log_info "Tunnel ID: $TUNNEL_ID"
log_info "Config File: $CONFIG_DIR/config-$WORKER_ID.yml"
log_info ""

if [[ "$WORKER_ID" == "rtx3090ti" ]]; then
    log_info "On-Demand Services:"
    log_info "  - https://tensorboard-$WORKER_ID.$DOMAIN"
    log_info "  - https://compute-$WORKER_ID.$DOMAIN"
    log_info ""
    log_info "Start tunnel: sudo systemctl start cloudflared-$WORKER_ID"
else
    log_info "Development Services:"
    log_info "  - https://jupyter-$WORKER_ID.$DOMAIN"
    log_info "  - https://ollama-$WORKER_ID.$DOMAIN"
    log_info "  - https://textgen-$WORKER_ID.$DOMAIN"
    log_info "  - https://code-$WORKER_ID.$DOMAIN"
fi

log_info ""
log_info "Monitor tunnel: journalctl -u cloudflared-$WORKER_ID -f"
log_info "View metrics: http://localhost:2000/metrics"
log_info ""
log_warning "IMPORTANT: Configure Cloudflare Access for team authentication!"
log_info ""
