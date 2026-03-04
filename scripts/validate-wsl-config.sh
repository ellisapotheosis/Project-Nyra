#!/bin/bash
# ==============================================================================
# WSL Configuration Validator for AI Development Orchestrator
# ==============================================================================
# Validates optimal WSL configuration for:
# - Docker Desktop integration
# - AI/LLM development
# - Cloudflare tunneling
# - Tailscale networking
# - MCP server hosting
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# ==============================================================================
# CHECK 1: WSL Configuration File
# ==============================================================================
print_header "1. WSL Configuration File (/etc/wsl.conf)"

if [[ -f /etc/wsl.conf ]]; then
    check_pass "WSL configuration file exists"

    # Check systemd
    if grep -q "systemd=true" /etc/wsl.conf; then
        check_pass "Systemd is enabled (required for Docker, Tailscale, Cloudflared)"
    else
        check_fail "Systemd is NOT enabled - add 'systemd=true' to [boot] section"
    fi

    # Check automount options
    if grep -q "metadata" /etc/wsl.conf; then
        check_pass "Metadata support enabled (proper file permissions)"
    else
        check_fail "Metadata not enabled - file permissions may be incorrect"
    fi

    # Check interop
    if grep -q "enabled=true" /etc/wsl.conf | grep -q "interop" -A1; then
        check_pass "Windows interoperability enabled"
    else
        check_warn "Windows interoperability might not be enabled"
    fi

    echo -e "\nCurrent /etc/wsl.conf contents:"
    echo "----------------------------------------"
    cat /etc/wsl.conf
    echo "----------------------------------------"
else
    check_fail "WSL configuration file NOT found at /etc/wsl.conf"
    echo -e "\n${YELLOW}To create optimal config:${NC}"
    echo "sudo cp ~/projects/project-nyra/scripts/wsl-config-orchestrator.conf /etc/wsl.conf"
    echo "wsl --shutdown  # (run from PowerShell/CMD)"
fi

# ==============================================================================
# CHECK 2: Systemd Status
# ==============================================================================
print_header "2. Systemd Status"

if command -v systemctl &> /dev/null; then
    if systemctl is-system-running &> /dev/null || [[ "$(systemctl is-system-running)" == "running" ]] || [[ "$(systemctl is-system-running)" == "degraded" ]]; then
        check_pass "Systemd is running"

        # Check important services
        if systemctl is-active --quiet docker; then
            check_pass "Docker service is active"
        else
            check_warn "Docker service is not active (may not be installed or started)"
        fi

        if systemctl is-active --quiet tailscaled; then
            check_pass "Tailscale daemon is active"
        else
            check_warn "Tailscale daemon is not active (may not be installed)"
        fi

        if systemctl is-active --quiet cloudflared; then
            check_pass "Cloudflared service is active"
        else
            check_warn "Cloudflared service is not active (may not be configured)"
        fi
    else
        check_fail "Systemd is NOT running properly"
    fi
else
    check_fail "Systemd is NOT available (systemctl command not found)"
fi

# ==============================================================================
# CHECK 3: Docker Desktop Integration
# ==============================================================================
print_header "3. Docker Desktop Integration"

if command -v docker &> /dev/null; then
    check_pass "Docker CLI is installed"

    if docker ps &> /dev/null; then
        check_pass "Docker daemon is accessible"
        echo -e "\n${GREEN}Running containers:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No containers running"
    else
        check_fail "Docker daemon is NOT accessible"
        echo -e "\n${YELLOW}Tips:${NC}"
        echo "1. Open Docker Desktop on Windows"
        echo "2. Settings → Resources → WSL Integration"
        echo "3. Enable integration with 'Ubuntu' distro"
        echo "4. Restart Docker Desktop"
    fi
else
    check_warn "Docker CLI is not installed"
fi

# ==============================================================================
# CHECK 4: Tailscale Configuration
# ==============================================================================
print_header "4. Tailscale Configuration"

if command -v tailscale &> /dev/null; then
    check_pass "Tailscale CLI is installed"

    if tailscale status &> /dev/null; then
        check_pass "Tailscale is connected"
        echo -e "\n${GREEN}Tailscale status:${NC}"
        tailscale status | head -10

        echo -e "\n${GREEN}Tailscale IP:${NC}"
        tailscale ip -4
    else
        check_warn "Tailscale is installed but not connected"
        echo -e "\n${YELLOW}To connect:${NC}"
        echo "sudo tailscale up --accept-routes --advertise-routes=192.168.1.0/24"
    fi
else
    check_warn "Tailscale is not installed"
    echo -e "\n${YELLOW}To install:${NC}"
    echo "curl -fsSL https://tailscale.com/install.sh | sh"
fi

# ==============================================================================
# CHECK 5: Cloudflare Tunnel
# ==============================================================================
print_header "5. Cloudflare Tunnel Configuration"

if command -v cloudflared &> /dev/null; then
    check_pass "Cloudflared is installed"

    if systemctl is-active --quiet cloudflared 2>/dev/null; then
        check_pass "Cloudflared service is running"
        echo -e "\n${GREEN}Cloudflared status:${NC}"
        systemctl status cloudflared --no-pager -l | head -15
    else
        check_warn "Cloudflared is installed but service not running"
        echo -e "\n${YELLOW}To configure:${NC}"
        echo "1. Create tunnel: cloudflared tunnel create nyra-orchestrator"
        echo "2. Configure tunnel: cloudflared tunnel route dns <tunnel-id> nyra.example.com"
        echo "3. Install service: sudo cloudflared service install <token>"
    fi
else
    check_warn "Cloudflared is not installed"
    echo -e "\n${YELLOW}To install:${NC}"
    echo "curl -L https://pkg.cloudflare.com/cloudflared-stable-linux-amd64.deb -o cloudflared.deb"
    echo "sudo dpkg -i cloudflared.deb"
fi

# ==============================================================================
# CHECK 6: MCP Server Ports
# ==============================================================================
print_header "6. MCP Server Ports & Service Status"

# Check common MCP/service ports
PORTS=(
    "3000:TwentyCRM"
    "4000:LiteLLM"
    "6000:Nexus Router"
    "8000:Backend API"
    "8001:Quote Engine"
    "8002:Campaign Engine"
    "8081:OpenMemory MCP"
)

echo -e "Checking listening ports:\n"

for port_service in "${PORTS[@]}"; do
    IFS=':' read -r port service <<< "$port_service"
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        check_pass "$service (port $port) is listening"
    else
        check_warn "$service (port $port) is NOT listening"
    fi
done

# ==============================================================================
# CHECK 7: File System Performance
# ==============================================================================
print_header "7. File System Performance & Permissions"

# Check if we're in WSL native filesystem
CURRENT_PATH=$(pwd)
if [[ "$CURRENT_PATH" == /home/* ]]; then
    check_pass "Current directory is in WSL native filesystem (optimal performance)"
else
    check_warn "Current directory is NOT in WSL native filesystem (slower I/O)"
    echo -e "${YELLOW}Tip:${NC} Store code in /home for best performance"
fi

# Check metadata support
TEST_FILE="/tmp/wsl-metadata-test-$$"
touch "$TEST_FILE"
chmod 755 "$TEST_FILE"
if [[ -x "$TEST_FILE" ]]; then
    check_pass "File permissions work correctly (metadata enabled)"
else
    check_fail "File permissions not working (metadata may not be enabled)"
fi
rm -f "$TEST_FILE"

# Check Windows drive mounting
if [[ -d /mnt/c ]]; then
    check_pass "Windows C: drive is mounted at /mnt/c"
else
    check_fail "Windows C: drive is NOT mounted"
fi

# ==============================================================================
# CHECK 8: Network Configuration
# ==============================================================================
print_header "8. Network Configuration"

# Check DNS resolution
if ping -c 1 google.com &> /dev/null; then
    check_pass "DNS resolution is working"
else
    check_fail "DNS resolution is NOT working"
    echo -e "\n${YELLOW}Check /etc/resolv.conf:${NC}"
    cat /etc/resolv.conf
fi

# Check localhost forwarding
echo -e "\n${GREEN}Network interfaces:${NC}"
ip addr show | grep -E "^[0-9]+:|inet " | head -20

# ==============================================================================
# CHECK 9: AI/LLM Development Tools
# ==============================================================================
print_header "9. AI/LLM Development Tools"

# Check Node.js (for Claude Code, MCP servers)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js is installed ($NODE_VERSION)"
else
    check_warn "Node.js is not installed"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    check_pass "pnpm is installed ($PNPM_VERSION)"
else
    check_warn "pnpm is not installed"
fi

# Check Python (for AI tools)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check_pass "Python is installed ($PYTHON_VERSION)"
else
    check_warn "Python is not installed"
fi

# Check GPU (for LLM inference)
if command -v nvidia-smi &> /dev/null; then
    if nvidia-smi &> /dev/null; then
        check_pass "NVIDIA GPU is accessible"
        echo -e "\n${GREEN}GPU status:${NC}"
        nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits
    else
        check_warn "NVIDIA drivers installed but GPU not accessible"
    fi
else
    check_warn "NVIDIA GPU tools (nvidia-smi) not found"
fi

# ==============================================================================
# CHECK 10: Resource Allocation (.wslconfig)
# ==============================================================================
print_header "10. WSL Resource Allocation"

echo -e "Current resource usage:\n"
echo "Memory:"
free -h
echo -e "\nCPU:"
lscpu | grep -E "^CPU\(s\)|^Model name|^Thread"

echo -e "\n${YELLOW}Note:${NC} WSL resource limits are set in Windows:"
echo "C:\\Users\\$(whoami)/.wslconfig"
echo -e "\n${YELLOW}Recommended for AI orchestrator:${NC}"
cat << 'EOF'
[wsl2]
memory=16GB              # Allocate sufficient RAM for LLMs
processors=8             # CPU cores for parallel processing
swap=8GB                 # Swap space for large models
localhostForwarding=true # Forward ports from WSL to Windows
nestedVirtualization=true # Enable for nested containers
EOF

# ==============================================================================
# SUMMARY
# ==============================================================================
print_header "Validation Summary"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}✓ Passed:${NC}   $PASSED"
echo -e "${RED}✗ Failed:${NC}   $FAILED"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo -e "──────────────────"
echo -e "Total checks: $TOTAL"

if [[ $FAILED -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 Perfect! Your WSL orchestrator setup is fully optimized!${NC}"
elif [[ $FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}✓ Good! No critical failures, but review warnings above.${NC}"
else
    echo -e "\n${RED}⚠ Action required! Address failed checks above.${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
