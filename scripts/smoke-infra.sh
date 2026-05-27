#!/bin/bash
# Project Nyra — Infra Smoke Test
# Verifies connectivity across Tailscale mesh and Cloudflare ingress.

set -e

echo "--- NYRA INFRA SMOKE TEST ---"

# 1. Local Host Status
echo "[1/4] Checking local Tailscale status..."
if ! tailscale status > /dev/null 2>&1; then
  echo "❌ Tailscale is not running."
  exit 1
fi
echo "✅ Tailscale is active."

# 2. Host Resolution
echo "[2/4] Verifying host resolution..."
HOSTS=("orchestrator" "worker-rtx5090" "worker-rtx3090ti" "worker-rtx3060" "oracle-vps")
for host in "${HOSTS[@]}"; do
  if getent hosts "$host" > /dev/null; then
    echo "✅ Resolved $host"
  else
    echo "⚠️  Could not resolve $host via /etc/hosts"
  fi
done

# 3. Service Connectivity (Tailscale)
echo "[3/4] Testing service connectivity (Tailscale mesh)..."

# Nexus Router (Orchestrator)
if curl -s --max-time 3 http://orchestrator:7000/health > /dev/null; then
  echo "✅ Nexus Router (orchestrator:7000) is reachable."
else
  echo "⚠️  Nexus Router (orchestrator:7000) is unreachable."
fi

# TwentyCRM (Oracle VPS)
if curl -s --max-time 3 http://oracle-vps:3000/api/health > /dev/null; then
  echo "✅ TwentyCRM (oracle-vps:3000) is reachable."
else
  echo "⚠️  TwentyCRM (oracle-vps:3000) is unreachable."
fi

# 4. Public Ingress (Cloudflare)
echo "[4/4] Testing public ingress (Cloudflare)..."
PUBLIC_URLS=("https://api.ratehunter.net/health" "https://crm.ratehunter.net/api/health")
for url in "${PUBLIC_URLS[@]}"; do
  if curl -s --max-time 5 "$url" > /dev/null; then
    echo "✅ $url is reachable."
  else
    echo "⚠️  $url is unreachable."
  fi
done

echo "--- SMOKE TEST COMPLETE ---"
