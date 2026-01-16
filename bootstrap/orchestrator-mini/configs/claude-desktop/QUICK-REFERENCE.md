# Claude Desktop Quick Reference Card

## 🚀 One-Time Setup

```bash
# 1. Install Claude Desktop
Download from: https://claude.ai/download

# 2. Run setup script
cd /path/to/Project-Nyra
bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh

# 3. Restart Claude Desktop
# Quit completely and restart

# 4. Validate setup
bash bootstrap/orchestrator-mini/scripts/validate-claude-setup.sh
```

## 📁 Configuration Locations

| OS | Path |
|----|------|
| **Linux/macOS** | `~/.config/claude/` |
| **Windows** | `%APPDATA%\Claude\` |
| **WSL** | Run Claude on Windows host |

**Files**:
- `claude_desktop_config.json` (required)
- `custom_instructions.txt` (optional)
- `workspace_settings.json` (optional)

## 🔧 Essential Commands

### Claude Flow CLI

```bash
# Check version
npx @claude-flow/cli@latest --version

# System diagnostics
npx @claude-flow/cli@latest doctor

# Start daemon
npx @claude-flow/cli@latest daemon start

# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical

# Memory operations
npx @claude-flow/cli@latest memory store --key "k" --value "v"
npx @claude-flow/cli@latest memory search --query "search"
npx @claude-flow/cli@latest memory retrieve --key "k"

# Hooks
npx @claude-flow/cli@latest hooks pre-task --description "task"
npx @claude-flow/cli@latest hooks post-task --task-id "id" --success true

# Workers
npx @claude-flow/cli@latest hooks worker list
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit
```

### Validation

```bash
# Quick validation
bash bootstrap/orchestrator-mini/scripts/validate-claude-setup.sh

# Validation with auto-fix
bash bootstrap/orchestrator-mini/scripts/validate-claude-setup.sh --fix

# Check specific components
node --version   # Should be 20+
npm --version    # Should be 9+
git --version
```

## 🎯 Claude Desktop Commands

Try these in Claude Desktop to test MCP integration:

```
List files in the project root
```

```
Show me the git status and recent commits
```

```
Initialize a hierarchical swarm with 6 agents
```

```
Search memory for authentication patterns
```

```
Store this pattern in memory: "use JWT for auth"
```

```
Dispatch a security audit worker
```

## 🔍 Troubleshooting Quick Fixes

### MCP Servers Not Connecting

```bash
# 1. Check config file exists
ls -la ~/.config/claude/claude_desktop_config.json

# 2. Validate JSON
cat ~/.config/claude/claude_desktop_config.json | jq .

# 3. Check for template variables (should be empty)
grep '\${' ~/.config/claude/claude_desktop_config.json

# 4. Restart Claude Desktop completely
```

### Permission Errors

```bash
# Fix permissions
chmod 600 ~/.config/claude/claude_desktop_config.json
chmod 755 ~/.config/claude
```

### Path Issues (Windows)

Use forward slashes in JSON:
```json
"PROJECT_ROOT": "C:/Dev/Projects/Project-Nyra"
```

### Claude Flow Issues

```bash
# Clear cache
npm cache clean --force
rm -rf ~/.npm/_npx

# Restart daemon
npx @claude-flow/cli@latest daemon stop
npx @claude-flow/cli@latest daemon start

# Re-initialize
npx @claude-flow/cli@latest init --force
```

## 🔐 Environment Variables

Create `.env` file in project root:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
GITHUB_TOKEN=ghp_...
POSTGRES_CONNECTION_STRING=postgresql://...
BRAVE_API_KEY=...

# Claude Flow
CLAUDE_FLOW_LOG_LEVEL=info
CLAUDE_FLOW_MEMORY_BACKEND=hybrid
CLAUDE_FLOW_MEMORY_PATH=./data/memory
```

## 📊 MCP Servers

| Server | Auto-Start | Required | Purpose |
|--------|-----------|----------|---------|
| `claude-flow` | ✅ | Yes | Orchestration |
| `filesystem` | ✅ | Yes | File ops |
| `git` | ✅ | Yes | Version control |
| `memory` | ✅ | Yes | Key-value storage |
| `github` | ❌ | No | GitHub API |
| `postgres` | ❌ | No | Database |
| `brave-search` | ❌ | No | Web search |

## 🐛 Debug Mode

Enable verbose logging:

```bash
# Set log level
export CLAUDE_FLOW_LOG_LEVEL=debug

# Start daemon with logging
npx @claude-flow/cli@latest daemon start

# Watch logs
tail -f logs/claude-flow.log
```

## 📚 Documentation

- **Setup Guide**: `bootstrap/docs/CLAUDE-DESKTOP-SETUP.md`
- **Main CLAUDE.md**: `CLAUDE.md`
- **Config README**: `bootstrap/orchestrator-mini/configs/claude-desktop/README.md`
- **Claude Flow**: https://github.com/ruvnet/claude-flow
- **MCP**: https://modelcontextprotocol.io/

## ✅ Health Check Checklist

- [ ] Node.js 20+ installed
- [ ] npm 9+ installed
- [ ] Git installed
- [ ] Claude Desktop installed and signed in
- [ ] Config files copied to correct location
- [ ] Template variables replaced with actual paths
- [ ] Claude Desktop restarted
- [ ] MCP servers showing as connected
- [ ] Test commands work in Claude Desktop
- [ ] Claude Flow daemon running
- [ ] Data directory exists and writable

## 🆘 Getting Help

1. **Check setup guide**: `bootstrap/docs/CLAUDE-DESKTOP-SETUP.md`
2. **Run diagnostics**: `npx @claude-flow/cli@latest doctor`
3. **Validate setup**: `bash bootstrap/orchestrator-mini/scripts/validate-claude-setup.sh`
4. **Check logs**: `tail -f logs/claude-desktop.log`
5. **Create issue**: GitHub with error details

## 🎯 Quick Test Script

```bash
#!/bin/bash
# Save as test-claude-desktop.sh and run

echo "Testing Claude Desktop Setup..."

# Test Node.js
node --version || echo "ERROR: Node.js not found"

# Test Claude Flow
npx @claude-flow/cli@latest --version || echo "ERROR: Claude Flow not accessible"

# Test config exists
test -f ~/.config/claude/claude_desktop_config.json && echo "✓ Config file exists" || echo "✗ Config file missing"

# Test daemon
npx @claude-flow/cli@latest daemon status && echo "✓ Daemon running" || echo "✗ Daemon not running"

echo "Test complete!"
```

## 📞 Support

- **Issues**: https://github.com/ruvnet/claude-flow/issues
- **Docs**: https://github.com/ruvnet/claude-flow
- **MCP**: https://modelcontextprotocol.io/

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-15

Keep this card handy for quick reference! 🚀
