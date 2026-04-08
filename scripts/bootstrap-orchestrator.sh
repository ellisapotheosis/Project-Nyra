#!/bin/bash
# Project Nyra - Orchestrator Bootstrap Script (PC1)
# Automated setup for Mac Mini orchestrator node

set -e

STATIC_IP="${1:-10.0.0.1}"
TAILSCALE_AUTH_KEY="${2:-}"
SKIP_DOCKER="${3:-false}"
SKIP_TAILSCALE="${4:-false}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=================================="
echo "  Project Nyra Orchestrator Setup"
echo "  PC1: Mac Mini (No GPU)"
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
    Darwin*)    OS_TYPE=Mac;;
    *)          OS_TYPE="UNKNOWN:$OS"
esac

log "INFO" "Detected OS: $OS_TYPE"

# Step 1: Configure Static IP
log "INFO" "Configuring static IP: $STATIC_IP"

if [ "$OS_TYPE" == "Mac" ]; then
    # macOS network configuration
    INTERFACE=$(networksetup -listallhardwareports | grep -A 1 "Ethernet" | grep "Device:" | awk '{print $2}')
    if [ -n "$INTERFACE" ]; then
        networksetup -setmanual "$INTERFACE" "$STATIC_IP" 255.255.255.0 10.0.0.1
        networksetup -setdnsservers "$INTERFACE" 1.1.1.1 8.8.8.8
        log "SUCCESS" "Static IP configured successfully"
    else
        log "WARNING" "Could not detect Ethernet interface"
    fi
elif [ "$OS_TYPE" == "Linux" ]; then
    # Linux network configuration (systemd-networkd)
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

        if [ "$OS_TYPE" == "Mac" ]; then
            log "INFO" "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
            log "WARNING" "After installation, re-run this script"
            exit 0
        elif [ "$OS_TYPE" == "Linux" ]; then
            # Install Docker on Linux
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            usermod -aG docker $SUDO_USER
            systemctl enable docker
            systemctl start docker
            log "SUCCESS" "Docker installed"
        fi
    else
        log "SUCCESS" "Docker already installed"
    fi

    # Verify Docker is running
    if ! docker ps &> /dev/null; then
        log "WARNING" "Docker is not running. Starting Docker..."
        if [ "$OS_TYPE" == "Linux" ]; then
            systemctl start docker
        fi
    fi
fi

# Step 3: Install Tailscale
if [ "$SKIP_TAILSCALE" != "true" ]; then
    log "INFO" "Checking Tailscale installation..."

    if ! command -v tailscale &> /dev/null; then
        log "INFO" "Installing Tailscale..."
        curl -fsSL https://tailscale.com/install.sh | sh
        log "SUCCESS" "Tailscale installed"
    else
        log "SUCCESS" "Tailscale already installed"
    fi

    # Connect to Tailscale
    if [ -n "$TAILSCALE_AUTH_KEY" ]; then
        log "INFO" "Connecting to Tailscale network..."
        tailscale up --authkey="$TAILSCALE_AUTH_KEY" --accept-routes
        log "SUCCESS" "Tailscale connected"
    fi
fi

# Step 4: Clone Repository
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

# Step 5: Configure Environment Variables
log "INFO" "Configuring environment variables..."
ENV_FILE="$REPO_PATH/.env"

if [ ! -f "$ENV_FILE" ]; then
    cp "$REPO_PATH/master-.env.example" "$ENV_FILE"
    chown $SUDO_USER:$SUDO_USER "$ENV_FILE"
    log "WARNING" "Created .env file from template. IMPORTANT: Edit $ENV_FILE with your API keys!"
else
    log "SUCCESS" ".env file already exists"
fi

# Step 6: Deploy Orchestrator Services
log "INFO" "Deploying orchestrator services..."
cd "$REPO_PATH/infra"

log "INFO" "Pulling Docker images..."
docker compose -f docker-compose.orchestrator.yml pull

log "INFO" "Starting services..."
docker compose -f docker-compose.orchestrator.yml up -d

# Wait for services to start
log "INFO" "Waiting for services to initialize..."
sleep 30

# Step 7: Health Checks
log "INFO" "Running health checks..."

declare -A services=(
    ["Nexus Router"]="http://localhost:6000/health"
    ["Letta"]="http://localhost:8283/health"
    ["Mem0"]="http://localhost:4321/health"
    ["Claude Flow"]="http://localhost:3010/health"
    ["AgentDB"]="http://localhost:8080/health"
    ["Redis"]="http://localhost:6380"
)

all_healthy=true

for service in "${!services[@]}"; do
    url="${services[$service]}"
    if curl -sf "$url" > /dev/null 2>&1; then
        log "SUCCESS" "$service: HEALTHY"
    else
        log "ERROR" "$service: UNHEALTHY"
        all_healthy=false
    fi
done

# Step 8: Summary
echo ""
echo -e "${CYAN}=================================="
echo "  Bootstrap Complete!"
echo -e "==================================${NC}"
echo ""

if [ "$all_healthy" = true ]; then
    log "SUCCESS" "All services are healthy and running!"
else
    log "WARNING" "Some services are unhealthy. Check logs with: docker compose logs [service-name]"
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Edit .env file with your API keys: $ENV_FILE"
echo "2. Restart services: docker compose -f infra/docker-compose.orchestrator.yml restart"
echo "3. Bootstrap worker nodes (PC2, PC3, PC4)"
echo "4. Access services:"
echo "   - Nexus Router: http://10.0.0.1:6000"
echo "   - Letta: http://10.0.0.1:8283"
echo "   - Grafana: http://10.0.0.4:3005 (after PC4 bootstrap)"
echo ""
