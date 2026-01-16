#!/bin/bash
# Project Nyra - Worker Bootstrap Script (PC2/3/4)
# Automated setup for GPU worker nodes

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <worker-role> [static-ip] [tailscale-auth-key]"
    echo "Worker roles: worker-2, worker-3, worker-4"
    exit 1
fi

WORKER_ROLE="$1"
STATIC_IP="${2:-}"
TAILSCALE_AUTH_KEY="${3:-}"
SKIP_DOCKER="${4:-false}"
SKIP_TAILSCALE="${5:-false}"
SKIP_GPU="${6:-false}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Worker configuration
declare -A worker_config=(
    [worker-2-ip]="10.0.0.2"
    [worker-2-gpu]="RTX 3060 12GB"
    [worker-2-services]="TwentyCRM, n8n, Dify"
    [worker-3-ip]="10.0.0.3"
    [worker-3-gpu]="RTX 5090 32GB"
    [worker-3-services]="Ollama, Neo4j, FalkorDB"
    [worker-4-ip]="10.0.0.4"
    [worker-4-gpu]="RTX 3090 Ti 24GB"
    [worker-4-services]="Prometheus, Grafana, Loki"
)

# Validate worker role
if [[ ! "$WORKER_ROLE" =~ ^worker-[234]$ ]]; then
    echo -e "${RED}Invalid worker role: $WORKER_ROLE${NC}"
    echo "Valid roles: worker-2, worker-3, worker-4"
    exit 1
fi

# Set default IP if not provided
if [ -z "$STATIC_IP" ]; then
    STATIC_IP="${worker_config[${WORKER_ROLE}-ip]}"
fi

GPU="${worker_config[${WORKER_ROLE}-gpu]}"
SERVICES="${worker_config[${WORKER_ROLE}-services]}"

echo -e "${CYAN}=================================="
echo "  Project Nyra Worker Setup"
echo "  Role: $WORKER_ROLE"
echo "  GPU: $GPU"
echo "  Services: $SERVICES"
echo -e "==================================${NC}"
echo ""

# Function to log with timestamp
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local color="${NC}"

    case "$level" in
        ERROR) color="${RED}" ;;
        SUCCESS) color="${GREEN}" ;;
        WARNING) color="${YELLOW}" ;;
        INFO) color="${NC}" ;;
    esac

    echo -e "${color}[$timestamp] [$level] $message${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log "ERROR" "This script requires root privileges. Please run with sudo."
    exit 1
fi

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     OS_TYPE=Linux;;
    *)          OS_TYPE="UNKNOWN:$OS"
esac

log "INFO" "Detected OS: $OS_TYPE"

# Step 1: Configure Static IP
log "INFO" "Configuring static IP: $STATIC_IP"

if [ "$OS_TYPE" == "Linux" ]; then
    cat > /etc/systemd/network/10-static-eth0.network << EOF
[Match]
Name=eth0

[Network]
Address=$STATIC_IP/24
Gateway=10.0.0.1
DNS=1.1.1.1
DNS=8.8.8.8
EOF
    systemctl restart systemd-networkd
    log "SUCCESS" "Static IP configured successfully"
fi

# Step 2: Install Docker
if [ "$SKIP_DOCKER" != "true" ]; then
    log "INFO" "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        log "INFO" "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $SUDO_USER
        systemctl enable docker
        systemctl start docker
        log "SUCCESS" "Docker installed"
    else
        log "SUCCESS" "Docker already installed"
    fi
fi

# Step 3: Install NVIDIA Container Toolkit (for GPU workers)
if [ "$SKIP_GPU" != "true" ]; then
    log "INFO" "Checking GPU and NVIDIA drivers..."

    if command -v nvidia-smi &> /dev/null; then
        log "SUCCESS" "GPU detected successfully"
        nvidia-smi

        # Install NVIDIA Container Toolkit
        log "INFO" "Installing NVIDIA Container Toolkit..."
        distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
        curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
        curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | tee /etc/apt/sources.list.d/nvidia-docker.list

        apt-get update
        apt-get install -y nvidia-container-toolkit
        systemctl restart docker

        # Test GPU in container
        docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
        log "SUCCESS" "NVIDIA Container Toolkit configured"
    else
        log "ERROR" "GPU not detected. Install NVIDIA drivers first"
        log "WARNING" "Visit: https://www.nvidia.com/Download/index.aspx"
        exit 1
    fi
fi

# Step 4: Install Tailscale
if [ "$SKIP_TAILSCALE" != "true" ]; then
    log "INFO" "Checking Tailscale installation..."

    if ! command -v tailscale &> /dev/null; then
        log "INFO" "Installing Tailscale..."
        curl -fsSL https://tailscale.com/install.sh | sh
        log "SUCCESS" "Tailscale installed"
    else
        log "SUCCESS" "Tailscale already installed"
    fi

    if [ -n "$TAILSCALE_AUTH_KEY" ]; then
        log "INFO" "Connecting to Tailscale network..."
        tailscale up --authkey="$TAILSCALE_AUTH_KEY" --accept-routes
        log "SUCCESS" "Tailscale connected"
    fi
fi

# Step 5: Clone Repository
log "INFO" "Cloning Project Nyra repository..."
REPO_PATH="/opt/Project-Nyra"

if [ ! -d "$REPO_PATH" ]; then
    git clone https://github.com/yourusername/Project-Nyra.git "$REPO_PATH"
    chown -R $SUDO_USER:$SUDO_USER "$REPO_PATH"
    log "SUCCESS" "Repository cloned to $REPO_PATH"
else
    log "INFO" "Repository already exists, pulling latest changes..."
    cd "$REPO_PATH"
    git pull origin main
    log "SUCCESS" "Repository updated"
fi

# Step 6: Configure Environment Variables
log "INFO" "Configuring environment variables..."
ENV_FILE="$REPO_PATH/.env"

if [ ! -f "$ENV_FILE" ]; then
    cp "$REPO_PATH/master-.env.example" "$ENV_FILE"
    chown $SUDO_USER:$SUDO_USER "$ENV_FILE"
    log "SUCCESS" "Created .env file from template"
else
    log "SUCCESS" ".env file already exists"
fi

# Step 7: Deploy Worker Services
log "INFO" "Deploying $WORKER_ROLE services..."
cd "$REPO_PATH/infra"

log "INFO" "Pulling Docker images for $WORKER_ROLE..."
docker compose -f docker-compose.worker.yml --profile $WORKER_ROLE pull

log "INFO" "Starting services..."
docker compose -f docker-compose.worker.yml --profile $WORKER_ROLE up -d

# Wait for services to start
log "INFO" "Waiting for services to initialize..."
sleep 30

# Step 8: Worker-Specific Configuration
case "$WORKER_ROLE" in
    worker-3)
        # Pull Ollama models
        log "INFO" "Pulling Ollama models (this may take 10-15 minutes)..."
        docker exec ollama ollama pull llama3.1:latest
        docker exec ollama ollama pull mistral:latest
        docker exec ollama ollama pull codellama:latest
        log "SUCCESS" "Ollama models installed"
        ;;
    worker-4)
        # Configure Grafana
        log "INFO" "Configuring Grafana dashboards..."
        log "INFO" "Access Grafana at http://$STATIC_IP:3005 (default: admin/admin)"
        ;;
esac

# Step 9: Health Checks
log "INFO" "Running health checks for $WORKER_ROLE..."

declare -A service_checks
case "$WORKER_ROLE" in
    worker-2)
        service_checks=(
            [TwentyCRM]="http://localhost:3000/health"
            [n8n]="http://localhost:5678/healthz"
            [Dify]="http://localhost:3001/health"
            [Redis]="http://localhost:6379"
        )
        ;;
    worker-3)
        service_checks=(
            [Ollama]="http://localhost:11434"
            [Neo4j]="http://localhost:7474"
            [FalkorDB]="http://localhost:6379"
        )
        ;;
    worker-4)
        service_checks=(
            [Prometheus]="http://localhost:9090/-/healthy"
            [Grafana]="http://localhost:3005/api/health"
            [Loki]="http://localhost:3100/ready"
        )
        ;;
esac

all_healthy=true
for service in "${!service_checks[@]}"; do
    url="${service_checks[$service]}"
    if curl -sf "$url" > /dev/null 2>&1; then
        log "SUCCESS" "$service: HEALTHY"
    else
        log "ERROR" "$service: UNHEALTHY"
        all_healthy=false
    fi
done

# Step 10: Summary
echo ""
echo -e "${CYAN}=================================="
echo "  Bootstrap Complete!"
echo -e "==================================${NC}"
echo ""

if [ "$all_healthy" = true ]; then
    log "SUCCESS" "All $WORKER_ROLE services are healthy!"
else
    log "WARNING" "Some services are unhealthy. Check logs with: docker compose logs [service-name]"
fi

echo ""
echo -e "${YELLOW}Worker Role: $WORKER_ROLE${NC}"
echo -e "${YELLOW}Static IP: $STATIC_IP${NC}"
echo -e "${YELLOW}Services: $SERVICES${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Verify connectivity to orchestrator: ping 10.0.0.1"
echo "2. Run full health check: ./scripts/health-check-all.sh"
echo "3. Access monitoring at http://10.0.0.4:3005 (if worker-4 is running)"
echo ""
