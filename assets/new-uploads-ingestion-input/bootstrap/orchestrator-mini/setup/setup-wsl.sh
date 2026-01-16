#!/bin/bash
# Project Nyra - Orchestrator Mini PC Setup (WSL/Ubuntu)
# This script configures WSL environment with Docker, Claude Flow, and Infisical

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo_success() { echo -e "${GREEN}$1${NC}"; }
echo_info() { echo -e "${CYAN}$1${NC}"; }
echo_warning() { echo -e "${YELLOW}$1${NC}"; }
echo_error() { echo -e "${RED}$1${NC}"; }

# ASCII Banner
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Project Nyra - Orchestrator WSL Setup                  ║
║   Role: MCP Servers, Coordination, Memory Systems        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF

echo ""
echo_info "[1/12] Checking WSL environment..."

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    echo_error "ERROR: This script must be run inside WSL"
    exit 1
fi

echo_success "✓ Running in WSL environment"

# Update system
echo_info "\n[2/12] Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
echo_success "✓ System packages updated"

# Install essential packages
echo_info "\n[3/12] Installing essential packages..."
sudo apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    jq \
    unzip \
    software-properties-common

echo_success "✓ Essential packages installed"

# Install Docker (in WSL, we'll use Docker CLI that connects to Docker Desktop)
echo_info "\n[4/12] Configuring Docker CLI..."

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker CLI (connects to Docker Desktop on Windows)
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce-cli docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

echo_success "✓ Docker CLI configured"

# Install Node.js via nvm
echo_info "\n[5/12] Installing Node.js via nvm..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    nvm install --lts
    nvm use --lts
    nvm alias default lts/*
    echo_success "✓ Node.js installed via nvm"
else
    echo_success "✓ nvm already installed"
fi

# Ensure nvm is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Claude Flow CLI
echo_info "\n[6/12] Installing Claude Flow CLI..."
npm install -g @claude-flow/cli@latest
echo_success "✓ Claude Flow CLI installed"

# Verify Claude Flow installation
CF_VERSION=$(npx @claude-flow/cli@latest --version 2>/dev/null || echo "unknown")
echo_info "Claude Flow version: $CF_VERSION"

# Install Infisical CLI
echo_info "\n[7/12] Installing Infisical CLI..."
if ! command -v infisical &> /dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get update -qq && sudo apt-get install -y -qq infisical
    echo_success "✓ Infisical CLI installed"
else
    echo_success "✓ Infisical CLI already installed"
fi

# Configure Infisical
echo_info "\n[8/12] Configuring Infisical..."
mkdir -p ~/.infisical

# Check for Infisical credentials from environment or .env file
if [ -n "$INFISICAL_TOKEN" ] && [ -n "$INFISICAL_PROJECT_ID" ]; then
    cat > ~/.infisical/config.json <<EOF
{
  "token": "$INFISICAL_TOKEN",
  "projectId": "$INFISICAL_PROJECT_ID",
  "environment": "production",
  "path": "/nyra/orchestrator"
}
EOF
    echo_success "✓ Infisical configured from environment variables"

    # Test connection
    echo_info "Testing Infisical connection..."
    if infisical secrets 2>/dev/null; then
        echo_success "✓ Infisical connection successful"
    else
        echo_warning "⚠ Could not connect to Infisical. Please verify credentials."
    fi
else
    echo_warning "⚠ Infisical credentials not provided. Run 'infisical login' to configure."
fi

# Install Python 3.11 (for some MCP servers)
echo_info "\n[9/12] Installing Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update -qq
sudo apt-get install -y -qq python3.11 python3.11-venv python3-pip
echo_success "✓ Python 3.11 installed"

# Install additional tools
echo_info "\n[10/12] Installing additional tools..."

# Install PostgreSQL client (for database management)
sudo apt-get install -y -qq postgresql-client

# Install Redis client
sudo apt-get install -y -qq redis-tools

# Install monitoring tools
sudo apt-get install -y -qq htop iotop nethogs

echo_success "✓ Additional tools installed"

# Create project directory structure
echo_info "\n[11/12] Creating project directory structure..."
PROJECT_ROOT="$HOME/nyra-orchestrator"
mkdir -p $PROJECT_ROOT/{config,data,logs,scripts,secrets,docker}

# Create symbolic link to Windows project directory (if exists)
WIN_PROJECT="/mnt/c/nyra-orchestrator"
if [ -d "$WIN_PROJECT" ]; then
    ln -sf $WIN_PROJECT $HOME/nyra-orchestrator-win
    echo_info "Created symbolic link: $HOME/nyra-orchestrator-win -> $WIN_PROJECT"
fi

echo_success "✓ Project directory structure created"

# Setup shell environment
echo_info "\n[12/12] Configuring shell environment..."

# Add to .bashrc if not already present
BASHRC="$HOME/.bashrc"

# Add nvm initialization
if ! grep -q "NVM_DIR" $BASHRC; then
    cat >> $BASHRC <<'EOF'

# NVM initialization
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
fi

# Add Claude Flow aliases
if ! grep -q "claude-flow aliases" $BASHRC; then
    cat >> $BASHRC <<'EOF'

# Claude Flow aliases
alias cf='npx @claude-flow/cli@latest'
alias cf-doctor='npx @claude-flow/cli@latest doctor'
alias cf-status='npx @claude-flow/cli@latest status'
alias cf-swarm='npx @claude-flow/cli@latest swarm'
alias cf-memory='npx @claude-flow/cli@latest memory'
EOF
fi

# Add Docker aliases
if ! grep -q "docker aliases" $BASHRC; then
    cat >> $BASHRC <<'EOF'

# Docker aliases
alias dc='docker compose'
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
alias dlogs='docker compose logs -f'
alias dstats='docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"'
EOF
fi

# Add project shortcuts
if ! grep -q "Nyra shortcuts" $BASHRC; then
    cat >> $BASHRC <<EOF

# Nyra shortcuts
export NYRA_HOME="$PROJECT_ROOT"
alias nyra='cd $PROJECT_ROOT'
alias nyra-start='cd $PROJECT_ROOT && infisical run --env=production --path=/nyra/orchestrator -- docker compose up -d'
alias nyra-stop='cd $PROJECT_ROOT && docker compose down'
alias nyra-logs='cd $PROJECT_ROOT && docker compose logs -f'
alias nyra-status='cd $PROJECT_ROOT && docker compose ps && echo "" && docker stats --no-stream'
EOF
fi

echo_success "✓ Shell environment configured"

# Create health check script
cat > $PROJECT_ROOT/scripts/health-check.sh <<'HEALTH_EOF'
#!/bin/bash
# Health check script for Nyra Orchestrator

echo "╔═══════════════════════════════════════╗"
echo "║   Nyra Orchestrator Health Check     ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    echo "✓ Docker CLI available"
    if docker ps &> /dev/null; then
        echo "✓ Docker daemon accessible"
    else
        echo "✗ Docker daemon not accessible"
    fi
else
    echo "✗ Docker CLI not found"
fi

# Check Claude Flow
if command -v npx &> /dev/null; then
    echo "✓ npx available"
    CF_VERSION=$(npx @claude-flow/cli@latest --version 2>/dev/null || echo "error")
    if [ "$CF_VERSION" != "error" ]; then
        echo "✓ Claude Flow CLI: $CF_VERSION"
    else
        echo "✗ Claude Flow CLI not accessible"
    fi
else
    echo "✗ npx not found"
fi

# Check Infisical
if command -v infisical &> /dev/null; then
    echo "✓ Infisical CLI available"
    if infisical secrets &> /dev/null; then
        echo "✓ Infisical authenticated"
    else
        echo "✗ Infisical not authenticated"
    fi
else
    echo "✗ Infisical CLI not found"
fi

# Check services (if running)
echo ""
echo "Running services:"
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "No services running"

HEALTH_EOF

chmod +x $PROJECT_ROOT/scripts/health-check.sh
echo_success "✓ Health check script created"

# Create Docker Compose file for orchestrator
cat > $PROJECT_ROOT/docker-compose.orchestrator.yml <<'COMPOSE_EOF'
version: '3.8'

# Nyra Orchestrator Services
# This compose file should be run with Infisical: infisical run -- docker compose up

networks:
  nyra-network:
    name: nyra-orchestrator-network
    driver: bridge

services:
  # PostgreSQL with pgvector
  postgres:
    image: pgvector/pgvector:pg15
    container_name: nyra-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-nyra_db}
      POSTGRES_USER: ${POSTGRES_USER:-nyra}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nyra-network
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - nyra-network
    restart: unless-stopped

  # Qdrant (Vector DB)
  qdrant:
    image: qdrant/qdrant:latest
    container_name: nyra-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - nyra-network
    restart: unless-stopped

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: nyra-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - nyra-network
    restart: unless-stopped

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: nyra-grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana:/etc/grafana/provisioning
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
  prometheus_data:
  grafana_data:
COMPOSE_EOF

echo_success "✓ Docker Compose file created"

# Final summary
echo ""
echo_success "╔═══════════════════════════════════════════════════════════╗"
echo_success "║                                                           ║"
echo_success "║   ✓ Orchestrator WSL Setup Complete!                     ║"
echo_success "║                                                           ║"
echo_success "╚═══════════════════════════════════════════════════════════╝"

echo ""
echo_info "Installed Components:"
echo_info "  ✓ Docker CLI (connects to Docker Desktop)"
echo_info "  ✓ Node.js LTS (via nvm)"
echo_info "  ✓ Claude Flow CLI"
echo_info "  ✓ Infisical CLI"
echo_info "  ✓ Python 3.11"
echo_info "  ✓ PostgreSQL client"
echo_info "  ✓ Redis client"
echo_info "  ✓ Monitoring tools"

echo ""
echo_info "Useful Commands:"
echo_info "  nyra              - Navigate to project directory"
echo_info "  nyra-start        - Start all orchestrator services"
echo_info "  nyra-stop         - Stop all services"
echo_info "  nyra-status       - Show service status"
echo_info "  nyra-logs         - Show service logs"
echo_info "  cf-doctor         - Run Claude Flow diagnostics"
echo_info "  cf-status         - Show Claude Flow status"

echo ""
echo_info "Project Directory: $PROJECT_ROOT"
echo_info "Health Check: $PROJECT_ROOT/scripts/health-check.sh"

echo ""
echo_warning "⚠️  IMPORTANT: Restart your terminal or run: source ~/.bashrc"
echo_info "Then run: $PROJECT_ROOT/scripts/health-check.sh"

echo ""
echo_info "Next Steps:"
echo_info "  1. Restart terminal: exit && wsl"
echo_info "  2. Run health check: ~/nyra-orchestrator/scripts/health-check.sh"
echo_info "  3. Configure Infisical (if not done): infisical login"
echo_info "  4. Start services: nyra-start"
