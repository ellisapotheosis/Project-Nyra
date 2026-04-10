#!/bin/bash
# Nyra Orchestrator Setup Script
# Minisforum UH680 (Ryzen 7 6800H, 16GB DDR5, 1TB SSD)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
        exit 1
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."

    # Update package lists
    sudo apt update

    # Install required packages
    sudo apt install -y \
        curl \
        wget \
        git \
        nodejs \
        npm \
        python3 \
        python3-pip \
        docker.io \
        docker-compose \
        ufw \
        htop \
        iotop \
        net-tools \
        jq \
        unzip

    # Add user to docker group
    sudo usermod -aG docker $USER

    success "System dependencies installed"
}

# Install Cloudflared
install_cloudflared() {
    log "Installing cloudflared..."

    # Download and install cloudflared
    if ! command -v cloudflared &> /dev/null; then
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared.deb
        rm cloudflared.deb

        success "Cloudflared installed"
    else
        success "Cloudflared already installed"
    fi
}

# Setup cloudflared directories and permissions
setup_cloudflared_directories() {
    log "Setting up cloudflared directories..."

    sudo mkdir -p /etc/cloudflared
    sudo mkdir -p /var/log/cloudflared
    sudo chown -R $USER:$USER /etc/cloudflared
    sudo chown -R $USER:$USER /var/log/cloudflared

    success "Cloudflared directories created"
}

# Install Node.js dependencies
install_node_dependencies() {
    log "Installing Node.js dependencies..."

    cd "$PROJECT_ROOT"

    # Install project dependencies
    npm install

    # Install global utilities
    sudo npm install -g pm2 nodemon

    success "Node.js dependencies installed"
}

# Setup firewall rules
setup_firewall() {
    log "Configuring firewall..."

    # Enable UFW
    sudo ufw --force enable

    # Allow SSH
    sudo ufw allow ssh

    # Allow internal network
    sudo ufw allow from 192.168.1.0/24

    # Allow specific ports for Nyra services
    sudo ufw allow 3000   # archon-os
    sudo ufw allow 8080   # Task API
    sudo ufw allow 9090   # Health Dashboard
    sudo ufw allow 8081   # GPU Metrics
    sudo ufw allow 8888   # Cloudflared Metrics

    success "Firewall configured"
}

# Create systemd service for orchestrator
create_systemd_service() {
    log "Creating systemd service..."

    sudo tee /etc/systemd/system/nyra-orchestrator.service > /dev/null <<EOF
[Unit]
Description=Nyra Orchestrator Service
After=network.target
Requires=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_ROOT
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start:orchestrator
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=nyra-orchestrator

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable nyra-orchestrator

    success "Systemd service created"
}

# Setup cloudflared tunnel
setup_tunnel() {
    log "Setting up cloudflared tunnel..."

    # Check if tunnel credentials exist
    if [[ ! -f "/etc/cloudflared/cert.pem" ]]; then
        warning "Cloudflare certificate not found. Please run:"
        echo "  cloudflared tunnel login"
        echo "  cloudflared tunnel create nyra-orchestrator"
        echo "  Then re-run this script"
        return 1
    fi

    # Copy tunnel configuration
    cp "$PROJECT_ROOT/config/tunnels/orchestrator.yml" /etc/cloudflared/config.yml

    # Replace environment variables in config
    envsubst < "$PROJECT_ROOT/config/tunnels/orchestrator.yml" > /etc/cloudflared/config.yml

    # Create systemd service for tunnel
    sudo cloudflared service install
    sudo systemctl enable cloudflared

    success "Cloudflared tunnel configured"
}

# Setup monitoring and health checks
setup_monitoring() {
    log "Setting up monitoring..."

    # Create monitoring scripts directory
    mkdir -p "$PROJECT_ROOT/scripts/monitoring"

    # Create health check script
    cat > "$PROJECT_ROOT/scripts/monitoring/health-check.sh" <<'EOF'
#!/bin/bash
# Nyra Orchestrator Health Check

check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3

    if curl -sf "http://localhost:$port$endpoint" > /dev/null; then
        echo "✅ $service_name is healthy"
        return 0
    else
        echo "❌ $service_name is unhealthy"
        return 1
    fi
}

echo "🔍 Nyra Orchestrator Health Check - $(date)"
echo "============================================"

# Check services
check_service "archon-os" 3000 "/health" || FAILED=1
check_service "Task API" 8080 "/health" || FAILED=1
check_service "Health Dashboard" 9090 "/health" || FAILED=1
check_service "GPU Metrics" 8081 "/metrics" || FAILED=1

# Check cloudflared
if systemctl is-active --quiet cloudflared; then
    echo "✅ Cloudflared tunnel is running"
else
    echo "❌ Cloudflared tunnel is not running"
    FAILED=1
fi

if [[ -z ${FAILED:-} ]]; then
    echo "🟢 All services healthy"
    exit 0
else
    echo "🔴 Some services unhealthy"
    exit 1
fi
EOF

    chmod +x "$PROJECT_ROOT/scripts/monitoring/health-check.sh"

    # Setup cron job for health checks
    (crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_ROOT/scripts/monitoring/health-check.sh >> /var/log/nyra-health.log 2>&1") | crontab -

    success "Monitoring configured"
}

# Setup log rotation
setup_logging() {
    log "Setting up log rotation..."

    sudo tee /etc/logrotate.d/nyra <<EOF
/var/log/cloudflared/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}

/var/log/nyra-*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

    success "Log rotation configured"
}

# Display setup information
show_setup_info() {
    log "Setup completed! Here's what was installed:"
    echo
    echo "🏗️  System Components:"
    echo "   - Cloudflared tunnel client"
    echo "   - Docker and Docker Compose"
    echo "   - Node.js and npm packages"
    echo "   - PM2 process manager"
    echo
    echo "🔧 Services:"
    echo "   - nyra-orchestrator.service"
    echo "   - cloudflared.service"
    echo
    echo "🔍 Monitoring:"
    echo "   - Health check script (/scripts/monitoring/health-check.sh)"
    echo "   - Cron job for automated checks"
    echo "   - Log rotation for system logs"
    echo
    echo "🌐 Network Configuration:"
    echo "   - Firewall rules for internal network"
    echo "   - Service ports opened: 3000, 8080, 9090, 8081"
    echo
    echo "⚡ Next Steps:"
    echo "   1. Configure Cloudflare tunnel: cloudflared tunnel login"
    echo "   2. Create tunnel: cloudflared tunnel create nyra-orchestrator"
    echo "   3. Set environment variables in .env"
    echo "   4. Start services: sudo systemctl start nyra-orchestrator"
    echo "   5. Start tunnel: sudo systemctl start cloudflared"
    echo
    echo "🔗 Service URLs (after tunnel setup):"
    echo "   - https://nyra.ratehunter.net"
    echo "   - https://orchestrator.ratehunter.net"
    echo "   - https://health.ratehunter.net"
    echo "   - https://api.ratehunter.net"
}

# Main setup function
main() {
    log "Starting Nyra Orchestrator setup..."

    check_root
    install_dependencies
    install_cloudflared
    setup_cloudflared_directories
    install_node_dependencies
    setup_firewall
    create_systemd_service
    setup_monitoring
    setup_logging

    # Note: setup_tunnel requires manual steps first

    success "Orchestrator setup completed!"
    show_setup_info
}

# Run main function
main "$@"