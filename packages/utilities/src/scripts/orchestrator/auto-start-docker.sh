#!/bin/bash
#
# Project Nyra - Orchestrator Auto-Start Docker Services
# Automatically starts all 40+ Docker services on system boot
#
# Usage: Run via crontab @reboot
# Location: /opt/nyra/project-nyra/scripts/orchestrator/auto-start-docker.sh
#

set -e

COMPOSE_DIR="/opt/nyra/project-nyra/infra"
LOG_DIR="/opt/nyra/logs"
LOG_FILE="$LOG_DIR/docker-autostart.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Start logging
log "========================================="
log "Starting Project Nyra Docker Services"
log "========================================="

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    log "⚠️  Docker service is not running. Starting Docker..."
    sudo systemctl start docker
    sleep 10
fi

# Check if compose directory exists
if [ ! -d "$COMPOSE_DIR" ]; then
    log "❌ Error: Compose directory not found: $COMPOSE_DIR"
    exit 1
fi

# Navigate to compose directory
cd "$COMPOSE_DIR" || exit 1

# Start all services from consolidated docker-compose.yml
log "🚀 Starting all Docker services..."
if docker compose up -d 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Docker services started successfully"
else
    log "❌ Error starting Docker services"
    exit 1
fi

# Wait for services to initialize
log "⏳ Waiting 30 seconds for services to initialize..."
sleep 30

# Run health checks
log "🏥 Running health checks..."
docker compose ps | tee -a "$LOG_FILE"

# Count running containers
RUNNING_COUNT=$(docker ps --format '{{.Names}}' | wc -l)
log "📊 Total running containers: $RUNNING_COUNT"

# Check critical services
CRITICAL_SERVICES=("postgres" "redis" "mongo" "infisical" "nexus")
log "🔍 Checking critical services..."

for service in "${CRITICAL_SERVICES[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "$service"; then
        log "  ✅ $service is running"
    else
        log "  ⚠️  $service is NOT running"
    fi
done

log "========================================="
log "Auto-start complete!"
log "========================================="
log ""
log "View running containers: docker ps"
log "View logs: docker compose logs -f"
log "Health check: cd $COMPOSE_DIR && make health"
log ""
