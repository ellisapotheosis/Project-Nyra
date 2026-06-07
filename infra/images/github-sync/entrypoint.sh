#!/bin/bash
# ============================================================================
# GitHub Sync Service Entrypoint
# ============================================================================
# Sets up environment and starts the synchronization service
# ============================================================================

set -euo pipefail

# Create required directories
mkdir -p /data/repos /logs

# Set up logging
exec > >(tee -a /logs/entrypoint.log)
exec 2>&1

echo "🚀 Starting GitHub Sync Service"
echo "================================"
echo "Timestamp: $(date -Iseconds)"
echo "Sync Interval: ${SYNC_INTERVAL:-300}s"
echo "Sync Direction: ${SYNC_DIRECTION:-bidirectional}"
echo "Conflict Resolution: ${CONFLICT_RESOLUTION:-gitea_wins}"
echo ""

# Wait for secret files to be available
echo "📋 Checking for required secrets..."
REQUIRED_SECRETS=(
    "/run/nyra-secrets/github_token"
    "/run/nyra-secrets/gitea_orchestrator_token"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    timeout=60
    while [ $timeout -gt 0 ] && [ ! -f "$secret" ]; do
        echo "Waiting for secret: $secret"
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ ! -f "$secret" ]; then
        echo "❌ Required secret not found: $secret"
        exit 1
    fi

    echo "✅ Found secret: $secret"
done

# Set up git configuration
echo "📝 Configuring Git..."
git config --global user.name "Nyra Sync Service"
git config --global user.email "sync@ratehunter.com"
git config --global pull.rebase false
git config --global init.defaultBranch main

# Test connectivity
echo "🌐 Testing connectivity..."
if curl -s --connect-timeout 10 https://api.github.com/rate_limit > /dev/null; then
    echo "✅ GitHub API accessible"
else
    echo "⚠️ GitHub API not accessible (may affect sync)"
fi

if [ -n "${SOURCE_GITEA_URL:-}" ]; then
    if curl -s --connect-timeout 10 "${SOURCE_GITEA_URL}/api/v1/version" > /dev/null; then
        echo "✅ Source Gitea accessible"
    else
        echo "⚠️ Source Gitea not accessible"
    fi
fi

# Start the service
echo "🎬 Starting sync service..."
exec python3 /app/sync-service.py