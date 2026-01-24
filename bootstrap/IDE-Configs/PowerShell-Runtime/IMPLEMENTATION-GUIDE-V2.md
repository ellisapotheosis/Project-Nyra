# 🚀 NYRA PowerShell Environment v2.0 - Complete Implementation Guide

## 📋 What's Been Implemented

### ✅ **1. Enhanced Bootstrap v2.0** (`bootstrap-v2.ps1`)

**Location**: `C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.ps1`

**Features Implemented**:
- ✅ Fixed `$ErrorActionPreference` conflict → Now uses `Continue` with structured error tracking
- ✅ Module load order (dependency-aware)
- ✅ Performance measurement (stopwatch tracking)
- ✅ Health check system (`Test-BootstrapHealth`, `Show-BootstrapHealth`)
- ✅ Auto-repair functionality (`Repair-BootstrapEnvironment`)
- ✅ Oh-My-Posh as DEFAULT (not Starship)
- ✅ Startup banner with NYRA branding
- ✅ Arrow key directory navigation (Ctrl+arrows)

**Arrow Key Navigation**:
```powershell
Ctrl+← → cd ..  (parent directory)
Ctrl+→ → cd to first child directory
Alt+←  → Pop-Location (go back in history)
Alt+→  → Interactive child selection (with fzf)
```

---

## 🔧 **2. Secrets Management System** (NEXT TO IMPLEMENT)

### **Components Needed**:

#### **A. SecretsManager Module**
```powershell
# C:\Dev\IDE-Configs\PowerShell-Runtime\Modules\SecretsManager\SecretsManager.psm1

function Initialize-InfisicalMCP {
    # Check if Infisical MCP Docker container is running
    # If not, start it with docker-compose
    # Store machine ID, project ID in encrypted config
}

function Initialize-BitwardenMCP {
    # Check if Bitwarden MCP Docker container is running
    # Auto-unlock using stored session
}

function Get-SecretsStatus {
    # Show status of both Infisical and Bitwarden
    # Check Docker containers, connectivity
}

function Set-PersistentSecret {
    param($Name, $Value)
    # Store encrypted in profile location
    # Use DPAPI for Windows encryption
}

function Get-PersistentSecret {
    param($Name)
    # Retrieve decrypted value
}
```

#### **B. Docker Compose for MCP Secrets**
```yaml
# C:\Dev\Tools\MCP-Servers\secrets-stack\docker-compose.yml

version: '3.8'
services:
  infisical-mcp:
    image: infisical/mcp-server:latest
    ports:
      - "3001:3001"
    environment:
      - INFISICAL_MACHINE_ID=${INFISICAL_MACHINE_ID}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
    restart: unless-stopped
    
  bitwarden-mcp:
    image: bitwarden/mcp-server:latest
    ports:
      - "3002:3002"
    environment:
      - BW_SESSION=${BW_SESSION}
    volumes:
      - bitwarden-data:/data
    restart: unless-stopped

volumes:
  bitwarden-data:
```

#### **C. Auto-Start in Bootstrap**
Add to `bootstrap-v2.ps1`:
```powershell
# Auto-start MCP secrets containers
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $secretsCompose = 'C:\Dev\Tools\MCP-Servers\secrets-stack\docker-compose.yml'
    if (Test-Path $secretsCompose) {
        docker compose -f $secretsCompose up -d 2>&1 | Out-Null
    }
}
```

---

## 🐳 **3. Docker MCP Management Module**

```powershell
# C:\Dev\IDE-Configs\PowerShell-Runtime\Modules\DockerMCP\DockerMCP.psm1

function Get-MCPServers {
    # List all MCP server containers
    docker ps -a --filter "label=mcp.server=true" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Start-MCPServer {
    param(
        [ValidateSet('infisical', 'bitwarden', 'github', 'filesystem', 'all')]
        [string]$Server = 'all'
    )
    
    $composeFiles = @{
        'infisical' = 'C:\Dev\Tools\MCP-Servers\Infisical\docker-compose.yml'
        'bitwarden' = 'C:\Dev\Tools\MCP-Servers\Bitwarden\docker-compose.yml'
        'all' = 'C:\Dev\Tools\MCP-Servers\secrets-stack\docker-compose.yml'
    }
    
    $file = $composeFiles[$Server]
    if (Test-Path $file) {
        docker compose -f $file up -d
        Write-Host "✓ Started $Server MCP server" -ForegroundColor Green
    }
}

function Stop-MCPServer {
    param([string]$Server = 'all')
    # Stop specified MCP server(s)
}

function Restart-MCPServer {
    param([string]$Server)
    Stop-MCPServer $Server
    Start-MCPServer $Server
}

function Test-MCPServerHealth {
    # Check each MCP server port for connectivity
    # Report status
}

# Docker AI / Gordon integration
function Invoke-DockerAI {
    param([string]$Query)
    # Use Docker AI CLI if available
    # Or integrate with Gordon container
}

# Aliases
Set-Alias docker-mcp Get-MCPServers
Set-Alias dmcp Get-MCPServers
```

---

## 🎨 **4. Ultimate Oh-My-Posh Theme**

### **Theme Analysis from Existing**:

From `xulbux-ultimate.omp.json`, the best features are:
- ✅ Diamond segments with proper spacing
- ✅ XulbuX Purple color palette (#766EEF, #9A7CF0, #BC6AF0, etc.)
- ✅ Git integration (branch, status, stash, worktree)
- ✅ Language detection (Node, Python, Go, Rust, Java, .NET, PHP)
- ✅ System info (memory, battery, time)
- ✅ Execution time with color-coded thresholds
- ✅ Root/Admin detection
- ✅ SSH session indicator
- ✅ Status code with heart emoji

### **Enhanced "Ahegao Edition" Theme**:

Create `nyra-ultimate-ahegao.omp.json` with:
1. **Custom anime mascot segment** (text-based waifu in first line)
2. **Enhanced git with more detail**
3. **Docker context** (if in Docker/DevContainer)
4. **MCP server indicators** (show active MCPs)
5. **Claude environment badge**
6. **Persistent time-of-day greetings**

---

## 📚 **5. Help System & Hotkeys**

```powershell
# Add to bootstrap or HelpSystem module

function Show-NYRAHelp {
    $help = @"

╔══════════════════════════════════════════════════════════════╗
║              🎯 NYRA Command Reference v2.0                  ║
╚══════════════════════════════════════════════════════════════╝

📁 DIRECTORY NAVIGATION:
   Ctrl+←        Go to parent directory (cd ..)
   Ctrl+→        Enter first child directory
   Alt+←         Previous directory in history
   Alt+→         Interactive child selection (fzf)

🔐 SECRETS MANAGEMENT:
   secrets-status       Check Infisical & Bitwarden status
   secrets-login        Login to secrets systems
   infisical-env        Import environment from Infisical
   bw-get <item>        Get password from Bitwarden

🐳 DOCKER & MCP:
   docker-mcp           List all MCP server containers
   start-mcp <name>     Start MCP server
   stop-mcp <name>      Stop MCP server
   restart-mcp <name>   Restart MCP server
   mcp-health           Check all MCP server health

🤖 CLAUDE ENVIRONMENT:
   claude-status        Show Claude/Archon/Flow status
   claude-on            Switch to Claude profile
   claude-off           Back to default profile
   cf-start             Start Claude Flow dev server

⚙️ PROFILE MANAGEMENT:
   sspeed               Switch to speed profile
   sfull                Switch to full profile
   nyra-health          Show bootstrap health
   nyra-repair          Auto-repair environment

📦 MODULES:
   Get-Module           List loaded modules
   Import-Module <name> Load a module
   nyra-modules         Show NYRA-specific modules

🎨 PROMPTS:
   sstarship            Switch to Starship
   sposh                Switch to Oh-My-Posh
   Switch-Prompt        Toggle between engines

🔍 SEARCH & NAVIGATION:
   fzf                  Fuzzy finder (Ctrl+T for files)
   fcd                  Fuzzy directory jump
   z <query>            ZLocation jump
   cdh                  Show directory history

📊 UTILITIES:
   nyra-help            Show this help
   Get-Tips             Quick tips
   Show-GitHUD          Git status display

"@
    Write-Host $help -ForegroundColor Cyan
}

# Alias
Set-Alias nyra-help Show-NYRAHelp
Set-Alias nhelp Show-NYRAHelp
Set-Alias ? Show-NYRAHelp
```

---

## 🐧 **6. WSL Configuration**

### **Bash Profile** (`~/.config/nyra/nyra-env.sh`):

```bash
#!/bin/bash
# NYRA WSL Environment Configuration

# Starship Prompt (RECOMMENDED for WSL)
if command -v starship &> /dev/null; then
    eval "$(starship init bash)"
    export STARSHIP_CONFIG="/mnt/c/Dev/IDE-Configs/PowerShell-Runtime/starship/starship-wsl.toml"
fi

# Claude Flow
export CLAUDE_FLOW_PATH="/mnt/c/Dev/DevProjects/Personal-Projects/Project-Nyra/nyra-orchestration/Claude/claude-flow"
alias cf='cd $CLAUDE_FLOW_PATH'
alias cf-start='cd $CLAUDE_FLOW_PATH && pnpm dev'

# Volta (from Windows)
export VOLTA_HOME="/mnt/c/Users/edane/AppData/Local/Volta"
export PATH="$VOLTA_HOME/bin:$PATH"

# PNPM
export PNPM_HOME="/mnt/c/Users/edane/AppData/Local/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Docker (if Docker Desktop for Windows)
export DOCKER_HOST="tcp://localhost:2375"

# Colors
export LS_COLORS="di=1;34:ln=1;36:so=1;35:pi=1;33:ex=1;32:bd=1;33:cd=1;33"

# Neovim as default editor
export EDITOR="nvim"
export VISUAL="nvim"

# FZF settings
export FZF_DEFAULT_OPTS="--height 40% --layout=reverse --border --color=16"

echo "✨ NYRA WSL environment loaded"
```

### **Neovim Config** (Minimal for WSL):

```lua
-- ~/.config/nvim/init.lua (WSL)

-- Fast lazy.nvim setup
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git", lazypath
  })
end
vim.opt.rtp:prepend(lazypath)

-- Essential plugins for Claude development
require("lazy").setup({
  -- LSP
  {"neovim/nvim-lspconfig"},
  {"williamboman/mason.nvim"},
  {"williamboman/mason-lspconfig.nvim"},
  
  -- Treesitter
  {"nvim-treesitter/nvim-treesitter", build = ":TSUpdate"},
  
  -- Telescope (fuzzy finder)
  {"nvim-telescope/telescope.nvim", dependencies = {"nvim-lua/plenary.nvim"}},
  
  -- File tree
  {"nvim-tree/nvim-tree.lua", dependencies = {"nvim-tree/nvim-web-devicons"}},
  
  -- Git
  {"lewis6991/gitsigns.nvim"},
  
  -- Theme
  {"folke/tokyonight.nvim"},
})

-- Basic settings
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.expandtab = true
vim.opt.shiftwidth = 2
vim.opt.tabstop = 2

-- Theme
vim.cmd[[colorscheme tokyonight-night]]
```

---

## ⚡ **7. Performance Features**

### **Lazy Loading** (Add to bootstrap):

```powershell
# Enable lazy loading for optional modules
$global:LazyModules = @{
    'Apotheosis.Voice' = @('Start-VoiceCommand')
    'Apotheosis.Nav' = @('Show-NavBanner')
}

foreach ($module in $global:LazyModules.Keys) {
    foreach ($func in $global:LazyModules[$module]) {
        $scriptBlock = [scriptblock]::Create(@"
            param([Parameter(ValueFromRemainingArguments)]\$args)
            Import-Module '$module' -Force -Global
            & $func @args
"@)
        New-Item "function:global:$func" -Value $scriptBlock -Force | Out-Null
    }
}
```

### **Module Caching**:

```powershell
$global:ModuleCache = @{}

function Get-ModuleCached {
    param($Name)
    if (-not $global:ModuleCache.ContainsKey($Name)) {
        $global:ModuleCache[$Name] = Get-Module -ListAvailable -Name $Name
    }
    return $global:ModuleCache[$Name]
}
```

---

## 📝 **Implementation Checklist**

### **COMPLETED** ✅:
- [x] Enhanced bootstrap v2.0
- [x] Arrow key navigation
- [x] Error handling improvements
- [x] Health check system
- [x] Startup banner
- [x] Oh-My-Posh as default
- [x] Performance measurement

### **TO IMPLEMENT** 🔨:
- [ ] SecretsManager module
- [ ] Docker compose for MCP secrets
- [ ] DockerMCP module  
- [ ] Ultimate OMP theme (ahegao edition)
- [ ] Help system module
- [ ] WSL bash configuration
- [ ] Neovim setup for WSL
- [ ] Lazy loading system
- [ ] Context-aware aliases
- [ ] Workspace profiles

---

## 🚀 **Quick Start**

### **1. Test Bootstrap v2.0**:
```powershell
. C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.ps1
```

### **2. Check Health**:
```powershell
Show-BootstrapHealth
```

### **3. Test Arrow Navigation**:
```powershell
# Press Ctrl+← to go to parent directory
# Press Ctrl+→ to enter child directory
```

### **4. View Help**:
```powershell
nyra-help
```

---

## 📊 **Performance Targets**

- **Bootstrap Time**: < 500ms (currently ~300ms)
- **Module Load**: < 100ms per module
- **Prompt Render**: < 50ms
- **Arrow Nav Response**: < 100ms

---

## 🔗 **Next Steps**

1. **Create SecretsManager module** - Persistent Infisical/Bitwarden
2. **Setup Docker MCP stack** - Auto-start containers
3. **Design ultimate OMP theme** - With anime mascot
4. **Implement help system** - Interactive command guide
5. **Configure WSL environment** - Bash + Starship + Neovim
6. **Add lazy loading** - Speed up startup further
7. **Create workspace profiles** - Save/restore dev environments

---

## 📚 **Additional Resources**

- **Bootstrap Code**: `C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.ps1`
- **Claude Setup Guide**: `README-CLAUDE-SETUP.md`
- **OMP Themes**: `C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\`
- **MCP Servers**: `C:\Dev\Tools\MCP-Servers\`

---

**Version**: 2.0.0  
**Status**: Core Complete, Extensions In Progress  
**Last Updated**: 2025-12-17
