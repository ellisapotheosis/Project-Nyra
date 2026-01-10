#!/bin/bash
set -euo pipefail

# Gitea setup script for Project-Nyra self-hosted Git

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

GITEA_DIR="/opt/nyra/gitea"
DATA_DIR="$GITEA_DIR/data"

echo "=========================================="
echo "  Gitea Setup for Project-Nyra"
echo "=========================================="
echo ""

# Create directory structure
log_info "Creating Gitea directories..."
mkdir -p "$GITEA_DIR"/{data,config}

# Create docker-compose.yml
log_info "Creating Gitea Docker Compose configuration..."

cat > "$GITEA_DIR/docker-compose.yml" <<'EOF'
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
      - GITEA__server__DOMAIN=gitea.local
      - GITEA__server__SSH_DOMAIN=gitea.local
      - GITEA__server__ROOT_URL=http://gitea.local:3020/
      - GITEA__security__INSTALL_LOCK=false
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
    networks:
      - gitea

networks:
  gitea:
    driver: bridge

EOF

# Create Gitea database if not exists
log_info "Creating Gitea database..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gitea; then
    log_warn "Database 'gitea' already exists"
else
    sudo -u postgres psql -c "CREATE DATABASE gitea;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gitea TO postgres;"
    log_success "Database 'gitea' created"
fi

# Start Gitea
log_info "Starting Gitea..."
cd "$GITEA_DIR"
docker compose up -d

# Wait for Gitea to be ready
log_info "Waiting for Gitea to start..."
for i in {1..30}; do
    if curl -s http://localhost:3020 > /dev/null; then
        break
    fi
    sleep 2
done

log_success "Gitea is running!"
echo ""
log_info "=============================================="
log_info "  Gitea Setup Complete"
log_info "=============================================="
echo ""
log_info "Access Gitea at: http://localhost:3020"
log_info "         or at: http://gitea.local:3020"
echo ""
log_info "Initial Setup Steps:"
log_info "1. Open http://localhost:3020 in your browser"
log_info "2. Complete the installation wizard"
log_info "3. Create administrator account"
log_info "4. Configure SSH keys for Git access"
echo ""
log_info "Database Configuration (already set):"
log_info "  Database Type: PostgreSQL"
log_info "  Host: host.docker.internal:5432"
log_info "  Database Name: gitea"
log_info "  Username: postgres"
log_info "  Password: postgres"
echo ""
log_info "Commands:"
log_info "  Start: cd $GITEA_DIR && docker compose up -d"
log_info "  Stop: cd $GITEA_DIR && docker compose down"
log_info "  Logs: cd $GITEA_DIR && docker compose logs -f"
log_info "  Status: docker ps | grep gitea"
echo ""
log_success "Gitea setup complete!"
