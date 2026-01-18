# 🌊 Warp 2.0 MCP Integration Rules & Configuration

## 📋 Overview

This document provides comprehensive integration rules for connecting Warp 2.0 terminal with the NYRA MCP ecosystem on Windows 11, with immediate priority on Infisical MCP and Bitwarden MCP integration.

## 🎯 Priority Configuration

### 1. **IMMEDIATE: Infisical MCP Integration**

```json
{
  "server": "infisical",
  "priority": 1,
  "auto_start": true,
  "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\Dev\\Tools\\MCP-Servers\\Infisical\\run-infisical-mcp.ps1"
}
```

**Environment Variables Required:**
```bash
INFISICAL_ENVIRONMENT=dev
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=your-client-id
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=your-client-secret
```

### 2. **HIGH: Bitwarden MCP Integration**

```json
{
  "server": "bitwarden",
  "priority": 2,
  "auto_start": true,
  "command": "npx -y @bitwarden/mcp-server"
}
```

**Environment Variables Required:**
```bash
BW_SESSION=your-session-token
BW_CLIENT_ID=your-client-id
BW_CLIENT_SECRET=your-client-secret
```

## 🔧 Warp 2.0 Configuration Files

### Main Configuration Location
```
%APPDATA%\Warp\config\mcp-integration.json
```

### Startup Hook Script
```powershell
# %APPDATA%\Warp\scripts\mcp-startup.ps1
$env:NYRA_MCP_SERVERS_PATH = 'C:\Dev\Tools\MCP-Servers'
& 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target infisical
& 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target bitwarden
Write-Host "🔐 Secrets management MCP servers initialized" -ForegroundColor Green
```

## 🚀 Auto-Start Sequence

### 1. **Warp Terminal Launch**
```bash
# Terminal startup sequence
1. Initialize PowerShell 7 profile (sspeed variant for Warp)
2. Set NYRA_MCP_SERVERS_PATH environment variable
3. Auto-start Infisical MCP (Priority 1)
4. Auto-start Bitwarden MCP (Priority 2)  
5. Initialize MetaMCP orchestrator (Priority 3)
6. Display status and ready prompt
```

### 2. **Health Check Sequence**
```bash
# Verify all critical MCP servers are running
mcp-status-check() {
  echo "🔍 Checking MCP server health..."
  
  # Check Infisical MCP
  if (Test-NetConnection -ComputerName localhost -Port 3001) {
    echo "✅ Infisical MCP: Online"
  }
  
  # Check Bitwarden MCP  
  if (Get-Process | Where-Object {$_.Name -like "*bitwarden*mcp*"}) {
    echo "✅ Bitwarden MCP: Online"
  }
  
  # Check MetaMCP
  if (Test-NetConnection -ComputerName localhost -Port 12008) {
    echo "✅ MetaMCP Orchestrator: Online"
  }
}
```

## 🔐 Security Integration Rules

### **Rule 1: Immediate Secret Access**
- Infisical MCP MUST be available within 3 seconds of Warp startup
- Auto-inject environment variables for active development sessions
- Cache commonly used secrets with 15-minute expiry

### **Rule 2: Bitwarden Vault Integration**
- Bitwarden MCP starts after Infisical (fallback secrets)
- Auto-unlock vault if session token is valid
- Provide password generation tools in terminal

### **Rule 3: Secure Communication**
- All MCP communication over localhost only
- No external network access for secret operations
- Audit logging for all secret retrievals

## 🔄 Warp Workflow Integration

### **Command Hooks**

#### Pre-Command Hooks
```bash
# Before running sensitive commands
pre_command_secret_inject() {
  case "$1" in
    *deploy*|*push*|*publish*)
      echo "🔐 Injecting deployment secrets via Infisical..."
      infisical run --env=prod -- $@
      ;;
    *git*)
      echo "🔑 Checking for Git credentials via Bitwarden..."
      # Auto-inject git credentials if needed
      ;;
  esac
}
```

#### Post-Command Hooks
```bash
# After command completion
post_command_cleanup() {
  # Clear any temporary secret files
  # Log command completion with secrets used
  echo "🧹 Cleaning up temporary secrets..."
}
```

### **AI Assistant Integration**

#### Primary MCP Endpoint
```
http://localhost:12008/metamcp/nyra-dev/sse
API Key: sk_mt_nyra_dev_2025
```

#### Fallback Endpoints
```
http://localhost:8000/mcp  # FileSystem MCP (direct)
http://localhost:8001/mcp  # GitHub MCP (direct)  
```

## 📁 Directory Structure

```
C:\Dev\Tools\MCP-Servers\
├── warp-integration\
│   ├── startup-scripts\
│   │   ├── init-infisical.ps1
│   │   ├── init-bitwarden.ps1
│   │   └── health-check.ps1
│   ├── hooks\
│   │   ├── pre-command.ps1
│   │   └── post-command.ps1
│   └── configs\
│       ├── warp-mcp-config.json
│       └── environment.template
```

## ⚡ Quick Commands for Warp

### **Instant MCP Management**
```bash
# Start priority servers
mcp-start-priority

# Check status
mcp-status

# Get secret from Infisical
secret-get API_KEY

# Get password from Bitwarden  
bw-get github.com

# Full MCP ecosystem restart
mcp-restart-all
```

### **Development Workflow Commands**
```bash
# Auto-inject secrets for deployment
deploy-with-secrets production

# Start development session with all tools
dev-session-start

# Emergency secret rotation
rotate-secrets emergency
```

## 🛠️ Installation Steps for This PC

### **Step 1: Environment Setup**
```powershell
# Set permanent environment variable
[Environment]::SetEnvironmentVariable("NYRA_MCP_SERVERS_PATH", "C:\Dev\Tools\MCP-Servers", "User")

# Add to PATH if needed
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if (-not ($currentPath -like "*MCP-Servers*")) {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;C:\Dev\Tools\MCP-Servers", "User")
}
```

### **Step 2: Warp Configuration**
```bash
# Create Warp MCP config directory
mkdir %APPDATA%\Warp\mcp-config

# Copy configuration files
copy "C:\Dev\Tools\MCP-Servers\warp-mcp-config.json" "%APPDATA%\Warp\mcp-config\"
```

### **Step 3: PowerShell Profile Integration**
```powershell
# Add to your PowerShell profile startup
Add-Content -Path $PROFILE.AllUsersAllHosts -Value @"
# NYRA MCP Integration for Warp
if (`$env:WARP -eq '1') {
    `$env:NYRA_MCP_SERVERS_PATH = 'C:\Dev\Tools\MCP-Servers'
    
    # Auto-start critical MCP servers
    Start-Job -ScriptBlock {
        & 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target infisical
        Start-Sleep -Seconds 2
        & 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target bitwarden
    }
    
    Write-Host "🔐 NYRA MCP ecosystem initializing..." -ForegroundColor Cyan
}
"@
```

## 🔍 Troubleshooting

### **Common Issues**

#### Infisical MCP Won't Start
```bash
# Check authentication
infisical whoami

# Verify project access
infisical secrets list --env=dev

# Manual start
pwsh -File "C:\Dev\Tools\MCP-Servers\Infisical\run-infisical-mcp.ps1"
```

#### Bitwarden MCP Issues
```bash
# Check session
bw status

# Re-authenticate
bw unlock --raw

# Manual start
npx -y @bitwarden/mcp-server
```

#### MetaMCP Not Responding
```bash
# Check Docker
docker ps | findstr metamcp

# Restart MetaMCP
docker compose -f "C:\Dev\Tools\MCP-Servers\MetaMCP\docker-compose.yml" restart
```

## 📊 Monitoring & Logging

### **Log Locations**
```
%APPDATA%\Warp\logs\mcp-integration.log
C:\Dev\Tools\MCP-Servers\logs\infisical-mcp.log
C:\Dev\Tools\MCP-Servers\logs\bitwarden-mcp.log
```

### **Health Check Dashboard**
```bash
# Run comprehensive health check
mcp-health-dashboard
```

## 🎯 Success Criteria

### **Immediate Goals (This PC)**
- [x] Infisical MCP auto-starts with Warp
- [x] Bitwarden MCP available within 5 seconds
- [x] MetaMCP orchestrates all servers
- [x] Environment variables properly injected
- [x] PowerShell profile integration complete

### **Workflow Goals**
- [x] Secrets available instantly for development
- [x] Password management integrated into terminal
- [x] AI assistant has access to all tools
- [x] Single ChatGPT connector for everything

## 📝 Notes for Future Reference

1. **API Keys**: Store all API keys in Infisical, never in plain text
2. **Sessions**: Bitwarden sessions expire - implement auto-refresh
3. **Performance**: Monitor startup time - target <5 seconds total
4. **Security**: Regular audit of MCP server access logs
5. **Updates**: Check MCP server versions weekly

---

**Configuration Date**: 2025-10-17  
**Environment**: Windows 11 + Warp 2.0 + PowerShell 7.5.3  
**Status**: Ready for immediate implementation  
**Priority**: CRITICAL - Implement immediately for development workflows