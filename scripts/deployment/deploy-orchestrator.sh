#!/bin/bash

###############################################################################
# Project Nyra - Deploy Orchestrator Node
# Deploys the orchestrator node with all coordination services
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

check_prerequisites() {
    log_info "Checking prerequisites..."
    command -v docker &> /dev/null || { log_error "Docker is not installed"; exit 1; }
    command -v docker-compose &> /dev/null || { log_error "Docker Compose is not installed"; exit 1; }
    docker info &> /dev/null || { log_error "Docker daemon is not running"; exit 1; }
    log_success "Prerequisites check passed"
}

backup_config() {
    log_info "Backing up current configuration..."
    BACKUP_DIR="$PROJECT_ROOT/backups/orchestrator-$TIMESTAMP"
    mkdir -p "$BACKUP_DIR"
    docker-compose -f "$PROJECT_ROOT/infra/docker-compose.orchestrator.yml" config > "$BACKUP_DIR/config-backup.yml" 2>/dev/null || true
    [ -f "$PROJECT_ROOT/.env" ] && cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/.env.backup"
    log_success "Configuration backed up to $BACKUP_DIR"
}

build_images() {
    log_info "Building orchestrator images..."
    cd "$PROJECT_ROOT"
    docker-compose -f infra/docker-compose.orchestrator.yml build \
        --build-arg NODE_ENV=production \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    log_success "Images built successfully"
}

deploy() {
    log_info "Deploying orchestrator node..."
    cd "$PROJECT_ROOT"
    docker-compose -f infra/docker-compose.orchestrator.yml pull --ignore-pull-failures || true
    docker-compose -f infra/docker-compose.orchestrator.yml down --remove-orphans
    docker-compose -f infra/docker-compose.orchestrator.yml up -d
    log_success "Orchestrator deployed successfully"
}

verify_deployment() {
    log_info "Verifying deployment..."
    sleep 5
    docker-compose -f "$PROJECT_ROOT/infra/docker-compose.orchestrator.yml" ps
    log_success "Deployment verification complete"
}

main() {
    echo "╔═══════════════════════════════════════════════╗"
    echo "║  Project Nyra - Orchestrator Deployment      ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo ""
    check_prerequisites
    backup_config
    build_images
    deploy
    verify_deployment
    log_success "Orchestrator deployment completed!"
}

trap 'log_error "Deployment interrupted"; exit 1' INT TERM
main "$@"
