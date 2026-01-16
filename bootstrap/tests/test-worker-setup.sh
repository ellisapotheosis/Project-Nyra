#!/bin/bash
# Test Suite: Worker PC Setup Validation
# Tests Wake-on-LAN, Docker, Claude Flow config, and GPU availability

set -euo pipefail

# Source test utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-utils.sh"

TEST_SUITE="worker-setup"

log_info "Starting Worker Setup Tests..."
log_info "Platform: $(detect_platform)"
log_info "PC Role: $(detect_pc_role)"

echo ""
echo "========================================="
echo "1. Docker Environment Tests"
echo "========================================="

benchmark_start "docker_tests"

check_docker_health

# Check Docker Compose
assert_command_exists docker-compose "Docker Compose is installed" || \
    assert_command_exists docker "Docker with compose plugin is available"

# Check Docker version
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null || echo "unknown")
    log_info "Docker Version: $DOCKER_VERSION"

    # Check Docker daemon
    if docker info &> /dev/null; then
        log_success "Docker daemon is accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Get container count
        CONTAINER_COUNT=$(docker ps -q | wc -l)
        log_info "Running containers: $CONTAINER_COUNT"
    else
        log_error "Docker daemon is not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "docker_tests"

echo ""
echo "========================================="
echo "2. NVIDIA GPU Tests"
echo "========================================="

benchmark_start "gpu_tests"

# Check nvidia-smi
assert_command_exists nvidia-smi "NVIDIA drivers are installed"

if command -v nvidia-smi &> /dev/null; then
    # Get GPU info
    GPU_INFO=$(nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>/dev/null || echo "unknown")
    log_info "GPU Info: $GPU_INFO"

    # Check CUDA version
    CUDA_VERSION=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader 2>/dev/null | head -n1)
    log_info "CUDA Driver Version: $CUDA_VERSION"

    if [ "$CUDA_VERSION" != "unknown" ]; then
        log_success "NVIDIA GPU is accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "NVIDIA GPU not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check NVIDIA Container Toolkit
if docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi &> /dev/null; then
    log_success "NVIDIA Container Toolkit is working"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_error "NVIDIA Container Toolkit not working"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check for specific GPU models
if nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | grep -qi "RTX\|GeForce"; then
    log_success "NVIDIA RTX GPU detected"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "RTX GPU not detected (might be different model)"
fi

benchmark_end "gpu_tests"

echo ""
echo "========================================="
echo "3. Claude Code Tests"
echo "========================================="

benchmark_start "claude_code_tests"

# Check Claude Code installation (Windows)
CLAUDE_CODE_PATH="/mnt/c/Users/$USER/AppData/Local/Programs/Claude/Claude.exe"
if [ -f "$CLAUDE_CODE_PATH" ]; then
    log_success "Claude Code is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    # Try alternate paths
    if [ -d "/mnt/c/Users/$USER/AppData/Local/Programs/Claude" ]; then
        log_success "Claude Code directory found"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Claude Code not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check Claude Code config
CLAUDE_CODE_CONFIG="/mnt/c/Users/$USER/AppData/Roaming/Claude/config.json"
if [ -f "$CLAUDE_CODE_CONFIG" ]; then
    log_success "Claude Code config exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Claude Code config not found"
fi

benchmark_end "claude_code_tests"

echo ""
echo "========================================="
echo "4. Claude Flow Tests"
echo "========================================="

benchmark_start "claude_flow_tests"

# Check Claude Flow installation
if [ -d "/mnt/c/Users/$USER/.claude-flow" ] || [ -d "$HOME/.claude-flow" ]; then
    log_success "Claude Flow directory exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check for config
    if [ -f "/mnt/c/Users/$USER/.claude-flow/config.json" ] || \
       [ -f "$HOME/.claude-flow/config.json" ]; then
        log_success "Claude Flow config exists"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Validate config contains worker role
        CONFIG_PATH="/mnt/c/Users/$USER/.claude-flow/config.json"
        if [ -f "$CONFIG_PATH" ] && jq -e '.role == "worker"' "$CONFIG_PATH" &> /dev/null; then
            log_success "Claude Flow configured as worker"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "Claude Flow role not set to worker"
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        log_warning "Claude Flow config not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_error "Claude Flow directory not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check Claude Flow CLI
if command -v npx &> /dev/null; then
    if npx --yes @claude-flow/cli@latest --version &> /dev/null; then
        log_success "Claude Flow CLI is accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Claude Flow CLI not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "claude_flow_tests"

echo ""
echo "========================================="
echo "5. Wake-on-LAN Tests"
echo "========================================="

benchmark_start "wol_tests"

# Check network adapter for WOL support
if command -v ethtool &> /dev/null; then
    # Get primary network interface
    PRIMARY_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)

    if [ -n "$PRIMARY_INTERFACE" ]; then
        log_info "Primary network interface: $PRIMARY_INTERFACE"

        # Check WOL support
        if ethtool "$PRIMARY_INTERFACE" 2>/dev/null | grep -i "wake-on" | grep -q "g"; then
            log_success "Wake-on-LAN is enabled on $PRIMARY_INTERFACE"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "Wake-on-LAN might not be enabled on $PRIMARY_INTERFACE"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        skip_test "Could not determine primary network interface"
    fi
else
    log_info "ethtool not available, checking via other methods..."

    # Check for network interfaces
    if ip link show | grep -q "state UP"; then
        log_success "Network interface is up"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "No active network interfaces found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check MAC address is available
MAC_ADDRESS=$(ip link show | grep -A1 "state UP" | grep "link/ether" | awk '{print $2}' | head -n1)
if [ -n "$MAC_ADDRESS" ]; then
    log_info "MAC Address: $MAC_ADDRESS"
    log_success "MAC address available for WOL"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_error "Could not determine MAC address"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "wol_tests"

echo ""
echo "========================================="
echo "6. Network Configuration Tests"
echo "========================================="

benchmark_start "network_tests"

# Check network connectivity
check_network_connectivity

# Check Tailscale
if command -v tailscale &> /dev/null; then
    log_success "Tailscale is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check Tailscale status
    if tailscale status &> /dev/null; then
        log_success "Tailscale is connected"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Get Tailscale IP
        TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "unknown")
        log_info "Tailscale IP: $TAILSCALE_IP"
    else
        log_warning "Tailscale is not connected"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_warning "Tailscale not installed (might be optional)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check connectivity to orchestrator
if [ -n "${ORCHESTRATOR_IP:-}" ]; then
    if ping -c 1 -W 2 "$ORCHESTRATOR_IP" &> /dev/null; then
        log_success "Can reach orchestrator at $ORCHESTRATOR_IP"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Cannot reach orchestrator at $ORCHESTRATOR_IP"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "ORCHESTRATOR_IP not set, skipping connectivity test"
fi

benchmark_end "network_tests"

echo ""
echo "========================================="
echo "7. Git Configuration Tests"
echo "========================================="

benchmark_start "git_tests"

# Check Git installation
assert_command_exists git "Git is installed"

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version 2>/dev/null || echo "unknown")
    log_info "Git Version: $GIT_VERSION"

    # Check Git config for Gitea
    GIT_URL_INSTEADOF=$(git config --global --get url."http://".insteadOf 2>/dev/null || echo "")
    if [ -n "$GIT_URL_INSTEADOF" ]; then
        log_info "Git URL insteadOf configured: $GIT_URL_INSTEADOF"
    fi

    # Check Git user config
    GIT_USER=$(git config --global user.name 2>/dev/null || echo "")
    GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")

    if [ -n "$GIT_USER" ] && [ -n "$GIT_EMAIL" ]; then
        log_success "Git user configured: $GIT_USER <$GIT_EMAIL>"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "Git user not configured"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "git_tests"

echo ""
echo "========================================="
echo "8. Performance Benchmarks"
echo "========================================="

# Docker GPU test
if command -v docker &> /dev/null && command -v nvidia-smi &> /dev/null; then
    benchmark_start "docker_gpu_test"
    docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi &> /dev/null || true
    benchmark_end "docker_gpu_test"
fi

# Memory test
TOTAL_MEM=$(free -h | awk '/^Mem:/ {print $2}')
AVAIL_MEM=$(free -h | awk '/^Mem:/ {print $7}')
log_info "Memory - Total: $TOTAL_MEM, Available: $AVAIL_MEM"

# GPU memory test
if command -v nvidia-smi &> /dev/null; then
    GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n1)
    GPU_MEM_FREE=$(nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits | head -n1)
    log_info "GPU Memory - Total: ${GPU_MEM}MB, Free: ${GPU_MEM_FREE}MB"
fi

# Generate final report
generate_test_report "$TEST_SUITE"

# Store results in memory using Claude Flow CLI if available
if command -v npx &> /dev/null; then
    log_info "Storing test results in Claude Flow memory..."

    npx --yes @claude-flow/cli@latest memory store \
        --key "worker-test-results-$(hostname)" \
        --value "$(cat $RESULTS_JSON)" \
        --namespace "bootstrap-tests" 2>/dev/null || \
        log_warning "Failed to store results in memory"
fi

# Exit with appropriate code
[ $TESTS_FAILED -eq 0 ]
