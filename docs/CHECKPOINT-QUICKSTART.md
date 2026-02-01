# Checkpoint & Autosave - Quick Start Guide

## ✅ What's Been Configured

Your Claude Flow V3 setup now includes:

### 1. **Automatic Session Autosave**
- **On every session end**: Saves state, metrics, and memory
- **On daemon stop**: Graceful shutdown with state preservation
- **On session start**: Attempts to restore previous session

### 2. **Periodic Auto-Checkpoints** (Every 15 minutes)
- Runs in background via daemon worker
- Saves: session state, memory DBs, git status, metadata
- No interruption to your work

### 3. **Manual Checkpoint Tools**
- Create named checkpoints anytime
- Restore from any checkpoint
- List and browse all checkpoints

## 🚀 Quick Commands

### Create Checkpoint
```bash
# Named checkpoint
.claude/hooks/checkpoint.sh "before-big-change"

# Auto-named checkpoint (timestamp)
.claude/hooks/checkpoint.sh
```

### Restore Checkpoint
```bash
# Restore latest
.claude/hooks/restore-checkpoint.sh latest

# Restore specific
.claude/hooks/restore-checkpoint.sh "before-big-change"

# List all
.claude/hooks/restore-checkpoint.sh list
```

### Session Management (CLI)
```bash
# List sessions
npx @claude-flow/cli@latest session list

# Save session
npx @claude-flow/cli@latest session save --name "my-work"

# Restore session
npx @claude-flow/cli@latest session restore --name "my-work"
```

## 📁 Where Everything Is Stored

| What | Location |
|------|----------|
| Session state | Claude Flow internal storage |
| Memory backups | `.claude/backups/memory-*.db` |
| Swarm backups | `.swarm/backups/swarm-*.db` |
| Checkpoint metadata | Memory namespace `checkpoints` |

## 🔧 Configuration Files

- **Hooks**: `.claude/settings.json` (SessionStart, SessionEnd, Stop hooks)
- **Daemon schedules**: `.claude/settings.json` (15min checkpoint worker)
- **Scripts**: `.claude/hooks/checkpoint.sh` and `.claude/hooks/restore-checkpoint.sh`
- **Documentation**: `.claude/hooks/README-CHECKPOINTS.md`

## 🎯 Common Workflows

### Before Major Refactor
```bash
.claude/hooks/checkpoint.sh "pre-refactor-$(git branch --show-current)"
# Do your refactor work...
# If needed:
.claude/hooks/restore-checkpoint.sh "pre-refactor-main"
```

### Daily Backup
```bash
.claude/hooks/checkpoint.sh "daily-backup"
```

### After Successful Changes
```bash
# Checkpoint is auto-created every 15 minutes
# OR manually:
.claude/hooks/checkpoint.sh "working-state"
```

## 🐛 Troubleshooting

### Check if daemon is running
```bash
npx @claude-flow/cli@latest daemon status
```

### Manually trigger checkpoint
```bash
.claude/hooks/checkpoint.sh "manual-test"
```

### View checkpoint metadata
```bash
npx @claude-flow/cli@latest memory list --namespace checkpoints
```

### Check backups
```bash
ls -lh .claude/backups/
ls -lh .swarm/backups/
```

## 📚 Full Documentation

- **Checkpoints**: `.claude/hooks/README-CHECKPOINTS.md`
- **Claude Flow V3**: `~/projects/claude-flow/README.md`
- **Hooks System**: `~/projects/claude-flow/CLAUDE.md`
- **Project Config**: `./CLAUDE.md`

## ⚙️ Adjust Settings

Edit `.claude/settings.json` to:
- Change checkpoint interval (currently 15 minutes)
- Disable auto-checkpoints
- Customize hooks behavior

```json
{
  "claudeFlow": {
    "daemon": {
      "schedules": {
        "checkpoint": {
          "interval": "15m",  // ← Change this
          "enabled": true     // ← Or disable
        }
      }
    }
  }
}
```

---

**Setup Date**: 2026-01-27
**Project**: Nyra
**Status**: ✅ Active & Tested
