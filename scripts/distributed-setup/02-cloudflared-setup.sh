#!/bin/bash
# Cloudflared Tunnel Setup Script
# Project Nyra - 4-PC Distributed Architecture

set -e

echo "☁️  Project Nyra - Cloudflared Tunnel Setup"
echo "=========================================="
echo ""

# Configuration
TUNNEL_NAME="nyra-gitea"
GITEA_PORT="3000"
CLOUDFLARED_DIR="$HOME/.cloudflared"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Cannot detect operating system"
    exit 1
fi

echo "📋 Configuration:"
echo "  - Tunnel Name: ${TUNNEL_NAME}"
echo "  - Target Service: http://localhost:${GITEA_PORT}"
echo "  - OS: ${OS}"
echo ""

# Step 1: Install Cloudflared
echo "📥 Installing Cloudflared..."
if command -v cloudflared &> /dev/null; then
    echo "  ✓ Cloudflared already installed"
    cloudflared version
else
    case "$OS" in
        ubuntu|debian)
            wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
            sudo dpkg -i cloudflared-linux-amd64.deb
            rm cloudflared-linux-amd64.deb
            ;;
        fedora|rhel|centos)
            wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
            sudo yum install -y cloudflared-linux-x86_64.rpm
            rm cloudflared-linux-x86_64.rpm
            ;;
        arch)
            sudo pacman -S cloudflared
            ;;
        *)
            echo "  ℹ️  Manual installation required for ${OS}"
            echo "  Download from: https://github.com/cloudflare/cloudflared/releases"
            exit 1
            ;;
    esac
    echo "  ✓ Cloudflared installed"
fi

# Step 2: Authenticate
echo ""
echo "🔐 Cloudflare Authentication"
echo "  This will open a browser window for authentication"
read -p "Press Enter to continue..."

cloudflared tunnel login

if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
    echo "❌ Authentication failed. cert.pem not found."
    exit 1
fi
echo "  ✓ Authentication successful"

# Step 3: Create Tunnel
echo ""
echo "🚇 Creating tunnel..."
if cloudflared tunnel list | grep -q "${TUNNEL_NAME}"; then
    echo "  ℹ️  Tunnel '${TUNNEL_NAME}' already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "${TUNNEL_NAME}" | awk '{print $1}')
else
    cloudflared tunnel create ${TUNNEL_NAME}
    TUNNEL_ID=$(cloudflared tunnel list | grep "${TUNNEL_NAME}" | awk '{print $1}')
    echo "  ✓ Tunnel created: ${TUNNEL_ID}"
fi

# Step 4: Configure Tunnel
echo ""
echo "⚙️  Configuring tunnel..."

TUNNEL_CREDS=$(find $CLOUDFLARED_DIR -name "${TUNNEL_ID}.json" | head -1)
if [ -z "$TUNNEL_CREDS" ]; then
    echo "❌ Tunnel credentials not found"
    exit 1
fi

cat > $CLOUDFLARED_DIR/config.yml << EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${TUNNEL_CREDS}

ingress:
  # Gitea web interface
  - hostname: gitea.YOURDOMAIN.com
    service: http://localhost:${GITEA_PORT}

  # Optional: Add more services
  # - hostname: api.YOURDOMAIN.com
  #   service: http://localhost:8080

  # Catch-all rule (required)
  - service: http_status:404
EOF

echo "  ✓ Configuration created: $CLOUDFLARED_DIR/config.yml"

# Step 5: DNS Setup Instructions
echo ""
echo "🌐 DNS Configuration Required"
echo "================================"
echo ""
echo "Run the following command to get your tunnel's DNS record:"
echo ""
echo "  cloudflared tunnel route dns ${TUNNEL_NAME} gitea.YOURDOMAIN.com"
echo ""
echo "Replace YOURDOMAIN.com with your actual domain."
echo ""
read -p "Have you configured your domain? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please configure DNS before continuing"
    echo "   You can run the tunnel manually later with:"
    echo "   cloudflared tunnel run ${TUNNEL_NAME}"
    exit 0
fi

# Step 6: Install as Service
echo ""
echo "⚙️  Installing systemd service..."
sudo cloudflared service install

if [ -f /etc/systemd/system/cloudflared.service ]; then
    sudo systemctl enable cloudflared
    sudo systemctl start cloudflared
    echo "  ✓ Service installed and started"
else
    echo "  ⚠️  Service installation failed. You can run manually with:"
    echo "     cloudflared tunnel run ${TUNNEL_NAME}"
fi

# Step 7: Test Connection
echo ""
echo "🧪 Testing tunnel..."
sleep 5

if sudo systemctl is-active --quiet cloudflared; then
    echo "  ✓ Tunnel is running"
else
    echo "  ⚠️  Tunnel may not be running. Check with: sudo systemctl status cloudflared"
fi

echo ""
echo "✅ Cloudflared setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  - Tunnel Name: ${TUNNEL_NAME}"
echo "  - Tunnel ID: ${TUNNEL_ID}"
echo "  - Config: $CLOUDFLARED_DIR/config.yml"
echo "  - Public URL: https://gitea.YOURDOMAIN.com"
echo ""
echo "🔧 Useful Commands:"
echo "  - Status: sudo systemctl status cloudflared"
echo "  - Logs: sudo journalctl -u cloudflared -f"
echo "  - Restart: sudo systemctl restart cloudflared"
echo "  - Manual run: cloudflared tunnel run ${TUNNEL_NAME}"
echo "  - List tunnels: cloudflared tunnel list"
echo ""
echo "📝 Next Steps:"
echo "  1. Edit $CLOUDFLARED_DIR/config.yml and replace YOURDOMAIN.com"
echo "  2. Configure DNS: cloudflared tunnel route dns ${TUNNEL_NAME} gitea.YOUR DOMAIN.com"
echo "  3. Restart service: sudo systemctl restart cloudflared"
echo "  4. Test access: https://gitea.YOURDOMAIN.com"
echo "  5. (Optional) Run Tailscale setup: ./03-tailscale-setup.sh"
