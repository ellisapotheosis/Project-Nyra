#!/bin/bash

echo "=========================================="
echo "Setup Passwordless Sudo for Installation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}This script will configure passwordless sudo for installation commands.${NC}"
echo ""
echo "This is a ONE-TIME setup. After installation, you can remove it if desired."
echo ""
echo "The following will be allowed without password:"
echo "  - apt-get (for installing Tailscale, Cloudflared)"
echo "  - systemctl (for managing services)"
echo "  - tailscale (for Tailscale configuration)"
echo "  - cloudflared (for tunnel setup)"
echo "  - docker (for container management)"
echo "  - chown/chmod (for file permissions)"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Create sudoers file for passwordless installation
SUDOERS_FILE="/etc/sudoers.d/nyra-installation"

echo -e "${BLUE}Creating sudoers configuration...${NC}"

sudo tee "$SUDOERS_FILE" > /dev/null << 'EOF'
# Nyra Project - Passwordless sudo for installation commands
# Created by setup-passwordless-sudo.sh
# You can remove this file after installation is complete

# User configuration
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/apt-get
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/apt
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/dpkg
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/systemctl
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/tailscale
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/tailscaled
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/cloudflared
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/docker
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/chown
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/chmod
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/wsl.conf
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/systemd/system/*
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/cloudflared/*
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/cp /etc/wsl.conf*
ellisapotheosis ALL=(ALL) NOPASSWD: /usr/bin/mkdir -p /etc/cloudflared
EOF

# Set correct permissions
sudo chmod 0440 "$SUDOERS_FILE"

# Validate sudoers file
if sudo visudo -c -f "$SUDOERS_FILE" &> /dev/null; then
    echo -e "${GREEN}✓ Passwordless sudo configured successfully${NC}"
    echo ""
    echo -e "${BLUE}You can now run installation commands without entering password.${NC}"
    echo ""
    echo "To remove this configuration after installation:"
    echo "  sudo rm $SUDOERS_FILE"
    echo ""
    echo -e "${GREEN}Ready to run:${NC}"
    echo "  sudo bash scripts/install-orchestrator-services.sh"
else
    echo -e "${RED}✗ Error: Invalid sudoers configuration${NC}"
    sudo rm "$SUDOERS_FILE" 2>/dev/null
    exit 1
fi
