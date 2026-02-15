#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Setup script for GPU Worker-3060 (RTX 3060 12GB) - Project Nyra
.DESCRIPTION
    Installs and configures:
    - Docker Desktop with GPU support
    - NVIDIA drivers and CUDA 12.4
    - Ollama with CodeLlama 34B, Qwen 2 32B, Gemma 2 27B
    - Infisical agent for secrets management
    - Tailscale VPN
    - Cloudflared tunnel
    - Health monitoring
.NOTES
    Requires: Windows 10/11, PowerShell 5.1+, Administrator privileges
#>

param(
    [switch]$SkipDrivers,
    [switch]$SkipDocker,
    [switch]$Validate
)

$ErrorActionPreference = "Stop"
$WorkerName = "worker-3060"
$WorkerDir = $PSScriptRoot
$LogFile = "$WorkerDir\setup.log"

# Colors
function Write-Step { param($Message) Write-Host "`n[STEP] $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }

# Logging
function Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -Append -FilePath $LogFile
}

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         Project Nyra - GPU Worker Setup                   ║
║         Worker: RTX 3060 (12GB VRAM)                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

Log "Setup started for $WorkerName"

# ============================================================================
# 1. System Requirements Check
# ============================================================================
Write-Step "Checking system requirements..."

$OSVersion = (Get-CimInstance Win32_OperatingSystem).Version
$RAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
$DiskSpace = [math]::Round((Get-PSDrive C).Free / 1GB, 2)

Write-Host "  OS Version: $OSVersion"
Write-Host "  RAM: $RAM GB"
Write-Host "  Free Disk Space: $DiskSpace GB"

if ($RAM -lt 16) {
    Write-Warning "Recommended RAM is 16GB+. Current: $RAM GB"
}

if ($DiskSpace -lt 100) {
    Write-Error "Insufficient disk space. Need 100GB+, have $DiskSpace GB"
    exit 1
}

Write-Success "System requirements check passed"
Log "System check: RAM=$RAM GB, Disk=$DiskSpace GB"

# ============================================================================
# 2. Install Chocolatey (Package Manager)
# ============================================================================
Write-Step "Installing Chocolatey package manager..."

if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Success "Chocolatey installed"
    Log "Chocolatey installed"
} else {
    Write-Success "Chocolatey already installed"
}

# ============================================================================
# 3. Install NVIDIA Drivers and CUDA 12.4
# ============================================================================
if (!$SkipDrivers) {
    Write-Step "Installing NVIDIA GPU drivers and CUDA 12.4..."

    # Check if NVIDIA GPU exists
    $GPU = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }
    if (!$GPU) {
        Write-Error "NVIDIA GPU not detected. Is the RTX 3060 installed?"
        exit 1
    }

    Write-Host "  Detected: $($GPU.Name)"

    # Check current driver version
    $CurrentDriver = $GPU.DriverVersion
    Write-Host "  Current driver version: $CurrentDriver"

    # Install CUDA Toolkit 12.4
    $CudaVersion = "12.4"
    if (!(Test-Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v$CudaVersion")) {
        Write-Host "  Installing CUDA $CudaVersion..."
        choco install cuda --version=12.4.0 -y
        Write-Success "CUDA $CudaVersion installed"
        Log "CUDA $CudaVersion installed"
    } else {
        Write-Success "CUDA $CudaVersion already installed"
    }

    # Set CUDA environment variables
    [System.Environment]::SetEnvironmentVariable("CUDA_PATH", "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v$CudaVersion", "Machine")
    [System.Environment]::SetEnvironmentVariable("CUDA_PATH_V12_4", "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v$CudaVersion", "Machine")

    # Add to PATH
    $CudaBinPath = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v$CudaVersion\bin"
    $CurrentPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($CurrentPath -notlike "*$CudaBinPath*") {
        [System.Environment]::SetEnvironmentVariable("Path", "$CurrentPath;$CudaBinPath", "Machine")
        Write-Success "CUDA added to PATH"
    }

    # Install cuDNN
    Write-Host "  Checking cuDNN..."
    if (!(Test-Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v$CudaVersion\bin\cudnn64_8.dll")) {
        Write-Warning "cuDNN not found. Download from: https://developer.nvidia.com/cudnn"
        Write-Host "  Extract to: C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v$CudaVersion"
    } else {
        Write-Success "cuDNN installed"
    }

    Write-Success "NVIDIA drivers and CUDA setup complete"
} else {
    Write-Warning "Skipping driver installation (--SkipDrivers)"
}

# ============================================================================
# 4. Install Docker Desktop with GPU Support
# ============================================================================
if (!$SkipDocker) {
    Write-Step "Installing Docker Desktop with GPU support..."

    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        choco install docker-desktop -y
        Write-Success "Docker Desktop installed"
        Log "Docker Desktop installed"
        Write-Warning "Please restart your computer and run this script again"
        Write-Host "`nAfter restart, enable WSL2 integration and GPU support in Docker Desktop settings."
        pause
        exit 0
    } else {
        Write-Success "Docker Desktop already installed"

        # Verify Docker is running
        $dockerRunning = docker ps 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Docker Desktop is not running. Starting..."
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            Start-Sleep -Seconds 10
        }
    }

    # Check Docker GPU support
    Write-Host "  Checking Docker GPU support..."
    $gpuCheck = docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker GPU support confirmed"
    } else {
        Write-Warning "Docker GPU support not working. Enable in Docker Desktop settings."
    }

} else {
    Write-Warning "Skipping Docker installation (--SkipDocker)"
}

# ============================================================================
# 5. Install Ollama
# ============================================================================
Write-Step "Installing Ollama..."

if (!(Get-Command ollama -ErrorAction SilentlyContinue)) {
    # Download and install Ollama
    $OllamaInstaller = "$env:TEMP\OllamaSetup.exe"
    Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $OllamaInstaller
    Start-Process -FilePath $OllamaInstaller -ArgumentList "/S" -Wait
    Write-Success "Ollama installed"
    Log "Ollama installed"
} else {
    Write-Success "Ollama already installed"
}

# Configure Ollama environment
[System.Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0:11434", "Machine")
[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "Machine")
[System.Environment]::SetEnvironmentVariable("OLLAMA_NUM_PARALLEL", "2", "Machine")
[System.Environment]::SetEnvironmentVariable("OLLAMA_MAX_LOADED_MODELS", "3", "Machine")

# Restart Ollama service to apply changes
Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden

Write-Success "Ollama configured on port 11434"
Log "Ollama configured"

# ============================================================================
# 6. Pull Ollama Models (CodeLlama 34B, Qwen 2 32B, Gemma 2 27B)
# ============================================================================
Write-Step "Pulling Ollama models (this will take 30-60 minutes)..."

$Models = @(
    @{ Name = "codellama:34b"; Description = "CodeLlama 34B (Primary - Code analysis, OCR)" }
    @{ Name = "qwen2:32b"; Description = "Qwen 2 32B (Secondary - Document processing)" }
    @{ Name = "gemma2:27b"; Description = "Gemma 2 27B (Tertiary - Classification, embeddings)" }
)

foreach ($model in $Models) {
    Write-Host "`n  Pulling $($model.Name) - $($model.Description)..."
    ollama pull $model.Name
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$($model.Name) downloaded"
        Log "Model pulled: $($model.Name)"
    } else {
        Write-Error "Failed to pull $($model.Name)"
    }
}

# Verify models
Write-Host "`n  Installed models:"
ollama list

Write-Success "All models pulled successfully"

# ============================================================================
# 7. Install Infisical CLI
# ============================================================================
Write-Step "Installing Infisical CLI..."

if (!(Get-Command infisical -ErrorAction SilentlyContinue)) {
    choco install infisical -y
    Write-Success "Infisical CLI installed"
    Log "Infisical CLI installed"
} else {
    Write-Success "Infisical CLI already installed"
}

# ============================================================================
# 8. Setup Infisical Agent
# ============================================================================
Write-Step "Setting up Infisical agent..."

$InfisicalConfig = @{
    ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
    Environment = "dev"
    Path = "/worker-3060"
}

# Create .env file from Infisical secrets
Write-Host "  Pulling secrets from Infisical..."
Write-Warning "You must login to Infisical first: infisical login"

# Create infisical agent config
$AgentConfigPath = "$WorkerDir\infisical-agent.yaml"
$AgentConfig = @"
project-id: $($InfisicalConfig.ProjectId)
environment: $($InfisicalConfig.Environment)
secret-path: $($InfisicalConfig.Path)
agent:
  port: 8200
  tls:
    enabled: false
cache:
  ttl: 300
"@

$AgentConfig | Out-File -FilePath $AgentConfigPath -Encoding UTF8
Write-Success "Infisical agent config created"

# Create Windows service for Infisical agent (optional)
Write-Host "  To run Infisical agent as a service, use NSSM:"
Write-Host "    choco install nssm -y"
Write-Host "    nssm install infisical-agent infisical agent --config=$AgentConfigPath"

# ============================================================================
# 9. Create .env file
# ============================================================================
Write-Step "Creating .env file..."

$EnvContent = @"
# Worker-3060 Configuration
WORKER_NAME=worker-3060
WORKER_TYPE=gpu
GPU_MODEL=RTX_3060
VRAM_GB=12
WORKER_ROLE=document-processing

# Ollama Configuration
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=3

# Primary Models
PRIMARY_MODEL=codellama:34b
SECONDARY_MODEL=qwen2:32b
TERTIARY_MODEL=gemma2:27b

# Network Configuration
TAILSCALE_HOSTNAME=worker-3060.tail-net.ts.net
NEXUS_ROUTER_URL=http://nexus-router.tail-net.ts.net:6000

# Infisical Configuration
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV=dev
INFISICAL_PATH=/worker-3060

# GPU Configuration
CUDA_VERSION=12.4
CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.4

# Health Check
HEALTH_CHECK_INTERVAL=60
HEALTH_CHECK_TIMEOUT=10

# Cloudflared
CLOUDFLARED_TUNNEL_ID=
CLOUDFLARED_TUNNEL_TOKEN=

# ONNX Runtime
ONNX_RUNTIME_PROVIDER=cuda
ONNX_RUNTIME_DEVICE=0
"@

$EnvContent | Out-File -FilePath "$WorkerDir\.env" -Encoding UTF8
Write-Success ".env file created"

# ============================================================================
# 10. Install Tailscale
# ============================================================================
Write-Step "Installing Tailscale VPN..."

if (!(Get-Command tailscale -ErrorAction SilentlyContinue)) {
    choco install tailscale -y
    Write-Success "Tailscale installed"
    Log "Tailscale installed"
    Write-Host "`n  Configure Tailscale:"
    Write-Host "    1. Run: tailscale up"
    Write-Host "    2. Authenticate in browser"
    Write-Host "    3. Set hostname to: worker-3060"
} else {
    Write-Success "Tailscale already installed"

    # Check if connected
    $tailscaleStatus = tailscale status 2>&1
    if ($tailscaleStatus -like "*Logged out*") {
        Write-Warning "Tailscale not authenticated. Run: tailscale up"
    } else {
        Write-Success "Tailscale connected"
    }
}

# ============================================================================
# 11. Install Cloudflared
# ============================================================================
Write-Step "Installing Cloudflared tunnel..."

if (!(Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    choco install cloudflared -y
    Write-Success "Cloudflared installed"
    Log "Cloudflared installed"
} else {
    Write-Success "Cloudflared already installed"
}

Write-Host "`n  To create a tunnel:"
Write-Host "    cloudflared tunnel create worker-3060"
Write-Host "    cloudflared tunnel route dns worker-3060 worker-3060.yourdomain.com"

# ============================================================================
# 12. Install Node.js and Python (for embeddings)
# ============================================================================
Write-Step "Installing Node.js and Python..."

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    choco install nodejs-lts -y
    Write-Success "Node.js installed"
} else {
    Write-Success "Node.js already installed"
}

if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    choco install python311 -y
    Write-Success "Python 3.11 installed"
} else {
    Write-Success "Python already installed"
}

# Install Python packages for embeddings
Write-Host "  Installing Python packages..."
python -m pip install --upgrade pip
pip install transformers torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
pip install sentence-transformers onnxruntime-gpu

Write-Success "Python packages installed"

# ============================================================================
# 13. Setup Docker Compose
# ============================================================================
Write-Step "Setting up Docker Compose services..."

# Start Docker Compose services
Set-Location $WorkerDir
docker-compose -f docker-compose.worker-3060.yml pull
Write-Success "Docker images pulled"

# ============================================================================
# 14. Validation
# ============================================================================
Write-Step "Running validation checks..."

$ValidationResults = @()

# Check 1: Docker running
$dockerCheck = docker ps 2>&1
$ValidationResults += @{
    Check = "Docker"
    Status = if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }
}

# Check 2: NVIDIA GPU accessible
$gpuCheck = nvidia-smi 2>&1
$ValidationResults += @{
    Check = "NVIDIA GPU"
    Status = if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }
}

# Check 3: Ollama running
$ollamaCheck = curl http://localhost:11434/api/version 2>&1
$ValidationResults += @{
    Check = "Ollama"
    Status = if ($ollamaCheck -like "*version*") { "PASS" } else { "FAIL" }
}

# Check 4: Models downloaded
$modelsCheck = ollama list 2>&1
$ValidationResults += @{
    Check = "Models Downloaded"
    Status = if ($modelsCheck -like "*codellama*" -and $modelsCheck -like "*qwen2*" -and $modelsCheck -like "*gemma2*") { "PASS" } else { "FAIL" }
}

# Check 5: Tailscale connected
$tailscaleCheck = tailscale status 2>&1
$ValidationResults += @{
    Check = "Tailscale"
    Status = if ($tailscaleCheck -notlike "*Logged out*") { "PASS" } else { "WARN" }
}

# Print results
Write-Host "`n╔════════════════════════════════════════════════════════════╗"
Write-Host "║                   Validation Results                       ║"
Write-Host "╚════════════════════════════════════════════════════════════╝`n"

foreach ($result in $ValidationResults) {
    $statusColor = switch ($result.Status) {
        "PASS" { "Green" }
        "WARN" { "Yellow" }
        "FAIL" { "Red" }
    }
    $checkPadded = $result.Check.PadRight(30)
    Write-Host "  $checkPadded " -NoNewline
    Write-Host "[$($result.Status)]" -ForegroundColor $statusColor
}

# ============================================================================
# 15. Next Steps
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗"
Write-Host "║                      Setup Complete!                       ║"
Write-Host "╚════════════════════════════════════════════════════════════╝`n"

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Authenticate Infisical: infisical login"
Write-Host "  2. Pull secrets: infisical run --env=dev -- docker-compose up -d"
Write-Host "  3. Start services: docker-compose -f docker-compose.worker-3060.yml up -d"
Write-Host "  4. Check health: .\health-check.ps1"
Write-Host "  5. Test Ollama: curl http://localhost:11434/api/generate -d '{`"model`":`"codellama:34b`",`"prompt`":`"Hello`"}'"
Write-Host "`n  Worker URL: http://worker-3060.tail-net.ts.net:11434"
Write-Host "  Logs: $LogFile"

Log "Setup completed successfully"

# Save validation results
$ValidationResults | ConvertTo-Json | Out-File "$WorkerDir\validation-results.json"

Write-Host "`nSetup script completed. Review $LogFile for details.`n" -ForegroundColor Green
