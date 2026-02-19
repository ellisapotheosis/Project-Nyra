#!/bin/bash
set -e

echo "🔧 Configuring WSL DNS (Cloudflare)"

# Prevent WSL from overwriting resolv.conf
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[network]
generateResolvConf = false
EOF

# Set Cloudflare DNS explicitly
sudo tee /etc/resolv.conf > /dev/null <<'EOF'
nameserver 1.1.1.1
nameserver 1.0.0.1
options timeout:1 attempts:3 rotate
EOF

sudo chattr +i /etc/resolv.conf || true

echo "✅ WSL DNS locked to Cloudflare"
echo "⚠️  Run 'wsl --shutdown' from Windows to apply"
