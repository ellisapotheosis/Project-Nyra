#!/usr/bin/env bash
set -euo pipefail

AUTHKEY="${TAILSCALE_AUTHKEY:-}"

if ! command -v tailscale >/dev/null 2>&1; then
  echo "Installing Tailscale..."
  curl -fsSL https://tailscale.com/install.sh | sh
fi

systemctl enable --now tailscaled

if [[ -n "${AUTHKEY}" ]]; then
  tailscale up --auth-key="${AUTHKEY}" --hostname="$(hostname)" || true
else
  echo "TAILSCALE_AUTHKEY not set; run 'tailscale up' manually if needed."
fi

tailscale status | head -n 30 || true
