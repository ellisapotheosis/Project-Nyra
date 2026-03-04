#!/bin/bash
# Project Nyra - Static IP Configuration Script
# Configure static IP addresses for 4-PC cluster

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <PC-role> [interface-name]"
    echo "PC roles: PC1, PC2, PC3, PC4"
    exit 1
fi

PC_ROLE="$1"
INTERFACE="${2:-}"
SET_DNS=true

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# IP assignments
declare -A ip_config=(
    [PC1-ip]="10.0.0.1"
    [PC1-desc]="Orchestrator (Mac Mini)"
    [PC2-ip]="10.0.0.2"
    [PC2-desc]="Worker-2 (Alienware M15R7, RTX 3060)"
    [PC3-ip]="10.0.0.3"
    [PC3-desc]="Worker-3 (Alienware Area-51, RTX 5090)"
    [PC4-ip]="10.0.0.4"
    [PC4-desc]="Worker-4 (Desktop, RTX 3090 Ti)"
)

# Validate PC role
if [[ ! "$PC_ROLE" =~ ^PC[1-4]$ ]]; then
    echo -e "${RED}Invalid PC role: $PC_ROLE${NC}"
    echo "Valid roles: PC1, PC2, PC3, PC4"
    exit 1
fi

STATIC_IP="${ip_config[${PC_ROLE}-ip]}"
DESCRIPTION="${ip_config[${PC_ROLE}-desc]}"
GATEWAY="10.0.0.1"
DNS1="1.1.1.1"
DNS2="8.8.8.8"

echo -e "${CYAN}=================================="
echo "  Static IP Configuration"
echo "  PC: $PC_ROLE"
echo "  IP: $STATIC_IP"
echo "  Description: $DESCRIPTION"
echo -e "==================================${NC}"
echo ""

# Check root privileges
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: This script requires root privileges.${NC}"
    echo "Please run with sudo"
    exit 1
fi

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     OS_TYPE=Linux;;
    Darwin*)    OS_TYPE=Mac;;
    *)          OS_TYPE="UNKNOWN:$OS"
esac

echo -e "${CYAN}Detected OS: $OS_TYPE${NC}"
echo ""

# Auto-detect interface if not specified
if [ -z "$INTERFACE" ]; then
    echo -e "${YELLOW}Auto-detecting network interface...${NC}"

    if [ "$OS_TYPE" == "Mac" ]; then
        INTERFACE=$(networksetup -listallhardwareports | grep -A 1 "Ethernet" | grep "Device:" | awk '{print $2}' | head -1)
    elif [ "$OS_TYPE" == "Linux" ]; then
        INTERFACE=$(ip -o link show | grep -v "lo" | grep "state UP" | awk -F': ' '{print $2}' | head -1)
    fi

    if [ -n "$INTERFACE" ]; then
        echo -e "${GREEN}✓ Detected interface: $INTERFACE${NC}"
    else
        echo -e "${RED}✗ No active network interface found!${NC}"
        echo -e "${YELLOW}Available interfaces:${NC}"

        if [ "$OS_TYPE" == "Mac" ]; then
            networksetup -listallhardwareports
        elif [ "$OS_TYPE" == "Linux" ]; then
            ip link show
        fi
        exit 1
    fi
fi

echo ""
echo -e "${CYAN}Configuring network interface: $INTERFACE${NC}"
echo ""

# Configure based on OS
if [ "$OS_TYPE" == "Mac" ]; then
    # macOS configuration
    echo -e "${YELLOW}1. Configuring static IP: $STATIC_IP${NC}"
    networksetup -setmanual "$INTERFACE" "$STATIC_IP" 255.255.255.0 "$GATEWAY"
    echo -e "${GREEN}   ✓ Static IP configured${NC}"

    if [ "$SET_DNS" = true ]; then
        echo -e "${YELLOW}2. Setting DNS servers: $DNS1, $DNS2${NC}"
        networksetup -setdnsservers "$INTERFACE" "$DNS1" "$DNS2"
        echo -e "${GREEN}   ✓ DNS servers configured${NC}"
    fi

elif [ "$OS_TYPE" == "Linux" ]; then
    # Linux configuration (systemd-networkd)
    echo -e "${YELLOW}1. Creating network configuration file${NC}"

    cat > /etc/systemd/network/10-static-$INTERFACE.network << EOF
[Match]
Name=$INTERFACE

[Network]
Address=$STATIC_IP/24
Gateway=$GATEWAY
DNS=$DNS1
DNS=$DNS2

[Link]
RequiredForOnline=yes
EOF

    echo -e "${GREEN}   ✓ Configuration file created${NC}"

    echo -e "${YELLOW}2. Restarting network service${NC}"
    systemctl restart systemd-networkd
    echo -e "${GREEN}   ✓ Network service restarted${NC}"
fi

# Wait for network to stabilize
echo ""
echo -e "${YELLOW}3. Waiting for network to stabilize...${NC}"
sleep 3

# Verify configuration
echo ""
echo -e "${YELLOW}4. Verifying configuration...${NC}"

if [ "$OS_TYPE" == "Mac" ]; then
    current_ip=$(networksetup -getinfo "$INTERFACE" | grep "IP address:" | awk '{print $3}')
elif [ "$OS_TYPE" == "Linux" ]; then
    current_ip=$(ip -4 addr show "$INTERFACE" | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
fi

if [ "$current_ip" == "$STATIC_IP" ]; then
    echo -e "${GREEN}   ✓ IP Address: $current_ip${NC}"
else
    echo -e "${RED}   ✗ IP verification failed! Expected: $STATIC_IP, Got: $current_ip${NC}"
fi

# Test connectivity
echo ""
echo -e "${YELLOW}5. Testing network connectivity...${NC}"

echo -n "   Testing gateway ($GATEWAY)... "
if ping -c 2 -W 2 "$GATEWAY" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Reachable${NC}"
else
    echo -e "${RED}✗ Unreachable${NC}"
fi

echo -n "   Testing DNS (google.com)... "
if ping -c 2 -W 2 "google.com" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Working${NC}"
else
    echo -e "${RED}✗ Not working${NC}"
fi

# Test other PCs
echo ""
echo -e "${YELLOW}6. Testing connectivity to other cluster PCs...${NC}"

for pc in PC1 PC2 PC3 PC4; do
    if [ "$pc" != "$PC_ROLE" ]; then
        test_ip="${ip_config[${pc}-ip]}"
        echo -n "   $pc ($test_ip)... "
        if ping -c 1 -W 1 "$test_ip" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Reachable${NC}"
        else
            echo -e "${YELLOW}⚠ Not reachable (may not be configured yet)${NC}"
        fi
    fi
done

# Summary
echo ""
echo -e "${CYAN}=================================="
echo "  Configuration Complete!"
echo -e "==================================${NC}"
echo ""
echo "Network Configuration:"
echo "  PC Role:       $PC_ROLE ($DESCRIPTION)"
echo "  Interface:     $INTERFACE"
echo "  IP Address:    $STATIC_IP"
echo "  Gateway:       $GATEWAY"
echo "  DNS Servers:   $DNS1, $DNS2"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Configure other PCs in the cluster"

if [ "$PC_ROLE" == "PC1" ]; then
    echo "  2. Run bootstrap script: ./scripts/bootstrap-orchestrator.sh"
else
    echo "  2. Run bootstrap script: ./scripts/bootstrap-worker.sh ${PC_ROLE,,}"
fi

echo "  3. Test connectivity: ping 10.0.0.1"
echo ""
