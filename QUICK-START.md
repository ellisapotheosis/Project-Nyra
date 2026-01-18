# Claude Flow V3 - Quick Start Reference

## 🚀 Immediate Setup (PowerShell)

```powershell
# 1. Load statusline
. .\scripts\powershell-profile-statusline.ps1

# 2. Install to profile (one-time)
Install-ClaudeFlowStatusline

# 3. Reload profile
. $PROFILE

# 4. Check status
cfstatus
```

## 📊 PowerShell Statusline Commands

| Command | Description |
|---------|-------------|
| `cfstatus` | Show full statusline with colors |
| `cfwatch` | Live status updates (every 5s) |
| `cfjson` | Get status as JSON object |
| `Set-ClaudeFlowPrompt` | Add status to prompt |

**Example Prompt:**
```powershell
Set-ClaudeFlowPrompt
# Result: [CF:0/35 D:3/5 CVE:0/3] PS C:\...>
```

## 🛠️ Essential CLI Commands

### System Health
```bash
npx @claude-flow/cli@latest doctor          # Health check
npx @claude-flow/cli@latest status          # System status
npx @claude-flow/cli@latest daemon status   # Daemon status
```

### Memory Operations
```bash
# Store a pattern
npx @claude-flow/cli@latest memory store \
  --key "my-pattern" \
  --value "Pattern description" \
  --namespace patterns

# Search patterns
npx @claude-flow/cli@latest memory search --query "auth"

# List all
npx @claude-flow/cli@latest memory list --namespace patterns

# Initialize (if needed)
npx @claude-flow/cli@latest memory init --force
```

### Swarm Management
```bash
# Initialize swarm (hierarchical-mesh = anti-drift)
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical-mesh \
  --max-agents 35 \
  --strategy specialized

# Check swarm status
npx @claude-flow/cli@latest swarm status

# Shutdown swarm
npx @claude-flow/cli@latest swarm shutdown
```

### Agent Management
```bash
# Spawn an agent
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# List agents
npx @claude-flow/cli@latest agent list

# Agent status
npx @claude-flow/cli@latest agent status --agent-id <id>

# Stop agent
npx @claude-flow/cli@latest agent stop --agent-id <id>
```

### Hooks (Self-Learning)
```bash
# Pre-task routing (get agent recommendation)
npx @claude-flow/cli@latest hooks pre-task --description "Fix bug in auth"

# Post-task learning (record success)
npx @claude-flow/cli@latest hooks post-task --task-id "123" --success true

# View metrics
npx @claude-flow/cli@latest hooks metrics

# List all hooks
npx @claude-flow/cli@latest hooks list
```

## 🔍 Statusline Output Explained

```
▊ Claude Flow V3 ● ellisapotheosis  │  ⎇ main  │  Opus 4.5
─────────────────────────────────────────────────────
🏗️  DDD Domains    [●●●○○]  3/5    ⚡ 1.0x → 2.49x-7.47x
🤖 Swarm  ○ [ 0/35]  👥 0    🔴 CVE 0/3    💾 12MB    📂  60%    🧠  12%
🔧 Architecture    DDD ●60%  │  Security ●PENDING  │  Memory ●AgentDB  │  Integration ●
```

| Symbol | Meaning |
|--------|---------|
| `●` | Active/online |
| `○` | Inactive/offline |
| `[●●●○○]` | Progress bar (3/5 = 60%) |
| `🤖 Swarm  ○ [ 0/35]` | 0 active agents / 35 max |
| `👥 0` | 0 sub-agents |
| `🔴 CVE 0/3` | 0 CVEs fixed / 3 total |
| `💾 12MB` | Memory usage |
| `📂 60%` | Context percentage |
| `🧠 12%` | Intelligence percentage |
| `⚡ 1.0x → 2.49x-7.47x` | Performance target |

## 🎯 Common Workflows

### Check System Status
```powershell
# Quick check
cfstatus

# Detailed check
npx @claude-flow/cli@latest doctor
npx @claude-flow/cli@latest status
```

### Start Development Session
```bash
# 1. Check memory for relevant patterns
npx @claude-flow/cli@latest memory search --query "relevant topic"

# 2. Get agent routing recommendation
npx @claude-flow/cli@latest hooks pre-task --description "Your task"

# 3. Initialize swarm if needed
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh

# 4. Monitor with statusline
cfwatch  # In PowerShell
```

### Learn from Successful Work
```bash
# 1. Store successful pattern
npx @claude-flow/cli@latest memory store \
  --key "solution-xyz" \
  --value "Description of what worked" \
  --namespace solutions

# 2. Record task success
npx @claude-flow/cli@latest hooks post-task --task-id "abc" --success true

# 3. Trigger neural learning
npx @claude-flow/cli@latest hooks post-edit --file "main.ts" --train-neural true
```

## 🖥️ Multi-Machine Setup

### Orchestrator (PC1 - Mini PC, WSL/Linux)
```bash
# Load config
cp .env.orchestrator .env

# Start daemon
npx @claude-flow/cli@latest daemon start

# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh
```

### Workers (PC2-4)
```bash
# PC2 (RTX 3060 - Coding)
cp .env.worker-3060 .env

# PC3 (RTX 5090 - Large models)
cp .env.worker-5090 .env

# PC4 (RTX 3090 Ti - Analysis)
cp .env.worker-3090ti .env

# Each worker: Start and join swarm
npx @claude-flow/cli@latest daemon start
```

### Query Orchestrator from Windows
```powershell
# Query orchestrator for authoritative status
cfstatus -Remote

# Or set as default
$USE_REMOTE_DATA = $true
cfstatus
```

## 🐛 Troubleshooting

### Config Warnings (Non-Critical)
```
[WARN] Invalid config: Expected object, received boolean
```
**Solution:** These are cosmetic. System works perfectly. Can be ignored.

### Memory Database Not Found
```bash
npx @claude-flow/cli@latest memory init --force
```

### Daemon Not Running
```bash
npx @claude-flow/cli@latest daemon start
```

### Swarm Not Starting
```bash
# Check config
npx @claude-flow/cli@latest doctor

# Restart daemon
npx @claude-flow/cli@latest daemon stop
npx @claude-flow/cli@latest daemon start

# Try again
npx @claude-flow/cli@latest swarm init
```

### PowerShell Colors Not Working
```powershell
# Upgrade to PowerShell 7+
winget install Microsoft.PowerShell
```

## 📚 Documentation

| Document | Path |
|----------|------|
| PowerShell Setup | `docs/POWERSHELL-STATUSLINE-SETUP.md` |
| Full V3 Setup | `docs/CLAUDE-FLOW-V3-SETUP-SUMMARY.md` |
| 4-PC Architecture | `docs/ENV-SETUP-GUIDE.md` |
| Status Update | `docs/STATUS-UPDATE-2026-01-18.md` |
| Main Instructions | `CLAUDE.md` |

## ⚡ Pro Tips

### 1. PowerShell Prompt Integration
Add compact status to your prompt for constant awareness:
```powershell
Set-ClaudeFlowPrompt -Minimal
# Shows: [0🤖 12MB] PS C:\...>
```

### 2. Memory-Driven Development
Always search memory before starting new work:
```bash
# Search for similar patterns
npx @claude-flow/cli@latest memory search --query "your task keywords"

# Use what you find to inform approach
```

### 3. Auto-Learning Workflow
Configure hooks to automatically learn from your work:
```bash
# Pre-task: Get recommendations
npx @claude-flow/cli@latest hooks pre-task --description "[task]"

# Post-task: Record success
npx @claude-flow/cli@latest hooks post-task --success true
```

### 4. Watch Mode for Debugging
When troubleshooting, use live status:
```powershell
cfwatch
# Refreshes every 5 seconds
```

### 5. JSON for Automation
Use JSON output in scripts:
```powershell
$status = cfjson
if ($status.swarm.activeAgents -eq 0) {
    Write-Warning "No active agents!"
}
```

## 🎯 Next Actions

1. **Install PowerShell Integration:**
   ```powershell
   . .\scripts\powershell-profile-statusline.ps1
   Install-ClaudeFlowStatusline
   . $PROFILE
   ```

2. **Verify Setup:**
   ```powershell
   cfstatus
   npx @claude-flow/cli@latest doctor
   ```

3. **Initialize Swarm (Optional):**
   ```bash
   npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh
   ```

4. **Start Developing:**
   - Use `cfstatus` for real-time visibility
   - Search memory before coding
   - Record successes for learning

---

**System Status:** ✅ OPERATIONAL
**Version:** Claude Flow V3 Alpha (v3.0.0-alpha.104)
**Last Updated:** 2026-01-18
