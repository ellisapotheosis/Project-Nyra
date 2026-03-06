# ============================================================================
# Project Nyra - Worker RTX 5090 Setup Script
# GPU: NVIDIA RTX 5090 (48GB VRAM)
# Specialization: High-performance LLM inference, DeepSeek-R1 236B, vLLM, Neo4j
# ============================================================================
#
# This script sets up the RTX 5090 worker node with:
#   - NVIDIA Container Toolkit
#   - Docker with GPU support
#   - Infisical secrets sync
#   - Ollama with high-VRAM models
#   - vLLM for batch inference
#   - Neo4j and FalkorDB graph databases
#   - Health monitoring
#
# Usage:
#   .\setup-worker-5090.ps1 -Install         # Full installation
#   .\setup-worker-5090.ps1 -Start           # Start services
#   .\setup-worker-5090.ps1 -Status          # Check status
#   .\setup-worker-5090.ps1 -PullModels      # Download models
#   .\setup-worker-5090.ps1 -SyncSecrets     # Sync from Infisical
#
# ============================================================================

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$Install,

    [Parameter()]
    [switch]$Start,

    [Parameter()]
    [switch]$Status,

    [Parameter()]
    [switch]$Stop,

    [Parameter()]
    [switch]$PullModels,

    [Parameter()]
    [switch]$SyncSecrets,

    [Parameter()]
    [string]$OrchestratorIP = "orchestrator.tail-net.ts.net",

    [Parameter()]
    [string]$InfisicalToken = $env:INFISICAL_TOKEN
)

$ErrorActionPreference = "Stop"
$WorkerID = "worker-5090"
$GPU = "RTX 5090"
$VRAM = "48GB"

# Color helpers
function Write-Phase { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "  -> $msg" -ForegroundColor Gray }
function Write-Success { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "  [ERROR] $msg" -ForegroundColor Red }

# Banner
Write-Host @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                    PROJECT NYRA - WORKER RTX 5090 SETUP                      ║
║                                                                              ║
║    GPU: NVIDIA RTX 5090 (48GB VRAM)                                         ║
║    Role: High-Performance Inference, Complex Reasoning                       ║
║    Models: DeepSeek-R1 236B, Qwen 2.5 72B, Llama 3.1 70B                    ║
║    Services: vLLM, Ollama, Neo4j, FalkorDB                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# Models to load on this worker
$Models = @(
    @{ Name = "deepseek-r1:236b-q4_K_M"; Size = "140GB"; Purpose = "Complex reasoning, compliance" }
    @{ Name = "qwen2.5:72b-instruct-q8_0"; Size = "80GB"; Purpose = "General purpose, high quality" }
)

# Infisical configuration
$InfisicalConfig = @{
    ProjectID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
    Environment = "dev"
    SecretPath = "/workers/$WorkerID"
}

# ============================================================================
# INSTALLATION
# ============================================================================
if ($Install) {
    Write-Phase "Installing Worker RTX 5090 Prerequisites"

    # Check NVIDIA GPU
    Write-Step "Checking NVIDIA GPU..."
    $nvidiaSmi = nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "GPU detected: $nvidiaSmi"
    }
    else {
        Write-Error "NVIDIA GPU not detected. Ensure drivers are installed."
        exit 1
    }

    # Check Docker
    Write-Step "Checking Docker..."
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker: $dockerVersion"
    }
    else {
        Write-Error "Docker not found. Please install Docker Desktop with WSL2 backend."
        exit 1
    }

    # Check NVIDIA Container Toolkit
    Write-Step "Checking NVIDIA Container Toolkit..."
    $nvidiaDocker = docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "NVIDIA Container Toolkit working"
    }
    else {
        Write-Warning "NVIDIA Container Toolkit may need configuration"
        Write-Step "Installing NVIDIA Container Toolkit..."
        # For Windows with WSL2, this is typically configured in Docker Desktop
    }

    # Install Infisical CLI
    Write-Step "Installing Infisical CLI..."
    $infisicalInstalled = Get-Command infisical -ErrorAction SilentlyContinue
    if (-not $infisicalInstalled) {
        winget install Infisical.Infisical -e --silent
        Write-Success "Infisical CLI installed"
    }
    else {
        Write-Success "Infisical CLI already installed"
    }

    # Create directories
    Write-Step "Creating directories..."
    $dirs = @(
        "C:\nyra\$WorkerID\data",
        "C:\nyra\$WorkerID\logs",
        "C:\nyra\$WorkerID\models",
        "C:\nyra\$WorkerID\config",
        "C:\nyra\$WorkerID\secrets"
    )
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    Write-Success "Directories created"

    # Create worker configuration
    Write-Step "Creating worker configuration..."
    $workerConfig = @"
# Worker RTX 5090 Configuration
worker_id: $WorkerID
gpu_type: rtx_5090
vram_gb: 48
specialization: inference

orchestrator:
  url: http://$($OrchestratorIP):8080
  health_report_interval: 30

ollama:
  host: 0.0.0.0
  port: 11434
  num_parallel: 8
  max_loaded_models: 4
  gpu_layers: 999  # Use all GPU layers

vllm:
  host: 0.0.0.0
  port: 8000
  tensor_parallel_size: 1
  max_model_len: 32768
  gpu_memory_utilization: 0.95

models:
  - name: deepseek-r1:236b-q4_K_M
    priority: 1
    keep_loaded: true
  - name: qwen2.5:72b-instruct-q8_0
    priority: 2
    keep_loaded: false

services:
  neo4j:
    enabled: true
    memory_heap_max: 8G
    memory_pagecache: 4G
  falkordb:
    enabled: true
    max_memory: 4G

monitoring:
  prometheus_port: 9002
  health_check_port: 8092
"@
    $workerConfig | Out-File -FilePath "C:\nyra\$WorkerID\config\worker-config.yaml" -Encoding UTF8
    Write-Success "Configuration created"

    Write-Phase "Installation Complete"
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "    1. Run: .\setup-worker-5090.ps1 -SyncSecrets" -ForegroundColor White
    Write-Host "    2. Run: .\setup-worker-5090.ps1 -Start" -ForegroundColor White
    Write-Host "    3. Run: .\setup-worker-5090.ps1 -PullModels" -ForegroundColor White
}

# ============================================================================
# SYNC SECRETS FROM INFISICAL
# ============================================================================
if ($SyncSecrets) {
    Write-Phase "Syncing Secrets from Infisical"

    if (-not $InfisicalToken) {
        Write-Error "INFISICAL_TOKEN not set. Set environment variable or use -InfisicalToken"
        exit 1
    }

    Write-Step "Authenticating with Infisical..."
    $env:INFISICAL_TOKEN = $InfisicalToken

    Write-Step "Fetching secrets for $WorkerID..."
    $secrets = infisical export --projectId $InfisicalConfig.ProjectID `
        --env $InfisicalConfig.Environment `
        --path $InfisicalConfig.SecretPath `
        --format dotenv 2>&1

    if ($LASTEXITCODE -eq 0) {
        $secrets | Out-File -FilePath "C:\nyra\$WorkerID\secrets\.env" -Encoding UTF8
        Write-Success "Secrets synced to C:\nyra\$WorkerID\secrets\.env"
    }
    else {
        Write-Warning "Failed to sync secrets from Infisical. Using defaults."

        # Create default .env file
        $defaultEnv = @"
# Worker RTX 5090 Environment (Default)
WORKER_ID=$WorkerID
GPU_TYPE=rtx_5090
VRAM_GB=48

# Orchestrator Connection
ORCHESTRATOR_URL=http://$($OrchestratorIP):8080

# Ollama Configuration
OLLAMA_HOST=0.0.0.0
OLLAMA_NUM_PARALLEL=8
OLLAMA_MAX_LOADED_MODELS=4

# vLLM Configuration
VLLM_TENSOR_PARALLEL_SIZE=1
VLLM_MAX_MODEL_LEN=32768
VLLM_GPU_MEMORY_UTILIZATION=0.95

# Neo4j Configuration
NEO4J_AUTH=neo4j/changeme
NEO4J_dbms_memory_heap_max__size=8G

# Monitoring
PROMETHEUS_PUSH_GATEWAY=http://$($OrchestratorIP):9091
"@
        $defaultEnv | Out-File -FilePath "C:\nyra\$WorkerID\secrets\.env" -Encoding UTF8
        Write-Warning "Created default .env file - update with real secrets"
    }
}

# ============================================================================
# START SERVICES
# ============================================================================
if ($Start) {
    Write-Phase "Starting Worker RTX 5090 Services"

    $composeFile = Join-Path $PSScriptRoot "..\..\docker\workers\docker-compose.worker-rtx5090.yml"

    if (-not (Test-Path $composeFile)) {
        Write-Error "Compose file not found: $composeFile"
        exit 1
    }

    # Load environment
    $envFile = "C:\nyra\$WorkerID\secrets\.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#=]+)=(.*)$') {
                $env:($matches[1]) = $matches[2]
            }
        }
    }

    Write-Step "Starting Docker services..."
    docker compose -f $composeFile up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started"

        Write-Host "`n  Service Ports:" -ForegroundColor Yellow
        Write-Host "    Ollama:       http://localhost:11435" -ForegroundColor White
        Write-Host "    vLLM:         http://localhost:8000" -ForegroundColor White
        Write-Host "    Neo4j:        http://localhost:7474 / bolt://localhost:7687" -ForegroundColor White
        Write-Host "    FalkorDB:     localhost:6380" -ForegroundColor White
        Write-Host "    Model Mgr:    http://localhost:8082" -ForegroundColor White
        Write-Host "    Health:       http://localhost:8092" -ForegroundColor White
        Write-Host "    Metrics:      http://localhost:9002" -ForegroundColor White
    }
    else {
        Write-Error "Failed to start services"
        exit 1
    }
}

# ============================================================================
# STATUS CHECK
# ============================================================================
if ($Status) {
    Write-Phase "Worker RTX 5090 Status"

    # GPU Status
    Write-Host "`n  GPU Status:" -ForegroundColor Yellow
    nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader

    # Docker containers
    Write-Host "`n  Docker Containers:" -ForegroundColor Yellow
    docker ps --filter "name=nyra-worker-rtx5090" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    # Ollama models
    Write-Host "`n  Loaded Models:" -ForegroundColor Yellow
    $ollamaStatus = Invoke-RestMethod -Uri "http://localhost:11435/api/tags" -ErrorAction SilentlyContinue
    if ($ollamaStatus) {
        $ollamaStatus.models | ForEach-Object {
            Write-Host "    - $($_.name) ($([math]::Round($_.size / 1GB, 2)) GB)" -ForegroundColor White
        }
    }
    else {
        Write-Warning "Ollama not responding"
    }

    # Health check
    Write-Host "`n  Health Checks:" -ForegroundColor Yellow
    $services = @(
        @{ Name = "Ollama"; URL = "http://localhost:11435/api/tags" }
        @{ Name = "vLLM"; URL = "http://localhost:8000/health" }
        @{ Name = "Neo4j"; URL = "http://localhost:7474" }
        @{ Name = "Health Service"; URL = "http://localhost:8092/health" }
    )

    foreach ($svc in $services) {
        try {
            $response = Invoke-WebRequest -Uri $svc.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "$($svc.Name)"
            }
        }
        catch {
            Write-Error "$($svc.Name) - NOT RESPONDING"
        }
    }
}

# ============================================================================
# STOP SERVICES
# ============================================================================
if ($Stop) {
    Write-Phase "Stopping Worker RTX 5090 Services"

    $composeFile = Join-Path $PSScriptRoot "..\..\docker\workers\docker-compose.worker-rtx5090.yml"

    if (Test-Path $composeFile) {
        docker compose -f $composeFile down
        Write-Success "Services stopped"
    }
}

# ============================================================================
# PULL MODELS
# ============================================================================
if ($PullModels) {
    Write-Phase "Pulling Models for Worker RTX 5090"

    Write-Host "`n  Models to pull:" -ForegroundColor Yellow
    foreach ($model in $Models) {
        Write-Host "    - $($model.Name) (~$($model.Size)) - $($model.Purpose)" -ForegroundColor White
    }

    Write-Host "`n  This will download approximately 220GB of model weights." -ForegroundColor Yellow
    $confirm = Read-Host "  Continue? (y/N)"

    if ($confirm -eq "y" -or $confirm -eq "Y") {
        foreach ($model in $Models) {
            Write-Step "Pulling $($model.Name)..."
            docker exec nyra-worker-rtx5090-ollama ollama pull $model.Name

            if ($LASTEXITCODE -eq 0) {
                Write-Success "$($model.Name) pulled successfully"
            }
            else {
                Write-Error "Failed to pull $($model.Name)"
            }
        }
    }
    else {
        Write-Warning "Model pull cancelled"
    }
}

# Default help
if (-not ($Install -or $Start -or $Status -or $Stop -or $PullModels -or $SyncSecrets)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-worker-5090.ps1 -Install       # Full installation" -ForegroundColor White
    Write-Host "  .\setup-worker-5090.ps1 -SyncSecrets   # Sync secrets from Infisical" -ForegroundColor White
    Write-Host "  .\setup-worker-5090.ps1 -Start         # Start services" -ForegroundColor White
    Write-Host "  .\setup-worker-5090.ps1 -Status        # Check status" -ForegroundColor White
    Write-Host "  .\setup-worker-5090.ps1 -PullModels    # Download models" -ForegroundColor White
    Write-Host "  .\setup-worker-5090.ps1 -Stop          # Stop services" -ForegroundColor White
}
