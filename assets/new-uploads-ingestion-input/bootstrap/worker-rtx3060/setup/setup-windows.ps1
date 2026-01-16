# Project Nyra - Worker RTX 3060 Setup (Windows)
# This script sets up a GPU worker node for AI inference and processing

<#
.SYNOPSIS
    Sets up the Worker RTX 3060 PC for Project Nyra distributed architecture.

.DESCRIPTION
    Installs and configures:
    - WSL2 with Ubuntu
    - Docker Desktop with WSL2 backend
    - NVIDIA Container Toolkit
    - Claude Flow worker configuration
    - Infisical CLI and agent sidecar
    - GPU monitoring tools

.PARAMETER SkipWSL
    Skip WSL installation (if already installed)

.PARAMETER SkipDocker
    Skip Docker installation (if already installed)

.PARAMETER InfisicalToken
    Infisical service token for secrets management

.PARAMETER InfisicalProjectId
    Infisical project ID

.PARAMETER OrchestratorUrl
    URL of the orchestrator node (e.g., https://orchestrator.nyra.local)

.EXAMPLE
    .\setup-windows.ps1 -InfisicalToken "st.xxx" -InfisicalProjectId "proj-xxx" -OrchestratorUrl "https://orchestrator.nyra.local"
#>

param(
    [switch]$SkipWSL = $false,
    [switch]$SkipDocker = $false,
    [string]$InfisicalToken = "",
    [string]$InfisicalProjectId = "",
    [string]$OrchestratorUrl = "",
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
║   Project Nyra - Worker RTX 3060 Setup                   ║
║   Role: AI Inference Worker (12GB VRAM)                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@

Write-Info "`n[1/11] Checking prerequisites..."

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "ERROR: This script must be run as Administrator!"
    Write-Info "Right-click PowerShell and select 'Run as Administrator'"
    exit 1
}

# Check for NVIDIA GPU
Write-Info "Checking for NVIDIA GPU..."
try {
    $gpu = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }
    if ($gpu) {
        Write-Success "✓ NVIDIA GPU detected: $($gpu.Name)"
        if ($gpu.Name -notlike "*3060*") {
            Write-Warning "Warning: Expected RTX 3060 but found: $($gpu.Name)"
        }
    } else {
        Write-Warning "Warning: No NVIDIA GPU detected. GPU features may not work."
    }
} catch {
    Write-Warning "Warning: Could not detect GPU information"
}

Write-Success "✓ Prerequisites check passed"

# Install WSL2
if (-not $SkipWSL) {
    Write-Info "`n[2/11] Installing WSL2 with Ubuntu..."

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
    Write-Info "`n[2/11] Skipping WSL installation (--SkipWSL flag set)"
}

# Install Chocolatey
Write-Info "`n[3/11] Installing Chocolatey..."
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
    Write-Info "`n[4/11] Installing Docker Desktop..."

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
    Write-Info "`n[4/11] Skipping Docker installation (--SkipDocker flag set)"
}

# Install NVIDIA GeForce Experience and drivers
Write-Info "`n[5/11] Checking NVIDIA drivers..."
try {
    $nvidiaVersion = nvidia-smi --query-gpu=driver_version --format=csv,noheader 2>$null
    if ($nvidiaVersion) {
        Write-Success "✓ NVIDIA drivers installed (version: $nvidiaVersion)"
    } else {
        Write-Warning "NVIDIA drivers not detected. Please install from: https://www.nvidia.com/download/index.aspx"
        Write-Info "Required: Latest Game Ready Driver for RTX 3060"
    }
} catch {
    Write-Warning "NVIDIA drivers not found. Please install from: https://www.nvidia.com/download/index.aspx"
}

# Install Node.js
Write-Info "`n[6/11] Installing Node.js LTS..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    choco install nodejs-lts -y
    Write-Success "✓ Node.js installed"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    $nodeVersion = node --version
    Write-Success "✓ Node.js already installed ($nodeVersion)"
}

# Install Git
Write-Info "`n[7/11] Installing Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    choco install git -y
    Write-Success "✓ Git installed"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    $gitVersion = git --version
    Write-Success "✓ Git already installed ($gitVersion)"
}

# Install Claude Flow CLI
Write-Info "`n[8/11] Installing Claude Flow CLI..."
try {
    npm install -g @claude-flow/cli@latest
    Write-Success "✓ Claude Flow CLI installed"

    $cfVersion = npx @claude-flow/cli@latest --version
    Write-Info "Claude Flow version: $cfVersion"
} catch {
    Write-Error "Failed to install Claude Flow CLI: $_"
}

# Install Infisical CLI
Write-Info "`n[9/11] Installing Infisical CLI..."
if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    choco install infisical -y
    Write-Success "✓ Infisical CLI installed"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Success "✓ Infisical CLI already installed"
}

# Configure Infisical
Write-Info "`n[10/11] Configuring Infisical..."
if ($InfisicalToken -ne "" -and $InfisicalProjectId -ne "") {
    $configDir = "$env:USERPROFILE\.infisical"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    $configFile = "$configDir\config.json"
    $config = @{
        token = $InfisicalToken
        projectId = $InfisicalProjectId
        environment = "production"
        path = "/nyra/worker-1"
    } | ConvertTo-Json

    $config | Out-File -FilePath $configFile -Encoding UTF8
    Write-Success "✓ Infisical configured for worker-1 (RTX 3060)"

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
Write-Info "`n[11/11] Creating project directory structure..."
$projectRoot = "C:\nyra-worker-rtx3060"
$directories = @(
    "$projectRoot\config",
    "$projectRoot\data",
    "$projectRoot\logs",
    "$projectRoot\scripts",
    "$projectRoot\secrets",
    "$projectRoot\models"
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
# Nyra Worker RTX 3060 Environment Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# System Configuration
NYRA_ENVIRONMENT=production
NYRA_PC_ID=worker-1
NYRA_MODE=worker
NYRA_WORKER_ID=1
NYRA_GPU_TYPE=rtx_3060
NYRA_LOG_LEVEL=info

# GPU Configuration
NVIDIA_VISIBLE_DEVICES=all
CUDA_VERSION=12.3
NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Infisical Configuration
INFISICAL_PROJECT_ID=$InfisicalProjectId
INFISICAL_TOKEN=$InfisicalToken
INFISICAL_DISABLE_UPDATE_CHECK=true

# Orchestrator Connection
ORCHESTRATOR_URL=$OrchestratorUrl
METAMCP_GATEWAY_URL=${OrchestratorUrl}/mcp

# Worker Configuration
WORKER_MAX_CONCURRENT_TASKS=4
WORKER_GPU_MEMORY_LIMIT=12GB
WORKER_ENABLE_GPU_MONITORING=true

# Ollama Configuration
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_MODELS_DIR=/models

# vLLM Configuration
VLLM_PORT=8000
VLLM_GPU_MEMORY_UTILIZATION=0.90

# API Keys (stored in Infisical, referenced here)
# ANTHROPIC_API_KEY - from Infisical
# OPENAI_API_KEY - from Infisical
"@

$envFile = "$projectRoot\.env"
$envTemplate | Out-File -FilePath $envFile -Encoding UTF8
Write-Success "✓ Environment file created at $envFile"

# Create startup script
$startupScript = @"
# Nyra Worker RTX 3060 Startup Script
# Run this script to start the worker services

param(
    [switch]`$Logs = `$false
)

`$ErrorActionPreference = "Stop"

Write-Host "Starting Nyra Worker (RTX 3060) services..." -ForegroundColor Cyan

# Check GPU availability
Write-Host "`nChecking GPU..." -ForegroundColor Yellow
try {
    `$gpuInfo = nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader 2>`$null
    if (`$gpuInfo) {
        Write-Host "✓ GPU Available: `$gpuInfo" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Warning: Could not query GPU" -ForegroundColor Yellow
}

# Load environment variables from Infisical
Write-Host "`nLoading secrets from Infisical..." -ForegroundColor Yellow
infisical run --env=production --path=/nyra/worker-1 -- docker compose -f docker-compose.worker.yml up -d

if (`$Logs) {
    Write-Host "`nShowing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker compose -f docker-compose.worker.yml logs -f
}

Write-Host "`n✓ Worker services started successfully" -ForegroundColor Green
Write-Host "`nGPU Monitoring:"
Write-Host "  - nvidia-smi: Monitor GPU usage"
Write-Host "  - http://localhost:9001: GPU metrics endpoint"
Write-Host "`nServices:"
Write-Host "  - Ollama: http://localhost:11434"
Write-Host "  - vLLM: http://localhost:8000"
"@

$startupScriptPath = "$projectRoot\scripts\start-worker.ps1"
$startupScript | Out-File -FilePath $startupScriptPath -Encoding UTF8
Write-Success "✓ Startup script created at $startupScriptPath"

# Create GPU monitoring script
$gpuMonitorScript = @"
# GPU Monitoring Script
param(
    [int]`$RefreshSeconds = 2
)

while (`$true) {
    Clear-Host
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         Nyra Worker RTX 3060 - GPU Monitor               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    nvidia-smi

    Write-Host "`nRefreshing in `$RefreshSeconds seconds... (Ctrl+C to exit)" -ForegroundColor Yellow
    Start-Sleep -Seconds `$RefreshSeconds
}
"@

$gpuMonitorPath = "$projectRoot\scripts\monitor-gpu.ps1"
$gpuMonitorScript | Out-File -FilePath $gpuMonitorPath -Encoding UTF8
Write-Success "✓ GPU monitoring script created at $gpuMonitorPath"

# Final summary
Write-Success "`n╔═══════════════════════════════════════════════════════════╗"
Write-Success "║                                                           ║"
Write-Success "║   ✓ Worker RTX 3060 Setup Complete!                      ║"
Write-Success "║                                                           ║"
Write-Success "╚═══════════════════════════════════════════════════════════╝"

Write-Info "`nInstalled Components:"
Write-Info "  ✓ WSL2 with Ubuntu"
Write-Info "  ✓ Docker Desktop"
Write-Info "  ✓ Node.js LTS"
Write-Info "  ✓ Claude Flow CLI"
Write-Info "  ✓ Infisical CLI"
Write-Info "  ✓ Git"

Write-Info "`nGPU Information:"
Write-Info "  Model: RTX 3060"
Write-Info "  VRAM: 12GB"
Write-Info "  Role: AI Inference Worker"

Write-Info "`nNext Steps:"
Write-Info "  1. Restart your computer (if WSL/Docker were just installed)"
Write-Info "  2. Ensure NVIDIA drivers are installed (latest Game Ready)"
Write-Info "  3. Run the WSL setup script: wsl bash /mnt/c/nyra-worker-rtx3060/setup-wsl.sh"
Write-Info "  4. Start Docker Desktop (enable WSL2 integration)"
Write-Info "  5. Start services: .\scripts\start-worker.ps1"

Write-Info "`nUseful Scripts:"
Write-Info "  Startup: $startupScriptPath"
Write-Info "  GPU Monitor: $gpuMonitorPath"

Write-Info "`nProject Directory: $projectRoot"
Write-Info "Environment File: $envFile"
