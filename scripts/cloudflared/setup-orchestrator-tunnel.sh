#!/bin/bash
#
# Project Nyra - Cloudflare Tunnel Setup Script (Orchestrator)
# Sets up primary Cloudflare tunnel on orchestrator PC (10.0.0.1)
#
# Usage: sudo ./setup-orchestrator-tunnel.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/opt/nyra/logs/cloudflared-setup.log"
CONFIG_DIR="/etc/cloudflared"
TUNNEL_NAME="nyra-prod-orchestrator"
DOMAIN="nyra.yourdomain.com"  # CHANGE THIS

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (sudo)"
   exit 1
fi

# Create log directory
mkdir -p /opt/nyra/logs

log_info "========================================="
log_info "Cloudflare Tunnel Setup - Orchestrator"
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

sudo -u nyra cloudflared tunnel login

if [[ ! -f /home/nyra/.cloudflared/cert.pem ]]; then
    log_error "Authentication failed. cert.pem not found."
    exit 1
fi

log_success "Authentication successful"

# Step 3: Create tunnel
log_info "Creating tunnel: $TUNNEL_NAME"

# Check if tunnel already exists
EXISTING_TUNNEL=$(sudo -u nyra cloudflared tunnel list 2>/dev/null | grep -w "$TUNNEL_NAME" || true)

if [[ -n "$EXISTING_TUNNEL" ]]; then
    log_warning "Tunnel $TUNNEL_NAME already exists. Skipping creation."
    TUNNEL_ID=$(echo "$EXISTING_TUNNEL" | awk '{print $1}')
else
    sudo -u nyra cloudflared tunnel create "$TUNNEL_NAME"
    TUNNEL_ID=$(sudo -u nyra cloudflared tunnel list | grep -w "$TUNNEL_NAME" | awk '{print $1}')
    log_success "Tunnel created: $TUNNEL_ID"
fi

# Step 4: Copy credentials
log_info "Configuring tunnel credentials..."

mkdir -p "$CONFIG_DIR"

# Copy credentials
CRED_FILE="/home/nyra/.cloudflared/$TUNNEL_ID.json"
if [[ -f "$CRED_FILE" ]]; then
    cp "$CRED_FILE" "$CONFIG_DIR/"
    chmod 600 "$CONFIG_DIR/$TUNNEL_ID.json"
    chown nyra:nyra "$CONFIG_DIR/$TUNNEL_ID.json"
    log_success "Credentials copied to $CONFIG_DIR"
else
    log_error "Credentials file not found: $CRED_FILE"
    exit 1
fi

# Step 5: Create configuration file
log_info "Creating tunnel configuration..."

cat > "$CONFIG_DIR/config.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

# Metrics for Prometheus monitoring
metrics: 0.0.0.0:2000

# Ingress rules for orchestrator services
ingress:
  # ===== Production APIs =====
  - hostname: api.$DOMAIN
    service: http://localhost:3000
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
      keepAliveTimeout: 90s

  - hostname: quote-api.$DOMAIN
    service: http://localhost:8001

  - hostname: admin-api.$DOMAIN
    service: http://localhost:8002

  # ===== Observability Stack =====
  - hostname: grafana.$DOMAIN
    service: http://localhost:3003

  - hostname: prometheus.$DOMAIN
    service: http://localhost:9090

  - hostname: loki.$DOMAIN
    service: http://localhost:3100

  - hostname: jaeger.$DOMAIN
    service: http://localhost:16686

  # ===== Infrastructure Services =====
  - hostname: secrets.$DOMAIN
    service: http://localhost:8080

  - hostname: nexus.$DOMAIN
    service: http://localhost:8888

  - hostname: claude-flow.$DOMAIN
    service: http://localhost:8081

  # ===== Database Admin =====
  - hostname: pgadmin.$DOMAIN
    service: http://localhost:5050

  - hostname: redis.$DOMAIN
    service: http://localhost:8082

  # ===== Applications =====
  - hostname: ratehunter.$DOMAIN
    service: http://localhost:3001

  - hostname: admin.$DOMAIN
    service: http://localhost:3002

  - hostname: crm.$DOMAIN
    service: http://localhost:3004

  # ===== MCP Gateway (Internal) =====
  - hostname: mcp.$DOMAIN
    service: http://localhost:8090

  # Catch-all rule (required)
  - service: http_status:404
EOF

chmod 600 "$CONFIG_DIR/config.yml"
chown nyra:nyra "$CONFIG_DIR/config.yml"

log_success "Configuration file created: $CONFIG_DIR/config.yml"

# Step 6: Create systemd service
log_info "Creating systemd service..."

cat > /etc/systemd/system/cloudflared-orchestrator.service << EOF
[Unit]
Description=Cloudflare Tunnel - Orchestrator Primary
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Type=simple
User=nyra
Group=nyra
ExecStart=/usr/bin/cloudflared tunnel --config $CONFIG_DIR/config.yml run $TUNNEL_NAME
Restart=always
RestartSec=10s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared

# Resource limits
MemoryLimit=512M
CPUQuota=100%

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
log_success "Systemd service created"

# Step 7: Route DNS
log_info "Routing DNS records..."

SERVICES=(
    "api"
    "quote-api"
    "admin-api"
    "grafana"
    "prometheus"
    "loki"
    "jaeger"
    "secrets"
    "nexus"
    "claude-flow"
    "pgadmin"
    "redis"
    "ratehunter"
    "admin"
    "crm"
    "mcp"
)

for service in "${SERVICES[@]}"; do
    log_info "Routing DNS: $service.$DOMAIN"
    sudo -u nyra cloudflared tunnel route dns "$TUNNEL_NAME" "$service.$DOMAIN" || log_warning "Failed to route $service.$DOMAIN (may already exist)"
done

log_success "DNS routing complete"

# Step 8: Enable and start service
log_info "Starting cloudflared service..."

systemctl enable cloudflared-orchestrator.service
systemctl start cloudflared-orchestrator.service

sleep 5

# Check status
if systemctl is-active --quiet cloudflared-orchestrator.service; then
    log_success "Cloudflared service is running!"
else
    log_error "Cloudflared service failed to start"
    log_info "Check logs: journalctl -u cloudflared-orchestrator -n 50"
    exit 1
fi

# Step 9: Verify tunnel
log_info "Verifying tunnel connectivity..."

TUNNEL_STATUS=$(sudo -u nyra cloudflared tunnel info "$TUNNEL_NAME" 2>&1 || true)
log_info "$TUNNEL_STATUS"

log_info "========================================="
log_success "Setup Complete!"
log_info "========================================="
log_info ""
log_info "Next Steps:"
log_info "1. Configure Cloudflare Access policies (see docs/architecture/cloudflare-tunnel-architecture.md)"
log_info "2. Test service access: curl https://api.$DOMAIN/health"
log_info "3. Monitor tunnel: journalctl -u cloudflared-orchestrator -f"
log_info "4. View metrics: http://localhost:2000/metrics"
log_info ""
log_info "Tunnel ID: $TUNNEL_ID"
log_info "Config File: $CONFIG_DIR/config.yml"
log_info "Service Status: systemctl status cloudflared-orchestrator"
log_info ""
log_warning "IMPORTANT: Configure Cloudflare Access before exposing admin services!"
log_info ""
