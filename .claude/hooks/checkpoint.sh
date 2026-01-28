#!/bin/bash
# Claude Flow V3 - Session Checkpoint Script
# Saves current session state for recovery
# Usage: .claude/hooks/checkpoint.sh [session-name]

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Get session name (default to timestamp)
SESSION_NAME="${1:-checkpoint-$(date +%Y%m%d-%H%M%S)}"

echo "📸 Creating checkpoint: $SESSION_NAME"

# Capture current state
TIMESTAMP=$(date -Iseconds)
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
GIT_UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l || echo "0")
GIT_LAST_COMMIT=$(git log -1 --format="%H" 2>/dev/null || echo "none")

# Save session via CLI
echo "  ├─ Saving session state..."
npx @claude-flow/cli@latest session save \
  --name "$SESSION_NAME" \
  --include-memory true \
  --include-tasks true \
  --include-agents true \
  2>/dev/null || {
    echo "  └─ ⚠️  CLI session save failed, using memory fallback"
  }

# Store checkpoint metadata in memory
echo "  ├─ Storing checkpoint metadata..."
npx @claude-flow/cli@latest memory store \
  --namespace checkpoints \
  --key "$SESSION_NAME" \
  --value "{
    \"timestamp\": \"$TIMESTAMP\",
    \"gitBranch\": \"$GIT_BRANCH\",
    \"uncommittedChanges\": $GIT_UNCOMMITTED,
    \"lastCommit\": \"$GIT_LAST_COMMIT\",
    \"sessionName\": \"$SESSION_NAME\"
  }" \
  2>/dev/null || {
    echo "  └─ ⚠️  Memory store failed"
  }

# Save memory database checkpoint
if [ -f ".claude/memory.db" ]; then
  echo "  ├─ Backing up memory database..."
  mkdir -p ".claude/backups"
  cp ".claude/memory.db" ".claude/backups/memory-$SESSION_NAME.db"
  echo "  └─ ✓ Memory backed up to .claude/backups/memory-$SESSION_NAME.db"
fi

# Save swarm state if exists
if [ -f ".swarm/memory.db" ]; then
  echo "  ├─ Backing up swarm state..."
  mkdir -p ".swarm/backups"
  cp ".swarm/memory.db" ".swarm/backups/swarm-$SESSION_NAME.db"
  echo "  └─ ✓ Swarm backed up to .swarm/backups/swarm-$SESSION_NAME.db"
fi

# List recent checkpoints
echo ""
echo "📋 Recent checkpoints:"
npx @claude-flow/cli@latest memory list \
  --namespace checkpoints \
  --limit 5 \
  2>/dev/null | grep -E "^  " | tail -5 || echo "  (none)"

echo ""
echo "✅ Checkpoint created: $SESSION_NAME"
echo ""
echo "To restore this checkpoint:"
echo "  npx @claude-flow/cli@latest session restore --name \"$SESSION_NAME\""
echo ""
