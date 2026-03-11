#!/bin/bash
#
# Project‑Nyra – Orchestrator Auto‑Start Docker Services
#
# This script starts all configured Docker services on system boot. It is
# intended to be run via systemd or cron using the `@reboot` schedule.
#
# Path normalization:
#   - Historically the repository was installed under `/opt/nyra/project-nyra`. To avoid
#     duplicating the word “nyra” in the directory tree, we now recommend checking
#     out the repository into `/opt/repos/project-nyra`.  If you choose a different
#     directory you can override the default by exporting `NYRA_REPO_ROOT` before running this script.
#
# Usage:
#   sudo crontab -e
#   @reboot /opt/repos/project-nyra/scripts/orchestrator/auto-start-docker.sh >> /var/log/nyra-autostart.log 2>&1

set -e

# Determine the project root.  If NYRA_REPO_ROOT is set use it, otherwise
# default to /opt/repos/project-nyra.
PROJECT_ROOT="${NYRA_REPO_ROOT:-/opt/repos/project-nyra}"

# Location of the docker-compose files.  The consolidated compose files live
# under infra/ in the repo root.
COMPOSE_DIR="$PROJECT_ROOT/infra"
# Centralised logs directory.  Logs are stored outside of the repo to
# simplify upgrades and clean checkouts.
LOG_DIR="${NYRA_LOG_DIR:-/opt/repos/logs}"
LOG_FILE="$LOG_DIR/docker-autostart.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Logging function. Prefixes messages with a timestamp and duplicates output
# to stdout and the log file.
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Start logging
log "========================================="
log "Starting Project‑Nyra Docker services"
log "Project root: $PROJECT_ROOT"
log "Compose directory: $COMPOSE_DIR"
log "========================================="

# Ensure Docker is running
if ! systemctl is-active --quiet docker; then
    log "⚠️  Docker service is not running. Starting Docker…"
    sudo systemctl start docker
    sleep 10
fi

# Verify the compose directory exists
if [ ! -d "$COMPOSE_DIR" ]; then
    log "❌ Error: Compose directory not found: $COMPOSE_DIR"
    exit 1
fi

# Navigate to compose directory
cd "$COMPOSE_DIR" || exit 1

# Start all services from the consolidated docker-compose file
log "🚀 Starting all Docker services…"
if docker compose up -d 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Docker services started successfully"
else
    log "❌ Error starting Docker services"
    exit 1
fi

# Wait for services to initialise
log "⏳ Waiting 30 seconds for services to initialise…"
sleep 30

# Run a health check
log "🏥 Running health checks…"
docker compose ps | tee -a "$LOG_FILE"

# Count running containers
RUNNING_COUNT=$(docker ps --format '{{.Names}}' | wc -l)
log "📊 Total running containers: $RUNNING_COUNT"

# Check critical services
CRITICAL_SERVICES=("postgres" "redis" "mongo" "infisical" "claude-flow" "nexus")
log "🔍 Checking critical services…"
for service in "${CRITICAL_SERVICES[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "$service"; then
        log "  ✅ $service is running"
    else
        log "  ⚠️  $service is NOT running"
    fi
done

log "========================================="
log "Auto‑start complete!"
log "========================================="
log ""
log "View running containers: docker ps"
log "View logs: docker compose logs -f"
log "Health check: cd $COMPOSE_DIR && make health"
log ""