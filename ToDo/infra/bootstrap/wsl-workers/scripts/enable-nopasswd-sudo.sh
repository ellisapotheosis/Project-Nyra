#!/usr/bin/env bash
set -euo pipefail
echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/$USER" >/dev/null
sudo chmod 0440 "/etc/sudoers.d/$USER"
echo "✅ Enabled passwordless sudo for $USER (WSL)."
echo "⚠️  This is powerful and risky. Remove with:"
echo "  sudo rm -f /etc/sudoers.d/$USER"
