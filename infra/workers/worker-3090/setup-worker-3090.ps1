<#
.SYNOPSIS
    GPU Worker-3090 Setup Script (RTX 3090 Ti - 24GB VRAM)

.DESCRIPTION
    Automated setup for GPU Worker PC running:
    - Ollama with Llama 3.1 70B and Mistral Large 123B
    - Docker with GPU passthrough
    - Infisical agent for secret management
    - Tailscale VPN
    - Cloudflared tunnel
    - Health monitoring and log shipping

.NOTES
    Worker Purpose: General purpose tasks (quote generation, document extraction)
    Hardware: RTX 3090 Ti (24GB VRAM)
    Port: 11434 (Ollama)
    Project: Project Nyra - Mortgage Automation Platform
#>

#Requires -RunAsAdministrator

param(
    [switch]$SkipDrivers,
    [switch]$SkipModels,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Configuration
$WORKER_ID = "worker-3090"
$OLLAMA_PORT = 11434
$CUDA_VERSION = "12.4"
$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$INFISICAL_ENV = "dev"
$INFISICAL_PATH = "/worker-3090"

# Colors for output
function Write-Step { param($msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Dry run wrapper
function Invoke-Command {
    param($ScriptBlock, $Description)
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would execute: $Description" -ForegroundColor Magenta
    } else {
        & $ScriptBlock
    }
}

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║         GPU WORKER-3090 SETUP (RTX 3090 Ti - 24GB VRAM)       ║
║                    Project Nyra - Mortgage AI                  ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# ============================================================================
# STEP 1: System Requirements Check
# ============================================================================
Write-Step "Checking system requirements..."

# Check Windows version
$osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
$windowsVersion = [System.Environment]::OSVersion.Version
if ($windowsVersion.Major -lt 10) {
    Write-Error "Windows 10 or later required. Current: $($osInfo.Caption)"
    exit 1
}
Write-Success "Windows version: $($osInfo.Caption)"

# Check GPU
$gpu = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*3090*" }
if (-not $gpu) {
    Write-Warning "RTX 3090 Ti not detected. Found: $((Get-WmiObject Win32_VideoController).Name -join ', ')"
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') { exit 1 }
} else {
    Write-Success "GPU detected: $($gpu.Name)"
}

# Check RAM (minimum 32GB recommended)
$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
Write-Success "System RAM: ${ram}GB"
if ($ram -lt 32) {
    Write-Warning "32GB+ RAM recommended for running 70B+ models. Current: ${ram}GB"
}

# Check disk space (minimum 500GB free)
$disk = Get-PSDrive C
$freeSpace = [math]::Round($disk.Free / 1GB, 2)
Write-Success "Free disk space: ${freeSpace}GB"
if ($freeSpace -lt 500) {
    Write-Error "At least 500GB free space required. Current: ${freeSpace}GB"
    exit 1
}

# ============================================================================
# STEP 2: Install Chocolatey (Package Manager)
# ============================================================================
Write-Step "Installing Chocolatey package manager..."

if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Invoke-Command -Description "Install Chocolatey" -ScriptBlock {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    Write-Success "Chocolatey installed"
} else {
    Write-Success "Chocolatey already installed"
}

# ============================================================================
# STEP 3: Install NVIDIA Drivers and CUDA Toolkit
# ============================================================================
if (-not $SkipDrivers) {
    Write-Step "Installing NVIDIA drivers and CUDA ${CUDA_VERSION}..."

    # Check current NVIDIA driver
    $nvidiaDriver = Get-WmiObject Win32_PnPSignedDriver | Where-Object { $_.DeviceName -like "*NVIDIA*" }
    if ($nvidiaDriver) {
        Write-Success "NVIDIA driver version: $($nvidiaDriver.DriverVersion)"
    } else {
        Write-Warning "NVIDIA driver not detected. Installing..."
        Write-Host "Please download and install the latest GeForce driver from:"
        Write-Host "https://www.nvidia.com/Download/index.aspx" -ForegroundColor Yellow
        Write-Host "`nAfter installing, re-run this script." -ForegroundColor Yellow
        $open = Read-Host "Open download page? (y/n)"
        if ($open -eq 'y') {
            Start-Process "https://www.nvidia.com/Download/index.aspx"
        }
        exit 1
    }

    # Install CUDA Toolkit
    if (-not (Test-Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v${CUDA_VERSION}")) {
        Write-Host "Installing CUDA Toolkit ${CUDA_VERSION}..." -ForegroundColor Yellow
        Invoke-Command -Description "Install CUDA Toolkit" -ScriptBlock {
            choco install cuda --version=${CUDA_VERSION} -y
        }
        Write-Success "CUDA Toolkit ${CUDA_VERSION} installed"
    } else {
        Write-Success "CUDA Toolkit ${CUDA_VERSION} already installed"
    }

    # Verify nvidia-smi
    $nvidiaSmi = "C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"
    if (Test-Path $nvidiaSmi) {
        Write-Success "nvidia-smi available"
        & $nvidiaSmi --query-gpu=name,driver_version,memory.total --format=csv,noheader
    }
} else {
    Write-Warning "Skipping driver installation (--SkipDrivers flag)"
}

# ============================================================================
# STEP 4: Install Docker Desktop
# ============================================================================
Write-Step "Installing Docker Desktop..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Invoke-Command -Description "Install Docker Desktop" -ScriptBlock {
        choco install docker-desktop -y
    }
    Write-Success "Docker Desktop installed"
    Write-Warning "Docker Desktop requires a system restart. Please restart and re-run this script."
    $restart = Read-Host "Restart now? (y/n)"
    if ($restart -eq 'y') {
        Restart-Computer -Force
    }
    exit 0
} else {
    Write-Success "Docker Desktop already installed"
    docker --version
}

# Check Docker daemon
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Warning "Docker daemon not running. Starting Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting for Docker daemon to start..." -ForegroundColor Yellow
    $timeout = 60
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 5
        $elapsed += 5
        $dockerRunning = docker info 2>$null
        if ($dockerRunning) { break }
        Write-Host "." -NoNewline
    }
    if ($dockerRunning) {
        Write-Success "Docker daemon started"
    } else {
        Write-Error "Docker daemon failed to start within ${timeout}s"
        exit 1
    }
}

# ============================================================================
# STEP 5: Install Ollama
# ============================================================================
Write-Step "Installing Ollama..."

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Invoke-Command -Description "Install Ollama" -ScriptBlock {
        Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "$env:TEMP\OllamaSetup.exe"
        Start-Process -FilePath "$env:TEMP\OllamaSetup.exe" -ArgumentList "/S" -Wait
        Remove-Item "$env:TEMP\OllamaSetup.exe"
    }
    Write-Success "Ollama installed"
} else {
    Write-Success "Ollama already installed"
    ollama --version
}

# Start Ollama service
$ollamaService = Get-Process ollama -ErrorAction SilentlyContinue
if (-not $ollamaService) {
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

# Test Ollama API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:${OLLAMA_PORT}/api/tags" -Method Get
    Write-Success "Ollama API responding on port ${OLLAMA_PORT}"
} catch {
    Write-Error "Ollama API not responding: $_"
    exit 1
}

# ============================================================================
# STEP 6: Pull Ollama Models
# ============================================================================
if (-not $SkipModels) {
    Write-Step "Pulling Ollama models (this will take 30-60 minutes)..."

    $models = @(
        @{ Name = "llama3.1:70b"; Size = "~40GB"; Priority = "Primary" }
        @{ Name = "mistral-large:123b"; Size = "~70GB"; Priority = "Secondary" }
    )

    foreach ($model in $models) {
        Write-Host "`nPulling $($model.Name) ($($model.Priority), $($model.Size))..." -ForegroundColor Yellow
        Invoke-Command -Description "Pull $($model.Name)" -ScriptBlock {
            ollama pull $model.Name
        }
        Write-Success "$($model.Name) pulled successfully"
    }

    # List installed models
    Write-Host "`nInstalled models:" -ForegroundColor Cyan
    ollama list
} else {
    Write-Warning "Skipping model download (--SkipModels flag)"
}

# ============================================================================
# STEP 7: Install Infisical CLI
# ============================================================================
Write-Step "Installing Infisical CLI..."

if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    Invoke-Command -Description "Install Infisical CLI" -ScriptBlock {
        choco install infisical -y
    }
    Write-Success "Infisical CLI installed"
} else {
    Write-Success "Infisical CLI already installed"
    infisical --version
}

# ============================================================================
# STEP 8: Configure Infisical Agent
# ============================================================================
Write-Step "Configuring Infisical agent..."

# Check for Infisical token
if (-not $env:INFISICAL_TOKEN) {
    Write-Warning "INFISICAL_TOKEN not set in environment"
    Write-Host @"

Please set up Infisical authentication:

1. Login to Infisical:
   infisical login

2. Create a machine identity token:
   - Go to https://app.infisical.com/project/${INFISICAL_PROJECT_ID}/settings/tokens
   - Create a new Universal Auth token with 'Read' permissions
   - Set environment variable: `$env:INFISICAL_TOKEN = "your-token-here"

3. Re-run this script

"@ -ForegroundColor Yellow
    exit 1
}

# Test Infisical connection
Write-Host "Testing Infisical connection..." -ForegroundColor Yellow
try {
    $secrets = infisical secrets list --projectId="${INFISICAL_PROJECT_ID}" --env="${INFISICAL_ENV}" --path="${INFISICAL_PATH}" --format=json | ConvertFrom-Json
    Write-Success "Infisical connection successful. Found $($secrets.Count) secrets."
} catch {
    Write-Error "Infisical connection failed: $_"
    exit 1
}

# Pull required secrets
Write-Host "Pulling secrets from Infisical..." -ForegroundColor Yellow
$requiredSecrets = @("TAILSCALE_KEY", "GPU_WORKER_ID", "NEXUS_ROUTER_URL", "GRAFANA_API_KEY", "LOKI_URL")
$secretsMap = @{}

foreach ($secretName in $requiredSecrets) {
    try {
        $value = infisical secrets get $secretName --projectId="${INFISICAL_PROJECT_ID}" --env="${INFISICAL_ENV}" --path="${INFISICAL_PATH}" --silent
        if ($value) {
            $secretsMap[$secretName] = $value
            Write-Success "Retrieved secret: $secretName"
        } else {
            Write-Warning "Secret not found: $secretName"
        }
    } catch {
        Write-Warning "Failed to retrieve secret: $secretName - $_"
    }
}

# ============================================================================
# STEP 9: Install and Configure Tailscale
# ============================================================================
Write-Step "Installing Tailscale VPN..."

if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
    Invoke-Command -Description "Install Tailscale" -ScriptBlock {
        choco install tailscale -y
    }
    Write-Success "Tailscale installed"
} else {
    Write-Success "Tailscale already installed"
}

# Connect to Tailscale
if ($secretsMap.ContainsKey("TAILSCALE_KEY")) {
    Write-Host "Connecting to Tailscale..." -ForegroundColor Yellow
    Invoke-Command -Description "Connect Tailscale" -ScriptBlock {
        tailscale up --authkey=$($secretsMap["TAILSCALE_KEY"]) --hostname="worker-3090"
    }
    Write-Success "Connected to Tailscale network"

    # Get Tailscale IP
    $tailscaleStatus = tailscale status --json | ConvertFrom-Json
    $tailscaleIP = $tailscaleStatus.Self.TailscaleIPs[0]
    Write-Success "Tailscale IP: $tailscaleIP"
} else {
    Write-Warning "TAILSCALE_KEY not found in secrets. Skipping Tailscale configuration."
}

# ============================================================================
# STEP 10: Install Cloudflared
# ============================================================================
Write-Step "Installing Cloudflared tunnel..."

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Invoke-Command -Description "Install Cloudflared" -ScriptBlock {
        choco install cloudflared -y
    }
    Write-Success "Cloudflared installed"
} else {
    Write-Success "Cloudflared already installed"
}

# ============================================================================
# STEP 11: Create Docker Compose Configuration
# ============================================================================
Write-Step "Creating Docker Compose configuration..."

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $scriptDir ".env"
$dockerComposeFile = Join-Path $scriptDir "docker-compose.worker-3090.yml"

# Create .env file
$envContent = @"
# Worker-3090 Environment Variables
WORKER_ID=worker-3090
WORKER_TYPE=gpu
GPU_MODEL=RTX-3090-Ti
GPU_VRAM=24GB
OLLAMA_PORT=${OLLAMA_PORT}
CUDA_VERSION=${CUDA_VERSION}

# Infisical
INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
INFISICAL_ENV=${INFISICAL_ENV}
INFISICAL_PATH=${INFISICAL_PATH}

# Secrets (pulled from Infisical)
TAILSCALE_KEY=$($secretsMap["TAILSCALE_KEY"])
GPU_WORKER_ID=$($secretsMap["GPU_WORKER_ID"])
NEXUS_ROUTER_URL=$($secretsMap["NEXUS_ROUTER_URL"])
GRAFANA_API_KEY=$($secretsMap["GRAFANA_API_KEY"])
LOKI_URL=$($secretsMap["LOKI_URL"])

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3005
LOKI_PORT=3100

# Models
PRIMARY_MODEL=llama3.1:70b
SECONDARY_MODEL=mistral-large:123b
"@

Set-Content -Path $envFile -Value $envContent
Write-Success "Created .env file: $envFile"

# ============================================================================
# STEP 12: Start Docker Compose Stack
# ============================================================================
Write-Step "Starting Docker Compose stack..."

if (Test-Path $dockerComposeFile) {
    Invoke-Command -Description "Start Docker Compose" -ScriptBlock {
        docker-compose -f $dockerComposeFile up -d
    }
    Write-Success "Docker Compose stack started"

    # Wait for services to be healthy
    Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    docker-compose -f $dockerComposeFile ps
} else {
    Write-Warning "Docker Compose file not found: $dockerComposeFile"
    Write-Host "Please ensure docker-compose.worker-3090.yml exists in the same directory."
}

# ============================================================================
# STEP 13: Validation and Health Checks
# ============================================================================
Write-Step "Running validation checks..."

# Test Ollama API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:${OLLAMA_PORT}/api/tags" -Method Get
    $modelCount = $response.models.Count
    Write-Success "Ollama API: $modelCount models available"
} catch {
    Write-Error "Ollama API validation failed: $_"
}

# Test Tailscale connectivity
$tailscaleStatus = tailscale status 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "Tailscale: Connected"
} else {
    Write-Warning "Tailscale: Not connected"
}

# Test Docker
$dockerInfo = docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "Docker: Running"
} else {
    Write-Warning "Docker: Not running"
}

# Test GPU availability in Docker
try {
    $gpuTest = docker run --rm --gpus all nvidia/cuda:${CUDA_VERSION}.0-base-ubuntu22.04 nvidia-smi 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker GPU passthrough: Working"
    } else {
        Write-Warning "Docker GPU passthrough: Failed - $gpuTest"
    }
} catch {
    Write-Warning "Docker GPU passthrough test failed: $_"
}

# ============================================================================
# STEP 14: Create Health Check Script
# ============================================================================
Write-Step "Creating health check script..."

$healthCheckScript = Join-Path $scriptDir "health-check.ps1"
$healthCheckContent = @'
# Worker-3090 Health Check Script
$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n=== Worker-3090 Health Check ===" -ForegroundColor Cyan

# Check Ollama
$ollama = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
if ($ollama) {
    Write-Host "[OK] Ollama: $($ollama.models.Count) models" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Ollama: Not responding" -ForegroundColor Red
}

# Check Tailscale
$tailscale = tailscale status --json | ConvertFrom-Json
if ($tailscale) {
    Write-Host "[OK] Tailscale: Connected ($($tailscale.Self.TailscaleIPs[0]))" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Tailscale: Not connected" -ForegroundColor Red
}

# Check Docker
$docker = docker ps --format "{{.Names}}: {{.Status}}"
if ($docker) {
    Write-Host "[OK] Docker: $($docker.Count) containers running" -ForegroundColor Green
    $docker | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "[FAIL] Docker: No containers running" -ForegroundColor Red
}

# Check GPU
$gpu = nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader
if ($gpu) {
    Write-Host "[OK] GPU: $gpu" -ForegroundColor Green
} else {
    Write-Host "[FAIL] GPU: nvidia-smi not available" -ForegroundColor Red
}

Write-Host ""
'@

Set-Content -Path $healthCheckScript -Value $healthCheckContent
Write-Success "Created health check script: $healthCheckScript"

# ============================================================================
# SETUP COMPLETE
# ============================================================================
Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                    SETUP COMPLETE                              ║
╚════════════════════════════════════════════════════════════════╝

Worker-3090 is now configured and running!

📊 Status:
   - Worker ID: $WORKER_ID
   - GPU: RTX 3090 Ti (24GB VRAM)
   - Ollama Port: ${OLLAMA_PORT}
   - Models: Llama 3.1 70B, Mistral Large 123B

🔗 Endpoints:
   - Ollama API: http://localhost:${OLLAMA_PORT}
   - Tailscale IP: $(if ($tailscaleIP) { $tailscaleIP } else { "Not configured" })
   - Nexus Router: $($secretsMap["NEXUS_ROUTER_URL"])

📋 Next Steps:
   1. Test Ollama: ollama run llama3.1:70b "Hello, world!"
   2. Run health check: .\health-check.ps1
   3. Monitor logs: docker-compose -f docker-compose.worker-3090.yml logs -f
   4. Register with Nexus Router at: $($secretsMap["NEXUS_ROUTER_URL"])

📚 Documentation:
   - README: $(Join-Path $scriptDir "README.md")
   - Configuration: $(Join-Path $scriptDir ".env")
   - Docker Compose: $(Join-Path $scriptDir "docker-compose.worker-3090.yml")

"@ -ForegroundColor Green

# Run health check
& $healthCheckScript
