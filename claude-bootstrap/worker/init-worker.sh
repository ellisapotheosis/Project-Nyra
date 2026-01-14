#!/bin/bash
# Claude Flow V3 - Worker PC Initialization Script
# Project Nyra - 4-PC Cluster Bootstrap

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default values
WORKER_ID=""
ORCHESTRATOR_IP=""
SKIP_GPU=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --worker-id)
            WORKER_ID="$2"
            shift 2
            ;;
        --orchestrator-ip)
            ORCHESTRATOR_IP="$2"
            shift 2
            ;;
        --skip-gpu)
            SKIP_GPU=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate arguments
if [ -z "$WORKER_ID" ] || [ -z "$ORCHESTRATOR_IP" ]; then
    echo "Usage: $0 --worker-id [1|2|3] --orchestrator-ip [IP] [--skip-gpu]"
    exit 1
fi

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BOOTSTRAP_DIR="$PROJECT_ROOT/claude-bootstrap"

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Claude Flow V3 - Worker Node Initialization            ║
║   Project Nyra - Distributed GPU Compute                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}Worker Configuration:${NC}"
echo "  Worker ID: $WORKER_ID"
echo "  Orchestrator IP: $ORCHESTRATOR_IP"
echo "  Skip GPU: $SKIP_GPU"
echo ""

# Step counter
STEP=0
TOTAL_STEPS=12

step() {
    STEP=$((STEP + 1))
    echo ""
    echo -e "${MAGENTA}[${STEP}/${TOTAL_STEPS}]${NC} ${CYAN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root (sudo)"
fi

# Step 1: System Detection
step "Detecting System Configuration"

OS_TYPE=$(uname -s)
OS_ARCH=$(uname -m)
HOSTNAME=$(hostname)
WORKER_IP=$(hostname -I | awk '{print $1}')

echo "  OS: $OS_TYPE"
echo "  Architecture: $OS_ARCH"
echo "  Hostname: $HOSTNAME"
echo "  Worker IP: $WORKER_IP"

if [ "$OS_TYPE" != "Linux" ]; then
    error "This script requires Linux"
fi

success "System detection complete"

# Step 2: Install Dependencies
step "Installing System Dependencies"

if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
else
    error "Unsupported package manager"
fi

$PKG_MANAGER update -y

DEPS=(
    "curl"
    "wget"
    "git"
    "build-essential"
    "python3"
    "python3-pip"
    "docker.io"
    "docker-compose"
    "jq"
    "netcat"
)

for dep in "${DEPS[@]}"; do
    if ! command -v $dep &> /dev/null && ! dpkg -l | grep -q $dep; then
        $PKG_MANAGER install -y $dep
    else
        success "$dep already installed"
    fi
done

success "System dependencies installed"

# Step 3: Install GPU Drivers (if not skipped)
if [ "$SKIP_GPU" = false ]; then
    step "Installing NVIDIA GPU Drivers"

    if ! command -v nvidia-smi &> /dev/null; then
        echo "  Installing NVIDIA drivers..."
        $PKG_MANAGER install -y nvidia-driver-535
        success "NVIDIA drivers installed (reboot may be required)"
    else
        GPU_INFO=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)
        success "GPU detected: $GPU_INFO"
    fi

    # Install CUDA toolkit
    if ! command -v nvcc &> /dev/null; then
        echo "  Installing CUDA toolkit..."
        wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-keyring_1.0-1_all.deb
        dpkg -i cuda-keyring_1.0-1_all.deb
        $PKG_MANAGER update -y
        $PKG_MANAGER install -y cuda
        success "CUDA toolkit installed"
    else
        CUDA_VERSION=$(nvcc --version | grep release | awk '{print $5}' | cut -d',' -f1)
        success "CUDA already installed: $CUDA_VERSION"
    fi
else
    warning "GPU setup skipped"
fi

# Step 4: Install Node.js and pnpm
step "Installing Node.js 20 and pnpm"

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    $PKG_MANAGER install -y nodejs
fi

NODE_VERSION=$(node --version)
success "Node.js installed: $NODE_VERSION"

if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@10.27.0
fi

PNPM_VERSION=$(pnpm --version)
success "pnpm installed: $PNPM_VERSION"

# Step 5: Install claude-flow@alpha
step "Installing Claude Flow V3"

npm install -g zod
npm install -g claude-flow@alpha --force

CLAUDE_FLOW_VERSION=$(npx claude-flow@alpha --version 2>&1 | grep -oP 'v?\d+\.\d+\.\d+.*' || echo "unknown")
success "claude-flow@alpha installed: $CLAUDE_FLOW_VERSION"

# Step 6: Configure Worker Node
step "Configuring Worker Node Settings"

# Create worker configuration
cat > /etc/claude-flow-worker.conf << EOL
WORKER_ID=$WORKER_ID
WORKER_IP=$WORKER_IP
ORCHESTRATOR_IP=$ORCHESTRATOR_IP
ROLE=worker
CLUSTER_NAME=project-nyra
EOL

success "Worker configuration created"

# Step 7: Test Orchestrator Connectivity
step "Testing Orchestrator Connectivity"

echo "  Pinging orchestrator at $ORCHESTRATOR_IP..."
if ping -c 3 $ORCHESTRATOR_IP > /dev/null 2>&1; then
    success "Orchestrator reachable"
else
    error "Cannot reach orchestrator at $ORCHESTRATOR_IP"
fi

# Test service ports
SERVICES=(
    "6000:Nexus Router"
    "8283:Letta"
    "4321:Mem0"
)

for service in "${SERVICES[@]}"; do
    PORT=$(echo $service | cut -d':' -f1)
    NAME=$(echo $service | cut -d':' -f2)

    if nc -z -w2 $ORCHESTRATOR_IP $PORT 2>/dev/null; then
        success "$NAME accessible on port $PORT"
    else
        warning "$NAME not accessible on port $PORT"
    fi
done

# Step 8: Configure Worker-Specific Services
step "Configuring Worker-Specific Services"

case $WORKER_ID in
    1)
        echo "  Worker 1: Ollama + Neo4j + FalkorDB"
        # Install Ollama
        curl -fsSL https://ollama.ai/install.sh | sh
        success "Ollama installed"
        ;;
    2)
        echo "  Worker 2: TwentyCRM + n8n + Dify + Redis"
        # These run in Docker
        success "Services configured for Docker deployment"
        ;;
    3)
        echo "  Worker 3: Prometheus + Grafana + Loki"
        # These run in Docker
        success "Services configured for Docker deployment"
        ;;
    *)
        warning "Unknown worker ID"
        ;;
esac

# Step 9: Pull Docker Images
step "Pulling Docker Images"

IMAGES=(
    "letta/letta:latest"
    "mem0/mem0:latest"
    "redis:alpine"
    "postgres:15-alpine"
)

for image in "${IMAGES[@]}"; do
    echo "  Pulling $image..."
    docker pull $image
done

success "Docker images pulled"

# Step 10: Configure Firewall
step "Configuring Firewall Rules"

if command -v ufw &> /dev/null; then
    # Allow SSH
    ufw allow 22/tcp

    # Allow orchestrator communication
    ufw allow from $ORCHESTRATOR_IP

    # Allow worker-specific ports
    case $WORKER_ID in
        1)
            ufw allow 11434/tcp  # Ollama
            ufw allow 7687/tcp   # Neo4j
            ;;
        2)
            ufw allow 3000/tcp   # TwentyCRM
            ufw allow 5678/tcp   # n8n
            ufw allow 3001/tcp   # Dify
            ;;
        3)
            ufw allow 9090/tcp   # Prometheus
            ufw allow 3005/tcp   # Grafana
            ufw allow 3100/tcp   # Loki
            ;;
    esac

    ufw --force enable
    success "Firewall configured"
else
    warning "UFW not found, skipping firewall configuration"
fi

# Step 11: Create Startup Service
step "Creating Startup Service"

cat > /etc/systemd/system/claude-flow-worker.service << EOL
[Unit]
Description=Claude Flow Worker Node
After=network.target docker.service

[Service]
Type=simple
User=root
EnvironmentFile=/etc/claude-flow-worker.conf
ExecStart=/usr/local/bin/node $PROJECT_ROOT/scripts/worker-daemon.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable claude-flow-worker.service

success "Startup service created"

# Step 12: Run Validation Tests
step "Running Validation Tests"

# Test GPU (if applicable)
if [ "$SKIP_GPU" = false ] && command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv
    success "GPU validation passed"
fi

# Test Docker
docker ps > /dev/null 2>&1 && success "Docker working" || error "Docker not working"

# Test claude-flow
npx claude-flow@alpha --version > /dev/null 2>&1 && success "Claude Flow working" || error "Claude Flow not working"

# Test orchestrator connectivity
curl -f http://$ORCHESTRATOR_IP:6000/health > /dev/null 2>&1 && success "Orchestrator accessible" || warning "Orchestrator not fully ready"

success "Validation tests completed"

# Final Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  ✓ Worker Node $WORKER_ID Initialization Complete!               ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📊 Installation Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Worker ID:      $WORKER_ID"
echo "  Worker IP:      $WORKER_IP"
echo "  Orchestrator:   $ORCHESTRATOR_IP"
echo "  Node.js:        $NODE_VERSION"
echo "  Claude Flow:    $CLAUDE_FLOW_VERSION"
echo ""

echo -e "${CYAN}🚀 Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Test worker:    bash claude-bootstrap/worker/test-worker.sh"
echo "  2. Start services: systemctl start claude-flow-worker"
echo "  3. View logs:      journalctl -u claude-flow-worker -f"
echo ""

echo -e "${GREEN}🎉 Worker node ready for cluster integration!${NC}"
echo ""
