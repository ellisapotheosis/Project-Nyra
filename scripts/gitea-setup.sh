#!/bin/bash
# ============================================================================
# Project Nyra - Gitea Complete Setup Script
# ============================================================================
# Comprehensive script to set up the entire Gitea infrastructure
# Includes orchestrator, backup, CI/CD, and monitoring
# ============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/gitea-setup.log"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.gitea.prod.yml"
ENV_FILE="${PROJECT_ROOT}/.env.gitea"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"

    case "$level" in
        "INFO")  echo -e "${GREEN}✅ ${message}${NC}" ;;
        "WARN")  echo -e "${YELLOW}⚠️  ${message}${NC}" ;;
        "ERROR") echo -e "${RED}❌ ${message}${NC}" ;;
        "DEBUG") echo -e "${BLUE}🔍 ${message}${NC}" ;;
    esac
}

# Error handler
error_handler() {
    local line_num=$1
    log "ERROR" "Script failed at line ${line_num}. Check ${LOG_FILE} for details."
    exit 1
}

trap 'error_handler ${LINENO}' ERR

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS] COMMAND

Project Nyra Gitea Setup Script

COMMANDS:
    setup       Complete Gitea setup (default)
    upgrade     Upgrade existing installation
    backup      Create backup of current setup
    restore     Restore from backup
    health      Check system health
    cleanup     Clean up old containers/volumes

OPTIONS:
    -e, --env-file FILE    Environment file (default: .env.gitea)
    -c, --compose FILE     Docker compose file (default: docker-compose.gitea.prod.yml)
    -p, --profiles LIST    Comma-separated profiles (default: actions,ai,mirror)
    -f, --force           Force operation without confirmation
    -v, --verbose         Enable verbose logging
    -h, --help            Show this help message

EXAMPLES:
    $0 setup                           # Full setup with default options
    $0 setup -p actions,ai             # Setup with specific profiles
    $0 upgrade --force                 # Force upgrade without prompts
    $0 backup                          # Create backup
    $0 health                          # Check system health

EOF
}

# Parse command line arguments
COMMAND="setup"
ENV_FILE_OVERRIDE=""
COMPOSE_FILE_OVERRIDE=""
PROFILES="actions,ai,mirror"
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env-file)
            ENV_FILE_OVERRIDE="$2"
            shift 2
            ;;
        -c|--compose)
            COMPOSE_FILE_OVERRIDE="$2"
            shift 2
            ;;
        -p|--profiles)
            PROFILES="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        setup|upgrade|backup|restore|health|cleanup)
            COMMAND="$1"
            shift
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Override files if specified
[[ -n "$ENV_FILE_OVERRIDE" ]] && ENV_FILE="$ENV_FILE_OVERRIDE"
[[ -n "$COMPOSE_FILE_OVERRIDE" ]] && COMPOSE_FILE="$COMPOSE_FILE_OVERRIDE"

# Enable verbose logging if requested
[[ "$VERBOSE" == "true" ]] && set -x

# Utility functions
check_prerequisites() {
    log "INFO" "Checking prerequisites..."

    # Check for required commands
    local required_commands=("docker" "docker-compose" "curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log "ERROR" "Required command not found: $cmd"
            exit 1
        fi
    done

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log "ERROR" "Docker daemon is not running"
        exit 1
    fi

    # Check available disk space (minimum 10GB)
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print int($4/1024/1024)}')
    if [[ $available_space -lt 10 ]]; then
        log "WARN" "Low disk space: ${available_space}GB available (recommended: 10GB+)"
    fi

    log "INFO" "Prerequisites check completed"
}

create_directories() {
    log "INFO" "Creating required directories..."

    local dirs=(
        "${PROJECT_ROOT}/data/gitea"
        "${PROJECT_ROOT}/data/gitea-db"
        "${PROJECT_ROOT}/logs"
        "${PROJECT_ROOT}/tmp/runner-cache"
        "${PROJECT_ROOT}/tmp/runner-cache-large"
        "${PROJECT_ROOT}/backups/gitea"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        log "DEBUG" "Created directory: $dir"
    done
}

setup_environment() {
    log "INFO" "Setting up environment configuration..."

    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "${ENV_FILE}.prod" ]]; then
            cp "${ENV_FILE}.prod" "$ENV_FILE"
            log "INFO" "Copied environment template to $ENV_FILE"
        else
            log "ERROR" "Environment file not found: $ENV_FILE"
            exit 1
        fi
    fi

    # Source environment file
    if [[ -f "$ENV_FILE" ]]; then
        source "$ENV_FILE"
        log "INFO" "Loaded environment from $ENV_FILE"
    fi
}

create_network() {
    log "INFO" "Setting up Docker network..."

    local network_name="${NYRA_NETWORK:-nyra-net}"

    if ! docker network ls | grep -q "$network_name"; then
        docker network create "$network_name"
        log "INFO" "Created Docker network: $network_name"
    else
        log "DEBUG" "Network already exists: $network_name"
    fi
}

start_services() {
    log "INFO" "Starting Gitea services..."

    # Convert profiles to array
    IFS=',' read -ra PROFILE_ARRAY <<< "$PROFILES"
    local profile_args=""
    for profile in "${PROFILE_ARRAY[@]}"; do
        profile_args+="--profile $profile "
    done

    # Start services
    docker-compose -f "$COMPOSE_FILE" $profile_args up -d

    log "INFO" "Waiting for services to start..."
    sleep 30

    # Health check
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if health_check_gitea; then
            log "INFO" "Gitea is healthy and ready"
            break
        fi

        log "DEBUG" "Waiting for Gitea... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        log "ERROR" "Gitea failed to start properly"
        return 1
    fi
}

health_check_gitea() {
    local gitea_port="${GITEA_PORT:-3100}"
    curl -f -s "http://localhost:${gitea_port}/api/healthz" &> /dev/null
}

setup_gitea_admin() {
    log "INFO" "Setting up Gitea admin user..."

    # This would typically be done via the Gitea API or web interface
    # For now, just log that manual setup is needed
    log "INFO" "Please complete Gitea setup via web interface at http://localhost:${GITEA_PORT:-3100}"
    log "INFO" "Create admin user and configure basic settings"
}

configure_runners() {
    log "INFO" "Configuring Gitea Actions runners..."

    # Check if runner services are enabled
    if docker-compose -f "$COMPOSE_FILE" --profile actions config &> /dev/null; then
        log "INFO" "Actions runners are configured and ready"
        log "INFO" "Register runners via Gitea admin panel: Repository Settings > Actions > Runners"
    else
        log "WARN" "Actions profile not enabled - runners will not be available"
    fi
}

print_status() {
    log "INFO" "=== Gitea Setup Complete ==="

    local gitea_port="${GITEA_PORT:-3100}"
    local gitea_ssh_port="${GITEA_SSH_PORT:-2222}"

    cat << EOF

🎉 Project Nyra Gitea Setup Complete!

📋 Service Information:
   • Gitea Web UI: http://localhost:${gitea_port}
   • SSH Clone URL: git@localhost:${gitea_ssh_port}:admin/Project-Nyra.git
   • HTTP Clone URL: http://localhost:${gitea_port}/admin/Project-Nyra.git

🔧 Management Commands:
   • View logs: docker-compose -f ${COMPOSE_FILE} logs -f
   • Stop services: docker-compose -f ${COMPOSE_FILE} down
   • Update services: docker-compose -f ${COMPOSE_FILE} pull && docker-compose -f ${COMPOSE_FILE} up -d

📊 Enabled Services:
$(docker-compose -f "$COMPOSE_FILE" --profile "${PROFILES//,/ --profile }" ps --services | sed 's/^/   • /')

🔗 Next Steps:
   1. Access Gitea web UI and complete initial setup
   2. Create admin user and configure organization
   3. Set up repository mirroring with GitHub (if enabled)
   4. Configure Actions runners (if enabled)
   5. Set up webhooks for AI code review (if enabled)

📖 Documentation: ${PROJECT_ROOT}/docs/gitea/

EOF
}

# Command implementations
cmd_setup() {
    log "INFO" "Starting Project Nyra Gitea setup..."

    if [[ "$FORCE" != "true" ]]; then
        read -p "This will set up Gitea infrastructure. Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Setup cancelled by user"
            exit 0
        fi
    fi

    check_prerequisites
    create_directories
    setup_environment
    create_network
    start_services
    setup_gitea_admin
    configure_runners
    print_status
}

cmd_upgrade() {
    log "INFO" "Upgrading Gitea installation..."

    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull

    # Recreate containers
    docker-compose -f "$COMPOSE_FILE" up -d

    log "INFO" "Upgrade completed"
}

cmd_backup() {
    log "INFO" "Creating Gitea backup..."

    local backup_script="${SCRIPT_DIR}/backup-gitea.sh"
    if [[ -f "$backup_script" ]]; then
        "$backup_script"
    else
        log "ERROR" "Backup script not found: $backup_script"
        exit 1
    fi
}

cmd_restore() {
    log "INFO" "Restore functionality would be implemented here"
    log "WARN" "Please use the backup-restore.yml workflow for now"
}

cmd_health() {
    log "INFO" "Checking system health..."

    # Check services
    docker-compose -f "$COMPOSE_FILE" ps

    # Check Gitea health
    if health_check_gitea; then
        log "INFO" "Gitea health check: PASSED"
    else
        log "ERROR" "Gitea health check: FAILED"
    fi

    # Check volumes
    docker volume ls | grep nyra-gitea

    log "INFO" "Health check completed"
}

cmd_cleanup() {
    log "INFO" "Cleaning up Gitea resources..."

    if [[ "$FORCE" != "true" ]]; then
        read -p "This will remove containers and networks. Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Cleanup cancelled by user"
            exit 0
        fi
    fi

    # Stop and remove containers
    docker-compose -f "$COMPOSE_FILE" down

    # Remove unused networks
    docker network prune -f

    log "INFO" "Cleanup completed"
}

# Main execution
main() {
    # Create logs directory
    mkdir -p "$(dirname "$LOG_FILE")"

    log "INFO" "Starting Gitea setup script - Command: $COMMAND"

    case "$COMMAND" in
        setup)   cmd_setup ;;
        upgrade) cmd_upgrade ;;
        backup)  cmd_backup ;;
        restore) cmd_restore ;;
        health)  cmd_health ;;
        cleanup) cmd_cleanup ;;
        *)
            log "ERROR" "Unknown command: $COMMAND"
            usage
            exit 1
            ;;
    esac

    log "INFO" "Script completed successfully"
}

# Execute main function
main