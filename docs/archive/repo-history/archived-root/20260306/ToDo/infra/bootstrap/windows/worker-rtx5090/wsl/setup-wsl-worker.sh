#!/usr/bin/env bash
set -euo pipefail

echo "=== Nyra WSL setup (Ubuntu) ==="
echo "This configures helpful tools and (optionally) NVIDIA container toolkit for WSL-native Docker."

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release jq git

# Quick GPU check (requires NVIDIA driver on Windows with WSL support)
echo "-> Checking GPU inside WSL (nvidia-smi)"
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi || true
else
  echo "⚠️ nvidia-smi not found in WSL."
  echo "If you're using Docker Desktop, that's often OK as long as containers can access GPU."
fi

# Optional: enable systemd (handy for services like tailscaled INSIDE WSL)
# We will NOT force this; just print instructions.
echo ""
echo "Systemd note:"
echo "  If you want Linux services to auto-start in WSL, enable systemd with:"
echo "    sudo tee /etc/wsl.conf >/dev/null <<'EOF'"
echo "    [boot]"
echo "    systemd=true"
echo "    EOF"
echo "  Then run in Windows PowerShell: wsl --shutdown"

# NVIDIA Container Toolkit (ONLY if you plan to run Docker Engine inside WSL).
# Docker Desktop users typically do NOT need this, but you asked for it — so we install it safely.
echo ""
echo "-> Installing NVIDIA Container Toolkit (safe even if unused)"
distribution=$(. /etc/os-release; echo ${ID}${VERSION_ID})
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -fsSL https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list \
  | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
  | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list >/dev/null

sudo apt-get update -y
sudo apt-get install -y nvidia-container-toolkit || true

echo ""
echo "✅ WSL setup done."
echo "If you run Docker Engine inside WSL, configure it with: sudo nvidia-ctk runtime configure --runtime=docker"
echo "and restart docker service (systemd required)."
