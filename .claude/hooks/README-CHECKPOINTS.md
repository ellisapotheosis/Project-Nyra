# Claude Flow V3 - Checkpoint & Autosave System

Automatic session checkpointing and state recovery for Project Nyra.

## ✨ Features

### 1. **Automatic Session Autosave**
- **On Session End**: Automatically saves state when Claude Code session ends
- **On Stop**: Gracefully saves before daemon shutdown
- **Session Restore**: Automatically restores previous session on startup

### 2. **Periodic Checkpoints** (Every 15 minutes)
- Auto-saves session state, memory, and git status
- Backs up memory databases (`.claude/memory.db`, `.swarm/memory.db`)
- Stores checkpoint metadata with timestamp and git info

### 3. **Manual Checkpointing**
- Create checkpoints anytime with custom names
- List all available checkpoints
- Restore from any checkpoint

## 🚀 Usage

### Manual Checkpoint Creation
```bash
# Create checkpoint with custom name
.claude/hooks/checkpoint.sh "before-major-refactor"

# Create checkpoint with auto-generated timestamp
.claude/hooks/checkpoint.sh
```

### Restore from Checkpoint
```bash
# Restore latest checkpoint
.claude/hooks/restore-checkpoint.sh latest

# Restore specific checkpoint
.claude/hooks/restore-checkpoint.sh "before-major-refactor"

# List all available checkpoints
.claude/hooks/restore-checkpoint.sh list
```

### Using CLI Commands
```bash
# Save current session
npx @archon-os/cli@latest session save --name "my-checkpoint" --include-memory true

# List saved sessions
npx @archon-os/cli@latest session list

# Restore session
npx @archon-os/cli@latest session restore --name "my-checkpoint"

# Restore latest session
npx @archon-os/cli@latest session restore --latest
```

## 📁 Storage Locations

### Session Data
- **CLI Sessions**: Stored in Claude Flow's session manager
- **Memory Checkpoints**: `.claude/memory.db` and `.swarm/memory.db`
- **Checkpoint Metadata**: Stored in memory namespace `checkpoints`

### Backups
- **Memory Backups**: `.claude/backups/memory-[checkpoint-name].db`
- **Swarm Backups**: `.swarm/backups/swarm-[checkpoint-name].db`

## 🔧 Configuration

Checkpointing is configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionEnd": [/* Saves on session end */],
    "Stop": [/* Saves on stop */]
  },
  "claudeFlow": {
    "daemon": {
      "schedules": {
        "checkpoint": {
          "interval": "15m",  // Checkpoint every 15 minutes
          "priority": "high",
          "enabled": true
        }
      }
    }
  }
}
```

### Adjust Checkpoint Interval
Edit `.claude/settings.json` and change the `checkpoint.interval`:
- `"10m"` - Every 10 minutes
- `"30m"` - Every 30 minutes
- `"1h"` - Every hour

## 📊 What Gets Saved

### Session State
- Active tasks and their status
- Spawned agents and their state
- Memory entries and namespaces
- Git branch, uncommitted changes, last commit
- Learning metrics and patterns

### Metadata
- Session start/end time
- Working directory
- Task execution summary
- Commands executed
- Files modified
- Agents spawned

## 🔄 Automatic Behaviors

### On Session Start (Configured)
1. Start daemon workers
2. Attempt to restore previous session (if `SESSION_ID` available)
3. Initialize memory and agent pools

### On Session End (NEW - Configured)
1. Save current session state with metrics
2. Export learning metrics
3. Store checkpoint metadata
4. Gracefully stop daemon

### Every 15 Minutes (NEW - Configured)
1. Auto-checkpoint with timestamp
2. Backup memory databases
3. Store git state snapshot

## 💡 Best Practices

### Before Major Changes
```bash
.claude/hooks/checkpoint.sh "before-$(git branch --show-current)-changes"
```

### Daily Checkpoints
```bash
.claude/hooks/checkpoint.sh "daily-$(date +%Y%m%d)"
```

### Before Testing Risky Operations
```bash
.claude/hooks/checkpoint.sh "pre-experiment"
# ... do risky stuff ...
# If something breaks:
.claude/hooks/restore-checkpoint.sh "pre-experiment"
```

## 🐛 Troubleshooting

### Checkpoints Not Working
```bash
# Check daemon status
npx @archon-os/cli@latest daemon status

# Manually save session
npx @archon-os/cli@latest session save --name "manual-test"

# Check memory store
npx @archon-os/cli@latest memory list --namespace checkpoints
```

### Restore Not Working
```bash
# List available sessions
npx @archon-os/cli@latest session list

# Check backup files
ls -lh .claude/backups/
ls -lh .swarm/backups/
```

### Daemon Issues
```bash
# Restart daemon
npx @archon-os/cli@latest daemon stop
npx @archon-os/cli@latest daemon start

# Check logs
npx @archon-os/cli@latest daemon status --verbose
```

## 📝 Notes

- Automatic checkpoints are stored with names like `auto-1430` (auto-generated timestamp)
- Manual checkpoints use your custom name or `checkpoint-20260127-143012` format
- Checkpoint metadata is searchable via memory CLI
- Old checkpoints are NOT automatically deleted (manual cleanup required)

## 🔗 Related Commands

```bash
# Memory operations
npx @archon-os/cli@latest memory search --query "checkpoint" --namespace checkpoints

# Session operations
npx @archon-os/cli@latest session list
npx @archon-os/cli@latest session info --session-id [id]

# Daemon operations
npx @archon-os/cli@latest daemon start
npx @archon-os/cli@latest daemon status
npx @archon-os/cli@latest hooks worker status
```

## ⚙️ Advanced Configuration

### Disable Auto-Checkpointing
Edit `.claude/settings.json`:
```json
{
  "claudeFlow": {
    "daemon": {
      "schedules": {
        "checkpoint": {
          "enabled": false  // Disable auto-checkpoints
        }
      }
    }
  }
}
```

### Custom Checkpoint Logic
You can customize the checkpoint script at `.claude/hooks/checkpoint.sh` to:
- Add custom metadata
- Trigger specific backups
- Integrate with external systems
- Send notifications

---

**Created**: 2026-01-27
**Version**: 1.0
**Project**: Nyra (Claude Flow V3)
