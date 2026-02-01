#!/bin/bash
set -e

echo "==================================="
echo "Orchestrator Mini - Service Setup"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}Please run with sudo:${NC}"
   echo "sudo bash $0"
   exit 1
fi

echo -e "${BLUE}[1/6] Installing Tailscale...${NC}"
# Add Tailscale repository
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.noarmor.gpg | tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.tailscale-keyring.list | tee /etc/apt/sources.list.d/tailscale.list

# Install Tailscale
apt-get update
apt-get install -y tailscale

echo -e "${GREEN}✓ Tailscale installed${NC}"
echo ""

echo -e "${BLUE}[2/6] Installing Cloudflared...${NC}"
# Download and install cloudflared
curl -L --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i /tmp/cloudflared.deb
rm /tmp/cloudflared.deb

echo -e "${GREEN}✓ Cloudflared installed${NC}"
echo ""

echo -e "${BLUE}[3/6] Applying WSL optimizations...${NC}"
# Check if wsl.conf exists
if [ -f /etc/wsl.conf ]; then
    cp /etc/wsl.conf /etc/wsl.conf.backup.$(date +%Y%m%d-%H%M%S)
fi

# Apply WSL configuration
cat > /etc/wsl.conf << 'EOF'
[boot]
systemd=true
command="mount --make-rshared /"

[network]
generateResolvConf=true
hostname=orchestrator-mini-wsl

[interop]
enabled=true
appendWindowsPath=true

[automount]
enabled=true
mountFsTab=true
options="metadata,umask=22,fmask=11"

[user]
default=ellisapotheosis
EOF

echo -e "${GREEN}✓ WSL configuration applied${NC}"
echo ""

echo -e "${BLUE}[4/6] Starting Tailscale daemon...${NC}"
systemctl enable tailscaled
systemctl start tailscaled

echo -e "${GREEN}✓ Tailscale daemon started${NC}"
echo ""

echo -e "${BLUE}[5/6] Configuring file permissions...${NC}"
# Fix common permission issues
chown -R ellisapotheosis:ellisapotheosis /home/ellisapotheosis/projects/project-nyra
chmod -R u+w /home/ellisapotheosis/projects/project-nyra

echo -e "${GREEN}✓ File permissions configured${NC}"
echo ""

echo -e "${BLUE}[6/6] Creating Docker network...${NC}"
# Switch to user context for Docker commands
su - ellisapotheosis -c "docker network create nyra-network 2>/dev/null || echo 'Network already exists'"

echo -e "${GREEN}✓ Docker network ready${NC}"
echo ""

echo -e "${GREEN}==================================="
echo "Installation Complete!"
echo "===================================${NC}"
echo ""
echo -e "${YELLOW}NEXT STEPS (manual):${NC}"
echo ""
echo "1. Authenticate Tailscale:"
echo "   sudo tailscale up --accept-routes --advertise-exit-node=false"
echo "   (This will print a URL - open it in browser to authorize)"
echo ""
echo "2. Set Tailscale hostname:"
echo "   sudo tailscale set --hostname orchestrator-mini-wsl"
echo ""
echo "3. Authenticate Cloudflared:"
echo "   cloudflared tunnel login"
echo "   (This will open browser to authorize with Cloudflare)"
echo ""
echo "4. Restart WSL for optimizations to take effect:"
echo "   wsl.exe --shutdown"
echo "   (Then reopen WSL)"
echo ""
echo -e "${BLUE}After completing steps 1-4, Claude will continue with:${NC}"
echo "  - Creating Cloudflared tunnel"
echo "  - Configuring systemd services"
echo "  - Starting all Docker containers"
echo "  - Verifying network connectivity"
