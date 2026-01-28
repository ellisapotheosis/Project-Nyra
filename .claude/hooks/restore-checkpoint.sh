#!/bin/bash
# Claude Flow V3 - Restore Checkpoint Script
# Restores a saved session checkpoint
# Usage: .claude/hooks/restore-checkpoint.sh [session-name|latest]

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Get session name (default to latest)
SESSION_NAME="${1:-latest}"

echo "🔄 Restoring checkpoint: $SESSION_NAME"
echo ""

# List available checkpoints if requested
if [ "$SESSION_NAME" == "list" ]; then
  echo "📋 Available checkpoints:"
  echo ""

  # List from memory
  echo "From memory store:"
  npx @claude-flow/cli@latest memory list \
    --namespace checkpoints \
    --limit 10 \
    2>/dev/null || echo "  (none)"

  echo ""
  echo "From backups:"
  if [ -d ".claude/backups" ]; then
    ls -lht .claude/backups/ | grep "memory-" | head -10 || echo "  (none)"
  else
    echo "  (none)"
  fi

  echo ""
  echo "Usage: .claude/hooks/restore-checkpoint.sh [session-name|latest]"
  exit 0
fi

# Restore session via CLI
echo "  ├─ Restoring session state..."
if [ "$SESSION_NAME" == "latest" ]; then
  npx @claude-flow/cli@latest session restore --latest 2>/dev/null || {
    echo "  └─ ⚠️  No recent session found"
  }
else
  npx @claude-flow/cli@latest session restore --name "$SESSION_NAME" 2>/dev/null || {
    echo "  └─ ⚠️  Session not found: $SESSION_NAME"
  }
fi

# Retrieve checkpoint metadata
echo "  ├─ Loading checkpoint metadata..."
METADATA=$(npx @claude-flow/cli@latest memory retrieve \
  --namespace checkpoints \
  --key "$SESSION_NAME" \
  2>/dev/null || echo "{}")

if [ "$METADATA" != "{}" ]; then
  echo "  └─ ✓ Checkpoint metadata loaded"
  echo ""
  echo "📊 Checkpoint Info:"
  echo "$METADATA" | jq . 2>/dev/null || echo "$METADATA"
else
  echo "  └─ ⚠️  No metadata found"
fi

# Restore memory database if backup exists
if [ "$SESSION_NAME" != "latest" ] && [ -f ".claude/backups/memory-$SESSION_NAME.db" ]; then
  echo ""
  read -p "📦 Restore memory database from backup? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ├─ Backing up current memory..."
    cp ".claude/memory.db" ".claude/memory.db.backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    echo "  ├─ Restoring memory database..."
    cp ".claude/backups/memory-$SESSION_NAME.db" ".claude/memory.db"
    echo "  └─ ✓ Memory database restored"
  fi
fi

# Restore swarm state if backup exists
if [ "$SESSION_NAME" != "latest" ] && [ -f ".swarm/backups/swarm-$SESSION_NAME.db" ]; then
  echo ""
  read -p "🐝 Restore swarm state from backup? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ├─ Backing up current swarm state..."
    cp ".swarm/memory.db" ".swarm/memory.db.backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    echo "  ├─ Restoring swarm state..."
    cp ".swarm/backups/swarm-$SESSION_NAME.db" ".swarm/memory.db"
    echo "  └─ ✓ Swarm state restored"
  fi
fi

echo ""
echo "✅ Checkpoint restored: $SESSION_NAME"
echo ""
echo "💡 Tips:"
echo "  • Check git status for uncommitted changes"
echo "  • Review .claude/memory.db for session data"
echo "  • Use 'npx @claude-flow/cli@latest session list' to see all sessions"
echo ""
