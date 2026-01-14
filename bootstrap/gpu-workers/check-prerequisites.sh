#!/bin/bash
################################################################################
# GPU Worker Prerequisites Checker
#
# This script validates system requirements before running worker setup
#
# Usage: ./check-prerequisites.sh
################################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Tracking
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

################################################################################
# Helper Functions
################################################################################

log_check() {
    echo -ne "${BLUE}[CHECK]${NC} $1 ... "
}

log_pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC}"
    if [[ -n "${2:-}" ]]; then
        echo -e "${RED}       $2${NC}"
    fi
    ((CHECKS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}"
    if [[ -n "${2:-}" ]]; then
        echo -e "${YELLOW}       $2${NC}"
    fi
    ((WARNINGS++))
}

log_info() {
    echo -e "${CYAN}ℹ INFO${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
}

################################################################################
# System Checks
################################################################################

check_os() {
    log_check "Operating System"

    if [[ ! -f /etc/os-release ]]; then
        log_fail "Cannot determine OS version"
        return 1
    fi

    source /etc/os-release

    case "$ID" in
        ubuntu|debian|rhel|centos|fedora|rocky|almalinux)
            log_pass
            log_info "Detected: $PRETTY_NAME"
            return 0
            ;;
        *)
            log_warning "Unsupported OS: $ID" \
                "Script may work but is untested on this OS"
            return 0
            ;;
    esac
}

check_root_access() {
    log_check "Root/sudo access"

    if [[ $EUID -eq 0 ]]; then
        log_pass
        log_info "Running as root"
        return 0
    fi

    if sudo -n true 2>/dev/null; then
        log_pass
        log_info "Passwordless sudo available"
        return 0
    fi

    if sudo true 2>/dev/null; then
        log_pass
        log_info "Sudo access available (password required)"
        return 0
    fi

    log_fail "No root or sudo access" \
        "Setup scripts require root privileges"
    return 1
}

check_internet() {
    log_check "Internet connectivity"

    if curl -sf --max-time 5 https://ollama.com > /dev/null 2>&1; then
        log_pass
        return 0
    fi

    if curl -sf --max-time 5 https://google.com > /dev/null 2>&1; then
        log_warning "Can reach internet but not ollama.com" \
            "DNS or firewall may block ollama.com"
        return 0
    fi

    log_fail "No internet connection" \
        "Internet required to download Ollama and models"
    return 1
}

check_disk_space() {
    log_check "Disk space (minimum 100GB recommended)"

    local available=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

    if [[ $available -ge 100 ]]; then
        log_pass
        log_info "Available: ${available}GB"
        return 0
    elif [[ $available -ge 50 ]]; then
        log_warning "Only ${available}GB available" \
            "Recommended: 100GB+ for multiple models"
        return 0
    else
        log_fail "Insufficient disk space: ${available}GB" \
            "Minimum 50GB required, 100GB+ recommended"
        return 1
    fi
}

check_memory() {
    log_check "System RAM (minimum 16GB recommended)"

    local total_ram=$(free -g | awk 'NR==2 {print $2}')

    if [[ $total_ram -ge 32 ]]; then
        log_pass
        log_info "Available: ${total_ram}GB (excellent)"
        return 0
    elif [[ $total_ram -ge 16 ]]; then
        log_pass
        log_info "Available: ${total_ram}GB (good)"
        return 0
    else
        log_warning "Only ${total_ram}GB RAM" \
            "16GB+ recommended for smooth operation"
        return 0
    fi
}

################################################################################
# NVIDIA Checks
################################################################################

check_nvidia_driver() {
    log_check "NVIDIA driver"

    if ! command -v nvidia-smi &> /dev/null; then
        log_fail "nvidia-smi not found" \
            "Install NVIDIA drivers: apt-get install nvidia-driver-535"
        return 1
    fi

    local driver_version=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader)

    if [[ -z "$driver_version" ]]; then
        log_fail "Cannot query NVIDIA driver version"
        return 1
    fi

    log_pass
    log_info "Driver version: $driver_version"
    return 0
}

check_nvidia_gpu() {
    log_check "NVIDIA GPU detection"

    if ! command -v nvidia-smi &> /dev/null; then
        log_fail "nvidia-smi not available"
        return 1
    fi

    local gpu_count=$(nvidia-smi --query-gpu=count --format=csv,noheader | head -n 1)
    local gpu_name=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n 1)
    local gpu_vram=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n 1)

    if [[ -z "$gpu_name" ]]; then
        log_fail "No NVIDIA GPU detected"
        return 1
    fi

    log_pass
    log_info "Detected: $gpu_name"
    log_info "VRAM: $((gpu_vram / 1024))GB"

    if [[ $gpu_count -gt 1 ]]; then
        log_info "Multiple GPUs detected: $gpu_count"
    fi

    return 0
}

check_cuda() {
    log_check "CUDA installation"

    if command -v nvcc &> /dev/null; then
        local cuda_version=$(nvcc --version | grep "release" | awk '{print $5}' | sed 's/,//')
        log_pass
        log_info "CUDA version: $cuda_version"
        return 0
    fi

    log_warning "CUDA toolkit not found" \
        "Not required for Ollama but useful for development"
    return 0
}

################################################################################
# Software Checks
################################################################################

check_curl() {
    log_check "curl"
    if command -v curl &> /dev/null; then
        log_pass
        return 0
    fi
    log_fail "curl not found" \
        "Install: apt-get install curl"
    return 1
}

check_jq() {
    log_check "jq (JSON processor)"
    if command -v jq &> /dev/null; then
        log_pass
        return 0
    fi
    log_warning "jq not found (optional)" \
        "Install: apt-get install jq"
    return 0
}

check_docker() {
    log_check "Docker"
    if command -v docker &> /dev/null; then
        log_pass
        log_info "Version: $(docker --version | awk '{print $3}' | sed 's/,//')"
        return 0
    fi
    log_warning "Docker not found (optional)" \
        "Required for LiteLLM proxy deployment"
    return 0
}

check_python() {
    log_check "Python 3"
    if command -v python3 &> /dev/null; then
        local py_version=$(python3 --version | awk '{print $2}')
        log_pass
        log_info "Version: $py_version"
        return 0
    fi
    log_fail "Python 3 not found" \
        "Install: apt-get install python3 python3-pip"
    return 1
}

check_systemd() {
    log_check "systemd"
    if command -v systemctl &> /dev/null; then
        log_pass
        return 0
    fi
    log_fail "systemd not found" \
        "systemd required for service management"
    return 1
}

################################################################################
# Network Checks
################################################################################

check_ports() {
    log_check "Required ports (11434, 4000, 8080)"

    local ports_in_use=()

    for port in 11434 4000 8080; do
        if ss -tlnp 2>/dev/null | grep -q ":$port "; then
            ports_in_use+=($port)
        elif netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            ports_in_use+=($port)
        fi
    done

    if [[ ${#ports_in_use[@]} -eq 0 ]]; then
        log_pass
        return 0
    fi

    log_warning "Ports in use: ${ports_in_use[*]}" \
        "Setup may fail if services are already running"
    return 0
}

check_firewall() {
    log_check "Firewall status"

    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            log_warning "UFW firewall is active" \
                "May need to allow ports: 11434, 4000, 8080"
        else
            log_pass
            log_info "UFW firewall inactive"
        fi
        return 0
    fi

    if systemctl is-active --quiet firewalld 2>/dev/null; then
        log_warning "firewalld is active" \
            "May need to allow ports: 11434, 4000, 8080"
        return 0
    fi

    log_pass
    log_info "No common firewall detected"
    return 0
}

################################################################################
# Optional Features
################################################################################

check_tailscale() {
    log_check "Tailscale (optional)"

    if command -v tailscale &> /dev/null; then
        if tailscale status &> /dev/null; then
            log_pass
            log_info "Tailscale installed and configured"
        else
            log_pass
            log_info "Tailscale installed but not configured"
        fi
        return 0
    fi

    log_info "Not installed (will be installed during setup if needed)"
    return 0
}

check_openrouter_key() {
    log_check "OpenRouter API key (optional)"

    if [[ -n "${OPENROUTER_API_KEY:-}" ]]; then
        log_pass
        log_info "OpenRouter key configured for fallback"
        return 0
    fi

    log_info "Not set (optional - provides fallback capability)"
    return 0
}

################################################################################
# Summary
################################################################################

print_summary() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} Prerequisites Check Summary${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}Passed:  $CHECKS_PASSED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo -e "${RED}Failed:  $CHECKS_FAILED${NC}"

    echo ""

    if [[ $CHECKS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ System ready for GPU worker setup!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Choose your GPU script:"
        echo "     - ./setup-rtx5090-worker.sh (48GB VRAM)"
        echo "     - ./setup-rtx3090-worker.sh (24GB VRAM)"
        echo "     - ./setup-rtx3060-worker.sh (12GB VRAM)"
        echo ""
        echo "  2. Or set up all workers:"
        echo "     - sudo ./setup-all-workers.sh"
        echo ""
        return 0
    else
        echo -e "${RED}✗ System not ready - fix failed checks before proceeding${NC}"
        echo ""
        echo "Common fixes:"
        echo "  NVIDIA driver:  sudo apt-get install nvidia-driver-535"
        echo "  curl:          sudo apt-get install curl wget"
        echo "  Python:        sudo apt-get install python3 python3-pip"
        echo ""
        return 1
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  GPU Worker Prerequisites Check                  ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"

    # System checks
    log_section "System Requirements"
    check_os
    check_root_access
    check_internet
    check_disk_space
    check_memory

    # NVIDIA checks
    log_section "NVIDIA Requirements"
    check_nvidia_driver
    check_nvidia_gpu
    check_cuda

    # Software checks
    log_section "Software Requirements"
    check_curl
    check_python
    check_systemd
    check_jq
    check_docker

    # Network checks
    log_section "Network Configuration"
    check_ports
    check_firewall

    # Optional features
    log_section "Optional Features"
    check_tailscale
    check_openrouter_key

    # Summary
    print_summary
}

# Run checks
main "$@"
