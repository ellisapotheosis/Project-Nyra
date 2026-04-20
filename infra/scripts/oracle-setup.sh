#!/bin/bash
# infra/scripts/oracle-setup.sh
# Bootstrap an Oracle Always Free Ampere instance for hosting Nyra services.
#
# !! THIS SCRIPT MUST BE RUN ON THE ORACLE VPS ITSELF VIA SSH — NOT LOCALLY !!
#
#   ssh ubuntu@<oracle-ip> "bash -s" < infra/scripts/oracle-setup.sh
#
# Running it locally will install packages on your local machine. To prevent
# that, this script aborts if it cannot detect an Oracle Cloud environment.

set -euo pipefail

# ── Safety guard ─────────────────────────────────────────────────────────────
# Abort if we appear to be running locally (not on an OCI instance).
# OCI sets a recognizable DMI product name; WSL / desktop Linux does not.
if ! grep -qi "oracle" /sys/class/dmi/id/chassis_vendor 2>/dev/null && \
   ! grep -qi "oraclecloud" /etc/hostname 2>/dev/null && \
   ! curl -sf --max-time 2 http://169.254.169.254/opc/v2/instance/ > /dev/null 2>&1; then
  echo ""
  echo "ERROR: This script is for the Oracle VPS only."
  echo "It does NOT run on your local machine."
  echo ""
  echo "Usage — run on the remote host via SSH:"
  echo "  ssh ubuntu@<oracle-public-ip> 'bash -s' < infra/scripts/oracle-setup.sh"
  echo ""
  exit 1
fi

echo "[Nyra] Starting Oracle VPS setup..."

# ── 1. Update and install Docker (skip if already present) ───────────────────
if ! command -v docker &>/dev/null; then
  sudo apt-get update -y
  sudo apt-get install -y docker.io docker-compose-plugin curl gnupg lsb-release
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
  echo "[Nyra] Docker installed."
else
  echo "[Nyra] Docker already present ($(docker --version)), skipping install."
fi

# ── 2. Tailscale — only install+register if not already on the tailnet ───────
# The oracle VPS should already be registered as oracle.trex-fiordland.ts.net.
# This block only runs if tailscale is missing entirely (fresh VM).
if ! command -v tailscale &>/dev/null; then
  echo "[Nyra] Tailscale not found. Installing..."
  curl -fsSL https://tailscale.com/install.sh | sudo sh
  # Auth key must be provided as env var — never hardcoded.
  if [[ -z "${TAILSCALE_AUTHKEY:-}" ]]; then
    echo ""
    echo "WARNING: Tailscale installed but NOT activated."
    echo "Set TAILSCALE_AUTHKEY and re-run, or run manually:"
    echo "  sudo tailscale up --authkey <key> --hostname oracle"
    echo ""
  else
    sudo tailscale up --authkey "${TAILSCALE_AUTHKEY}" --hostname oracle
    echo "[Nyra] Tailscale activated as oracle."
  fi
else
  TS_STATUS=$(tailscale status --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('BackendState','unknown'))" 2>/dev/null || echo "unknown")
  echo "[Nyra] Tailscale already present (state: ${TS_STATUS}), skipping install."
fi

# ── 3. Create data directories for persistent volumes ────────────────────────
sudo mkdir -p /data/nyra/{postgres,redis,falkordb,prometheus,grafana,loki,n8n,activepieces,letta,gitea}
sudo chown -R "$USER:$USER" /data/nyra
echo "[Nyra] Data directories ready at /data/nyra."

# ── 4. Ensure current user is in docker group ────────────────────────────────
if ! groups "$USER" | grep -q docker; then
  sudo usermod -aG docker "$USER"
  echo "[Nyra] Added $USER to docker group. Re-login or run: newgrp docker"
fi

echo ""
echo "[Nyra] Oracle VPS is ready."
echo "Next: copy infra/hosts/oracle-vps/ to the VM and fill .env.oracle, then:"
echo "  docker compose -f docker-compose.oracle.yml --env-file .env.oracle up -d"

