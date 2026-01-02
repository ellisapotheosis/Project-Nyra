#!/bin/bash
# Setup Upstream Remote for Claude-Flow
# Configures upstream repository for syncing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
UPSTREAM_URL="https://github.com/ruvnet/claude-flow.git"

echo "🔗 Setting up upstream remote for Claude-Flow"
echo "=============================================="

cd "$PROJECT_ROOT"

# Check if upstream exists
if git remote get-url upstream &>/dev/null; then
    CURRENT_UPSTREAM=$(git remote get-url upstream)
    echo "ℹ️  Upstream already configured: $CURRENT_UPSTREAM"

    # Verify it's the correct upstream
    if [ "$CURRENT_UPSTREAM" != "$UPSTREAM_URL" ]; then
        echo "⚠️  Current upstream differs from expected"
        echo "   Current:  $CURRENT_UPSTREAM"
        echo "   Expected: $UPSTREAM_URL"
        read -p "Update upstream URL? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git remote set-url upstream "$UPSTREAM_URL"
            echo "✓ Updated upstream URL"
        fi
    fi
else
    git remote add upstream "$UPSTREAM_URL"
    echo "✓ Added upstream remote: $UPSTREAM_URL"
fi

# Configure fetch settings
echo "⚙️  Configuring fetch settings..."
git config remote.upstream.fetch "+refs/heads/*:refs/remotes/upstream/*"

# Fetch upstream branches
echo "📥 Fetching upstream branches..."
git fetch upstream

# Show upstream branches
echo ""
echo "📋 Available upstream branches:"
git branch -r | grep "upstream/" | sed 's/.*upstream\//  - /'

echo ""
echo "✅ Upstream setup complete!"
echo ""
echo "Remote configuration:"
git remote -v | grep "upstream"
echo ""
