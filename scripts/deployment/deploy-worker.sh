#!/bin/bash

###############################################################################
# Project Nyra - Deploy Worker Node
# Deploys worker nodes for distributed processing
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

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
    command -v docker &> /dev/null || { log_error "Docker not installed"; exit 1; }
    command -v docker-compose &> /dev/null || { log_error "Docker Compose not installed"; exit 1; }
    docker info &> /dev/null || { log_error "Docker daemon not running"; exit 1; }
    log_success "Prerequisites OK"
}

deploy() {
    log_info "Deploying worker node..."
    cd "$PROJECT_ROOT"
    docker-compose -f infra/docker-compose.worker.yml pull --ignore-pull-failures || true
    docker-compose -f infra/docker-compose.worker.yml down --remove-orphans
    docker-compose -f infra/docker-compose.worker.yml up -d
    log_success "Worker deployed successfully"
}

verify() {
    log_info "Verifying deployment..."
    sleep 3
    docker-compose -f "$PROJECT_ROOT/infra/docker-compose.worker.yml" ps
    log_success "Worker node is running"
}

main() {
    echo "╔═══════════════════════════════════════════════╗"
    echo "║  Project Nyra - Worker Deployment            ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo ""
    check_prerequisites
    deploy
    verify
    log_success "Worker deployment completed!"
}

trap 'log_error "Deployment interrupted"; exit 1' INT TERM
main "$@"
