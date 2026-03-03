#!/bin/bash
# setup_tailscale.sh – helper script to install and join Tailscale on a
# Linux/WSL host.  Set TS_AUTHKEY to a reusable auth key generated from
# your Tailscale admin console.  Optionally set HOSTNAME_SUFFIX to
# differentiate this machine in the tailnet (e.g. rtx5090).

set -e

if [ -z "$TS_AUTHKEY" ]; then
  echo "ERROR: TS_AUTHKEY environment variable must be set"
  echo "Generate a reusable auth key from the Tailscale admin portal and run:"
  echo "  TS_AUTHKEY=tskey-xxxxxxxx ./setup_tailscale.sh"
  exit 1
fi

echo "[+] Installing Tailscale…"
curl -fsSL https://tailscale.com/install.sh | sh

HOSTNAME_SUFFIX=${HOSTNAME_SUFFIX:-nyra-worker}
HOSTNAME="$(hostname)-$HOSTNAME_SUFFIX"

echo "[+] Bringing up Tailscale…"
sudo tailscale up --authkey "$TS_AUTHKEY" --hostname "$HOSTNAME" --accept-routes --reset

echo "[+] Tailscale status:"
sudo tailscale status