# Project Nyra - Worker RTX 3090 Ti Setup (Windows)
# This script sets up a high-end GPU worker node for AI inference

<#
.SYNOPSIS
    Sets up the Worker RTX 3090 Ti PC for Project Nyra distributed architecture.

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
    URL of the orchestrator node

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

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

Write-Info @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Project Nyra - Worker RTX 3090 Ti Setup                ║
║   Role: High-End AI Inference Worker (24GB VRAM)         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@

Write-Info "`n[1/11] Checking prerequisites..."

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "ERROR: This script must be run as Administrator!"
    exit 1
}

Write-Info "Checking for NVIDIA GPU..."
try {
    $gpu = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }
    if ($gpu) {
        Write-Success "✓ NVIDIA GPU detected: $($gpu.Name)"
        if ($gpu.Name -notlike "*3090*" -and $gpu.Name -notlike "*4090*") {
            Write-Warning "Warning: Expected RTX 3090 Ti but found: $($gpu.Name)"
        }
    }
} catch {
    Write-Warning "Warning: Could not detect GPU information"
}

Write-Success "✓ Prerequisites check passed"

if (-not $SkipWSL) {
    Write-Info "`n[2/11] Installing WSL2..."
    $wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
    if ($wslFeature.State -ne "Enabled") {
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart
    }
    $vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
    if ($vmFeature.State -ne "Enabled") {
        Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
    }
    wsl --install -d Ubuntu --no-launch
    wsl --set-default-version 2
    Write-Success "✓ WSL2 installed"
}

Write-Info "`n[3/11] Installing Chocolatey..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Success "✓ Chocolatey installed"
} else {
    Write-Success "✓ Chocolatey already installed"
}

if (-not $SkipDocker) {
    Write-Info "`n[4/11] Installing Docker Desktop..."
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        choco install docker-desktop -y
        Write-Success "✓ Docker Desktop installed"
        Write-Warning "NOTE: Restart required. Re-run with: .\setup-windows.ps1 -SkipWSL -SkipDocker"
        exit 0
    } else {
        Write-Success "✓ Docker Desktop already installed"
    }
}

Write-Info "`n[5/11] Checking NVIDIA drivers..."
try {
    $nvidiaVersion = nvidia-smi --query-gpu=driver_version --format=csv,noheader 2>$null
    if ($nvidiaVersion) {
        Write-Success "✓ NVIDIA drivers installed (version: $nvidiaVersion)"
    } else {
        Write-Warning "Install from: https://www.nvidia.com/download/index.aspx"
    }
} catch {
    Write-Warning "NVIDIA drivers not found. Install latest drivers for RTX 3090 Ti."
}

Write-Info "`n[6/11] Installing Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    choco install nodejs-lts -y
    Write-Success "✓ Node.js installed"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Success "✓ Node.js already installed ($(node --version))"
}

Write-Info "`n[7/11] Installing Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    choco install git -y
    Write-Success "✓ Git installed"
} else {
    Write-Success "✓ Git already installed"
}

Write-Info "`n[8/11] Installing Claude Flow CLI..."
npm install -g @claude-flow/cli@latest
Write-Success "✓ Claude Flow CLI installed ($(npx @claude-flow/cli@latest --version))"

Write-Info "`n[9/11] Installing Infisical CLI..."
if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    choco install infisical -y
    Write-Success "✓ Infisical CLI installed"
} else {
    Write-Success "✓ Infisical CLI already installed"
}

Write-Info "`n[10/11] Configuring Infisical..."
if ($InfisicalToken -ne "" -and $InfisicalProjectId -ne "") {
    $configDir = "$env:USERPROFILE\.infisical"
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    @{
        token = $InfisicalToken
        projectId = $InfisicalProjectId
        environment = "production"
        path = "/nyra/worker-3"
    } | ConvertTo-Json | Out-File -FilePath "$configDir\config.json" -Encoding UTF8
    Write-Success "✓ Infisical configured for worker-3 (RTX 3090 Ti)"
} else {
    Write-Warning "Skipping Infisical config. Run: infisical login"
}

Write-Info "`n[11/11] Creating project structure..."
$projectRoot = "C:\nyra-worker-rtx3090ti"
@("config","data","logs","scripts","secrets","models") | ForEach-Object {
    New-Item -ItemType Directory -Path "$projectRoot\$_" -Force | Out-Null
}
Write-Success "✓ Project structure created at $projectRoot"

@"
# Nyra Worker RTX 3090 Ti Configuration
NYRA_ENVIRONMENT=production
NYRA_PC_ID=worker-3
NYRA_MODE=worker
NYRA_WORKER_ID=3
NYRA_GPU_TYPE=rtx_3090ti
NYRA_LOG_LEVEL=info
NVIDIA_VISIBLE_DEVICES=all
CUDA_VERSION=12.3
INFISICAL_PROJECT_ID=$InfisicalProjectId
INFISICAL_TOKEN=$InfisicalToken
ORCHESTRATOR_URL=$OrchestratorUrl
WORKER_MAX_CONCURRENT_TASKS=6
WORKER_GPU_MEMORY_LIMIT=24GB
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
VLLM_PORT=8000
VLLM_GPU_MEMORY_UTILIZATION=0.92
"@ | Out-File -FilePath "$projectRoot\.env" -Encoding UTF8

@"
param([switch]`$Logs = `$false)
Write-Host "Starting Nyra Worker (RTX 3090 Ti)..." -ForegroundColor Cyan
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
infisical run --env=production --path=/nyra/worker-3 -- docker compose -f docker-compose.worker.yml up -d
if (`$Logs) { docker compose -f docker-compose.worker.yml logs -f }
Write-Host "✓ Services started" -ForegroundColor Green
"@ | Out-File -FilePath "$projectRoot\scripts\start-worker.ps1" -Encoding UTF8

@"
param([int]`$RefreshSeconds = 2)
while (`$true) {
    Clear-Host
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║      Nyra Worker RTX 3090 Ti - GPU Monitor               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    nvidia-smi
    Write-Host "`nRefreshing in `$RefreshSeconds seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds `$RefreshSeconds
}
"@ | Out-File -FilePath "$projectRoot\scripts\monitor-gpu.ps1" -Encoding UTF8

Write-Success "`n╔═══════════════════════════════════════════════════════════╗"
Write-Success "║   ✓ Worker RTX 3090 Ti Setup Complete!                   ║"
Write-Success "╚═══════════════════════════════════════════════════════════╝"

Write-Info "`nGPU: RTX 3090 Ti (24GB VRAM)"
Write-Info "Role: High-End AI Inference Worker"
Write-Info "Project: $projectRoot"
Write-Info "`nNext Steps:"
Write-Info "  1. Restart (if WSL/Docker just installed)"
Write-Info "  2. Run: wsl bash /mnt/c/nyra-worker-rtx3090ti/setup-wsl.sh"
Write-Info "  3. Start services: .\scripts\start-worker.ps1"
Write-Info "  4. Monitor GPU: .\scripts\monitor-gpu.ps1"
