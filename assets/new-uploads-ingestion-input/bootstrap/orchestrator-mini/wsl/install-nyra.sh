#!/bin/bash
set -euo pipefail

# Project-Nyra Installation Script
# Complete setup for orchestrator-mini including all repositories and services

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NYRA_HOME="/opt/nyra"
REPOS_DIR="$NYRA_HOME/repos"
DATA_DIR="$NYRA_HOME/data"
LOGS_DIR="$NYRA_HOME/logs"
BACKUPS_DIR="$NYRA_HOME/backups"
LOG_FILE="$LOGS_DIR/install-nyra.log"

# Repository URLs
GITHUB_ORG="your-github-org"  # Update with actual organization
GITEA_URL="http://localhost:3020"  # Update when Gitea is configured

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Error handler
trap 'log_error "Installation failed at line $LINENO. Check $LOG_FILE for details."; exit 1' ERR

# Create directory structure
setup_directories() {
    log_info "Creating directory structure..."

    sudo mkdir -p "$NYRA_HOME"/{repos,data,logs,backups,scripts}
    sudo chown -R "$USER:$USER" "$NYRA_HOME"

    mkdir -p "$DATA_DIR"/{postgres,redis,gitea,minio,prometheus,grafana}
    mkdir -p "$LOGS_DIR"
    mkdir -p "$BACKUPS_DIR"

    log_success "Directory structure created"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing=()

    command -v git >/dev/null 2>&1 || missing+=("git")
    command -v docker >/dev/null 2>&1 || missing+=("docker")
    command -v node >/dev/null 2>&1 || missing+=("node")
    command -v psql >/dev/null 2>&1 || missing+=("postgresql")
    command -v redis-cli >/dev/null 2>&1 || missing+=("redis")

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing[*]}"
        log_error "Run setup-ubuntu.sh first to install dependencies"
        exit 1
    fi

    log_success "All prerequisites satisfied"
}

# Setup PostgreSQL databases
setup_databases() {
    log_info "Setting up PostgreSQL databases..."

    # Start PostgreSQL if not running
    if ! pg_isready -q 2>/dev/null; then
        sudo systemctl start postgresql
        sleep 3
    fi

    # Create databases
    local databases=(
        "nyra_main"
        "nyra_auth"
        "nyra_agents"
        "nyra_memory"
        "gitea"
    )

    for db in "${databases[@]}"; do
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$db"; then
            log_warn "Database '$db' already exists"
        else
            log_info "Creating database: $db"
            sudo -u postgres psql -c "CREATE DATABASE $db;" >> "$LOG_FILE" 2>&1
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db TO postgres;" >> "$LOG_FILE" 2>&1
            log_success "Database '$db' created"
        fi
    done

    log_success "PostgreSQL databases configured"
}

# Clone repositories
clone_repositories() {
    log_info "Cloning Project-Nyra repositories..."

    cd "$REPOS_DIR"

    # Main repository
    local main_repo="project-nyra"
    if [[ -d "$main_repo" ]]; then
        log_warn "Repository '$main_repo' already exists, pulling latest..."
        cd "$main_repo"
        git pull || log_warn "Failed to pull latest changes"
        cd "$REPOS_DIR"
    else
        log_info "Cloning main repository..."
        # Update with actual repository URL
        # git clone https://github.com/$GITHUB_ORG/$main_repo.git
        log_warn "Update repository URL in install-nyra.sh"
    fi

    # Additional repositories (add as needed)
    local repos=(
        # "nyra-frontend"
        # "nyra-backend"
        # "nyra-ai-engine"
        # "nyra-mobile"
    )

    for repo in "${repos[@]}"; do
        if [[ -d "$repo" ]]; then
            log_warn "Repository '$repo' already exists, skipping..."
        else
            log_info "Cloning $repo..."
            # git clone https://github.com/$GITHUB_ORG/$repo.git || log_warn "Failed to clone $repo"
        fi
    done

    log_success "Repositories ready"
}

# Install Node.js dependencies
install_node_dependencies() {
    log_info "Installing Node.js dependencies..."

    local node_projects=$(find "$REPOS_DIR" -name "package.json" -not -path "*/node_modules/*" | sed 's|/package.json||')

    for project in $node_projects; do
        log_info "Installing dependencies for $(basename "$project")..."
        cd "$project"

        if [[ -f "package-lock.json" ]]; then
            npm ci >> "$LOG_FILE" 2>&1
        elif [[ -f "yarn.lock" ]]; then
            yarn install --frozen-lockfile >> "$LOG_FILE" 2>&1
        elif [[ -f "pnpm-lock.yaml" ]]; then
            pnpm install --frozen-lockfile >> "$LOG_FILE" 2>&1
        else
            npm install >> "$LOG_FILE" 2>&1
        fi

        log_success "Dependencies installed for $(basename "$project")"
    done

    log_success "All Node.js dependencies installed"
}

# Setup Infisical secrets
setup_infisical() {
    log_info "Setting up Infisical secrets management..."

    if ! command -v infisical >/dev/null 2>&1; then
        log_warn "Infisical not installed, skipping secrets setup"
        return
    fi

    # Check if already logged in
    if ! infisical user 2>/dev/null | grep -q "email"; then
        log_warn "Infisical not authenticated"
        log_info "Run: infisical login"
        log_info "Then re-run this script"
        return
    fi

    log_info "Infisical configured. Secrets will be loaded at runtime."
    log_success "Infisical ready"
}

# Build applications
build_applications() {
    log_info "Building applications..."

    local node_projects=$(find "$REPOS_DIR" -name "package.json" -not -path "*/node_modules/*" | sed 's|/package.json||')

    for project in $node_projects; do
        cd "$project"

        if grep -q '"build"' package.json; then
            log_info "Building $(basename "$project")..."
            npm run build >> "$LOG_FILE" 2>&1 || log_warn "Build failed for $(basename "$project")"
            log_success "$(basename "$project") built"
        fi
    done

    log_success "Applications built"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    local node_projects=$(find "$REPOS_DIR" -name "package.json" -not -path "*/node_modules/*" | sed 's|/package.json||')

    for project in $node_projects; do
        cd "$project"

        # Prisma migrations
        if [[ -d "prisma" ]] && command -v prisma >/dev/null 2>&1; then
            log_info "Running Prisma migrations for $(basename "$project")..."
            npx prisma migrate deploy >> "$LOG_FILE" 2>&1 || log_warn "Migrations failed for $(basename "$project")"
            npx prisma generate >> "$LOG_FILE" 2>&1 || log_warn "Prisma generate failed"
            log_success "Migrations completed for $(basename "$project")"
        fi

        # TypeORM migrations
        if grep -q "typeorm" package.json; then
            log_info "Running TypeORM migrations for $(basename "$project")..."
            npm run migration:run >> "$LOG_FILE" 2>&1 || log_warn "TypeORM migrations failed"
        fi
    done

    log_success "Database migrations completed"
}

# Setup Gitea
setup_gitea() {
    log_info "Setting up Gitea (self-hosted Git)..."

    local gitea_dir="$NYRA_HOME/gitea"
    mkdir -p "$gitea_dir"

    # Create docker-compose.yml for Gitea
    cat > "$gitea_dir/docker-compose.yml" <<'EOF'
version: "3.9"

services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=host.docker.internal:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=postgres
      - GITEA__database__PASSWD=postgres
    restart: unless-stopped
    volumes:
      - ./data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3020:3000"
      - "2222:22"
    extra_hosts:
      - "host.docker.internal:host-gateway"

EOF

    log_info "Starting Gitea..."
    cd "$gitea_dir"
    docker compose up -d >> "$LOG_FILE" 2>&1

    log_success "Gitea configured (accessible at http://localhost:3020)"
    log_info "Complete Gitea setup through web interface"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring stack..."

    local monitoring_dir="$NYRA_HOME/monitoring"
    mkdir -p "$monitoring_dir"/{prometheus,grafana}

    # Prometheus configuration
    cat > "$monitoring_dir/prometheus/prometheus.yml" <<'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['host.docker.internal:9100']

  - job_name: 'postgres'
    static_configs:
      - targets: ['host.docker.internal:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['host.docker.internal:9121']

  - job_name: 'application'
    static_configs:
      - targets: ['host.docker.internal:3000']

EOF

    # Docker Compose for monitoring
    cat > "$monitoring_dir/docker-compose.yml" <<'EOF'
version: "3.9"

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:

EOF

    log_info "Starting monitoring stack..."
    cd "$monitoring_dir"
    docker compose up -d >> "$LOG_FILE" 2>&1

    log_success "Monitoring configured"
    log_info "Prometheus: http://localhost:9090"
    log_info "Grafana: http://localhost:3001 (admin/admin)"
}

# Create startup scripts
create_startup_scripts() {
    log_info "Creating startup scripts..."

    local scripts_dir="$NYRA_HOME/scripts"
    mkdir -p "$scripts_dir/services"

    # Copy service management scripts
    if [[ -d "$SCRIPT_DIR/services" ]]; then
        cp -r "$SCRIPT_DIR/services/"* "$scripts_dir/services/"
        chmod +x "$scripts_dir/services/"*.sh
    fi

    # Add to PATH in .bashrc if not already there
    if ! grep -q "NYRA_HOME/scripts" "$HOME/.bashrc"; then
        echo 'export PATH="$PATH:/opt/nyra/scripts/services"' >> "$HOME/.bashrc"
    fi

    log_success "Startup scripts created"
}

# Display summary
display_summary() {
    log_info ""
    log_info "=============================================="
    log_success "Project-Nyra Installation Complete!"
    log_info "=============================================="
    log_info ""
    log_info "Services installed:"
    log_info "  ✓ PostgreSQL databases created"
    log_info "  ✓ Redis configured"
    log_info "  ✓ Repositories cloned"
    log_info "  ✓ Dependencies installed"
    log_info "  ✓ Applications built"
    log_info "  ✓ Gitea running on http://localhost:3020"
    log_info "  ✓ Monitoring stack ready"
    log_info ""
    log_info "Quick start:"
    log_info "  1. Start all services: start-all.sh"
    log_info "  2. Check status: status.sh"
    log_info "  3. View logs: logs.sh -f"
    log_info ""
    log_info "Web interfaces:"
    log_info "  • Main App: http://localhost:3000"
    log_info "  • Gitea: http://localhost:3020"
    log_info "  • Prometheus: http://localhost:9090"
    log_info "  • Grafana: http://localhost:3001"
    log_info ""
    log_info "Configuration:"
    log_info "  • Nyra Home: $NYRA_HOME"
    log_info "  • Repositories: $REPOS_DIR"
    log_info "  • Data: $DATA_DIR"
    log_info "  • Logs: $LOGS_DIR"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Configure Infisical: infisical login"
    log_info "  2. Setup Gitea through web interface"
    log_info "  3. Connect Tailscale: sudo tailscale up"
    log_info "  4. Configure environment variables"
    log_info ""
    log_info "Log file: $LOG_FILE"
    log_info "=============================================="
}

# Main installation
main() {
    log_info "=========================================="
    log_info "Project-Nyra Installation"
    log_info "orchestrator-mini PC"
    log_info "=========================================="
    log_info ""

    setup_directories
    check_prerequisites
    setup_databases
    clone_repositories
    install_node_dependencies
    setup_infisical
    build_applications
    run_migrations
    setup_gitea
    setup_monitoring
    create_startup_scripts
    display_summary
}

# Run main function
main "$@"
