#!/bin/bash
set -euo pipefail

# Stop all Project-Nyra services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NYRA_HOME="/opt/nyra"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "========================================"
echo "  Stopping Project-Nyra Services"
echo "========================================"
echo ""

# Stop Project-Nyra applications
log "Stopping Project-Nyra applications..."

MAIN_APP="$NYRA_HOME/repos/project-nyra"
if [[ -d "$MAIN_APP" ]]; then
    cd "$MAIN_APP"

    # Stop Docker Compose
    if [[ -f "docker-compose.yml" ]]; then
        log "Stopping Docker Compose services..."
        docker compose down 2>/dev/null || warn "No running containers"
        success "Docker Compose services stopped"
    fi

    # Stop PM2
    if command -v pm2 >/dev/null 2>&1; then
        log "Stopping PM2 processes..."
        pm2 stop all 2>/dev/null || warn "No PM2 processes"
        pm2 delete all 2>/dev/null || true
        success "PM2 processes stopped"
    fi
fi

# Stop Gitea
log "Stopping Gitea..."
GITEA_COMPOSE="$NYRA_HOME/gitea/docker-compose.yml"
if [[ -f "$GITEA_COMPOSE" ]]; then
    cd "$(dirname "$GITEA_COMPOSE")"
    docker compose down 2>/dev/null || warn "Gitea not running"
    success "Gitea stopped"
fi

# Stop monitoring
log "Stopping monitoring..."
sudo systemctl stop node_exporter 2>/dev/null || warn "Node Exporter not running"

# Stop Nginx
log "Stopping Nginx..."
if sudo systemctl stop nginx 2>/dev/null; then
    success "Nginx stopped"
else
    warn "Nginx not running"
fi

# Stop Redis
log "Stopping Redis..."
if sudo systemctl stop redis-server 2>/dev/null; then
    success "Redis stopped"
else
    warn "Redis not running"
fi

# Stop PostgreSQL
log "Stopping PostgreSQL..."
if sudo systemctl stop postgresql 2>/dev/null; then
    success "PostgreSQL stopped"
else
    warn "PostgreSQL not running"
fi

# Optionally stop Docker (commented out by default)
# log "Stopping Docker..."
# sudo systemctl stop docker 2>/dev/null || warn "Docker not running"

# Optionally stop Tailscale (commented out by default)
# log "Stopping Tailscale..."
# sudo systemctl stop tailscaled 2>/dev/null || warn "Tailscale not running"

echo ""
success "All services stopped!"
echo ""
log "Start services: $SCRIPT_DIR/start-all.sh"
log "Check status: $SCRIPT_DIR/status.sh"
