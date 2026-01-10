#!/bin/bash
set -euo pipefail

# DNS configuration for Project-Nyra local development

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run with sudo"
    exit 1
fi

echo "=========================================="
echo "  DNS Configuration"
echo "=========================================="
echo ""

# Backup existing configuration
HOSTS_BACKUP="/etc/hosts.backup-$(date +%Y%m%d-%H%M%S)"
log_info "Backing up /etc/hosts to $HOSTS_BACKUP"
cp /etc/hosts "$HOSTS_BACKUP"

# Add local DNS entries
log_info "Adding local DNS entries..."

# Remove old Project-Nyra entries
sed -i '/# Project-Nyra/d' /etc/hosts
sed -i '/nyra.local/d' /etc/hosts
sed -i '/gitea.local/d' /etc/hosts
sed -i '/prometheus.local/d' /etc/hosts
sed -i '/grafana.local/d' /etc/hosts

# Add new entries
cat >> /etc/hosts <<'EOF'

# Project-Nyra local domains
127.0.0.1       nyra.local
127.0.0.1       api.nyra.local
127.0.0.1       gitea.local
127.0.0.1       prometheus.local
127.0.0.1       grafana.local
127.0.0.1       orchestrator-mini.local

EOF

log_success "DNS entries added to /etc/hosts"

# Configure WSL DNS
log_info "Configuring WSL DNS..."

# Backup resolv.conf
if [[ -f /etc/resolv.conf ]]; then
    cp /etc/resolv.conf /etc/resolv.conf.backup
fi

# Create wsl.conf if it doesn't exist
if [[ ! -f /etc/wsl.conf ]]; then
    cat > /etc/wsl.conf <<'EOF'
[boot]
systemd=true

[network]
generateResolvConf = true

[interop]
enabled = true
appendWindowsPath = true

EOF
    log_success "Created /etc/wsl.conf"
fi

# Display current configuration
echo ""
log_info "Current DNS configuration:"
cat /etc/hosts | grep -E "nyra|gitea|prometheus|grafana"

echo ""
log_info "Configured local domains:"
echo "  • http://nyra.local:3000"
echo "  • http://api.nyra.local:3000"
echo "  • http://gitea.local:3020"
echo "  • http://prometheus.local:9090"
echo "  • http://grafana.local:3001"

echo ""
log_success "DNS configuration complete!"
log_info "Restart WSL to apply all changes: wsl --shutdown"
