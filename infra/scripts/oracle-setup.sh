#!/bin/bash
# This script outlines the steps to bootstrap an Oracle Always Free Ampere instance
# for hosting Nyra services.  Execute these commands manually via SSH or use
# them as a starting point for automation.  Do not run this script blindly.

set -euo pipefail

echo "[Nyra] Starting Oracle setup..."

# 1. Update and install dependencies
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose curl gnupg lsb-release

# 2. Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker

# 3. Install Tailscale and join your tailnet (replace AUTH_KEY)
curl -fsSL https://tailscale.com/install.sh | sudo sh
sudo tailscale up --authkey REPLACE_ME_TAILSCALE_AUTHKEY --hostname oracle

# 4. Create data directories for persistent volumes
sudo mkdir -p /data/nyra/{postgres,redis,falkordb,prometheus,grafana,loki,n8n,activepieces,letta,gitea}
sudo chown -R $USER:$USER /data/nyra

# 5. (Optional) Install cloudflared for reverse proxy (comment out if not using Cloudflare on Oracle)
# curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
# sudo dpkg -i cloudflared.deb

# 6. Pull images (optional – you can rely on compose to pull)
# docker pull grafbase/grafbase:latest
# docker pull archon-mcp/archon:latest
# ...

echo "[Nyra] Oracle host is ready.  Copy your docker-compose.oracle*.yml files and run the stack."
