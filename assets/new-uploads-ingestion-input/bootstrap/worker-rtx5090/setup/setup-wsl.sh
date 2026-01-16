#!/bin/bash
# Project Nyra - Worker RTX 5090 Setup (WSL/Ubuntu)
# High-performance GPU worker with 32GB VRAM

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
echo_success() { echo -e "${GREEN}$1${NC}"; }
echo_info() { echo -e "${CYAN}$1${NC}"; }
echo_warning() { echo -e "${YELLOW}$1${NC}"; }

cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║   Project Nyra - Worker RTX 5090 WSL Setup               ║
║   Role: High-Performance AI Inference (32GB VRAM)        ║
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
{"token": "$INFISICAL_TOKEN", "projectId": "$INFISICAL_PROJECT_ID", "environment": "production", "path": "/nyra/worker-2"}
EOF
    echo_success "✓ Infisical configured"
fi

echo_info "\n[11/13] Installing Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update -qq
sudo apt-get install -y -qq python3.11 python3.11-venv python3-pip
echo_success "✓ Python 3.11 installed"

echo_info "\n[12/13] Installing monitoring tools..."
sudo apt-get install -y -qq nvtop htop
echo_success "✓ Monitoring tools installed"

echo_info "\n[13/13] Creating project structure..."
PROJECT_ROOT="$HOME/nyra-worker-rtx5090"
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
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
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
      - VLLM_GPU_MEMORY_UTILIZATION=0.95
    ports:
      - "8000:8000"
    volumes:
      - vllm_cache:/root/.cache
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  ollama_data:
  vllm_cache:
COMPOSE_EOF

# Shell aliases
cat >> ~/.bashrc <<'EOF'
alias nyra='cd ~/nyra-worker-rtx5090'
alias nyra-start='cd ~/nyra-worker-rtx5090 && infisical run --env=production --path=/nyra/worker-2 -- docker compose up -d'
alias nyra-stop='cd ~/nyra-worker-rtx5090 && docker compose down'
alias gpumon='watch -n 1 nvidia-smi'
export NYRA_HOME="$HOME/nyra-worker-rtx5090"
export NYRA_GPU_TYPE="rtx_5090"
EOF

cat > $PROJECT_ROOT/scripts/health-check.sh <<'HEALTH_EOF'
#!/bin/bash
echo "═══ Nyra Worker RTX 5090 Health Check ═══"
nvidia-smi --query-gpu=name,memory.total,temperature.gpu --format=csv,noheader
docker ps --format "table {{.Names}}\t{{.Status}}"
HEALTH_EOF
chmod +x $PROJECT_ROOT/scripts/health-check.sh

echo_success "✓ Project created"

echo_success "\n╔═══════════════════════════════════════════════════════════╗"
echo_success "║   ✓ Worker RTX 5090 WSL Setup Complete!                  ║"
echo_success "╚═══════════════════════════════════════════════════════════╝"

echo_info "\nGPU: RTX 5090 (32GB VRAM)"
echo_info "Commands: nyra, nyra-start, nyra-stop, gpumon"
echo_info "\nNext: source ~/.bashrc && ~/nyra-worker-rtx5090/scripts/health-check.sh"
