#!/bin/bash
set -euo pipefail

# Check status of all Project-Nyra services

NYRA_HOME="/opt/nyra"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warn() {
    echo -e "${YELLOW}!${NC} $1"
}

info() {
    echo -e "${BLUE}→${NC} $1"
}

echo "========================================"
echo "  Project-Nyra Service Status"
echo "========================================"
echo ""

# System services
echo "System Services:"
echo "----------------"

check_systemd_service() {
    local service=$1
    local name=$2

    if systemctl is-active --quiet "$service" 2>/dev/null; then
        success "$name is running"
        return 0
    else
        error "$name is not running"
        return 1
    fi
}

check_systemd_service postgresql "PostgreSQL"
check_systemd_service redis-server "Redis"
check_systemd_service docker "Docker"
check_systemd_service nginx "Nginx"
check_systemd_service tailscaled "Tailscale"
check_systemd_service node_exporter "Node Exporter"

echo ""
echo "Database Connectivity:"
echo "---------------------"

# PostgreSQL
if pg_isready -q 2>/dev/null; then
    success "PostgreSQL is accepting connections"
    info "   Host: localhost:5432"
    psql -U postgres -tc "SELECT version();" 2>/dev/null | xargs | sed 's/^/   /'
else
    error "PostgreSQL is not accepting connections"
fi

# Redis
if redis-cli ping 2>/dev/null | grep -q PONG; then
    success "Redis is responding"
    info "   Host: localhost:6379"
    redis-cli INFO server 2>/dev/null | grep redis_version | sed 's/^/   /'
else
    error "Redis is not responding"
fi

echo ""
echo "Docker Status:"
echo "--------------"

if docker info >/dev/null 2>&1; then
    success "Docker is running"

    # Count containers
    local running=$(docker ps -q | wc -l)
    local total=$(docker ps -aq | wc -l)
    info "   Containers: $running running, $total total"

    # Show running containers
    if [[ $running -gt 0 ]]; then
        echo ""
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | sed 's/^/   /'
    fi
else
    error "Docker is not running"
fi

echo ""
echo "Network Connectivity:"
echo "--------------------"

# Tailscale
if tailscale status >/dev/null 2>&1; then
    success "Tailscale VPN connected"
    tailscale status --json 2>/dev/null | jq -r '.Self.TailscaleIPs[0]' | sed 's/^/   IP: /'
else
    warn "Tailscale not connected (run: sudo tailscale up)"
fi

# Check key ports
echo ""
echo "Active Ports:"
echo "-------------"

check_port() {
    local port=$1
    local service=$2

    if ss -tuln | grep -q ":$port "; then
        success "$service (port $port)"
    else
        warn "$service (port $port) - not listening"
    fi
}

check_port 5432 "PostgreSQL"
check_port 6379 "Redis"
check_port 3000 "Main App"
check_port 3020 "Gitea"
check_port 8080 "Nginx"
check_port 9090 "Prometheus"
check_port 9100 "Node Exporter"

echo ""
echo "Application Status:"
echo "-------------------"

# Check PM2
if command -v pm2 >/dev/null 2>&1; then
    local pm2_count=$(pm2 list 2>/dev/null | grep -c "online" || echo "0")
    if [[ $pm2_count -gt 0 ]]; then
        success "PM2 applications: $pm2_count running"
        pm2 list | sed 's/^/   /'
    else
        warn "No PM2 applications running"
    fi
fi

# Check Docker Compose apps
MAIN_APP="$NYRA_HOME/repos/project-nyra"
if [[ -f "$MAIN_APP/docker-compose.yml" ]]; then
    cd "$MAIN_APP"
    local compose_running=$(docker compose ps --services --filter "status=running" 2>/dev/null | wc -l)
    if [[ $compose_running -gt 0 ]]; then
        success "Docker Compose: $compose_running services running"
    else
        warn "Docker Compose: no services running"
    fi
fi

# Check Gitea
GITEA_COMPOSE="$NYRA_HOME/gitea/docker-compose.yml"
if [[ -f "$GITEA_COMPOSE" ]]; then
    cd "$(dirname "$GITEA_COMPOSE")"
    if docker compose ps 2>/dev/null | grep -q "Up"; then
        success "Gitea is running"
    else
        warn "Gitea is not running"
    fi
fi

echo ""
echo "System Resources:"
echo "-----------------"

# Memory
local mem_used=$(free -h | awk '/^Mem:/ {print $3}')
local mem_total=$(free -h | awk '/^Mem:/ {print $2}')
info "Memory: $mem_used / $mem_total used"

# Disk
local disk_used=$(df -h / | awk 'NR==2 {print $3}')
local disk_total=$(df -h / | awk 'NR==2 {print $2}')
local disk_percent=$(df -h / | awk 'NR==2 {print $5}')
info "Disk: $disk_used / $disk_total ($disk_percent)"

# CPU Load
local load=$(uptime | awk -F'load average:' '{print $2}' | xargs)
info "Load average: $load"

echo ""
echo "Quick Actions:"
echo "--------------"
info "Start all: ~/services/start-all.sh"
info "Stop all: ~/services/stop-all.sh"
info "View logs: ~/services/logs.sh"

echo ""
echo "========================================"
