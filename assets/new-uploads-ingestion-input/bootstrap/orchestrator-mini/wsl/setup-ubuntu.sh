#!/bin/bash
set -euo pipefail

# Project-Nyra Ubuntu 22.04 Setup Script
# Installs all development tools, services, and dependencies for orchestrator-mini

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
export DEBIAN_FRONTEND=noninteractive
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/setup-ubuntu.log"
NYRA_HOME="/opt/nyra"
NODE_VERSION="20"
PYTHON_VERSION="3.11"

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

# Check if running as root or with sudo
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run with sudo"
        exit 1
    fi
}

# Update system
update_system() {
    log_info "Updating system packages..."
    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get upgrade -y >> "$LOG_FILE" 2>&1
    log_success "System updated"
}

# Install essential tools
install_essentials() {
    log_info "Installing essential tools..."

    local packages=(
        build-essential
        curl
        wget
        git
        vim
        nano
        htop
        jq
        yq
        unzip
        zip
        ca-certificates
        gnupg
        lsb-release
        software-properties-common
        apt-transport-https
        dirmngr
        sudo
        net-tools
        iputils-ping
        dnsutils
        telnet
        netcat
        tree
        tmux
        zsh
        fzf
        ripgrep
        fd-find
        bat
        exa
    )

    apt-get install -y "${packages[@]}" >> "$LOG_FILE" 2>&1
    log_success "Essential tools installed"
}

# Install Docker
install_docker() {
    log_info "Installing Docker..."

    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Set up repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >> "$LOG_FILE" 2>&1

    # Start Docker service
    systemctl enable docker >> "$LOG_FILE" 2>&1
    systemctl start docker >> "$LOG_FILE" 2>&1

    # Add user to docker group
    local current_user="${SUDO_USER:-$(whoami)}"
    if [[ "$current_user" != "root" ]]; then
        usermod -aG docker "$current_user"
    fi

    # Verify installation
    docker --version >> "$LOG_FILE" 2>&1
    docker compose version >> "$LOG_FILE" 2>&1

    log_success "Docker installed: $(docker --version)"
}

# Install Node.js via nvm
install_nodejs() {
    log_info "Installing Node.js $NODE_VERSION via nvm..."

    local current_user="${SUDO_USER:-$(whoami)}"
    local user_home=$(eval echo ~$current_user)

    # Install nvm as the user
    if [[ "$current_user" != "root" ]]; then
        sudo -u "$current_user" bash <<EOF
        export HOME="$user_home"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$user_home/.nvm"
        [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
        nvm install $NODE_VERSION
        nvm use $NODE_VERSION
        nvm alias default $NODE_VERSION

        # Install global packages
        npm install -g npm@latest
        npm install -g yarn pnpm
        npm install -g pm2
        npm install -g typescript ts-node
        npm install -g @nestjs/cli
        npm install -g prisma
        npm install -g claude-flow@alpha
EOF
    fi

    log_success "Node.js installed"
}

# Install Python via pyenv
install_python() {
    log_info "Installing Python $PYTHON_VERSION via pyenv..."

    # Install dependencies
    apt-get install -y make build-essential libssl-dev zlib1g-dev \
        libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
        libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
        libffi-dev liblzma-dev >> "$LOG_FILE" 2>&1

    local current_user="${SUDO_USER:-$(whoami)}"
    local user_home=$(eval echo ~$current_user)

    # Install pyenv as the user
    if [[ "$current_user" != "root" ]]; then
        sudo -u "$current_user" bash <<EOF
        export HOME="$user_home"
        curl https://pyenv.run | bash
        export PYENV_ROOT="$user_home/.pyenv"
        export PATH="\$PYENV_ROOT/bin:\$PATH"
        eval "\$(pyenv init -)"
        pyenv install $PYTHON_VERSION
        pyenv global $PYTHON_VERSION

        # Install useful packages
        pip install --upgrade pip
        pip install poetry pipenv
        pip install pytest pytest-cov
        pip install black flake8 mypy
        pip install ipython jupyter
EOF
    fi

    log_success "Python installed"
}

# Install PostgreSQL
install_postgresql() {
    log_info "Installing PostgreSQL 16..."

    # Add PostgreSQL repository
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg
    echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | \
        tee /etc/apt/sources.list.d/pgdg.list > /dev/null

    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get install -y postgresql-16 postgresql-contrib-16 postgresql-client-16 >> "$LOG_FILE" 2>&1

    # Start PostgreSQL
    systemctl enable postgresql >> "$LOG_FILE" 2>&1
    systemctl start postgresql >> "$LOG_FILE" 2>&1

    # Configure PostgreSQL for local development
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" >> "$LOG_FILE" 2>&1

    # Allow local connections
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
    echo "host    all             all             0.0.0.0/0               md5" >> /etc/postgresql/16/main/pg_hba.conf

    systemctl restart postgresql >> "$LOG_FILE" 2>&1

    log_success "PostgreSQL 16 installed"
}

# Install Redis
install_redis() {
    log_info "Installing Redis 7..."

    curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | \
        tee /etc/apt/sources.list.d/redis.list > /dev/null

    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get install -y redis >> "$LOG_FILE" 2>&1

    # Configure Redis
    sed -i 's/bind 127.0.0.1/bind 0.0.0.0/g' /etc/redis/redis.conf
    sed -i 's/# requirepass foobared/requirepass redis123/g' /etc/redis/redis.conf

    systemctl enable redis-server >> "$LOG_FILE" 2>&1
    systemctl start redis-server >> "$LOG_FILE" 2>&1

    log_success "Redis installed"
}

# Install GitHub CLI
install_github_cli() {
    log_info "Installing GitHub CLI..."

    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
        dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | \
        tee /etc/apt/sources.list.d/github-cli.list > /dev/null

    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get install -y gh >> "$LOG_FILE" 2>&1

    log_success "GitHub CLI installed"
}

# Install Claude CLI
install_claude_cli() {
    log_info "Installing Claude CLI..."

    local current_user="${SUDO_USER:-$(whoami)}"
    local user_home=$(eval echo ~$current_user)

    if [[ "$current_user" != "root" ]]; then
        sudo -u "$current_user" bash <<EOF
        export HOME="$user_home"
        export NVM_DIR="$user_home/.nvm"
        [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
        npm install -g @anthropic-ai/claude-cli
EOF
    fi

    log_success "Claude CLI installed"
}

# Install Infisical CLI
install_infisical_cli() {
    log_info "Installing Infisical CLI..."

    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash
    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get install -y infisical >> "$LOG_FILE" 2>&1

    log_success "Infisical CLI installed"
}

# Install Tailscale
install_tailscale() {
    log_info "Installing Tailscale..."

    curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/jammy.noarmor.gpg | \
        tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
    curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/jammy.tailscale-keyring.list | \
        tee /etc/apt/sources.list.d/tailscale.list

    apt-get update -y >> "$LOG_FILE" 2>&1
    apt-get install -y tailscale >> "$LOG_FILE" 2>&1

    systemctl enable tailscaled >> "$LOG_FILE" 2>&1
    systemctl start tailscaled >> "$LOG_FILE" 2>&1

    log_success "Tailscale installed (run 'sudo tailscale up' to authenticate)"
}

# Install Nginx
install_nginx() {
    log_info "Installing Nginx..."

    apt-get install -y nginx >> "$LOG_FILE" 2>&1

    systemctl enable nginx >> "$LOG_FILE" 2>&1
    systemctl start nginx >> "$LOG_FILE" 2>&1

    log_success "Nginx installed"
}

# Install monitoring tools
install_monitoring() {
    log_info "Installing monitoring tools..."

    # Prometheus Node Exporter
    local node_exporter_version="1.7.0"
    wget -q "https://github.com/prometheus/node_exporter/releases/download/v${node_exporter_version}/node_exporter-${node_exporter_version}.linux-amd64.tar.gz" \
        -O /tmp/node_exporter.tar.gz >> "$LOG_FILE" 2>&1
    tar xzf /tmp/node_exporter.tar.gz -C /tmp >> "$LOG_FILE" 2>&1
    mv /tmp/node_exporter-${node_exporter_version}.linux-amd64/node_exporter /usr/local/bin/
    rm -rf /tmp/node_exporter*

    # Create systemd service
    cat > /etc/systemd/system/node_exporter.service <<'EOF'
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload >> "$LOG_FILE" 2>&1
    systemctl enable node_exporter >> "$LOG_FILE" 2>&1
    systemctl start node_exporter >> "$LOG_FILE" 2>&1

    log_success "Monitoring tools installed"
}

# Setup development environment
setup_dev_environment() {
    log_info "Setting up development environment..."

    local current_user="${SUDO_USER:-$(whoami)}"
    local user_home=$(eval echo ~$current_user)

    # Create Nyra directories
    mkdir -p "$NYRA_HOME"/{repos,data,logs,backups}
    chown -R "$current_user:$current_user" "$NYRA_HOME"

    # Copy development environment files
    if [[ -d "$SCRIPT_DIR/dev-env" ]]; then
        log_info "Copying development environment configuration..."
        cp -r "$SCRIPT_DIR/dev-env/"* "$user_home/" 2>/dev/null || true
        chown -R "$current_user:$current_user" "$user_home/.bashrc" "$user_home/.bash_aliases" 2>/dev/null || true
    fi

    log_success "Development environment configured"
}

# Configure shell
configure_shell() {
    log_info "Configuring shell..."

    local current_user="${SUDO_USER:-$(whoami)}"
    local user_home=$(eval echo ~$current_user)

    # Install Oh My Zsh
    if [[ "$current_user" != "root" ]]; then
        sudo -u "$current_user" bash <<EOF
        export HOME="$user_home"
        sh -c "\$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

        # Install plugins
        git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
        git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
EOF
    fi

    log_success "Shell configured"
}

# Display summary
display_summary() {
    log_info ""
    log_info "=============================================="
    log_success "Ubuntu Setup Complete!"
    log_info "=============================================="
    log_info ""
    log_info "Installed components:"
    log_info "  - Docker: $(docker --version 2>/dev/null || echo 'Not found')"
    log_info "  - Node.js: $(which node 2>/dev/null && node --version 2>/dev/null || echo 'Not found')"
    log_info "  - Python: $(which python3 2>/dev/null && python3 --version 2>/dev/null || echo 'Not found')"
    log_info "  - PostgreSQL: $(sudo -u postgres psql --version 2>/dev/null || echo 'Not found')"
    log_info "  - Redis: $(redis-cli --version 2>/dev/null || echo 'Not found')"
    log_info "  - Git: $(git --version 2>/dev/null || echo 'Not found')"
    log_info "  - GitHub CLI: $(gh --version 2>/dev/null | head -1 || echo 'Not found')"
    log_info "  - Infisical: $(infisical --version 2>/dev/null || echo 'Not found')"
    log_info "  - Tailscale: $(tailscale version 2>/dev/null || echo 'Not found')"
    log_info "  - Nginx: $(nginx -v 2>&1 || echo 'Not found')"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Logout and login again to apply group changes"
    log_info "  2. Authenticate with GitHub: gh auth login"
    log_info "  3. Connect to Tailscale: sudo tailscale up"
    log_info "  4. Run Project-Nyra installation: $SCRIPT_DIR/install-nyra.sh"
    log_info ""
    log_info "Log file: $LOG_FILE"
}

# Main installation
main() {
    log_info "Starting Ubuntu 22.04 setup for Project-Nyra..."
    log_info "This will take approximately 15-30 minutes"
    log_info ""

    check_root
    update_system
    install_essentials
    install_docker
    install_nodejs
    install_python
    install_postgresql
    install_redis
    install_github_cli
    install_claude_cli
    install_infisical_cli
    install_tailscale
    install_nginx
    install_monitoring
    setup_dev_environment
    configure_shell
    display_summary
}

# Run main function
main "$@"
