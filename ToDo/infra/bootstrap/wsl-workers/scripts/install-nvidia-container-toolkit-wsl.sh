#!/usr/bin/env bash
set -euo pipefail
echo "=== Optional: NVIDIA Container Toolkit inside WSL ==="
echo "Use this ONLY if you plan to run Docker Engine inside WSL (not Docker Desktop)."
echo "Docker Desktop + WSL2 backend usually does not require this."

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

distribution=$(. /etc/os-release; echo ${ID}${VERSION_ID})
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -fsSL https://nvidia.github.io/libnvidia-container/${distribution}/libnvidia-container.list \
  | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
  | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list >/dev/null

sudo apt-get update -y
sudo apt-get install -y nvidia-container-toolkit || true

echo ""
echo "✅ Installed nvidia-container-toolkit."
echo "If using Docker Engine inside WSL:"
echo "  sudo nvidia-ctk runtime configure --runtime=docker"
echo "  (requires systemd + docker service restart)"
