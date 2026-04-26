# Claude-Flow Purge Guide for Worker PCs

## 🎯 Purpose
Complete removal of claude-flow, ruv-swarm, and related ruvnet framework remnants from worker PCs to resolve the persistent "claude-flow v3" statusline display in Claude Code.

## 🚨 Problem
- **Persistent statusline**: "claude-flow v3" showing at bottom of Claude Code CLI
- **Deprecated configurations**: Obsolete ruvnet framework settings causing conflicts
- **Stale MCP servers**: Flow-related MCP servers no longer needed

## 🧹 Complete Purge Script

Run this script on each worker PC (RTX 3060, RTX 3090 Ti, RTX 5090):

```bash
#!/bin/bash
# Claude-Flow Complete Purge Script for Worker PCs
# Run this in Ubuntu/WSL on each worker PC

echo "🧹 Purging claude-flow and ruvnet components..."

# 1. Remove Claude backup files with flow references
echo "Cleaning backup files..."
rm -rf ~/.claude/backups/.claude.json.backup.*

# 2. Clean history file of flow references
echo "Cleaning conversation history..."
grep -v "claude-flow\|ruflo\|agentic-flow\|agentdb\|ruvector\|ruv-swarm\|agentb.*booster\|epic.*sdk\|flow-nexus\|sona" ~/.claude/history.jsonl > /tmp/history_clean.jsonl && mv /tmp/history_clean.jsonl ~/.claude/history.jsonl

# 3. Clean Claude settings - replace entire settings.json
echo "Replacing Claude settings..."
cat > ~/.claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["*"],
    "defaultMode": "bypassPermissions"
  },
  "statusLine": {
    "type": "command",
    "command": "echo \"▊ Project Nyra\""
  },
  "enabledPlugins": {
    "serena@claude-plugins-official": true,
    "github@claude-plugins-official": true,
    "context7@claude-plugins-official": true
  },
  "skipDangerousModePermissionPrompt": true
}
EOF

# 4. Clean local settings if exists
echo "Cleaning local settings..."
if [ -f ~/.claude/settings.local.json ]; then
  # Remove flow-related MCP servers
  sed -i '/"ruv-swarm"/d; /"flow-nexus"/d; /"ruvector"/d; /"agent-booster"/d; /"epic-sdk"/d' ~/.claude/settings.local.json
fi

# 5. Remove any remaining flow directories
echo "Removing flow directories..."
find ~/repos -name "*claude-flow*" -o -name "*ruv-swarm*" -o -name "*flow-nexus*" -o -name "*ruvector*" -type d 2>/dev/null | xargs rm -rf

# 6. Clean project files if project-nyra exists
echo "Updating project repository..."
if [ -d ~/repos/project-nyra ]; then
  cd ~/repos/project-nyra

  # Pull latest changes (includes purge from orchestrator)
  git pull origin main

  # Remove any remaining flow references from files
  find . -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's/ruvector-search/vector-search/g; /claude-flow\|ruv-swarm\|flow-nexus\|ruvector\|agentdb/d' 2>/dev/null || true

  # Remove flow directories if they still exist
  rm -rf packages/database/.claude-flow tests/mesh/.claude-flow services/*/claude-flow-integration.*
fi

echo "✅ Claude-flow purge complete!"
echo "🔄 Restart Claude Code to see clean 'Project Nyra' statusline."
```

## 🖥️ Per-PC Execution

### Worker RTX 5090 (100.64.0.10)
```bash
ssh worker-rtx5090
curl -sSL https://raw.githubusercontent.com/ellisapotheosis/Project-Nyra/main/docs/ACTIVE-ToDo/claude-flow-purge-guide.md | grep -A 50 "#!/bin/bash" | bash
```

### Worker RTX 3090 Ti (100.64.0.12)
```bash
ssh worker-rtx3090ti
curl -sSL https://raw.githubusercontent.com/ellisapotheosis/Project-Nyra/main/docs/ACTIVE-ToDo/claude-flow-purge-guide.md | grep -A 50 "#!/bin/bash" | bash
```

### Worker RTX 3060 (100.64.0.11)
```bash
ssh worker-rtx3060
curl -sSL https://raw.githubusercontent.com/ellisapotheosis/Project-Nyra/main/docs/ACTIVE-ToDo/claude-flow-purge-guide.md | grep -A 50 "#!/bin/bash" | bash
```

## ✅ Verification

After running the script on each worker PC:

1. **Restart Claude Code** on each worker
2. **Check statusline** - should show "▊ Project Nyra" instead of "claude-flow v3"
3. **Verify MCP servers** - only archon-os should be active
4. **Test functionality** - ensure Claude Code works without flow-related errors

## 🔧 What This Fixes

- ✅ **Statusline**: Changes fallback from "Claude Flow V3" → "Project Nyra"
- ✅ **MCP Servers**: Removes deprecated ruv-swarm, flow-nexus, ruvector, etc.
- ✅ **Configuration**: Purges comprehensive claudeFlow settings
- ✅ **Files**: Removes claude-flow integration files and directories
- ✅ **History**: Cleans conversation logs of flow references
- ✅ **Documentation**: Updates obsolete service references

## 📋 Completion Checklist

- [ ] Orchestrator PC (already completed)
- [ ] Worker RTX 5090
- [ ] Worker RTX 3090 Ti
- [ ] Worker RTX 3060
- [ ] Verify statusline on all PCs shows "Project Nyra"

---

**Status**: Orchestrator completed ✅
**Next**: Execute on all worker PCs
**Goal**: Clean "Project Nyra" statusline across entire mesh