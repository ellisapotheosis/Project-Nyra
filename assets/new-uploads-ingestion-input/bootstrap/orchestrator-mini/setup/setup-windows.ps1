# Project Nyra - Orchestrator Mini PC Setup (Windows)
# This script sets up the orchestrator node with MCP servers, coordination, and memory systems

<#
.SYNOPSIS
    Sets up the Orchestrator Mini PC for Project Nyra distributed architecture.

.DESCRIPTION
    Installs and configures:
    - WSL2 with Ubuntu
    - Docker Desktop with WSL2 backend
    - Claude Flow CLI and daemon
    - Infisical CLI and agent sidecar
    - Required dependencies and tools
    - Network configuration for distributed setup

.PARAMETER SkipWSL
    Skip WSL installation (if already installed)

.PARAMETER SkipDocker
    Skip Docker installation (if already installed)

.PARAMETER InfisicalToken
    Infisical service token for secrets management

.PARAMETER InfisicalProjectId
    Infisical project ID

.EXAMPLE
    .\setup-windows.ps1 -InfisicalToken "st.xxx" -InfisicalProjectId "proj-xxx"
#>

param(
    [switch]$SkipWSL = $false,
    [switch]$SkipDocker = $false,
    [string]$InfisicalToken = "",
    [string]$InfisicalProjectId = "",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

# ASCII Banner
Write-Info @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Project Nyra - Orchestrator Mini PC Setup              ║
║   Role: MCP Servers, Coordination, Memory Systems        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@

Write-Info "`n[1/10] Checking prerequisites..."

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "ERROR: This script must be run as Administrator!"
    Write-Info "Right-click PowerShell and select 'Run as Administrator'"
    exit 1
}

# Check Windows version (requires Windows 10 version 2004 or higher for WSL2)
$winVersion = [System.Environment]::OSVersion.Version
if ($winVersion.Major -lt 10) {
    Write-Error "ERROR: Windows 10 or higher is required"
    exit 1
}

Write-Success "✓ Prerequisites check passed"

# Install WSL2
if (-not $SkipWSL) {
    Write-Info "`n[2/10] Installing WSL2 with Ubuntu..."

    # Enable WSL feature
    $wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
    if ($wslFeature.State -ne "Enabled") {
        Write-Info "Enabling WSL feature..."
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart
    }

    # Enable Virtual Machine Platform
    $vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
    if ($vmFeature.State -ne "Enabled") {
        Write-Info "Enabling Virtual Machine Platform..."
        Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
    }

    # Install WSL2
    Write-Info "Installing WSL2..."
    wsl --install -d Ubuntu --no-launch

    # Set WSL2 as default
    wsl --set-default-version 2

    Write-Success "✓ WSL2 installed successfully"
    Write-Warning "NOTE: A system restart may be required for WSL2"
} else {
    Write-Info "`n[2/10] Skipping WSL installation (--SkipWSL flag set)"
}

# Install Chocolatey (package manager)
Write-Info "`n[3/10] Installing Chocolatey..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Success "✓ Chocolatey installed"
} else {
    Write-Success "✓ Chocolatey already installed"
}

# Install Docker Desktop
if (-not $SkipDocker) {
    Write-Info "`n[4/10] Installing Docker Desktop..."

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        choco install docker-desktop -y
        Write-Success "✓ Docker Desktop installed"
        Write-Warning "NOTE: Docker Desktop requires a restart. Please restart and re-run this script."
        Write-Info "After restart, run: .\setup-windows.ps1 -SkipWSL -SkipDocker"
        exit 0
    } else {
        Write-Success "✓ Docker Desktop already installed"
    }
} else {
    Write-Info "`n[4/10] Skipping Docker installation (--SkipDocker flag set)"
}

# Install Node.js (for Claude Flow)
Write-Info "`n[5/10] Installing Node.js LTS..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    choco install nodejs-lts -y
    Write-Success "✓ Node.js installed"
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    $nodeVersion = node --version
    Write-Success "✓ Node.js already installed ($nodeVersion)"
}

# Install Git
Write-Info "`n[6/10] Installing Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    choco install git -y
    Write-Success "✓ Git installed"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    $gitVersion = git --version
    Write-Success "✓ Git already installed ($gitVersion)"
}

# Install Claude Flow CLI
Write-Info "`n[7/10] Installing Claude Flow CLI..."
try {
    npm install -g @claude-flow/cli@latest
    Write-Success "✓ Claude Flow CLI installed"

    # Verify installation
    $cfVersion = npx @claude-flow/cli@latest --version
    Write-Info "Claude Flow version: $cfVersion"
} catch {
    Write-Error "Failed to install Claude Flow CLI: $_"
}

# Install Infisical CLI
Write-Info "`n[8/10] Installing Infisical CLI..."
if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    choco install infisical -y
    Write-Success "✓ Infisical CLI installed"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Success "✓ Infisical CLI already installed"
}

# Configure Infisical
Write-Info "`n[9/10] Configuring Infisical..."
if ($InfisicalToken -ne "" -and $InfisicalProjectId -ne "") {
    # Create config directory
    $configDir = "$env:USERPROFILE\.infisical"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    # Save credentials
    $configFile = "$configDir\config.json"
    $config = @{
        token = $InfisicalToken
        projectId = $InfisicalProjectId
        environment = "production"
        path = "/nyra/orchestrator"
    } | ConvertTo-Json

    $config | Out-File -FilePath $configFile -Encoding UTF8
    Write-Success "✓ Infisical configured for orchestrator node"

    # Test connection
    Write-Info "Testing Infisical connection..."
    try {
        infisical secrets
        Write-Success "✓ Infisical connection successful"
    } catch {
        Write-Warning "Warning: Could not connect to Infisical. Please verify your token and project ID."
    }
} else {
    Write-Warning "Skipping Infisical configuration (no token/project ID provided)"
    Write-Info "To configure later, run: infisical login"
}

# Create project directory structure
Write-Info "`n[10/10] Creating project directory structure..."
$projectRoot = "C:\nyra-orchestrator"
$directories = @(
    "$projectRoot\config",
    "$projectRoot\data",
    "$projectRoot\logs",
    "$projectRoot\scripts",
    "$projectRoot\secrets"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Success "✓ Project directory structure created at $projectRoot"

# Create environment file template
Write-Info "Creating environment file template..."
$envTemplate = @"
# Nyra Orchestrator Environment Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# System Configuration
NYRA_ENVIRONMENT=production
NYRA_PC_ID=orchestrator
NYRA_MODE=orchestrator
NYRA_LOG_LEVEL=info

# Infisical Configuration
INFISICAL_PROJECT_ID=$InfisicalProjectId
INFISICAL_TOKEN=$InfisicalToken
INFISICAL_DISABLE_UPDATE_CHECK=true

# MCP Configuration
MCP_PORT=8005
CLAUDE_FLOW_MCP_PORT=8003
INFISICAL_MCP_PORT=8006

# Claude Flow Configuration
CLAUDE_FLOW_MODE=v3
CLAUDE_FLOW_HOOKS_ENABLED=true
CLAUDE_FLOW_TOPOLOGY=hierarchical-mesh
CLAUDE_FLOW_MAX_AGENTS=15
CLAUDE_FLOW_MEMORY_BACKEND=hybrid

# Network Configuration
NYRA_NETWORK_SUBNET=172.21.0.0/16
NYRA_NETWORK_GATEWAY=172.21.0.1

# Database Configuration (will be populated by Infisical)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nyra_db
# POSTGRES_USER and POSTGRES_PASSWORD from Infisical

# Monitoring
GRAFANA_PORT=3000
PROMETHEUS_PORT=9090
LOKI_PORT=3100

# API Keys (stored in Infisical, referenced here)
# ANTHROPIC_API_KEY - from Infisical
# OPENAI_API_KEY - from Infisical
"@

$envFile = "$projectRoot\.env"
$envTemplate | Out-File -FilePath $envFile -Encoding UTF8
Write-Success "✓ Environment file created at $envFile"

# Create startup script
$startupScript = @"
# Nyra Orchestrator Startup Script
# Run this script to start all orchestrator services

param(
    [switch]`$Build = `$false,
    [switch]`$Logs = `$false
)

`$ErrorActionPreference = "Stop"

Write-Host "Starting Nyra Orchestrator services..." -ForegroundColor Cyan

# Load environment variables from Infisical
Write-Host "Loading secrets from Infisical..." -ForegroundColor Yellow
infisical run --env=production --path=/nyra/orchestrator -- docker compose -f docker-compose.orchestrator.yml up -d

if (`$Logs) {
    Write-Host "`nShowing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker compose -f docker-compose.orchestrator.yml logs -f
}

Write-Host "✓ Orchestrator services started successfully" -ForegroundColor Green
Write-Host "`nAccess points:"
Write-Host "  - Grafana: http://localhost:3000"
Write-Host "  - Prometheus: http://localhost:9090"
Write-Host "  - MetaMCP Gateway: http://localhost:8005"
Write-Host "  - Claude Flow MCP: http://localhost:8003"
Write-Host "  - Infisical MCP: http://localhost:8006"
"@

$startupScriptPath = "$projectRoot\scripts\start-orchestrator.ps1"
$startupScript | Out-File -FilePath $startupScriptPath -Encoding UTF8
Write-Success "✓ Startup script created at $startupScriptPath"

# Final summary
Write-Success "`n╔═══════════════════════════════════════════════════════════╗"
Write-Success "║                                                           ║"
Write-Success "║   ✓ Orchestrator Mini PC Setup Complete!                 ║"
Write-Success "║                                                           ║"
Write-Success "╚═══════════════════════════════════════════════════════════╝"

Write-Info "`nInstalled Components:"
Write-Info "  ✓ WSL2 with Ubuntu"
Write-Info "  ✓ Docker Desktop"
Write-Info "  ✓ Node.js LTS"
Write-Info "  ✓ Claude Flow CLI"
Write-Info "  ✓ Infisical CLI"
Write-Info "  ✓ Git"

Write-Info "`nNext Steps:"
Write-Info "  1. Restart your computer to complete WSL2 setup (if not done already)"
Write-Info "  2. Run the WSL setup script: cd $projectRoot && wsl bash setup-wsl.sh"
Write-Info "  3. Start Docker Desktop"
Write-Info "  4. Navigate to: $projectRoot"
Write-Info "  5. Start services: .\scripts\start-orchestrator.ps1"

Write-Info "`nProject Directory: $projectRoot"
Write-Info "Environment File: $envFile"
Write-Info "Startup Script: $startupScriptPath"

Write-Warning "`n⚠️  IMPORTANT: After restart, run the WSL setup script:"
Write-Info "wsl -d Ubuntu -- bash /mnt/c/nyra-orchestrator/setup-wsl.sh"
