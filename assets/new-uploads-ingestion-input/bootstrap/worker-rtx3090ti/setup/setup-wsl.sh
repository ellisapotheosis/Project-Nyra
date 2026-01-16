#!/bin/bash
# Project Nyra - Worker RTX 3090 Ti Setup (WSL/Ubuntu)
# High-end GPU worker with 24GB VRAM

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
echo_success() { echo -e "${GREEN}$1${NC}"; }
echo_info() { echo -e "${CYAN}$1${NC}"; }
echo_warning() { echo -e "${YELLOW}$1${NC}"; }

cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║   Project Nyra - Worker RTX 3090 Ti WSL Setup            ║
║   Role: High-End AI Inference Worker (24GB VRAM)         ║
╚═══════════════════════════════════════════════════════════╝
EOF

echo_info "\n[1/13] Checking WSL environment..."
grep -qi microsoft /proc/version || { echo_error "Must run in WSL"; exit 1; }
echo_success "✓ Running in WSL"

echo_info "\n[2/13] Updating system..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq
echo_success "✓ System updated"

echo_info "\n[3/13] Installing essentials..."
sudo apt-get install -y -qq curl wget git build-essential ca-certificates gnupg lsb-release jq unzip software-properties-common
echo_success "✓ Essentials installed"

echo_info "\n[4/13] Installing Docker..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
echo_success "✓ Docker installed"

echo_info "\n[5/13] Installing NVIDIA Container Toolkit..."
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update -qq
sudo apt-get install -y -qq nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker 2>/dev/null || true
echo_success "✓ NVIDIA Container Toolkit installed"

echo_info "\n[6/13] Verifying GPU access..."
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
    echo_success "✓ GPU accessible"
else
    echo_warning "⚠ nvidia-smi not available"
fi

echo_info "\n[7/13] Installing Node.js..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts && nvm use --lts && nvm alias default lts/*
fi
echo_success "✓ Node.js installed"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo_info "\n[8/13] Installing Claude Flow CLI..."
npm install -g @claude-flow/cli@latest
echo_success "✓ Claude Flow installed ($(npx @claude-flow/cli@latest --version))"

echo_info "\n[9/13] Installing Infisical CLI..."
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update -qq && sudo apt-get install -y -qq infisical
echo_success "✓ Infisical installed"

echo_info "\n[10/13] Configuring Infisical..."
mkdir -p ~/.infisical
if [ -n "$INFISICAL_TOKEN" ] && [ -n "$INFISICAL_PROJECT_ID" ]; then
    cat > ~/.infisical/config.json <<EOF
{"token": "$INFISICAL_TOKEN", "projectId": "$INFISICAL_PROJECT_ID", "environment": "production", "path": "/nyra/worker-3"}
EOF
    echo_success "✓ Infisical configured"
fi

echo_info "\n[11/13] Installing Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update -qq
sudo apt-get install -y -qq python3.11 python3.11-venv python3-pip
echo_success "✓ Python 3.11 installed"

echo_info "\n[12/13] Installing monitoring tools..."
sudo apt-get install -y -qq nvtop htop iotop nethogs
echo_success "✓ Monitoring tools installed"

echo_info "\n[13/13] Creating project structure..."
PROJECT_ROOT="$HOME/nyra-worker-rtx3090ti"
mkdir -p $PROJECT_ROOT/{config,data,logs,scripts,secrets,models}

cat > $PROJECT_ROOT/docker-compose.worker.yml <<'COMPOSE_EOF'
version: '3.8'
networks:
  nyra-network:
    name: nyra-worker-network
    driver: bridge
services:
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
      - VLLM_GPU_MEMORY_UTILIZATION=0.92
    ports:
      - "8000:8000"
    volumes:
      - vllm_cache:/root/.cache
      - ./models:/models
    networks:
      - nyra-network
    restart: unless-stopped

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

# Shell aliases and environment
cat >> ~/.bashrc <<'EOF'
# Nyra Worker RTX 3090 Ti shortcuts
export NYRA_HOME="$HOME/nyra-worker-rtx3090ti"
export NYRA_GPU_TYPE="rtx_3090ti"
alias nyra='cd $NYRA_HOME'
alias nyra-start='cd $NYRA_HOME && infisical run --env=production --path=/nyra/worker-3 -- docker compose up -d'
alias nyra-stop='cd $NYRA_HOME && docker compose down'
alias nyra-logs='cd $NYRA_HOME && docker compose logs -f'
alias nyra-status='cd $NYRA_HOME && docker compose ps && echo "" && nvidia-smi'
alias gpumon='watch -n 1 nvidia-smi'
alias gpustat='nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv'
alias cf='npx @claude-flow/cli@latest'
alias dc='docker compose'
EOF

# Health check script
cat > $PROJECT_ROOT/scripts/health-check.sh <<'HEALTH_EOF'
#!/bin/bash
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Nyra Worker RTX 3090 Ti - Health Check               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Docker check
if docker ps &> /dev/null; then
    echo "✓ Docker daemon running"
else
    echo "✗ Docker daemon not accessible"
fi

# GPU check
if command -v nvidia-smi &> /dev/null; then
    echo "✓ NVIDIA drivers available"
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader)
    GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader)
    GPU_TEMP=$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader)
    GPU_UTIL=$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader)
    echo "  GPU: $GPU_NAME"
    echo "  VRAM: $GPU_MEM"
    echo "  Temp: ${GPU_TEMP}°C"
    echo "  Utilization: $GPU_UTIL"
else
    echo "✗ NVIDIA drivers not accessible"
fi

# Container GPU access check
if docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi &> /dev/null; then
    echo "✓ NVIDIA Container Toolkit working"
else
    echo "✗ NVIDIA Container Toolkit not working"
fi

# Claude Flow check
CF_VERSION=$(npx @claude-flow/cli@latest --version 2>/dev/null || echo "error")
if [ "$CF_VERSION" != "error" ]; then
    echo "✓ Claude Flow CLI: $CF_VERSION"
else
    echo "✗ Claude Flow CLI not accessible"
fi

# Infisical check
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

# Running services
echo ""
echo "Running services:"
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "No services running"
HEALTH_EOF

chmod +x $PROJECT_ROOT/scripts/health-check.sh
echo_success "✓ Health check script created"

# GPU dashboard script
cat > $PROJECT_ROOT/scripts/gpu-dashboard.sh <<'DASH_EOF'
#!/bin/bash
while true; do
    clear
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║    Nyra Worker RTX 3090 Ti - GPU Dashboard               ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    nvidia-smi
    echo ""
    echo "Docker Containers:"
    docker ps --filter "name=nyra" --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo "Press Ctrl+C to exit. Refreshing every 2 seconds..."
    sleep 2
done
DASH_EOF

chmod +x $PROJECT_ROOT/scripts/gpu-dashboard.sh
echo_success "✓ GPU dashboard created"

echo_success "✓ Project structure created"

echo ""
echo_success "╔═══════════════════════════════════════════════════════════╗"
echo_success "║                                                           ║"
echo_success "║   ✓ Worker RTX 3090 Ti WSL Setup Complete!               ║"
echo_success "║                                                           ║"
echo_success "╚═══════════════════════════════════════════════════════════╝"

echo ""
echo_info "Installed Components:"
echo_info "  ✓ Docker Engine + NVIDIA Container Toolkit"
echo_info "  ✓ Node.js LTS (nvm)"
echo_info "  ✓ Claude Flow CLI"
echo_info "  ✓ Infisical CLI"
echo_info "  ✓ Python 3.11"
echo_info "  ✓ GPU monitoring tools (nvtop, htop)"

echo ""
echo_info "GPU Configuration:"
echo_info "  Model: RTX 3090 Ti"
echo_info "  VRAM: 24GB"
echo_info "  Role: High-End AI Inference Worker"

echo ""
echo_info "Useful Commands:"
echo_info "  nyra          - Navigate to project"
echo_info "  nyra-start    - Start all services"
echo_info "  nyra-stop     - Stop services"
echo_info "  nyra-status   - Show status + GPU"
echo_info "  nyra-logs     - View service logs"
echo_info "  gpumon        - Real-time GPU monitoring"
echo_info "  gpustat       - GPU statistics"

echo ""
echo_info "Scripts:"
echo_info "  Health: $PROJECT_ROOT/scripts/health-check.sh"
echo_info "  Dashboard: $PROJECT_ROOT/scripts/gpu-dashboard.sh"

echo ""
echo_warning "⚠️  IMPORTANT: Restart terminal or run: source ~/.bashrc"
echo_info "Then run: $PROJECT_ROOT/scripts/health-check.sh"

echo ""
echo_info "Next Steps:"
echo_info "  1. exit && wsl (restart terminal)"
echo_info "  2. ~/nyra-worker-rtx3090ti/scripts/health-check.sh"
echo_info "  3. infisical login (if not configured)"
echo_info "  4. nyra-start"
echo_info "  5. ~/nyra-worker-rtx3090ti/scripts/gpu-dashboard.sh"
