#!/bin/bash
# Nyra Worker Node Setup Script
# Supports: Alienware M15R7 (RTX 3060), Alienware Area-51 (RTX 5090), Desktop PC (RTX 3090Ti)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Worker configuration (passed as arguments or environment variables)
WORKER_NAME=${1:-${WORKER_NAME:-"worker1"}}
WORKER_IP=${2:-${WORKER_IP:-"192.168.1.101"}}
GPU_MODEL=${3:-${GPU_MODEL:-"RTX 3060"}}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Worker port configurations
get_worker_ports() {
    case $WORKER_NAME in
        "worker1")
            GPU_API_PORT=8082
            HEALTH_PORT=8083
            METRICS_PORT=8889
            ;;
        "worker2")
            GPU_API_PORT=8084
            HEALTH_PORT=8085
            METRICS_PORT=8890
            ;;
        "worker3")
            GPU_API_PORT=8086
            HEALTH_PORT=8087
            METRICS_PORT=8891
            ;;
        *)
            error "Unknown worker name: $WORKER_NAME"
            exit 1
            ;;
    esac
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
        exit 1
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies for $WORKER_NAME..."

    # Update package lists
    sudo apt update

    # Install required packages
    sudo apt install -y \
        curl \
        wget \
        git \
        nodejs \
        npm \
        python3 \
        python3-pip \
        docker.io \
        docker-compose \
        ufw \
        htop \
        iotop \
        nvidia-smi \
        net-tools \
        jq \
        unzip \
        wake-on-lan \
        ethtool

    # Add user to docker group
    sudo usermod -aG docker $USER

    success "System dependencies installed"
}

# Install NVIDIA Docker support
install_nvidia_docker() {
    log "Installing NVIDIA Docker support..."

    # Add NVIDIA Docker repository
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
    curl -s -L "https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list" | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

    sudo apt update
    sudo apt install -y nvidia-docker2
    sudo systemctl restart docker

    success "NVIDIA Docker support installed"
}

# Setup GPU monitoring
setup_gpu_monitoring() {
    log "Setting up GPU monitoring..."

    # Install nvidia-ml-py for Python GPU monitoring
    pip3 install nvidia-ml-py3

    # Create GPU monitoring script
    mkdir -p "$PROJECT_ROOT/scripts/monitoring"

    cat > "$PROJECT_ROOT/scripts/monitoring/gpu-monitor.py" <<'EOF'
#!/usr/bin/env python3
import pynvml
import json
import time
import sys
from datetime import datetime

def get_gpu_info():
    try:
        pynvml.nvmlInit()
        device_count = pynvml.nvmlDeviceGetCount()

        gpus = []
        for i in range(device_count):
            handle = pynvml.nvmlDeviceGetHandleByIndex(i)

            # Get basic info
            name = pynvml.nvmlDeviceGetName(handle).decode('utf-8')
            memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
            utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
            temperature = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # Convert to watts

            gpu_info = {
                'index': i,
                'name': name,
                'memory': {
                    'total': memory_info.total,
                    'used': memory_info.used,
                    'free': memory_info.free,
                    'utilization_percent': round((memory_info.used / memory_info.total) * 100, 2)
                },
                'utilization': {
                    'gpu_percent': utilization.gpu,
                    'memory_percent': utilization.memory
                },
                'temperature': temperature,
                'power_usage': round(power, 2),
                'timestamp': datetime.utcnow().isoformat()
            }

            gpus.append(gpu_info)

        return {
            'gpus': gpus,
            'device_count': device_count,
            'timestamp': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {'error': str(e), 'timestamp': datetime.utcnow().isoformat()}

if __name__ == '__main__':
    gpu_info = get_gpu_info()
    print(json.dumps(gpu_info, indent=2))
EOF

    chmod +x "$PROJECT_ROOT/scripts/monitoring/gpu-monitor.py"

    success "GPU monitoring configured"
}

# Install Cloudflared
install_cloudflared() {
    log "Installing cloudflared for $WORKER_NAME..."

    # Download and install cloudflared
    if ! command -v cloudflared &> /dev/null; then
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared.deb
        rm cloudflared.deb

        success "Cloudflared installed"
    else
        success "Cloudflared already installed"
    fi
}

# Setup cloudflared directories
setup_cloudflared_directories() {
    log "Setting up cloudflared directories..."

    sudo mkdir -p /etc/cloudflared
    sudo mkdir -p /var/log/cloudflared
    sudo chown -R $USER:$USER /etc/cloudflared
    sudo chown -R $USER:$USER /var/log/cloudflared

    success "Cloudflared directories created"
}

# Install Node.js dependencies
install_node_dependencies() {
    log "Installing Node.js dependencies..."

    cd "$PROJECT_ROOT"

    # Install project dependencies
    npm install

    # Install global utilities
    sudo npm install -g pm2 nodemon

    success "Node.js dependencies installed"
}

# Setup firewall rules
setup_firewall() {
    get_worker_ports

    log "Configuring firewall for $WORKER_NAME..."

    # Enable UFW
    sudo ufw --force enable

    # Allow SSH
    sudo ufw allow ssh

    # Allow internal network
    sudo ufw allow from 192.168.1.0/24

    # Allow specific ports for this worker
    sudo ufw allow $GPU_API_PORT   # GPU API
    sudo ufw allow $HEALTH_PORT    # Health endpoint
    sudo ufw allow $METRICS_PORT   # Cloudflared metrics

    success "Firewall configured"
}

# Setup Wake-on-LAN
setup_wake_on_lan() {
    log "Setting up Wake-on-LAN for $WORKER_NAME..."

    # Get network interface
    INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)

    # Enable Wake-on-LAN
    sudo ethtool -s $INTERFACE wol g

    # Make it persistent
    echo "ethtool -s $INTERFACE wol g" | sudo tee -a /etc/rc.local

    # Get MAC address for reference
    MAC_ADDRESS=$(cat /sys/class/net/$INTERFACE/address)

    success "Wake-on-LAN enabled for $INTERFACE (MAC: $MAC_ADDRESS)"

    # Save MAC address for orchestrator
    echo "$WORKER_NAME:$MAC_ADDRESS" >> "$PROJECT_ROOT/data/worker-macs.txt"
}

# Create worker configuration
create_worker_config() {
    get_worker_ports

    log "Creating worker configuration for $WORKER_NAME..."

    mkdir -p "$PROJECT_ROOT/config/workers"

    cat > "$PROJECT_ROOT/config/workers/$WORKER_NAME.json" <<EOF
{
  "worker": {
    "name": "$WORKER_NAME",
    "ip": "$WORKER_IP",
    "hostname": "$WORKER_NAME.ratehunter.net",
    "gpu_model": "$GPU_MODEL",
    "ports": {
      "gpu_api": $GPU_API_PORT,
      "health": $HEALTH_PORT,
      "metrics": $METRICS_PORT
    },
    "capabilities": [
      "gpu-compute",
      "ai-inference"
    ],
    "environment": "production"
  },
  "services": {
    "gpu_api": {
      "port": $GPU_API_PORT,
      "path": "/api/v1/compute",
      "health_endpoint": "/health"
    },
    "health": {
      "port": $HEALTH_PORT,
      "path": "/health"
    }
  },
  "monitoring": {
    "gpu_metrics_interval": 30,
    "health_check_interval": 60,
    "log_level": "info"
  }
}
EOF

    success "Worker configuration created"
}

# Create worker tunnel config
create_tunnel_config() {
    get_worker_ports

    log "Creating tunnel configuration for $WORKER_NAME..."

    # Copy and customize worker tunnel template
    cp "$PROJECT_ROOT/config/tunnels/worker-template.yml" "/etc/cloudflared/$WORKER_NAME.yml"

    # Replace variables in config
    sed -i "s/\${WORKER_NAME}/$WORKER_NAME/g" "/etc/cloudflared/$WORKER_NAME.yml"
    sed -i "s/\${WORKER_HOSTNAME}/$WORKER_NAME.ratehunter.net/g" "/etc/cloudflared/$WORKER_NAME.yml"
    sed -i "s/\${GPU_API_PORT}/$GPU_API_PORT/g" "/etc/cloudflared/$WORKER_NAME.yml"
    sed -i "s/\${HEALTH_PORT}/$HEALTH_PORT/g" "/etc/cloudflared/$WORKER_NAME.yml"
    sed -i "s/\${METRICS_PORT}/$METRICS_PORT/g" "/etc/cloudflared/$WORKER_NAME.yml"

    success "Tunnel configuration created"
}

# Create systemd service for worker
create_systemd_service() {
    log "Creating systemd service for $WORKER_NAME..."

    sudo tee /etc/systemd/system/nyra-$WORKER_NAME.service > /dev/null <<EOF
[Unit]
Description=Nyra Worker Service ($WORKER_NAME)
After=network.target nvidia-docker.service
Requires=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_ROOT
Environment=NODE_ENV=production
Environment=WORKER_NAME=$WORKER_NAME
Environment=WORKER_IP=$WORKER_IP
Environment=GPU_MODEL="$GPU_MODEL"
ExecStart=/usr/bin/npm run start:worker
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=nyra-$WORKER_NAME

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable nyra-$WORKER_NAME

    success "Systemd service created"
}

# Setup worker monitoring
setup_worker_monitoring() {
    log "Setting up worker monitoring..."

    # Create worker health check script
    cat > "$PROJECT_ROOT/scripts/monitoring/$WORKER_NAME-health.sh" <<EOF
#!/bin/bash
# $WORKER_NAME Health Check

get_worker_ports
GPU_API_PORT=$GPU_API_PORT
HEALTH_PORT=$HEALTH_PORT

check_service() {
    local service_name=\$1
    local port=\$2
    local endpoint=\$3

    if curl -sf "http://localhost:\$port\$endpoint" > /dev/null; then
        echo "✅ \$service_name is healthy"
        return 0
    else
        echo "❌ \$service_name is unhealthy"
        return 1
    fi
}

echo "🔍 $WORKER_NAME Health Check - \$(date)"
echo "======================================="

# Check services
check_service "GPU API" \$GPU_API_PORT "/health" || FAILED=1
check_service "Health Service" \$HEALTH_PORT "/health" || FAILED=1

# Check GPU
if nvidia-smi > /dev/null 2>&1; then
    echo "✅ GPU is accessible"
    python3 "$PROJECT_ROOT/scripts/monitoring/gpu-monitor.py" | jq -r '.gpus[0].name' | sed 's/^/   GPU: /'
else
    echo "❌ GPU is not accessible"
    FAILED=1
fi

# Check Docker
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running"
    FAILED=1
fi

if [[ -z \${FAILED:-} ]]; then
    echo "🟢 All services healthy"
    exit 0
else
    echo "🔴 Some services unhealthy"
    exit 1
fi
EOF

    chmod +x "$PROJECT_ROOT/scripts/monitoring/$WORKER_NAME-health.sh"

    # Setup cron job for health checks
    (crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_ROOT/scripts/monitoring/$WORKER_NAME-health.sh >> /var/log/nyra-$WORKER_NAME-health.log 2>&1") | crontab -

    success "Worker monitoring configured"
}

# Display setup information
show_setup_info() {
    get_worker_ports

    log "Setup completed for $WORKER_NAME! Here's what was configured:"
    echo
    echo "🏗️  Worker Configuration:"
    echo "   - Name: $WORKER_NAME"
    echo "   - IP: $WORKER_IP"
    echo "   - GPU: $GPU_MODEL"
    echo "   - Hostname: $WORKER_NAME.ratehunter.net"
    echo
    echo "🔧 Services and Ports:"
    echo "   - GPU API: $GPU_API_PORT"
    echo "   - Health: $HEALTH_PORT"
    echo "   - Metrics: $METRICS_PORT"
    echo
    echo "🔍 Monitoring:"
    echo "   - Health check script"
    echo "   - GPU monitoring"
    echo "   - Automated health checks via cron"
    echo
    echo "🌐 Network Configuration:"
    echo "   - Wake-on-LAN enabled"
    echo "   - Firewall configured for worker ports"
    echo "   - Docker with NVIDIA support"
    echo
    echo "⚡ Next Steps:"
    echo "   1. Copy tunnel credentials from orchestrator"
    echo "   2. Start worker service: sudo systemctl start nyra-$WORKER_NAME"
    echo "   3. Register with orchestrator service discovery"
    echo "   4. Test GPU compute availability"
    echo
    echo "🔗 Service URLs (after registration):"
    echo "   - https://$WORKER_NAME.ratehunter.net"
}

# Main setup function
main() {
    log "Starting Nyra Worker setup for $WORKER_NAME..."

    check_root
    install_dependencies
    install_nvidia_docker
    setup_gpu_monitoring
    install_cloudflared
    setup_cloudflared_directories
    install_node_dependencies
    setup_firewall
    setup_wake_on_lan
    create_worker_config
    create_tunnel_config
    create_systemd_service
    setup_worker_monitoring

    success "Worker $WORKER_NAME setup completed!"
    show_setup_info
}

# Validate arguments
if [[ ! "$WORKER_NAME" =~ ^worker[1-3]$ ]]; then
    error "Invalid worker name. Must be worker1, worker2, or worker3"
    echo "Usage: $0 <worker_name> <worker_ip> <gpu_model>"
    echo "Example: $0 worker1 192.168.1.101 'RTX 3060'"
    exit 1
fi

# Run main function
main "$@"