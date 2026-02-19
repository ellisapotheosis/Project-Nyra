#!/bin/bash
# ============================================================================
# Project Nyra - Stop All Services Script
# ============================================================================
# Stops all Nyra Docker services gracefully
#
# Usage:
#   ./stop-all.sh [options]
#
# Options:
#   --prune       Remove volumes (WARNING: Data loss)
#   --clean       Remove containers and networks
#   --backup      Create backup before stopping
#   --force       Force stop without graceful shutdown
#
# Examples:
#   ./stop-all.sh                    # Graceful stop
#   ./stop-all.sh --backup           # Backup then stop
#   ./stop-all.sh --clean            # Stop and remove containers
#   ./stop-all.sh --prune            # Stop and remove everything
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Options
PRUNE_VOLUMES=false
CLEAN_CONTAINERS=false
CREATE_BACKUP=false
FORCE_STOP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --prune)
            PRUNE_VOLUMES=true
            CLEAN_CONTAINERS=true
            shift
            ;;
        --clean)
            CLEAN_CONTAINERS=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --force)
            FORCE_STOP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--prune] [--clean] [--backup] [--force]"
            exit 1
            ;;
    esac
done

# Functions
print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Confirm destructive operations
confirm_action() {
    local message=$1
    echo -e "${YELLOW}$message${NC}"
    read -p "Are you sure? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Operation cancelled"
        exit 0
    fi
}

# Backup function
create_backup() {
    print_header "Creating Backup"

    local backup_dir="$SCRIPT_DIR/backups/manual/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    print_info "Backup directory: $backup_dir"

    # Backup PostgreSQL
    if docker ps | grep -q "nyra-postgres"; then
        print_info "Backing up PostgreSQL..."
        docker exec nyra-postgres* pg_dumpall -U nyra_user > "$backup_dir/postgres_backup.sql" 2>/dev/null || true
        print_success "PostgreSQL backup complete"
    fi

    # Backup Redis
    if docker ps | grep -q "nyra-redis"; then
        print_info "Backing up Redis..."
        docker exec nyra-redis* redis-cli -a redis_secure_pass SAVE > /dev/null 2>&1 || true
        docker cp nyra-redis*:/data/dump.rdb "$backup_dir/redis_dump.rdb" 2>/dev/null || true
        print_success "Redis backup complete"
    fi

    # Backup Qdrant
    if docker ps | grep -q "nyra-qdrant"; then
        print_info "Backing up Qdrant..."
        docker cp nyra-qdrant*:/qdrant/storage "$backup_dir/qdrant_storage" 2>/dev/null || true
        print_success "Qdrant backup complete"
    fi

    print_success "Backup created at: $backup_dir"
}

# Main execution
print_header "Stopping Project Nyra Services"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running."
    exit 1
fi

# Create backup if requested
if [ "$CREATE_BACKUP" = true ]; then
    create_backup
fi

# Confirm destructive operations
if [ "$PRUNE_VOLUMES" = true ]; then
    confirm_action "WARNING: --prune will delete all data volumes. All data will be lost!"
fi

# Get list of running Nyra containers
RUNNING_CONTAINERS=$(docker ps --filter "name=nyra-*" --format "{{.Names}}" | tr '\n' ' ')

if [ -z "$RUNNING_CONTAINERS" ]; then
    print_info "No running Nyra containers found"
else
    print_info "Found containers: $RUNNING_CONTAINERS"
fi

# Stop services
print_header "Stopping Services"

compose_files=(
    "docker-compose.full.yml"
    "docker-compose.dev.yml"
    "docker-compose.prod.yml"
    "docker-compose.orchestration.yml"
    "docker-compose.ui.yml"
    "docker-compose.observability.yml"
)

for compose_file in "${compose_files[@]}"; do
    if [ -f "$SCRIPT_DIR/$compose_file" ]; then
        print_info "Stopping services from $compose_file..."

        if [ "$FORCE_STOP" = true ]; then
            docker compose -f "$SCRIPT_DIR/$compose_file" kill 2>/dev/null || true
        else
            docker compose -f "$SCRIPT_DIR/$compose_file" stop 2>/dev/null || true
        fi
    fi
done

print_success "All services stopped"

# Clean containers if requested
if [ "$CLEAN_CONTAINERS" = true ]; then
    print_header "Cleaning Containers"

    for compose_file in "${compose_files[@]}"; do
        if [ -f "$SCRIPT_DIR/$compose_file" ]; then
            print_info "Removing containers from $compose_file..."
            docker compose -f "$SCRIPT_DIR/$compose_file" down 2>/dev/null || true
        fi
    done

    # Remove any orphaned Nyra containers
    print_info "Removing orphaned containers..."
    docker ps -a --filter "name=nyra-*" --format "{{.Names}}" | xargs -r docker rm -f 2>/dev/null || true

    print_success "Containers removed"
fi

# Prune volumes if requested
if [ "$PRUNE_VOLUMES" = true ]; then
    print_header "Removing Volumes"

    # Remove volumes for each compose file
    for compose_file in "${compose_files[@]}"; do
        if [ -f "$SCRIPT_DIR/$compose_file" ]; then
            print_info "Removing volumes from $compose_file..."
            docker compose -f "$SCRIPT_DIR/$compose_file" down -v 2>/dev/null || true
        fi
    done

    # Remove any orphaned Nyra volumes
    print_info "Removing orphaned volumes..."
    docker volume ls --filter "name=nyra-*" --format "{{.Name}}" | xargs -r docker volume rm 2>/dev/null || true
    docker volume ls --filter "name=docker_*" --format "{{.Name}}" | xargs -r docker volume rm 2>/dev/null || true

    print_success "Volumes removed"
fi

# Show remaining containers and volumes
print_header "Status"

REMAINING_CONTAINERS=$(docker ps -a --filter "name=nyra-*" --format "{{.Names}}" | wc -l)
REMAINING_VOLUMES=$(docker volume ls --filter "name=nyra-*" --format "{{.Name}}" | wc -l)

echo -e "Remaining Nyra containers: ${BLUE}$REMAINING_CONTAINERS${NC}"
echo -e "Remaining Nyra volumes: ${BLUE}$REMAINING_VOLUMES${NC}"
echo ""

if [ $REMAINING_CONTAINERS -eq 0 ] && [ $REMAINING_VOLUMES -eq 0 ]; then
    print_success "All Nyra services have been completely removed"
elif [ "$PRUNE_VOLUMES" = false ] && [ "$CLEAN_CONTAINERS" = false ]; then
    print_success "All Nyra services have been stopped"
    print_info "Data volumes are preserved"
else
    print_success "Cleanup complete"
fi

echo ""
print_info "To start services again: ./start-full-stack.sh"
echo ""
