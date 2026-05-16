#!/bin/bash
# scripts/verify-clis.sh

# This script verifies that the required Project Nyra CLI tools are installed.

echo "🔍 Verifying Required CLI Tools..."

check_cli() {
  if command -v $1 &> /dev/null; then
    echo "✅ $1 is installed ($(which $1))"
  else
    echo "❌ $1 is NOT found in PATH"
  fi
}

echo "--- Foundation ---"
check_cli "pnpm"
check_cli "docker"
check_cli "infisical"
check_cli "tailscale"

echo "--- Orchestration & Subscription ---"
check_cli "rtk"
check_cli "jefe"      # @vybestack/llxprt-jefe
check_cli "codex"     # codex-cli
check_cli "gemini"    # gemini-cli

echo "--- Optional ---"
check_cli "make"
check_cli "jq"

echo "Done."
