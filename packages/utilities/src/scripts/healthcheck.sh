#!/bin/bash
# scripts/healthcheck.sh - Non-UI Integration Health Check

echo "🔍 Checking Project Nyra Infrastructure Health..."

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running."
  exit 1
fi

# Check Tailscale
if ! tailscale status > /dev/null 2>&1; then
  echo "⚠️ Tailscale is not running or not authenticated."
fi

# Check Common Services (Real Port Checks)
# Orchestrator
check_port() {
  local host=$1
  local port=$2
  local name=$3
  if timeout 1 bash -c "cat < /dev/null > /dev/tcp/$host/$port" 2>/dev/null; then
    echo "✅ $name ($host:$port) is REACHABLE"
  else
    echo "❌ $name ($host:$port) is UNREACHABLE"
  fi
}

echo "--- Local Orchestrator ---"
check_port "localhost" 5432 "Postgres"
check_port "localhost" 6379 "Redis"
check_port "localhost" 4000 "LiteLLM"
check_port "localhost" 6000 "Nexus Router"

echo "--- AI Fleet (Tailscale) ---"
check_port "worker-rtx5090.trex-fiordland.ts.net" 8001 "5090 OpenClaw"
check_port "worker-rtx5090.trex-fiordland.ts.net" 18789 "5090 Nerve UI"
check_port "worker-rtx3090ti.trex-fiordland.ts.net" 8001 "3090 Ti OpenClaw"
check_port "worker-rtx3090ti.trex-fiordland.ts.net" 18789 "3090 Ti Nerve UI"
check_port "worker-rtx3060.trex-fiordland.ts.net" 8002 "3060 PicoClaw"
check_port "worker-rtx3060.trex-fiordland.ts.net" 18789 "3060 Nerve UI"

echo "🎉 Network verification complete."
