#!/bin/bash
set -euo pipefail

# Start all Project-Nyra services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NYRA_HOME="/opt/nyra"
LOG_DIR="$NYRA_HOME/logs"

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

# Create log directory
mkdir -p "$LOG_DIR"

echo "========================================"
echo "  Starting Project-Nyra Services"
echo "========================================"
echo ""

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    warn "Not running in WSL, some services may not work correctly"
fi

# Start PostgreSQL
log "Starting PostgreSQL..."
if sudo systemctl start postgresql 2>/dev/null; then
    success "PostgreSQL started"
else
    error "Failed to start PostgreSQL"
fi

# Wait for PostgreSQL to be ready
sleep 2
until pg_isready -q 2>/dev/null; do
    log "Waiting for PostgreSQL..."
    sleep 1
done
success "PostgreSQL is ready"

# Start Redis
log "Starting Redis..."
if sudo systemctl start redis-server 2>/dev/null; then
    success "Redis started"
else
    error "Failed to start Redis"
fi

# Wait for Redis to be ready
sleep 2
until redis-cli ping 2>/dev/null | grep -q PONG; do
    log "Waiting for Redis..."
    sleep 1
done
success "Redis is ready"

# Start Docker if not running
log "Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    log "Starting Docker..."
    sudo systemctl start docker
    sleep 3
fi

if docker info >/dev/null 2>&1; then
    success "Docker is ready"
else
    error "Failed to start Docker"
fi

# Start Nginx
log "Starting Nginx..."
if sudo systemctl start nginx 2>/dev/null; then
    success "Nginx started"
else
    warn "Nginx may not be configured yet"
fi

# Start Tailscale
log "Checking Tailscale..."
if sudo systemctl start tailscaled 2>/dev/null; then
    if tailscale status >/dev/null 2>&1; then
        success "Tailscale is running"
    else
        warn "Tailscale needs authentication: sudo tailscale up"
    fi
else
    warn "Tailscale not started"
fi

# Start monitoring
log "Starting monitoring..."
if sudo systemctl start node_exporter 2>/dev/null; then
    success "Node Exporter started"
else
    warn "Node Exporter not available"
fi

# Start Gitea (if configured)
log "Checking Gitea..."
GITEA_COMPOSE="$NYRA_HOME/gitea/docker-compose.yml"
if [[ -f "$GITEA_COMPOSE" ]]; then
    cd "$(dirname "$GITEA_COMPOSE")"
    if docker compose up -d 2>&1 | tee -a "$LOG_DIR/gitea-startup.log"; then
        success "Gitea started"
    else
        warn "Failed to start Gitea"
    fi
else
    warn "Gitea not configured yet"
fi

# Start Project-Nyra applications (if built)
log "Starting Project-Nyra applications..."

# Check for main application
MAIN_APP="$NYRA_HOME/repos/project-nyra"
if [[ -d "$MAIN_APP" ]]; then
    cd "$MAIN_APP"

    # Check if using Docker Compose
    if [[ -f "docker-compose.yml" ]]; then
        log "Starting via Docker Compose..."
        docker compose up -d 2>&1 | tee -a "$LOG_DIR/app-startup.log"
        success "Application containers started"
    # Check if using PM2
    elif [[ -f "ecosystem.config.js" ]] && command -v pm2 >/dev/null 2>&1; then
        log "Starting via PM2..."
        pm2 start ecosystem.config.js 2>&1 | tee -a "$LOG_DIR/app-startup.log"
        pm2 save
        success "Application started with PM2"
    # Check if npm start is available
    elif [[ -f "package.json" ]] && grep -q '"start"' package.json; then
        log "Starting via npm..."
        npm start >> "$LOG_DIR/app-startup.log" 2>&1 &
        success "Application started with npm"
    else
        warn "No startup method found for main application"
    fi
else
    warn "Main application not found at $MAIN_APP"
fi

echo ""
echo "========================================"
echo "  Service Status"
echo "========================================"

# Check services
check_service() {
    local name=$1
    local check=$2

    if eval "$check" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $name"
    else
        echo -e "  ${RED}✗${NC} $name"
    fi
}

check_service "PostgreSQL" "pg_isready -q"
check_service "Redis" "redis-cli ping | grep -q PONG"
check_service "Docker" "docker info"
check_service "Nginx" "sudo systemctl is-active nginx"
check_service "Tailscale" "tailscale status"
check_service "Node Exporter" "curl -s http://localhost:9100/metrics"

# Check ports
echo ""
echo "Active ports:"
ss -tuln | grep -E ':(5432|6379|3000|3020|8080|9090|9100)' | awk '{print "  "$5}' | sort -u

echo ""
success "Services started successfully!"
echo ""
log "View logs: tail -f $LOG_DIR/*.log"
log "Check status: $SCRIPT_DIR/status.sh"
log "Stop services: $SCRIPT_DIR/stop-all.sh"
