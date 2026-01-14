#!/bin/bash
################################################################################
# RTX 3090 GPU Worker Bootstrap Script (24GB VRAM)
#
# This script sets up an Ollama worker optimized for RTX 3090 with:
# - Ollama installation and configuration
# - Medium language models (llama3.1:70b, mistral-large:123b)
# - Tailscale networking
# - LiteLLM proxy (optional)
# - OpenRouter fallback
# - Systemd services
# - Health check endpoints
#
# Usage: sudo ./setup-rtx3090-worker.sh [OPTIONS]
#   --skip-ollama       Skip Ollama installation
#   --skip-models       Skip model downloads
#   --skip-tailscale    Skip Tailscale setup
#   --skip-litellm      Skip LiteLLM proxy setup
#   --worker-name       Set custom worker name (default: rtx3090-worker)
#   --help              Show this help message
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKER_NAME="${WORKER_NAME:-rtx3090-worker}"
OLLAMA_HOST="${OLLAMA_HOST:-0.0.0.0}"
OLLAMA_PORT="${OLLAMA_PORT:-11434}"
LITELLM_PORT="${LITELLM_PORT:-4000}"
OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}"
TAILSCALE_AUTH_KEY="${TAILSCALE_AUTH_KEY:-}"
VRAM_SIZE="24GB"

# Models for RTX 3090 (24GB VRAM)
MODELS=(
    "llama3.1:70b-instruct-q4_K_M"           # Primary reasoning model
    "mistral-large:123b-instruct-2407-q4_K_M" # Secondary model
)

# Parse command line arguments
SKIP_OLLAMA=false
SKIP_MODELS=false
SKIP_TAILSCALE=false
SKIP_LITELLM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-ollama)
            SKIP_OLLAMA=true
            shift
            ;;
        --skip-models)
            SKIP_MODELS=true
            shift
            ;;
        --skip-tailscale)
            SKIP_TAILSCALE=true
            shift
            ;;
        --skip-litellm)
            SKIP_LITELLM=true
            shift
            ;;
        --worker-name)
            WORKER_NAME="$2"
            shift 2
            ;;
        --help)
            grep '^#' "$0" | tail -n +2 | head -n -1 | cut -c 3-
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

check_gpu() {
    log_info "Checking for NVIDIA GPU..."
    if ! command -v nvidia-smi &> /dev/null; then
        log_error "nvidia-smi not found. Please install NVIDIA drivers first."
        exit 1
    fi

    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n 1)
    GPU_VRAM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n 1)

    log_info "Detected GPU: $GPU_NAME"
    log_info "Available VRAM: ${GPU_VRAM}MB (~$((GPU_VRAM / 1024))GB)"

    if [[ ! "$GPU_NAME" =~ "3090" ]]; then
        log_warning "This script is optimized for RTX 3090, but detected: $GPU_NAME"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

install_dependencies() {
    log_info "Installing system dependencies..."

    if command -v apt-get &> /dev/null; then
        apt-get update -qq
        apt-get install -y -qq \
            curl wget git jq \
            python3 python3-pip \
            build-essential \
            ca-certificates \
            gnupg lsb-release \
            net-tools htop \
            docker.io docker-compose
    elif command -v dnf &> /dev/null; then
        dnf install -y -q \
            curl wget git jq \
            python3 python3-pip \
            gcc gcc-c++ make \
            ca-certificates \
            docker docker-compose
    else
        log_error "Unsupported package manager. Please install dependencies manually."
        exit 1
    fi

    systemctl enable --now docker
    log_success "System dependencies installed"
}

################################################################################
# Ollama Installation
################################################################################

install_ollama() {
    if [[ "$SKIP_OLLAMA" == true ]]; then
        log_info "Skipping Ollama installation"
        return 0
    fi

    log_info "Installing Ollama..."

    # Check if already installed
    if command -v ollama &> /dev/null; then
        OLLAMA_VERSION=$(ollama --version | head -n 1)
        log_warning "Ollama already installed: $OLLAMA_VERSION"
        read -p "Reinstall? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi

    # Download and install
    curl -fsSL https://ollama.com/install.sh | sh

    # Verify installation
    if ! command -v ollama &> /dev/null; then
        log_error "Ollama installation failed"
        exit 1
    fi

    log_success "Ollama installed successfully"
}

configure_ollama() {
    log_info "Configuring Ollama for RTX 3090..."

    # Create environment file for systemd
    mkdir -p /etc/systemd/system/ollama.service.d
    cat > /etc/systemd/system/ollama.service.d/environment.conf <<EOF
[Service]
Environment="OLLAMA_HOST=${OLLAMA_HOST}:${OLLAMA_PORT}"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_FLASH_ATTENTION=1"
Environment="CUDA_VISIBLE_DEVICES=0"
Environment="OLLAMA_DEBUG=1"
EOF

    # Reload systemd and restart Ollama
    systemctl daemon-reload
    systemctl enable ollama
    systemctl restart ollama

    # Wait for Ollama to start
    log_info "Waiting for Ollama to start..."
    for i in {1..30}; do
        if curl -sf http://localhost:${OLLAMA_PORT}/api/tags &> /dev/null; then
            log_success "Ollama is running"
            return 0
        fi
        sleep 1
    done

    log_error "Ollama failed to start"
    journalctl -u ollama -n 50 --no-pager
    exit 1
}

pull_models() {
    if [[ "$SKIP_MODELS" == true ]]; then
        log_info "Skipping model downloads"
        return 0
    fi

    log_info "Downloading models for RTX 3090 ($VRAM_SIZE VRAM)..."
    log_warning "Large models may take 30+ minutes to download"

    for model in "${MODELS[@]}"; do
        log_info "Pulling model: $model"

        if ollama list | grep -q "^${model%%:*}"; then
            log_warning "Model $model already exists"
            continue
        fi

        # Pull with progress
        if ! ollama pull "$model"; then
            log_error "Failed to pull model: $model"
            continue
        fi

        log_success "Model $model downloaded successfully"

        # Test the model
        log_info "Testing model: $model"
        if echo "Hello" | ollama run "$model" --verbose &> /dev/null; then
            log_success "Model $model is working"
        else
            log_warning "Model $model test failed"
        fi
    done
}

################################################################################
# Tailscale Setup
################################################################################

setup_tailscale() {
    if [[ "$SKIP_TAILSCALE" == true ]]; then
        log_info "Skipping Tailscale setup"
        return 0
    fi

    log_info "Setting up Tailscale networking..."

    # Check if already installed
    if command -v tailscale &> /dev/null; then
        if tailscale status &> /dev/null; then
            log_warning "Tailscale already configured and running"
            TAILSCALE_IP=$(tailscale ip -4)
            log_info "Tailscale IP: $TAILSCALE_IP"
            return 0
        fi
    fi

    # Install Tailscale
    if ! command -v tailscale &> /dev/null; then
        log_info "Installing Tailscale..."
        curl -fsSL https://tailscale.com/install.sh | sh
    fi

    # Authenticate
    if [[ -n "$TAILSCALE_AUTH_KEY" ]]; then
        log_info "Authenticating with auth key..."
        tailscale up --authkey="$TAILSCALE_AUTH_KEY" --hostname="$WORKER_NAME"
    else
        log_warning "No TAILSCALE_AUTH_KEY provided"
        log_info "Please run: tailscale up --hostname=$WORKER_NAME"
    fi

    # Get Tailscale IP
    if tailscale status &> /dev/null; then
        TAILSCALE_IP=$(tailscale ip -4)
        log_success "Tailscale configured. IP: $TAILSCALE_IP"
    fi
}

################################################################################
# LiteLLM Setup (Optional)
################################################################################

setup_litellm() {
    if [[ "$SKIP_LITELLM" == true ]]; then
        log_info "Skipping LiteLLM setup"
        return 0
    fi

    log_info "Setting up LiteLLM proxy..."

    # Install LiteLLM
    if ! command -v litellm &> /dev/null; then
        pip3 install litellm[proxy] --quiet
    fi

    # Create config directory
    mkdir -p /etc/litellm

    # Create LiteLLM config
    cat > /etc/litellm/config.yaml <<EOF
model_list:
  # Local Ollama models
  - model_name: llama3.1-70b
    litellm_params:
      model: ollama/llama3.1:70b-instruct-q4_K_M
      api_base: http://localhost:${OLLAMA_PORT}

  - model_name: mistral-large-123b
    litellm_params:
      model: ollama/mistral-large:123b-instruct-2407-q4_K_M
      api_base: http://localhost:${OLLAMA_PORT}

  # OpenRouter fallback (if configured)
  - model_name: llama-fallback
    litellm_params:
      model: openrouter/meta-llama/llama-3.1-70b-instruct
      api_key: \${OPENROUTER_API_KEY}

  - model_name: mistral-fallback
    litellm_params:
      model: openrouter/mistralai/mistral-large-2
      api_key: \${OPENROUTER_API_KEY}

router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  timeout: 600

general_settings:
  master_key: \${LITELLM_MASTER_KEY:-sk-litellm-master-key}
  database_url: sqlite:////var/lib/litellm/litellm.db
  drop_params: true
  max_parallel_requests: 50
EOF

    # Create systemd service
    cat > /etc/systemd/system/litellm.service <<EOF
[Unit]
Description=LiteLLM Proxy Server
After=network.target ollama.service
Wants=ollama.service

[Service]
Type=simple
User=root
WorkingDirectory=/etc/litellm
Environment="LITELLM_MASTER_KEY=sk-litellm-master-key"
Environment="OPENROUTER_API_KEY=${OPENROUTER_API_KEY}"
ExecStart=/usr/local/bin/litellm --config /etc/litellm/config.yaml --port ${LITELLM_PORT}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create database directory
    mkdir -p /var/lib/litellm

    # Enable and start service
    systemctl daemon-reload
    systemctl enable litellm
    systemctl restart litellm

    # Wait for LiteLLM to start
    log_info "Waiting for LiteLLM to start..."
    for i in {1..30}; do
        if curl -sf http://localhost:${LITELLM_PORT}/health &> /dev/null; then
            log_success "LiteLLM is running on port ${LITELLM_PORT}"
            return 0
        fi
        sleep 1
    done

    log_warning "LiteLLM may not have started properly"
}

################################################################################
# Health Check Setup
################################################################################

setup_health_checks() {
    log_info "Setting up health check endpoints..."

    # Create health check script
    cat > /usr/local/bin/ollama-health-check <<'EOF'
#!/bin/bash
set -euo pipefail

OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
LITELLM_URL="${LITELLM_URL:-http://localhost:4000}"

check_ollama() {
    if curl -sf "${OLLAMA_URL}/api/tags" > /dev/null; then
        return 0
    fi
    return 1
}

check_litellm() {
    if curl -sf "${LITELLM_URL}/health" > /dev/null; then
        return 0
    fi
    return 1
}

check_gpu() {
    if nvidia-smi &> /dev/null; then
        return 0
    fi
    return 1
}

# Main health check
if check_gpu && check_ollama; then
    echo "OK"
    exit 0
else
    echo "UNHEALTHY"
    exit 1
fi
EOF

    chmod +x /usr/local/bin/ollama-health-check

    # Create simple HTTP health endpoint
    cat > /usr/local/bin/health-server <<'EOF'
#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import json
import os

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            result = subprocess.run(['/usr/local/bin/ollama-health-check'],
                                  capture_output=True, text=True)

            if result.returncode == 0:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'status': 'healthy',
                    'worker': os.environ.get('WORKER_NAME', 'unknown'),
                    'models': ['llama3.1:70b-instruct-q4_K_M', 'mistral-large:123b-instruct-2407-q4_K_M']
                }
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_response(503)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'status': 'unhealthy'}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress access logs

if __name__ == '__main__':
    port = int(os.environ.get('HEALTH_PORT', 8080))
    server = HTTPServer(('0.0.0.0', port), HealthHandler)
    print(f'Health server running on port {port}')
    server.serve_forever()
EOF

    chmod +x /usr/local/bin/health-server

    # Create systemd service for health server
    cat > /etc/systemd/system/health-server.service <<EOF
[Unit]
Description=GPU Worker Health Check Server
After=network.target ollama.service

[Service]
Type=simple
User=root
Environment="WORKER_NAME=${WORKER_NAME}"
Environment="HEALTH_PORT=8080"
ExecStart=/usr/local/bin/health-server
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable health-server
    systemctl restart health-server

    log_success "Health check server running on port 8080"
}

################################################################################
# Monitoring Setup
################################################################################

setup_monitoring() {
    log_info "Setting up monitoring scripts..."

    # Create GPU monitoring script
    cat > /usr/local/bin/gpu-monitor <<'EOF'
#!/bin/bash
# GPU Monitoring Script

while true; do
    clear
    echo "=== RTX 3090 Worker Monitor ==="
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    echo "=== GPU Status ==="
    nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total \
        --format=csv,noheader,nounits | \
        awk -F', ' '{printf "GPU: %s\nTemp: %s°C | GPU: %s%% | VRAM: %s%% | Memory: %s/%s MB\n", $1, $2, $3, $4, $5, $6}'
    echo ""

    echo "=== Ollama Status ==="
    if systemctl is-active --quiet ollama; then
        echo "Status: Running ✓"
        echo "Models loaded:"
        curl -s http://localhost:11434/api/tags | jq -r '.models[]?.name' 2>/dev/null || echo "  (unable to fetch)"
    else
        echo "Status: Stopped ✗"
    fi
    echo ""

    echo "=== LiteLLM Status ==="
    if systemctl is-active --quiet litellm; then
        echo "Status: Running ✓"
    else
        echo "Status: Stopped ✗"
    fi
    echo ""

    echo "Press Ctrl+C to exit"
    sleep 5
done
EOF

    chmod +x /usr/local/bin/gpu-monitor
    log_success "Monitoring scripts installed. Run: gpu-monitor"
}

################################################################################
# Configuration Summary
################################################################################

print_summary() {
    log_success "===== RTX 3090 Worker Setup Complete ====="
    echo ""
    echo "Worker Name: $WORKER_NAME"
    echo "GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)"
    echo "VRAM: $VRAM_SIZE"
    echo ""
    echo "Services:"
    echo "  Ollama:      http://localhost:${OLLAMA_PORT}"
    echo "  LiteLLM:     http://localhost:${LITELLM_PORT}"
    echo "  Health:      http://localhost:8080/health"

    if tailscale status &> /dev/null; then
        TAILSCALE_IP=$(tailscale ip -4)
        echo "  Tailscale:   http://${TAILSCALE_IP}:${OLLAMA_PORT}"
    fi

    echo ""
    echo "Models Installed:"
    for model in "${MODELS[@]}"; do
        echo "  - $model"
    done

    echo ""
    echo "Useful Commands:"
    echo "  systemctl status ollama        # Check Ollama status"
    echo "  systemctl status litellm       # Check LiteLLM status"
    echo "  ollama list                    # List installed models"
    echo "  ollama run ${MODELS[0]%%:*}    # Test primary model"
    echo "  gpu-monitor                    # Monitor GPU usage"
    echo "  journalctl -u ollama -f        # View Ollama logs"
    echo ""

    echo "Environment Variables for Claude Code:"
    echo "  export ANTHROPIC_BASE_URL=http://localhost:${LITELLM_PORT}"
    echo "  export ANTHROPIC_AUTH_TOKEN=sk-litellm-master-key"
    echo "  export ANTHROPIC_MODEL=llama3.1-70b"
    echo ""

    log_success "Setup complete! Worker is ready for use."
}

################################################################################
# Main Execution
################################################################################

main() {
    log_info "Starting RTX 3090 Worker Setup..."
    log_info "Worker Name: $WORKER_NAME"

    check_root
    check_gpu
    install_dependencies
    install_ollama
    configure_ollama
    pull_models
    setup_tailscale
    setup_litellm
    setup_health_checks
    setup_monitoring
    print_summary
}

# Run main function
main "$@"
