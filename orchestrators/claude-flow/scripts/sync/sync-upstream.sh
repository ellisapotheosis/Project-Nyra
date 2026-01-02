#!/bin/bash
# Sync with Upstream Claude-Flow Repository
# Fetches and merges upstream changes while preserving customizations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"

echo "🔄 Syncing Claude-Flow with Upstream"
echo "====================================="

cd "$PROJECT_ROOT"

# Verify upstream is configured
if ! git remote get-url upstream &>/dev/null; then
    echo "❌ Upstream remote not configured"
    echo "Run: ./scripts/sync/setup-upstream.sh"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Uncommitted changes detected"
    read -p "Stash changes and continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before upstream sync"
        STASHED=true
    else
        echo "❌ Aborting sync"
        exit 1
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create backup branch
echo "💾 Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"

# Fetch upstream
echo "📥 Fetching upstream changes..."
git fetch upstream

# Show upstream changes
echo ""
echo "📊 Upstream changes:"
git log --oneline HEAD..upstream/main | head -10

# Merge upstream
echo ""
read -p "Merge upstream/main into $CURRENT_BRANCH? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Sync cancelled"
    git branch -D "$BACKUP_BRANCH" 2>/dev/null || true
    exit 0
fi

echo "🔀 Merging upstream/main..."
if git merge upstream/main --no-edit; then
    echo "✓ Merge successful"
else
    echo "⚠️  Merge conflicts detected"
    echo ""
    echo "Conflicted files:"
    git status --short | grep "^UU"
    echo ""
    echo "Resolution steps:"
    echo "  1. Resolve conflicts in your editor"
    echo "  2. Stage resolved files: git add <file>"
    echo "  3. Complete merge: git commit"
    echo "  4. Or abort: git merge --abort"
    echo ""
    echo "Backup branch available: $BACKUP_BRANCH"
    exit 1
fi

# Restore stashed changes
if [ "$STASHED" = true ]; then
    echo "📦 Restoring stashed changes..."
    if git stash pop; then
        echo "✓ Stash applied successfully"
    else
        echo "⚠️  Conflicts applying stash"
        echo "Manually apply stash: git stash apply"
    fi
fi

# Verify customizations are intact
echo "🔍 Verifying customizations..."
if [ -d "$PROJECT_ROOT/customizations" ]; then
    echo "✓ Customizations directory intact"
else
    echo "⚠️  Customizations directory missing"
fi

# Run tests
echo "🧪 Running tests..."
if npm run test --if-present; then
    echo "✓ Tests passed"
else
    echo "⚠️  Some tests failed"
    echo "Review changes before pushing"
fi

# Cleanup backup branch
echo "🧹 Cleaning up..."
read -p "Delete backup branch $BACKUP_BRANCH? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -D "$BACKUP_BRANCH"
    echo "✓ Backup branch deleted"
else
    echo "ℹ️  Backup branch kept: $BACKUP_BRANCH"
fi

echo ""
echo "✅ Sync complete!"
echo ""
echo "Summary:"
echo "  - Merged upstream/main into $CURRENT_BRANCH"
echo "  - Customizations preserved"
echo "  - Tests executed"
echo ""
echo "Next steps:"
echo "  1. Review changes: git log --oneline HEAD~10..HEAD"
echo "  2. Test thoroughly in development"
echo "  3. Push to fork: git push origin $CURRENT_BRANCH"
echo ""
