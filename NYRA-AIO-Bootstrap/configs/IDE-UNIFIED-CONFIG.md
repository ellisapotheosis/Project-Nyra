# Project Nyra - Unified IDE Configuration

**Purpose**: Consolidated IDE configurations for consistent development environment across all 4 PCs.

## Overview

This document provides unified configurations for:
- PowerShell profiles (Windows PCs)
- Zsh configuration (Mac Mini orchestrator)
- Git configuration
- Starship prompt
- Oh My Posh themes

## 🎯 Deployment Strategy

### PC Roles and Shell Requirements

| PC | Role | OS | Shell | Required Configs |
|----|------|----|----|------------------|
| PC1 | Orchestrator | macOS | zsh | zsh, git, starship |
| PC2 | Worker-2 CRM | Windows | PowerShell | PowerShell, git, oh-my-posh |
| PC3 | Worker-3 LLM | Windows | PowerShell | PowerShell, git, oh-my-posh |
| PC4 | Worker-4 Monitoring | Windows | PowerShell | PowerShell, git, oh-my-posh |

## 📦 Installation

### Automated Setup (Recommended)

```powershell
# Windows PCs (PC2, PC3, PC4)
.\NYRA-AIO-Bootstrap\scripts\install-ide-config.ps1 -PC "PC2"

# Mac Mini (PC1)
./NYRA-AIO-Bootstrap/scripts/install-ide-config.sh --pc PC1
```

### Manual Setup

See individual configuration sections below.

---

## 💻 PowerShell Configuration (Windows PCs)

### Profile Location
- Current User: `$PROFILE` or `~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`
- All Users: `C:\Program Files\PowerShell\7\profile.ps1`

### Unified PowerShell Profile

```powershell
#Requires -Version 7.0

# ============================================
# Project Nyra - PowerShell Profile
# ============================================

# Environment Variables
$env:NYRA_ROOT = "C:\Dev\Projects\Repos\Project-Nyra"
$env:NYRA_PC_ROLE = "WORKER-2"  # Change to PC2, PC3, or PC4

# Prompt Enhancement (Oh My Posh)
if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    oh-my-posh init pwsh --config "$env:NYRA_ROOT\NYRA-AIO-Bootstrap\configs\nyra-theme.omp.json" | Invoke-Expression
}

# PSReadLine Configuration (Better autocomplete)
if (Get-Module -ListAvailable PSReadLine) {
    Import-Module PSReadLine
    Set-PSReadLineOption -PredictionSource History
    Set-PSReadLineOption -PredictionViewStyle ListView
    Set-PSReadLineOption -EditMode Windows
    Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
    Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
    Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
}

# Aliases
Set-Alias -Name vim -Value nvim -ErrorAction SilentlyContinue
Set-Alias -Name g -Value git
Set-Alias -Name d -Value docker
Set-Alias -Name dc -Value docker-compose
Set-Alias -Name k -Value kubectl

# Project Nyra Functions
function nyra-status {
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "  Project Nyra System Status" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PC Role: $env:NYRA_PC_ROLE" -ForegroundColor Yellow
    Write-Host "Project Root: $env:NYRA_ROOT" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Docker Services:" -ForegroundColor Green
    docker-compose ps
}

function nyra-logs {
    param([string]$Service)
    if ($Service) {
        docker-compose logs -f --tail=100 $Service
    } else {
        docker-compose logs -f --tail=100
    }
}

function nyra-restart {
    param([string]$Service)
    if ($Service) {
        docker-compose restart $Service
        Write-Host "[+] Restarted service: $Service" -ForegroundColor Green
    } else {
        Write-Host "Usage: nyra-restart <service-name>" -ForegroundColor Red
    }
}

function nyra-health {
    Write-Host "Running comprehensive health check..." -ForegroundColor Cyan
    & "$env:NYRA_ROOT\scripts\health-check-all.ps1"
}

function nyra-backup {
    Write-Host "Starting daily backup..." -ForegroundColor Cyan
    & "$env:NYRA_ROOT\scripts\backup-daily.ps1"
}

function goto-nyra {
    Set-Location $env:NYRA_ROOT
}

# Quick navigation
function goto-services { Set-Location "$env:NYRA_ROOT\services" }
function goto-apps { Set-Location "$env:NYRA_ROOT\apps" }
function goto-infra { Set-Location "$env:NYRA_ROOT\infra" }
function goto-scripts { Set-Location "$env:NYRA_ROOT\scripts" }
function goto-docs { Set-Location "$env:NYRA_ROOT\docs" }

# Docker Compose shortcuts
function dcu { docker-compose up -d }
function dcd { docker-compose down }
function dcr { docker-compose restart }
function dcl { docker-compose logs -f --tail=100 }
function dcp { docker-compose ps }

# Git shortcuts
function gs { git status }
function ga { git add . }
function gc { param([string]$msg) git commit -m $msg }
function gp { git push }
function gl { git log --oneline --graph --decorate -10 }

# System info
function sysinfo {
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "  System Information" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Hostname: $env:COMPUTERNAME" -ForegroundColor Yellow
    Write-Host "Username: $env:USERNAME" -ForegroundColor Yellow
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Yellow
    Write-Host ""

    # GPU Info (if NVIDIA)
    if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) {
        Write-Host "GPU Information:" -ForegroundColor Green
        nvidia-smi --query-gpu=name,memory.total,memory.used,temperature.gpu --format=csv,noheader
    }
}

# Welcome message
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Project Nyra - $env:NYRA_PC_ROLE" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Green
Write-Host "  nyra-status    - System status" -ForegroundColor White
Write-Host "  nyra-health    - Health check" -ForegroundColor White
Write-Host "  nyra-logs      - View logs" -ForegroundColor White
Write-Host "  nyra-backup    - Run backup" -ForegroundColor White
Write-Host "  goto-nyra      - Go to project root" -ForegroundColor White
Write-Host ""
```

### Oh My Posh Theme (Nyra Custom)

**File**: `NYRA-AIO-Bootstrap/configs/nyra-theme.omp.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 2,
  "final_space": true,
  "console_title_template": "{{ .Folder }} @ {{ .HostName }}",
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "root",
          "style": "plain",
          "foreground": "red",
          "template": "⚡ "
        },
        {
          "type": "path",
          "style": "plain",
          "foreground": "cyan",
          "properties": {
            "style": "folder",
            "folder_separator_icon": " \ue0b1 ",
            "home_icon": "~"
          },
          "template": " {{ .Path }} "
        },
        {
          "type": "git",
          "style": "plain",
          "foreground": "yellow",
          "properties": {
            "fetch_status": true,
            "branch_icon": "\ue0a0 ",
            "branch_ahead_icon": "↑",
            "branch_behind_icon": "↓"
          },
          "template": " {{ .HEAD }}{{ if .Working.Changed }}*{{ end }} "
        },
        {
          "type": "docker",
          "style": "plain",
          "foreground": "blue",
          "template": " \uf308 {{ .Context }} "
        },
        {
          "type": "python",
          "style": "plain",
          "foreground": "green",
          "template": " \ue235 {{ .Full }} "
        },
        {
          "type": "node",
          "style": "plain",
          "foreground": "green",
          "template": " \ue718 {{ .Full }} "
        },
        {
          "type": "exit",
          "style": "plain",
          "foreground": "red",
          "foreground_templates": [
            "{{ if eq .Code 0 }}green{{ end }}"
          ],
          "template": " {{ if eq .Code 0 }}✓{{ else }}✗ {{ .Code }}{{ end }} "
        }
      ]
    },
    {
      "type": "prompt",
      "alignment": "right",
      "segments": [
        {
          "type": "time",
          "style": "plain",
          "foreground": "white",
          "properties": {
            "time_format": "15:04:05"
          },
          "template": " {{ .CurrentDate | date .Format }} "
        }
      ]
    },
    {
      "type": "prompt",
      "alignment": "left",
      "newline": true,
      "segments": [
        {
          "type": "text",
          "style": "plain",
          "foreground": "cyan",
          "template": "❯ "
        }
      ]
    }
  ]
}
```

---

## 🍎 Zsh Configuration (Mac Mini - PC1)

### Profile Location
- `~/.zshrc`

### Unified Zsh Configuration

```bash
# ============================================
# Project Nyra - Zsh Configuration (PC1)
# ============================================

# Environment Variables
export NYRA_ROOT="$HOME/Dev/Projects/Project-Nyra"
export NYRA_PC_ROLE="ORCHESTRATOR"

# Path
export PATH="$HOME/.local/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

# Starship Prompt
if command -v starship &> /dev/null; then
    eval "$(starship init zsh)"
fi

# Aliases
alias vim='nvim'
alias g='git'
alias d='docker'
alias dc='docker-compose'
alias k='kubectl'

# Project Nyra Functions
function nyra-status() {
    echo "=================================="
    echo "  Project Nyra System Status"
    echo "=================================="
    echo ""
    echo "PC Role: $NYRA_PC_ROLE"
    echo "Project Root: $NYRA_ROOT"
    echo ""
    echo "Docker Services:"
    docker-compose ps
}

function nyra-logs() {
    if [ -n "$1" ]; then
        docker-compose logs -f --tail=100 "$1"
    else
        docker-compose logs -f --tail=100
    fi
}

function nyra-restart() {
    if [ -n "$1" ]; then
        docker-compose restart "$1"
        echo "[+] Restarted service: $1"
    else
        echo "Usage: nyra-restart <service-name>"
    fi
}

function nyra-health() {
    echo "Running comprehensive health check..."
    "$NYRA_ROOT/scripts/health-check-all.sh"
}

function nyra-backup() {
    echo "Starting daily backup..."
    "$NYRA_ROOT/scripts/backup-daily.sh"
}

function goto-nyra() {
    cd "$NYRA_ROOT"
}

# Quick navigation
alias goto-services='cd $NYRA_ROOT/services'
alias goto-apps='cd $NYRA_ROOT/apps'
alias goto-infra='cd $NYRA_ROOT/infra'
alias goto-scripts='cd $NYRA_ROOT/scripts'
alias goto-docs='cd $NYRA_ROOT/docs'

# Docker Compose shortcuts
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcr='docker-compose restart'
alias dcl='docker-compose logs -f --tail=100'
alias dcp='docker-compose ps'

# Git shortcuts
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline --graph --decorate -10'

# System info
function sysinfo() {
    echo "=================================="
    echo "  System Information"
    echo "=================================="
    echo ""
    echo "Hostname: $(hostname)"
    echo "Username: $(whoami)"
    echo "Zsh: $ZSH_VERSION"
    echo ""
    echo "CPU: $(sysctl -n machdep.cpu.brand_string)"
    echo "Memory: $(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')"
}

# Welcome message
echo ""
echo "=================================="
echo "  Project Nyra - $NYRA_PC_ROLE"
echo "=================================="
echo ""
echo "Quick Commands:"
echo "  nyra-status    - System status"
echo "  nyra-health    - Health check"
echo "  nyra-logs      - View logs"
echo "  nyra-backup    - Run backup"
echo "  goto-nyra      - Go to project root"
echo ""
```

### Starship Configuration

**File**: `~/.config/starship.toml`

```toml
# Project Nyra - Starship Configuration

format = """
[┌─](bold cyan)$directory$git_branch$git_status$docker_context$python$nodejs
[└─](bold cyan)$character"""

[character]
success_symbol = "[❯](bold cyan)"
error_symbol = "[✗](bold red)"

[directory]
style = "bold cyan"
format = "[$path]($style)[$read_only]($read_only_style) "
truncation_length = 3
truncate_to_repo = true

[git_branch]
symbol = " "
style = "bold yellow"
format = "[$symbol$branch]($style) "

[git_status]
style = "bold yellow"
format = "([\\[$all_status$ahead_behind\\]]($style) )"

[docker_context]
symbol = " "
style = "bold blue"
format = "[$symbol$context]($style) "

[python]
symbol = " "
style = "bold green"
format = "[$symbol$version]($style) "

[nodejs]
symbol = " "
style = "bold green"
format = "[$symbol$version]($style) "

[time]
disabled = false
format = "[$time]($style) "
style = "white"
time_format = "%H:%M:%S"
```

---

## 🔧 Git Configuration (All PCs)

### Global Git Config

**File**: `~/.gitconfig` (Unix) or `C:\Users\<username>\.gitconfig` (Windows)

```ini
[user]
    name = Nyra Developer
    email = dev@ratehunter.net

[core]
    editor = nvim
    autocrlf = input     # Unix
    # autocrlf = true    # Windows (uncomment for Windows PCs)
    fileMode = false
    ignorecase = false

[init]
    defaultBranch = main

[pull]
    rebase = false

[push]
    default = simple
    autoSetupRemote = true

[fetch]
    prune = true

[diff]
    tool = nvimdiff
    colorMoved = zebra

[merge]
    tool = nvimdiff
    conflictstyle = diff3

[alias]
    # Status
    s = status --short
    st = status

    # Commits
    co = checkout
    cob = checkout -b
    cm = commit -m
    ca = commit --amend

    # Branches
    br = branch
    brd = branch -d

    # Logs
    l = log --oneline --graph --decorate -10
    ll = log --oneline --graph --decorate --all
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'

    # Diffs
    d = diff
    ds = diff --staged

    # Stash
    sl = stash list
    sp = stash pop
    ss = stash save

    # Reset
    undo = reset HEAD~1 --soft
    amend = commit --amend --no-edit

    # Pull/Push
    pl = pull
    ps = push
    pso = push origin

    # Remote
    r = remote -v

    # Clean
    cleanup = !git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d

[color]
    ui = auto
    branch = auto
    diff = auto
    status = auto

[color "branch"]
    current = yellow reverse
    local = yellow
    remote = green

[color "diff"]
    meta = yellow bold
    frag = magenta bold
    old = red bold
    new = green bold

[color "status"]
    added = green
    changed = yellow
    untracked = red
```

---

## 📋 Installation Scripts

### Windows Installation Script

**File**: `NYRA-AIO-Bootstrap/scripts/install-ide-config.ps1`

```powershell
#Requires -Version 7.0

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("PC2", "PC3", "PC4")]
    [string]$PC
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Project Nyra IDE Configuration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installing for: $PC" -ForegroundColor Yellow
Write-Host ""

$configRoot = "$PSScriptRoot\..\configs"

# Step 1: Install Oh My Posh
Write-Host "[1/5] Installing Oh My Posh..." -ForegroundColor Green
if (-not (Get-Command oh-my-posh -ErrorAction SilentlyContinue)) {
    winget install JanDeDobbeleer.OhMyPosh -s winget
    Write-Host "  [+] Oh My Posh installed" -ForegroundColor Green
} else {
    Write-Host "  [+] Oh My Posh already installed" -ForegroundColor Yellow
}

# Step 2: Install Nerd Font
Write-Host "[2/5] Installing Nerd Font..." -ForegroundColor Green
oh-my-posh font install CascadiaCode

# Step 3: Copy PowerShell Profile
Write-Host "[3/5] Configuring PowerShell profile..." -ForegroundColor Green
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path -Parent $profilePath

if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

# Read template and customize for PC
$profileContent = Get-Content "$configRoot\powershell-profile.ps1" -Raw
$profileContent = $profileContent -replace 'NYRA_PC_ROLE = "WORKER-2"', "NYRA_PC_ROLE = `"$PC`""
$profileContent | Out-File -FilePath $profilePath -Encoding UTF8 -Force

Write-Host "  [+] Profile installed: $profilePath" -ForegroundColor Green

# Step 4: Copy Oh My Posh Theme
Write-Host "[4/5] Installing Oh My Posh theme..." -ForegroundColor Green
$themeSource = "$configRoot\nyra-theme.omp.json"
$themeDest = "$env:NYRA_ROOT\NYRA-AIO-Bootstrap\configs\nyra-theme.omp.json"
Copy-Item -Path $themeSource -Destination $themeDest -Force
Write-Host "  [+] Theme installed: $themeDest" -ForegroundColor Green

# Step 5: Configure Git
Write-Host "[5/5] Configuring Git..." -ForegroundColor Green
$gitConfigSource = "$configRoot\gitconfig"
$gitConfigDest = "$env:USERPROFILE\.gitconfig"

if (Test-Path $gitConfigDest) {
    Write-Host "  [!] Git config already exists. Creating backup..." -ForegroundColor Yellow
    Copy-Item -Path $gitConfigDest -Destination "$gitConfigDest.backup" -Force
}

Copy-Item -Path $gitConfigSource -Destination $gitConfigDest -Force
git config --global core.autocrlf true  # Windows line endings
Write-Host "  [+] Git configured" -ForegroundColor Green

Write-Host ""
Write-Host "[+] Configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart PowerShell to apply changes"
Write-Host "  2. Set terminal font to 'CaskaydiaCove NF'"
Write-Host "  3. Run 'nyra-status' to verify setup"
Write-Host ""
```

### macOS Installation Script

**File**: `NYRA-AIO-Bootstrap/scripts/install-ide-config.sh`

```bash
#!/bin/bash
# Project Nyra IDE Configuration Setup (macOS)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================"
echo "  Project Nyra IDE Configuration Setup"
echo -e "========================================${NC}"
echo ""
echo -e "${YELLOW}Installing for: PC1 (Orchestrator)${NC}"
echo ""

CONFIG_ROOT="$(cd "$(dirname "$0")/../configs" && pwd)"

# Step 1: Install Homebrew
echo -e "${GREEN}[1/5] Checking Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo -e "  ${GREEN}[+] Homebrew installed${NC}"
else
    echo -e "  ${GREEN}[+] Homebrew already installed${NC}"
fi

# Step 2: Install Starship
echo -e "${GREEN}[2/5] Installing Starship...${NC}"
if ! command -v starship &> /dev/null; then
    brew install starship
    echo -e "  ${GREEN}[+] Starship installed${NC}"
else
    echo -e "  ${GREEN}[+] Starship already installed${NC}"
fi

# Step 3: Copy Zsh Profile
echo -e "${GREEN}[3/5] Configuring Zsh profile...${NC}"
cp "$CONFIG_ROOT/zshrc" "$HOME/.zshrc"
echo -e "  ${GREEN}[+] Profile installed: ~/.zshrc${NC}"

# Step 4: Copy Starship Config
echo -e "${GREEN}[4/5] Installing Starship config...${NC}"
mkdir -p "$HOME/.config"
cp "$CONFIG_ROOT/starship.toml" "$HOME/.config/starship.toml"
echo -e "  ${GREEN}[+] Config installed: ~/.config/starship.toml${NC}"

# Step 5: Configure Git
echo -e "${GREEN}[5/5] Configuring Git...${NC}"
if [ -f "$HOME/.gitconfig" ]; then
    echo -e "  ${YELLOW}[!] Git config already exists. Creating backup...${NC}"
    cp "$HOME/.gitconfig" "$HOME/.gitconfig.backup"
fi

cp "$CONFIG_ROOT/gitconfig" "$HOME/.gitconfig"
git config --global core.autocrlf input  # Unix line endings
echo -e "  ${GREEN}[+] Git configured${NC}"

echo ""
echo -e "${GREEN}[+] Configuration complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Restart terminal to apply changes"
echo "  2. Run 'nyra-status' to verify setup"
echo ""
```

---

## ✅ Verification

After installation, verify with:

### Windows
```powershell
# Restart PowerShell, then run:
nyra-status
oh-my-posh --version
git config --list
```

### macOS
```bash
# Restart terminal, then run:
nyra-status
starship --version
git config --list
```

---

## 🎨 Customization

### Changing PC Role

Edit your profile and update `$env:NYRA_PC_ROLE`:

```powershell
# PowerShell
$env:NYRA_PC_ROLE = "PC3"

# Zsh
export NYRA_PC_ROLE="ORCHESTRATOR"
```

### Changing Theme

Oh My Posh includes 200+ themes. Try them:

```powershell
Get-PoshThemes
oh-my-posh init pwsh --config "$(scoop prefix oh-my-posh)\themes\paradox.omp.json" | Invoke-Expression
```

### Adding Custom Functions

Add to your profile after the main configuration block.

---

## 📚 Additional Resources

- **Oh My Posh**: https://ohmyposh.dev
- **Starship**: https://starship.rs
- **PowerShell**: https://learn.microsoft.com/powershell
- **Zsh**: https://www.zsh.org
- **Git**: https://git-scm.com/docs

---

**Last Updated**: 2026-01-13
