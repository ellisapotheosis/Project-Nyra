#!/bin/bash
# Project Nyra - Worker RTX 3060 Setup (WSL/Ubuntu)
# This script configures WSL environment with Docker, NVIDIA Container Toolkit, and worker services

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
║   Project Nyra - Worker RTX 3060 WSL Setup               ║
║   Role: AI Inference Worker (12GB VRAM)                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF

echo ""
echo_info "[1/13] Checking WSL environment..."

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    echo_error "ERROR: This script must be run inside WSL"
    exit 1
fi

echo_success "✓ Running in WSL environment"

# Update system
echo_info "\n[2/13] Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
echo_success "✓ System packages updated"

# Install essential packages
echo_info "\n[3/13] Installing essential packages..."
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

# Install Docker
echo_info "\n[4/13] Installing Docker..."

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

echo_success "✓ Docker installed"

# Install NVIDIA Container Toolkit
echo_info "\n[5/13] Installing NVIDIA Container Toolkit..."

# Add NVIDIA package repository
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update -qq
sudo apt-get install -y -qq nvidia-container-toolkit

# Configure Docker to use NVIDIA runtime
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker 2>/dev/null || true

echo_success "✓ NVIDIA Container Toolkit installed"

# Verify GPU access
echo_info "\n[6/13] Verifying GPU access..."
if command -v nvidia-smi &> /dev/null; then
    echo_info "GPU Information:"
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
    echo_success "✓ GPU accessible"
else
    echo_warning "⚠ nvidia-smi not available. Ensure NVIDIA drivers are installed on Windows host."
fi

# Install Node.js via nvm
echo_info "\n[7/13] Installing Node.js via nvm..."
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
echo_info "\n[8/13] Installing Claude Flow CLI..."
npm install -g @claude-flow/cli@latest
echo_success "✓ Claude Flow CLI installed"

CF_VERSION=$(npx @claude-flow/cli@latest --version 2>/dev/null || echo "unknown")
echo_info "Claude Flow version: $CF_VERSION"

# Install Infisical CLI
echo_info "\n[9/13] Installing Infisical CLI..."
if ! command -v infisical &> /dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get update -qq && sudo apt-get install -y -qq infisical
    echo_success "✓ Infisical CLI installed"
else
    echo_success "✓ Infisical CLI already installed"
fi

# Configure Infisical
echo_info "\n[10/13] Configuring Infisical..."
mkdir -p ~/.infisical

if [ -n "$INFISICAL_TOKEN" ] && [ -n "$INFISICAL_PROJECT_ID" ]; then
    cat > ~/.infisical/config.json <<EOF
{
  "token": "$INFISICAL_TOKEN",
  "projectId": "$INFISICAL_PROJECT_ID",
  "environment": "production",
  "path": "/nyra/worker-1"
}
EOF
    echo_success "✓ Infisical configured from environment variables"

    echo_info "Testing Infisical connection..."
    if infisical secrets 2>/dev/null; then
        echo_success "✓ Infisical connection successful"
    else
        echo_warning "⚠ Could not connect to Infisical. Please verify credentials."
    fi
else
    echo_warning "⚠ Infisical credentials not provided. Run 'infisical login' to configure."
fi

# Install Python 3.11
echo_info "\n[11/13] Installing Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update -qq
sudo apt-get install -y -qq python3.11 python3.11-venv python3-pip
echo_success "✓ Python 3.11 installed"

# Install GPU monitoring tools
echo_info "\n[12/13] Installing GPU monitoring tools..."
sudo apt-get install -y -qq nvtop htop
echo_success "✓ GPU monitoring tools installed"

# Create project directory structure
echo_info "\n[13/13] Creating project directory structure..."
PROJECT_ROOT="$HOME/nyra-worker-rtx3060"
mkdir -p $PROJECT_ROOT/{config,data,logs,scripts,secrets,models}

# Create symbolic link to Windows project directory (if exists)
WIN_PROJECT="/mnt/c/nyra-worker-rtx3060"
if [ -d "$WIN_PROJECT" ]; then
    ln -sf $WIN_PROJECT $HOME/nyra-worker-rtx3060-win
    echo_info "Created symbolic link: $HOME/nyra-worker-rtx3060-win -> $WIN_PROJECT"
fi

echo_success "✓ Project directory structure created"

# Setup shell environment
echo_info "Configuring shell environment..."
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
EOF
fi

# Add Docker and GPU aliases
if ! grep -q "gpu aliases" $BASHRC; then
    cat >> $BASHRC <<'EOF'

# Docker and GPU aliases
alias dc='docker compose'
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
alias dgpu='docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi'
alias gpumon='watch -n 1 nvidia-smi'
alias gpustat='nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv'
EOF
fi

# Add worker shortcuts
if ! grep -q "Nyra worker shortcuts" $BASHRC; then
    cat >> $BASHRC <<EOF

# Nyra worker shortcuts
export NYRA_HOME="$PROJECT_ROOT"
export NYRA_GPU_TYPE="rtx_3060"
alias nyra='cd $PROJECT_ROOT'
alias nyra-start='cd $PROJECT_ROOT && infisical run --env=production --path=/nyra/worker-1 -- docker compose up -d'
alias nyra-stop='cd $PROJECT_ROOT && docker compose down'
alias nyra-logs='cd $PROJECT_ROOT && docker compose logs -f'
alias nyra-status='cd $PROJECT_ROOT && docker compose ps && echo "" && nvidia-smi'
EOF
fi

echo_success "✓ Shell environment configured"

# Create health check script
cat > $PROJECT_ROOT/scripts/health-check.sh <<'HEALTH_EOF'
#!/bin/bash
# Health check script for Nyra Worker RTX 3060

echo "╔═══════════════════════════════════════╗"
echo "║   Nyra Worker RTX 3060 Health Check  ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    echo "✓ Docker available"
    if docker ps &> /dev/null; then
        echo "✓ Docker daemon running"
    else
        echo "✗ Docker daemon not accessible"
    fi
else
    echo "✗ Docker not found"
fi

# Check GPU
if command -v nvidia-smi &> /dev/null; then
    echo "✓ NVIDIA drivers available"
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader)
    GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader)
    GPU_TEMP=$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader)
    echo "  GPU: $GPU_NAME"
    echo "  VRAM: $GPU_MEM"
    echo "  Temp: ${GPU_TEMP}°C"
else
    echo "✗ NVIDIA drivers not accessible"
fi

# Check NVIDIA Container Toolkit
if docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi &> /dev/null; then
    echo "✓ NVIDIA Container Toolkit working"
else
    echo "✗ NVIDIA Container Toolkit not working"
fi

# Check Claude Flow
if command -v npx &> /dev/null; then
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

# Check services
echo ""
echo "Running services:"
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "No services running"

# GPU utilization
echo ""
echo "GPU Utilization:"
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.free --format=csv,noheader 2>/dev/null || echo "N/A"
HEALTH_EOF

chmod +x $PROJECT_ROOT/scripts/health-check.sh
echo_success "✓ Health check script created"

# Create Docker Compose file for worker
cat > $PROJECT_ROOT/docker-compose.worker.yml <<'COMPOSE_EOF'
version: '3.8'

# Nyra Worker RTX 3060 Services
# This compose file should be run with Infisical: infisical run -- docker compose up

networks:
  nyra-network:
    name: nyra-worker-network
    driver: bridge

services:
  # Ollama - Local LLM Inference
  ollama:
    image: ollama/ollama:latest
    container_name: nyra-ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_ORIGINS=*
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
      - ./models:/models
    networks:
      - nyra-network
    restart: unless-stopped

  # vLLM - Fast Inference Server
  vllm:
    image: vllm/vllm-openai:latest
    container_name: nyra-vllm
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - VLLM_HOST=0.0.0.0
      - VLLM_PORT=8000
      - VLLM_GPU_MEMORY_UTILIZATION=0.90
    ports:
      - "8000:8000"
    volumes:
      - vllm_cache:/root/.cache
      - ./models:/models
    networks:
      - nyra-network
    restart: unless-stopped

  # NVIDIA DCGM Exporter (GPU metrics for Prometheus)
  dcgm-exporter:
    image: nvcr.io/nvidia/k8s/dcgm-exporter:3.3.0-3.2.0-ubuntu22.04
    container_name: nyra-dcgm-exporter
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    ports:
      - "9001:9400"
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  ollama_data:
  vllm_cache:
COMPOSE_EOF

echo_success "✓ Docker Compose file created"

# Create GPU monitoring dashboard script
cat > $PROJECT_ROOT/scripts/gpu-dashboard.sh <<'DASH_EOF'
#!/bin/bash
# GPU Monitoring Dashboard

while true; do
    clear
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║     Nyra Worker RTX 3060 - GPU Monitoring Dashboard      ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    nvidia-smi

    echo ""
    echo "Docker GPU Containers:"
    docker ps --filter "name=nyra" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "Press Ctrl+C to exit. Refreshing every 2 seconds..."
    sleep 2
done
DASH_EOF

chmod +x $PROJECT_ROOT/scripts/gpu-dashboard.sh
echo_success "✓ GPU dashboard script created"

# Final summary
echo ""
echo_success "╔═══════════════════════════════════════════════════════════╗"
echo_success "║                                                           ║"
echo_success "║   ✓ Worker RTX 3060 WSL Setup Complete!                  ║"
echo_success "║                                                           ║"
echo_success "╚═══════════════════════════════════════════════════════════╝"

echo ""
echo_info "Installed Components:"
echo_info "  ✓ Docker Engine"
echo_info "  ✓ NVIDIA Container Toolkit"
echo_info "  ✓ Node.js LTS (via nvm)"
echo_info "  ✓ Claude Flow CLI"
echo_info "  ✓ Infisical CLI"
echo_info "  ✓ Python 3.11"
echo_info "  ✓ GPU monitoring tools (nvtop)"

echo ""
echo_info "GPU Configuration:"
echo_info "  Model: RTX 3060"
echo_info "  VRAM: 12GB"
echo_info "  Role: AI Inference Worker"

echo ""
echo_info "Useful Commands:"
echo_info "  nyra              - Navigate to project directory"
echo_info "  nyra-start        - Start all worker services"
echo_info "  nyra-stop         - Stop all services"
echo_info "  nyra-status       - Show service and GPU status"
echo_info "  gpumon            - Monitor GPU in real-time"
echo_info "  gpustat           - Show GPU statistics"

echo ""
echo_info "Scripts:"
echo_info "  Health Check: $PROJECT_ROOT/scripts/health-check.sh"
echo_info "  GPU Dashboard: $PROJECT_ROOT/scripts/gpu-dashboard.sh"

echo ""
echo_warning "⚠️  IMPORTANT: Restart your terminal or run: source ~/.bashrc"
echo_info "Then run: $PROJECT_ROOT/scripts/health-check.sh"

echo ""
echo_info "Next Steps:"
echo_info "  1. Restart terminal: exit && wsl"
echo_info "  2. Run health check: ~/nyra-worker-rtx3060/scripts/health-check.sh"
echo_info "  3. Configure Infisical (if not done): infisical login"
echo_info "  4. Start services: nyra-start"
echo_info "  5. Monitor GPU: ~/nyra-worker-rtx3060/scripts/gpu-dashboard.sh"
