#!/bin/bash
# ==============================================================================
# Gitea Local Git Server Setup Script
# ==============================================================================
# This script configures Gitea for local network use on the orchestrator PC
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - Infisical CLI configured
#   - Network access to PostgreSQL
#
# Usage:
#   ./setup-gitea.sh [--skip-infisical] [--admin-user USER] [--admin-pass PASS]
#
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DOCKER_DIR="${SCRIPT_DIR}/../docker"
CONFIG_DIR="${SCRIPT_DIR}/../configs/gitea"

# Default values
SKIP_INFISICAL=false
ADMIN_USER=""
ADMIN_PASSWORD=""
GITEA_DOMAIN="${GITEA_DOMAIN:-localhost}"

# ==============================================================================
# Functions
# ==============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-infisical)
                SKIP_INFISICAL=true
                shift
                ;;
            --admin-user)
                ADMIN_USER="$2"
                shift 2
                ;;
            --admin-pass)
                ADMIN_PASSWORD="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-infisical      Skip Infisical credential retrieval"
                echo "  --admin-user USER     Set admin username"
                echo "  --admin-pass PASS     Set admin password"
                echo "  --help                Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    # Check Infisical (if not skipped)
    if [[ "$SKIP_INFISICAL" == false ]]; then
        if ! command -v infisical &> /dev/null; then
            log_warning "Infisical CLI not found, will use default credentials"
            SKIP_INFISICAL=true
        fi
    fi

    log_success "Prerequisites check passed"
}

# Load or generate credentials
setup_credentials() {
    log_info "Setting up credentials..."

    if [[ "$SKIP_INFISICAL" == false ]]; then
        log_info "Fetching credentials from Infisical..."

        # Fetch admin credentials from Infisical
        if [[ -z "$ADMIN_USER" ]]; then
            ADMIN_USER=$(infisical secrets get GITEA_ADMIN_USER --silent 2>/dev/null || echo "admin")
        fi

        if [[ -z "$ADMIN_PASSWORD" ]]; then
            ADMIN_PASSWORD=$(infisical secrets get GITEA_ADMIN_PASSWORD --silent 2>/dev/null || echo "")
        fi

        # Fetch database credentials
        DB_USER=$(infisical secrets get GITEA_DB_USER --silent 2>/dev/null || echo "gitea")
        DB_PASSWORD=$(infisical secrets get GITEA_DB_PASSWORD --silent 2>/dev/null || echo "gitea_password")
        DB_NAME=$(infisical secrets get GITEA_DB_NAME --silent 2>/dev/null || echo "gitea")

        # Fetch security keys
        SECRET_KEY=$(infisical secrets get GITEA_SECRET_KEY --silent 2>/dev/null || echo "")
        INTERNAL_TOKEN=$(infisical secrets get GITEA_INTERNAL_TOKEN --silent 2>/dev/null || echo "")
    fi

    # Generate defaults if not from Infisical
    if [[ -z "$ADMIN_USER" ]]; then
        ADMIN_USER="admin"
    fi

    if [[ -z "$ADMIN_PASSWORD" ]]; then
        log_warning "No admin password provided, generating random password..."
        ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        log_info "Generated admin password: ${ADMIN_PASSWORD}"
    fi

    if [[ -z "$SECRET_KEY" ]]; then
        SECRET_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    fi

    if [[ -z "$INTERNAL_TOKEN" ]]; then
        INTERNAL_TOKEN=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    fi

    # Create or update .env file
    ENV_FILE="${DOCKER_DIR}/.env.gitea"
    log_info "Creating environment file: ${ENV_FILE}"

    cat > "${ENV_FILE}" <<EOF
# Gitea Configuration
# Generated on $(date)

# Database
GITEA_DB_USER=${DB_USER:-gitea}
GITEA_DB_PASSWORD=${DB_PASSWORD:-gitea_password}
GITEA_DB_NAME=${DB_NAME:-gitea}

# Admin Account
GITEA_ADMIN_USER=${ADMIN_USER}
GITEA_ADMIN_PASSWORD=${ADMIN_PASSWORD}
GITEA_ADMIN_EMAIL=${GITEA_ADMIN_EMAIL:-admin@localhost}

# Security Keys
GITEA_SECRET_KEY=${SECRET_KEY}
GITEA_INTERNAL_TOKEN=${INTERNAL_TOKEN}

# Server Configuration
GITEA_DOMAIN=${GITEA_DOMAIN}
GITEA_LOG_LEVEL=Info
EOF

    chmod 600 "${ENV_FILE}"
    log_success "Credentials configured"
}

# Create configuration directory
setup_config_directory() {
    log_info "Setting up configuration directory..."

    mkdir -p "${CONFIG_DIR}"

    # Copy app.ini template if it doesn't exist
    if [[ ! -f "${CONFIG_DIR}/app.ini" ]]; then
        log_info "Creating app.ini template..."
        cat > "${CONFIG_DIR}/app.ini" <<'EOF'
; Gitea Configuration Template
; This file is a template - actual configuration is managed via environment variables
; in docker-compose.yml

APP_NAME = Project Nyra - Local Git Server
RUN_MODE = prod
RUN_USER = git

[repository]
ROOT = /data/git/repositories
DEFAULT_BRANCH = main
DEFAULT_PRIVATE = private
ENABLE_PUSH_CREATE_USER = true
ENABLE_PUSH_CREATE_ORG = true

[repository.local]
LOCAL_COPY_PATH = /tmp/gitea/local-repo

[repository.upload]
ENABLED = true
FILE_MAX_SIZE = 100
MAX_FILES = 10

[server]
PROTOCOL = http
DOMAIN = localhost
HTTP_PORT = 3000
ROOT_URL = http://localhost:3001/
DISABLE_SSH = false
SSH_PORT = 2222
START_SSH_SERVER = true
LFS_START_SERVER = true
OFFLINE_MODE = false

[database]
DB_TYPE = postgres
HOST = gitea-db:5432
NAME = gitea
USER = gitea
SCHEMA = public
SSL_MODE = disable
LOG_SQL = false

[security]
INSTALL_LOCK = true
MIN_PASSWORD_LENGTH = 8
PASSWORD_COMPLEXITY = lower,upper,digit
PASSWORD_HASH_ALGO = pbkdf2

[service]
DISABLE_REGISTRATION = true
REQUIRE_SIGNIN_VIEW = false
REGISTER_EMAIL_CONFIRM = false
ENABLE_NOTIFY_MAIL = false
DEFAULT_KEEP_EMAIL_PRIVATE = true
DEFAULT_ALLOW_CREATE_ORGANIZATION = true
NO_REPLY_ADDRESS = noreply@localhost

[webhook]
ALLOWED_HOST_LIST = *
SKIP_TLS_VERIFY = false

[mailer]
ENABLED = false

[cache]
ENABLED = true
ADAPTER = memory

[session]
PROVIDER = file
PROVIDER_CONFIG = /data/gitea/sessions

[log]
MODE = console
LEVEL = Info

[git]
MAX_GIT_DIFF_LINES = 10000
MAX_GIT_DIFF_LINE_CHARACTERS = 5000
MAX_GIT_DIFF_FILES = 100
DISABLE_DIFF_HIGHLIGHT = false

[api]
ENABLE_SWAGGER = true
MAX_RESPONSE_ITEMS = 50

[oauth2]
ENABLE = true
EOF
    fi

    log_success "Configuration directory setup complete"
}

# Start Gitea services
start_services() {
    log_info "Starting Gitea services..."

    cd "${DOCKER_DIR}"

    # Load environment file
    export $(cat .env.gitea | grep -v '^#' | xargs)

    # Start services
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d gitea-db gitea
    else
        docker compose up -d gitea-db gitea
    fi

    log_success "Gitea services started"
}

# Wait for Gitea to be ready
wait_for_gitea() {
    log_info "Waiting for Gitea to be ready..."

    local max_attempts=60
    local attempt=0

    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s http://localhost:3001/api/healthz > /dev/null 2>&1; then
            log_success "Gitea is ready"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    log_error "Gitea failed to start within expected time"
    return 1
}

# Create initial repositories
create_initial_repos() {
    log_info "Creating initial repositories..."

    # Wait a bit more for admin user to be created
    sleep 5

    # Create Project Nyra repository using Gitea API
    local api_url="http://localhost:3001/api/v1"
    local auth="${ADMIN_USER}:${ADMIN_PASSWORD}"

    log_info "Creating Project-Nyra repository..."

    curl -X POST "${api_url}/user/repos" \
        -u "${auth}" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Project-Nyra",
            "description": "Project Nyra - AI-Powered Mortgage Platform",
            "private": false,
            "auto_init": true,
            "default_branch": "main",
            "gitignores": "Node,Python",
            "license": "MIT",
            "readme": "Default"
        }' 2>/dev/null || log_warning "Repository might already exist"

    log_success "Initial repositories created"
}

# Configure SSH access
configure_ssh() {
    log_info "Configuring SSH access..."

    # Create SSH directory if it doesn't exist
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh

    # Add Gitea SSH host key to known_hosts
    if [[ ! -f ~/.ssh/known_hosts ]] || ! grep -q "\[${GITEA_DOMAIN}\]:2222" ~/.ssh/known_hosts; then
        ssh-keyscan -p 2222 "${GITEA_DOMAIN}" >> ~/.ssh/known_hosts 2>/dev/null || true
    fi

    log_info "SSH configuration instructions:"
    echo ""
    echo "To use SSH with Gitea:"
    echo "1. Generate SSH key (if you don't have one):"
    echo "   ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo ""
    echo "2. Add your public key to Gitea:"
    echo "   - Go to http://localhost:3001"
    echo "   - Login with admin credentials"
    echo "   - Go to Settings -> SSH/GPG Keys"
    echo "   - Add your public key (~/.ssh/id_ed25519.pub)"
    echo ""
    echo "3. Clone repositories using SSH:"
    echo "   git clone ssh://git@${GITEA_DOMAIN}:2222/admin/Project-Nyra.git"
    echo ""

    log_success "SSH configuration complete"
}

# Setup Git hooks
setup_git_hooks() {
    log_info "Setting up Git hooks..."

    # Create hooks directory
    local hooks_dir="${SCRIPT_DIR}/../configs/gitea/hooks"
    mkdir -p "${hooks_dir}"

    # Create pre-receive hook template
    cat > "${hooks_dir}/pre-receive.sample" <<'EOF'
#!/bin/bash
# Pre-receive hook for Gitea
# This hook is called before refs are updated

while read oldrev newrev refname; do
    # Add your validation logic here
    echo "Validating push to ${refname}..."

    # Example: Check commit message format
    # Example: Run linters
    # Example: Validate file types
done

exit 0
EOF

    # Create post-receive hook template
    cat > "${hooks_dir}/post-receive.sample" <<'EOF'
#!/bin/bash
# Post-receive hook for Gitea
# This hook is called after refs are updated

while read oldrev newrev refname; do
    # Add your automation logic here
    echo "Processing push to ${refname}..."

    # Example: Trigger CI/CD pipeline
    # Example: Send notifications
    # Example: Update documentation
done

exit 0
EOF

    chmod +x "${hooks_dir}"/*.sample

    log_success "Git hooks templates created"
}

# Configure backup strategy
configure_backup() {
    log_info "Configuring backup strategy..."

    local backup_dir="${SCRIPT_DIR}/../backups/gitea"
    mkdir -p "${backup_dir}"

    # Create backup script
    cat > "${SCRIPT_DIR}/backup-gitea.sh" <<'EOF'
#!/bin/bash
# Gitea Backup Script

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backups/gitea" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/gitea_backup_${TIMESTAMP}.tar.gz"

echo "Starting Gitea backup..."

# Backup Gitea data
docker exec orchestrator-gitea /bin/bash -c "cd /data && tar czf /tmp/gitea_backup.tar.gz ." && \
docker cp orchestrator-gitea:/tmp/gitea_backup.tar.gz "${BACKUP_FILE}" && \
docker exec orchestrator-gitea rm /tmp/gitea_backup.tar.gz

# Backup database
docker exec orchestrator-gitea-db pg_dump -U gitea gitea > "${BACKUP_DIR}/gitea_db_${TIMESTAMP}.sql"

# Compress database backup
gzip "${BACKUP_DIR}/gitea_db_${TIMESTAMP}.sql"

# Keep only last 7 backups
ls -t "${BACKUP_DIR}"/gitea_backup_*.tar.gz | tail -n +8 | xargs -r rm
ls -t "${BACKUP_DIR}"/gitea_db_*.sql.gz | tail -n +8 | xargs -r rm

echo "Backup completed: ${BACKUP_FILE}"
EOF

    chmod +x "${SCRIPT_DIR}/backup-gitea.sh"

    # Create restore script
    cat > "${SCRIPT_DIR}/restore-gitea.sh" <<'EOF'
#!/bin/bash
# Gitea Restore Script

if [[ -z "$1" ]]; then
    echo "Usage: $0 <backup_timestamp>"
    echo "Example: $0 20260115_120000"
    exit 1
fi

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backups/gitea" && pwd)"
TIMESTAMP=$1
DATA_BACKUP="${BACKUP_DIR}/gitea_backup_${TIMESTAMP}.tar.gz"
DB_BACKUP="${BACKUP_DIR}/gitea_db_${TIMESTAMP}.sql.gz"

if [[ ! -f "${DATA_BACKUP}" ]] || [[ ! -f "${DB_BACKUP}" ]]; then
    echo "Error: Backup files not found for timestamp ${TIMESTAMP}"
    exit 1
fi

echo "Restoring Gitea from backup ${TIMESTAMP}..."

# Stop Gitea
docker-compose -f "$(dirname "${BASH_SOURCE[0]}")/../docker/docker-compose.yml" stop gitea

# Restore database
gunzip -c "${DB_BACKUP}" | docker exec -i orchestrator-gitea-db psql -U gitea gitea

# Restore data
docker cp "${DATA_BACKUP}" orchestrator-gitea:/tmp/gitea_backup.tar.gz && \
docker exec orchestrator-gitea /bin/bash -c "cd /data && tar xzf /tmp/gitea_backup.tar.gz && rm /tmp/gitea_backup.tar.gz"

# Start Gitea
docker-compose -f "$(dirname "${BASH_SOURCE[0]}")/../docker/docker-compose.yml" start gitea

echo "Restore completed"
EOF

    chmod +x "${SCRIPT_DIR}/restore-gitea.sh"

    log_info "Backup scripts created:"
    echo "  - Backup: ${SCRIPT_DIR}/backup-gitea.sh"
    echo "  - Restore: ${SCRIPT_DIR}/restore-gitea.sh"
    echo ""
    echo "To setup automated backups, add to crontab:"
    echo "  0 2 * * * ${SCRIPT_DIR}/backup-gitea.sh"
    echo ""

    log_success "Backup strategy configured"
}

# Print summary
print_summary() {
    log_success "Gitea setup complete!"
    echo ""
    echo "================================================================"
    echo "Gitea Local Git Server - Setup Summary"
    echo "================================================================"
    echo ""
    echo "Access Information:"
    echo "  Web UI:     http://localhost:3001"
    echo "  SSH:        ssh://git@${GITEA_DOMAIN}:2222"
    echo "  API:        http://localhost:3001/api/v1"
    echo ""
    echo "Admin Credentials:"
    echo "  Username:   ${ADMIN_USER}"
    echo "  Password:   ${ADMIN_PASSWORD}"
    echo ""
    echo "Initial Repository:"
    echo "  Project-Nyra: http://localhost:3001/admin/Project-Nyra"
    echo ""
    echo "Configuration:"
    echo "  Docker Compose: ${DOCKER_DIR}/docker-compose.yml"
    echo "  Environment:    ${DOCKER_DIR}/.env.gitea"
    echo "  Config Dir:     ${CONFIG_DIR}"
    echo ""
    echo "Backup Scripts:"
    echo "  Backup:  ${SCRIPT_DIR}/backup-gitea.sh"
    echo "  Restore: ${SCRIPT_DIR}/restore-gitea.sh"
    echo ""
    echo "Next Steps:"
    echo "  1. Login to web UI and change admin password"
    echo "  2. Add SSH keys for team members"
    echo "  3. Configure webhooks for CI/CD"
    echo "  4. Setup automated backups"
    echo "  5. Configure Cloudflare tunnel for external access"
    echo ""
    echo "================================================================"
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    echo ""
    echo "================================================================"
    echo "Gitea Local Git Server Setup"
    echo "================================================================"
    echo ""

    parse_args "$@"
    check_prerequisites
    setup_credentials
    setup_config_directory
    start_services
    wait_for_gitea
    create_initial_repos
    configure_ssh
    setup_git_hooks
    configure_backup
    print_summary
}

main "$@"
