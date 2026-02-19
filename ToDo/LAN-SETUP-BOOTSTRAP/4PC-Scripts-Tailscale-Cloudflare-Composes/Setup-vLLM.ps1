<#
.SYNOPSIS
    Setup vLLM with LMCache for GPU workers
.DESCRIPTION
    Installs and configures vLLM inference server with LMCache integration
    for RTX 5090 (PC3) and RTX 3090 Ti (PC4)
.PARAMETER WorkerID
    Worker identifier (worker-rtx5090, worker-rtx3090ti)
.PARAMETER Model
    HuggingFace model to deploy (e.g., TheBloke/Llama-3-70B-Instruct-AWQ)
.PARAMETER EnableLMCache
    Enable LMCache for 3-10x speedup
.PARAMETER RedisHost
    Redis server for LMCache (orchestrator IP)
.PARAMETER RedisPort
    Redis port (default: 6379)
.EXAMPLE
    .\Setup-vLLM.ps1 -WorkerID worker-rtx5090 -Model "TheBloke/Llama-3-70B-Instruct-AWQ" `
                     -EnableLMCache $true -RedisHost "orchestrator-mini"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$WorkerID,
    
    [Parameter(Mandatory=$true)]
    [string]$Model,
    
    [Parameter(Mandatory=$false)]
    [bool]$EnableLMCache = $true,
    
    [Parameter(Mandatory=$false)]
    [string]$RedisHost = "orchestrator-mini",
    
    [Parameter(Mandatory=$false)]
    [int]$RedisPort = 6379,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxModelLen = 4096,
    
    [Parameter(Mandatory=$false)]
    [double]$GPUMemoryUtilization = 0.95
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Project Nyra - vLLM Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Worker: $WorkerID" -ForegroundColor Yellow
Write-Host "Model: $Model" -ForegroundColor Yellow
Write-Host "LMCache: $EnableLMCache" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check GPU
Write-Host "[1/6] Checking GPU..." -ForegroundColor Cyan
$gpu = nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
if (-not $gpu) {
    Write-Host "ERROR: No NVIDIA GPU detected" -ForegroundColor Red
    exit 1
}
Write-Host "GPU: $gpu" -ForegroundColor Green
Write-Host ""

# Step 2: Pull vLLM Docker image
Write-Host "[2/6] Pulling vLLM Docker image..." -ForegroundColor Cyan
docker pull vllm/vllm-openai:latest
Write-Host ""

# Step 3: Download model weights (if not cached)
Write-Host "[3/6] Downloading model weights..." -ForegroundColor Cyan
Write-Host "Model: $Model" -ForegroundColor Gray
# Note: Docker will download on first run
Write-Host ""

# Step 4: Create docker-compose.yml
Write-Host "[4/6] Creating docker-compose configuration..." -ForegroundColor Cyan

$dockerComposeContent = @"
version: '3.8'

services:
  vllm-server:
    image: vllm/vllm-openai:latest
    container_name: $WorkerID-vllm
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    ports:
      - "8000:8000"
    volumes:
      - ~/.cache/huggingface:/root/.cache/huggingface
    command:
      - --model=$Model
      - --tensor-parallel-size=1
      - --max-model-len=$MaxModelLen
      - --gpu-memory-utilization=$GPUMemoryUtilization
"@

if ($EnableLMCache) {
    $dockerComposeContent += @"

      - --enable-lmcache
      - --lmcache-backend=redis
      - --lmcache-redis-host=$RedisHost
      - --lmcache-redis-port=$RedisPort
"@
}

$dockerComposeContent += @"

    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
"@

$configDir = "C:\Dev\Projects\Repos\Project-Nyra\infra\workers\$WorkerID"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$dockerComposeContent | Out-File -FilePath "$configDir\docker-compose.yml" -Encoding UTF8

Write-Host "Created: $configDir\docker-compose.yml" -ForegroundColor Green
Write-Host ""

# Step 5: Start vLLM service
Write-Host "[5/6] Starting vLLM service..." -ForegroundColor Cyan
Push-Location $configDir
docker-compose up -d
Pop-Location

Start-Sleep -Seconds 10

# Step 6: Verify service
Write-Host "[6/6] Verifying vLLM service..." -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    Write-Host "✓ vLLM service is healthy" -ForegroundColor Green
} catch {
    Write-Host "⚠ Service may still be starting..." -ForegroundColor Yellow
    Write-Host "Check status: docker logs $WorkerID-vllm" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " vLLM Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  docker logs $WorkerID-vllm -f" -ForegroundColor Gray
Write-Host "  docker stats $WorkerID-vllm" -ForegroundColor Gray
Write-Host "  curl http://localhost:8000/v1/models" -ForegroundColor Gray
Write-Host ""

if ($EnableLMCache) {
    Write-Host "LMCache Configuration:" -ForegroundColor Cyan
    Write-Host "  Redis: $RedisHost:$RedisPort" -ForegroundColor Gray
    Write-Host "  Warm up cache with 100+ prompts for best performance" -ForegroundColor Gray
    Write-Host ""
}
