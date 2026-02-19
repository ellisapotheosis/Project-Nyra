#!/bin/bash
# infra/scripts/infra-cleanup.sh

cd ~/projects/project-nyra

echo "🧹 Starting infrastructure cleanup..."

# Create archive directories
mkdir -p _infra-archived/old-configs
mkdir -p _infra-archived/deprecated

# Archive old files
find infra -maxdepth 2 -type f \( \
    -name "*.old" -o \
    -name "*.bak" -o \
    -name "*.backup" -o \
    -name "*_old*" \
\) -exec mv {} _infra-archived/old-configs/ \; 2>/dev/null

# Create new structure
mkdir -p infra/docker/{orchestrator,worker-rtx3060,worker-rtx5090,worker-rtx3090ti}
mkdir -p infra/cloudflared
mkdir -p infra/tailscale
mkdir -p infra/scripts

echo "✅ Cleanup complete"
