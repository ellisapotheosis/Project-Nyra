#!/bin/bash
################################################################################
# All GPU Workers Orchestrator Script
#
# This script orchestrates the setup of multiple GPU workers across a LAN:
# - RTX 5090 (48GB VRAM) - High-end reasoning
# - RTX 3090 (24GB VRAM) - Mid-tier workloads
# - RTX 3060 (12GB VRAM) - Fast coding tasks
#
# Features:
# - Sequential or parallel worker setup
# - SSH-based remote deployment
# - Health check validation
# - Tailscale network discovery
# - Load balancer configuration
# - Centralized monitoring dashboard
#
# Usage: ./setup-all-workers.sh [OPTIONS]
#   --parallel          Setup workers in parallel (default: sequential)
#   --skip-tests        Skip health checks after setup
#   --hosts-file FILE   Load worker hosts from file
#   --setup-lb          Setup nginx load balancer
#   --help              Show this help message
#
# Example hosts file format:
#   rtx5090-worker:192.168.1.100:ssh_user
#   rtx3090-worker:192.168.1.101:ssh_user
#   rtx3060-worker:192.168.1.102:ssh_user
################################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARALLEL_MODE=false
SKIP_TESTS=false
SETUP_LB=false
HOSTS_FILE=""
OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}"
TAILSCALE_AUTH_KEY="${TAILSCALE_AUTH_KEY:-}"

# Worker definitions
declare -A WORKERS=(
    ["rtx5090"]="setup-rtx5090-worker.sh:48GB:11434"
    ["rtx3090"]="setup-rtx3090-worker.sh:24GB:11435"
    ["rtx3060"]="setup-rtx3060-worker.sh:12GB:11436"
)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --parallel)
            PARALLEL_MODE=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --setup-lb)
            SETUP_LB=true
            shift
            ;;
        --hosts-file)
            HOSTS_FILE="$2"
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

log_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing_tools=()

    # Check for required tools
    for tool in ssh scp curl jq; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Install with: apt-get install ssh curl jq"
        exit 1
    fi

    # Check if worker scripts exist
    for worker in "${!WORKERS[@]}"; do
        script="${WORKERS[$worker]%%:*}"
        if [[ ! -f "$SCRIPT_DIR/$script" ]]; then
            log_error "Worker script not found: $script"
            exit 1
        fi
    done

    log_success "Prerequisites check passed"
}

################################################################################
# Local Setup
################################################################################

setup_local_workers() {
    log_header "Setting Up Local GPU Workers"

    if [[ "$PARALLEL_MODE" == true ]]; then
        log_info "Running setup in parallel mode..."
        setup_workers_parallel
    else
        log_info "Running setup in sequential mode..."
        setup_workers_sequential
    fi
}

setup_workers_sequential() {
    for worker in rtx5090 rtx3090 rtx3060; do
        setup_local_worker "$worker"
    done
}

setup_workers_parallel() {
    local pids=()

    for worker in rtx5090 rtx3090 rtx3060; do
        setup_local_worker "$worker" &
        pids+=($!)
    done

    # Wait for all workers
    log_info "Waiting for all workers to complete..."
    for pid in "${pids[@]}"; do
        if ! wait "$pid"; then
            log_warning "Worker setup failed (PID: $pid)"
        fi
    done
}

setup_local_worker() {
    local worker=$1
    local script="${WORKERS[$worker]%%:*}"
    local vram=$(echo "${WORKERS[$worker]}" | cut -d: -f2)

    log_info "Setting up $worker ($vram VRAM)..."

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        log_error "Local setup requires root privileges"
        log_info "Run: sudo $SCRIPT_DIR/$script"
        return 1
    fi

    # Export environment variables
    export WORKER_NAME="$worker"
    export OPENROUTER_API_KEY="$OPENROUTER_API_KEY"
    export TAILSCALE_AUTH_KEY="$TAILSCALE_AUTH_KEY"

    # Run setup script
    if bash "$SCRIPT_DIR/$script"; then
        log_success "$worker setup completed"
        return 0
    else
        log_error "$worker setup failed"
        return 1
    fi
}

################################################################################
# Remote Setup (via SSH)
################################################################################

setup_remote_workers() {
    log_header "Setting Up Remote GPU Workers"

    if [[ -z "$HOSTS_FILE" || ! -f "$HOSTS_FILE" ]]; then
        log_error "Hosts file not found: $HOSTS_FILE"
        log_info "Create a hosts file with format: worker_name:ip_address:ssh_user"
        exit 1
    fi

    while IFS=: read -r worker_name ip_address ssh_user; do
        # Skip comments and empty lines
        [[ "$worker_name" =~ ^#.*$ || -z "$worker_name" ]] && continue

        log_info "Deploying to $worker_name ($ip_address)..."

        # Determine which script to use based on worker name
        local script=""
        if [[ "$worker_name" =~ 5090 ]]; then
            script="setup-rtx5090-worker.sh"
        elif [[ "$worker_name" =~ 3090 ]]; then
            script="setup-rtx3090-worker.sh"
        elif [[ "$worker_name" =~ 3060 ]]; then
            script="setup-rtx3060-worker.sh"
        else
            log_warning "Unknown worker type: $worker_name, skipping..."
            continue
        fi

        # Copy script to remote host
        if scp "$SCRIPT_DIR/$script" "$ssh_user@$ip_address:/tmp/"; then
            log_success "Script copied to $worker_name"
        else
            log_error "Failed to copy script to $worker_name"
            continue
        fi

        # Execute script remotely
        log_info "Executing setup on $worker_name..."
        if ssh "$ssh_user@$ip_address" "sudo bash /tmp/$script --worker-name $worker_name"; then
            log_success "$worker_name setup completed"
        else
            log_error "$worker_name setup failed"
        fi

    done < "$HOSTS_FILE"
}

################################################################################
# Health Checks
################################################################################

run_health_checks() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_info "Skipping health checks"
        return 0
    fi

    log_header "Running Health Checks"

    local all_healthy=true

    # Check localhost workers
    for worker in rtx5090 rtx3090 rtx3060; do
        local port=$(echo "${WORKERS[$worker]}" | cut -d: -f3)

        log_info "Checking $worker on localhost:$port..."

        if check_worker_health "localhost" "$port" "$worker"; then
            log_success "$worker is healthy"
        else
            log_error "$worker health check failed"
            all_healthy=false
        fi
    done

    # Check remote workers if hosts file provided
    if [[ -n "$HOSTS_FILE" && -f "$HOSTS_FILE" ]]; then
        while IFS=: read -r worker_name ip_address ssh_user; do
            [[ "$worker_name" =~ ^#.*$ || -z "$worker_name" ]] && continue

            log_info "Checking $worker_name at $ip_address..."

            if check_worker_health "$ip_address" "11434" "$worker_name"; then
                log_success "$worker_name is healthy"
            else
                log_error "$worker_name health check failed"
                all_healthy=false
            fi
        done < "$HOSTS_FILE"
    fi

    if [[ "$all_healthy" == true ]]; then
        log_success "All workers are healthy!"
        return 0
    else
        log_warning "Some workers failed health checks"
        return 1
    fi
}

check_worker_health() {
    local host=$1
    local port=$2
    local worker_name=$3

    # Check Ollama API
    if curl -sf "http://$host:$port/api/tags" > /dev/null 2>&1; then
        return 0
    fi

    # Check health endpoint
    if curl -sf "http://$host:8080/health" > /dev/null 2>&1; then
        return 0
    fi

    return 1
}

################################################################################
# Tailscale Network Discovery
################################################################################

discover_tailscale_workers() {
    log_header "Discovering Workers on Tailscale Network"

    if ! command -v tailscale &> /dev/null; then
        log_warning "Tailscale not installed, skipping discovery"
        return 1
    fi

    log_info "Scanning Tailscale network for GPU workers..."

    # Get all Tailscale peers
    local peers=$(tailscale status --json 2>/dev/null | jq -r '.Peer[].HostName')

    if [[ -z "$peers" ]]; then
        log_warning "No Tailscale peers found"
        return 1
    fi

    local found_workers=0

    for peer in $peers; do
        # Check if peer name suggests it's a GPU worker
        if [[ "$peer" =~ (rtx|gpu|worker) ]]; then
            local peer_ip=$(tailscale status --json | jq -r ".Peer[] | select(.HostName==\"$peer\") | .TailscaleIPs[0]")

            log_info "Found potential worker: $peer ($peer_ip)"

            # Try to connect
            if check_worker_health "$peer_ip" "11434" "$peer"; then
                log_success "$peer is accessible and healthy"
                ((found_workers++))
            fi
        fi
    done

    if [[ $found_workers -gt 0 ]]; then
        log_success "Found $found_workers GPU workers on Tailscale"
        return 0
    else
        log_warning "No GPU workers found on Tailscale"
        return 1
    fi
}

################################################################################
# Load Balancer Setup
################################################################################

setup_load_balancer() {
    if [[ "$SETUP_LB" != true ]]; then
        return 0
    fi

    log_header "Setting Up Nginx Load Balancer"

    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        log_info "Installing nginx..."
        apt-get update -qq
        apt-get install -y -qq nginx
    fi

    # Create nginx config
    cat > /etc/nginx/conf.d/ollama-lb.conf <<'EOF'
upstream ollama_workers {
    least_conn;

    # RTX 5090 - Highest weight for most powerful GPU
    server localhost:11434 weight=3 max_fails=3 fail_timeout=30s;

    # RTX 3090 - Medium weight
    server localhost:11435 weight=2 max_fails=3 fail_timeout=30s;

    # RTX 3060 - Lower weight, faster for small models
    server localhost:11436 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 8000;
    server_name _;

    location / {
        proxy_pass http://ollama_workers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for LLM generation
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;

        # Disable buffering for streaming
        proxy_buffering off;
        proxy_cache off;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Test nginx config
    if nginx -t &> /dev/null; then
        log_success "Nginx configuration is valid"
    else
        log_error "Nginx configuration has errors"
        nginx -t
        return 1
    fi

    # Restart nginx
    systemctl restart nginx
    systemctl enable nginx

    log_success "Load balancer running on port 8000"
    log_info "Test with: curl http://localhost:8000/api/tags"
}

################################################################################
# Monitoring Dashboard
################################################################################

create_monitoring_dashboard() {
    log_header "Creating Monitoring Dashboard"

    cat > /usr/local/bin/workers-dashboard <<'EOF'
#!/bin/bash
# GPU Workers Monitoring Dashboard

while true; do
    clear
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║           GPU Workers Cluster Dashboard                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # RTX 5090
    echo "┌─ RTX 5090 Worker (48GB) ────────────────────────────────┐"
    if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "│ Status: ONLINE ✓                                        │"
        MODELS=$(curl -s http://localhost:11434/api/tags | jq -r '.models[].name' | wc -l)
        echo "│ Models: $MODELS                                              │"
    else
        echo "│ Status: OFFLINE ✗                                       │"
    fi
    echo "└─────────────────────────────────────────────────────────┘"
    echo ""

    # RTX 3090
    echo "┌─ RTX 3090 Worker (24GB) ────────────────────────────────┐"
    if curl -sf http://localhost:11435/api/tags > /dev/null 2>&1; then
        echo "│ Status: ONLINE ✓                                        │"
        MODELS=$(curl -s http://localhost:11435/api/tags | jq -r '.models[].name' | wc -l)
        echo "│ Models: $MODELS                                              │"
    else
        echo "│ Status: OFFLINE ✗                                       │"
    fi
    echo "└─────────────────────────────────────────────────────────┘"
    echo ""

    # RTX 3060
    echo "┌─ RTX 3060 Worker (12GB) ────────────────────────────────┐"
    if curl -sf http://localhost:11436/api/tags > /dev/null 2>&1; then
        echo "│ Status: ONLINE ✓                                        │"
        MODELS=$(curl -s http://localhost:11436/api/tags | jq -r '.models[].name' | wc -l)
        echo "│ Models: $MODELS                                              │"
    else
        echo "│ Status: OFFLINE ✗                                       │"
    fi
    echo "└─────────────────────────────────────────────────────────┘"
    echo ""

    # Load Balancer
    echo "┌─ Load Balancer ─────────────────────────────────────────┐"
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo "│ Status: ONLINE ✓ (Port 8000)                           │"
    else
        echo "│ Status: Not configured or offline                      │"
    fi
    echo "└─────────────────────────────────────────────────────────┘"
    echo ""

    echo "Press Ctrl+C to exit"
    sleep 5
done
EOF

    chmod +x /usr/local/bin/workers-dashboard
    log_success "Dashboard created. Run: workers-dashboard"
}

################################################################################
# Summary and Instructions
################################################################################

print_summary() {
    log_header "Setup Complete!"

    echo "GPU Workers Status:"
    echo "  RTX 5090 (48GB): http://localhost:11434"
    echo "  RTX 3090 (24GB): http://localhost:11435"
    echo "  RTX 3060 (12GB): http://localhost:11436"
    echo ""

    if [[ "$SETUP_LB" == true ]]; then
        echo "Load Balancer: http://localhost:8000"
        echo ""
    fi

    echo "Useful Commands:"
    echo "  workers-dashboard              # View cluster status"
    echo "  systemctl status ollama        # Check Ollama service"
    echo "  journalctl -u ollama -f        # View logs"
    echo ""

    echo "Claude Code Configuration (Load Balanced):"
    echo "  export ANTHROPIC_BASE_URL=http://localhost:8000"
    echo "  export ANTHROPIC_AUTH_TOKEN=sk-litellm-master-key"
    echo ""

    echo "Or connect to specific workers:"
    echo "  export ANTHROPIC_BASE_URL=http://localhost:11434  # RTX 5090"
    echo "  export ANTHROPIC_BASE_URL=http://localhost:11435  # RTX 3090"
    echo "  export ANTHROPIC_BASE_URL=http://localhost:11436  # RTX 3060"
    echo ""

    log_success "All workers ready for Claude Code!"
}

################################################################################
# Main Execution
################################################################################

main() {
    log_header "GPU Workers Cluster Setup"

    check_prerequisites

    # Setup based on mode
    if [[ -n "$HOSTS_FILE" ]]; then
        setup_remote_workers
    else
        if [[ $EUID -ne 0 ]]; then
            log_error "Local setup requires root privileges"
            log_info "Run: sudo $0 $*"
            exit 1
        fi
        setup_local_workers
    fi

    # Optional features
    setup_load_balancer
    create_monitoring_dashboard

    # Validation
    run_health_checks

    # Tailscale discovery
    discover_tailscale_workers

    print_summary
}

# Run main
main "$@"
