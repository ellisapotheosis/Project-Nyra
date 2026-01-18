# Quick Start Guide - Testing Bootstrap Package

## ✅ Bootstrap Package Created Successfully!

Your claude-code-bootstrap package is ready at:
```
C:\Dev\DevProjects\Personal-Projects\claude-code-bootstrap\
```

## 📦 What Was Created

### 1. Updated Settings (Active Now)
- **C:\Users\edane\.claude\settings.json** - Updated with `bypassPermissions` mode
- Backup saved at: `C:\Users\edane\.claude\settings.json.backup`

### 2. Bootstrap Package Contents
```
claude-code-bootstrap/
├── settings.json              (792 bytes)
├── .claude.json              (53,789 bytes)
├── deploy.ps1                (10,155 bytes)
├── README.md                 (6,749 bytes)
├── QUICKSTART.md             (this file)
└── claude-flow/
    └── settings-alpha-all-modes.json  (16,350 bytes)
```

## 🧪 Testing bypassPermissions Mode

### Step 1: Restart Claude Code
The `bypassPermissions` mode requires a fresh session to activate:
1. Close this Claude Code session completely
2. Open a new Claude Code window
3. Verify no permission prompts appear

### Step 2: Verify Activation
Run a test command that normally requires permission:
```bash
Write-Output "Testing permissions" > test-permissions.txt
```

If no permission prompt appears, `bypassPermissions` is active! ✅

### Step 3: Check Settings
Verify the setting took effect:
```powershell
Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json | Select-Object -ExpandProperty permissions
```

Expected output:
```json
{
  "defaultMode": "bypassPermissions",
  "allow": [...]
}
```

## 🔄 Applying to Local claude-flow Repository

### Option 1: Use Bootstrap Script (Recommended)
```powershell
cd C:\Dev\DevProjects\Personal-Projects\claude-code-bootstrap
.\bootstrap-claude-flow.ps1
```

This will:
- Copy settings-alpha-all-modes.json → .claude/settings.json
- Create timestamped backups automatically
- Validate paths before copying

### Option 2: Manual Copy
```powershell
# Copy to your local repo
Copy-Item "C:\Dev\DevProjects\Personal-Projects\claude-code-bootstrap\claude-flow\settings-alpha-all-modes.json" "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow\.claude\settings.json" -Force

# Verify
cat "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow\.claude\settings.json" | ConvertFrom-Json | Select-Object -Property env, performance | ConvertTo-Json -Depth 3
```

## 🌐 Deploying to Other LAN Machines

### Quick Deploy (Same User)
On each target PC, run:
```powershell
# Via network share (easiest)
$source = "\\YOUR-MAIN-PC\C$\Dev\DevProjects\Personal-Projects\claude-code-bootstrap"
Copy-Item "$source\settings.json" "$env:USERPROFILE\.claude\settings.json" -Force
Copy-Item "$source\.claude.json" "$env:USERPROFILE\.claude.json" -Force
```

### Automated Deployment
Use the deployment script:
```powershell
cd C:\Dev\DevProjects\Personal-Projects\claude-code-bootstrap
.\deploy.ps1 -TargetMachines @("PC1", "PC2", "PC3", "PC4")
```

## 🔍 Troubleshooting

### bypassPermissions Not Working
If you still see permission prompts after restarting:

1. **Check file syntax:**
```powershell
Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json
```
If error, JSON syntax is invalid

2. **Verify exact spelling:**
Must be `"bypassPermissions"` not `"bypass"` or `"BypassPermissions"`

3. **Check .claude.json too:**
```powershell
Get-Content "$env:USERPROFILE\.claude.json" | ConvertFrom-Json | Select-Object -ExpandProperty permissions
```

Should show:
```json
{
  "defaultMode": "bypass",
  "allow": [...]
}
```

4. **Hard restart:**
- Close ALL Claude Code windows
- Kill any claude.exe processes in Task Manager
- Restart Claude Code

### Infisical Hook Not Running
If MCP doesn't start on SessionStart:
```powershell
# Test Infisical manually
infisical secrets list --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared"

# Check if authenticated
infisical whoami
```

### claude-flow Hooks Not Executing
Verify installation:
```bash
npx claude-flow@alpha --version
```

Check settings loaded:
```powershell
cat ".\.claude\settings.json" | jq '.hooks.PreToolUse[0].matcher'
```

## 🎯 Next Steps

### Recommended Actions:
1. ✅ Test `bypassPermissions` mode (restart Claude Code)
2. ✅ Deploy to your 4 LAN PCs using `deploy.ps1`
3. ✅ Copy alpha settings to local claude-flow repo
4. ⚙️ Customize Infisical project ID if needed
5. 🧪 Test claude-flow hooks with a simple edit
6. 📊 Monitor performance with optimized settings

### For claude-flow Testing:
```bash
# Navigate to repo
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow"

# Test basic command
npx claude-flow@alpha --help

# Test hooks manually
npx claude-flow@alpha hooks pre-command --command "ls" --validate-safety true
```

## 📝 Configuration Highlights

### Base Settings Features:
- ✅ bypassPermissions active
- ✅ Infisical MCP auto-start
- ✅ Starship statusline integration
- ✅ Always Thinking enabled

### Alpha Settings Features:
- ⚡ Performance: Caching, batching, parallel processing
- 🧠 Neural: 3 AI models (task predictor, error preventer, optimizer)
- 💾 Memory: Auto-persist with GitHub backup
- 🔄 Checkpoints: Every 5 minutes with git commit
- 🎯 Hooks: Pre/Post for Bash, Edit, Tasks with optimization
- 📊 Monitoring: Latency, throughput, errors, cache hits

### Security:
- ✅ Comprehensive allow list
- ✅ Deny dangerous commands (rm -rf /, pipe to bash, eval)
- ✅ MCP wildcard support
- ✅ Infisical secrets integration

## 🆘 Support

If you encounter issues:
1. Check logs: `$env:USERPROFILE\.claude\logs\`
2. Review README.md for detailed troubleshooting
3. Verify source files exist in bootstrap folder
4. Test deployment to one machine first before all 4

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ No permission prompts appear (bypassPermissions)
- ✅ Infisical MCP connects on startup
- ✅ Status line shows custom theme
- ✅ claude-flow hooks execute (check console)
- ✅ All 4 PCs have identical configs

---

**Created:** 2025-12-22  
**Location:** C:\Dev\DevProjects\Personal-Projects\claude-code-bootstrap\  
**Version:** 1.0.0
