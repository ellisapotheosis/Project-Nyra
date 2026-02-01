#!/bin/bash

echo "======================================"
echo "Pre-Installation Environment Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check command existence
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check systemd
check_systemd() {
    if systemctl --version &> /dev/null; then
        echo -e "${GREEN}✓${NC} systemd is running"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} systemd is not running (required for WSL2)"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check Docker
check_docker() {
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker is running and accessible"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} Docker is not running or not accessible"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check internet connectivity
check_internet() {
    if ping -c 1 8.8.8.8 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Internet connectivity available"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} No internet connectivity"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    AVAILABLE=$(df -BG /home | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE" -gt 10 ]; then
        echo -e "${GREEN}✓${NC} Sufficient disk space available (${AVAILABLE}GB)"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Low disk space (${AVAILABLE}GB available, recommend 10GB+)"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check if running in WSL
check_wsl() {
    if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then
        echo -e "${GREEN}✓${NC} Running in WSL2"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Not running in WSL (script designed for WSL2)"
        return 1
    fi
}

echo "Checking system requirements..."
echo ""

check_wsl
check_systemd
check_command curl
check_command docker
check_docker
check_internet
check_disk_space

echo ""
echo "======================================"
echo "Results: $CHECKS_PASSED passed, $CHECKS_FAILED failed"
echo "======================================"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC} Ready to run installation script."
    echo ""
    echo "Run the installation with:"
    echo "  cd ~/projects/project-nyra"
    echo "  sudo bash scripts/install-orchestrator-services.sh"
    exit 0
else
    echo -e "${YELLOW}Some checks failed.${NC} Please resolve issues before proceeding."
    echo ""
    echo "Common fixes:"
    echo "  - Docker not running: Start Docker Desktop with WSL2 backend"
    echo "  - systemd not running: Enable in /etc/wsl.conf and restart WSL"
    echo "  - No internet: Check network configuration"
    echo ""
    exit 1
fi
