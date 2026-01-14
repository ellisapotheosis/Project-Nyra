# Project Nyra - PC2 GPU Worker 1 Setup Script
# Sets up Ollama, Ruvector Leader, Letta, Mem0, Dify

param(
    [switch]$SkipGpuCheck = $false,
    [switch]$PullModels = $true
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Nyra - PC2 GPU Worker 1 Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check GPU
if (-not $SkipGpuCheck) {
    Write-Host "Checking NVIDIA GPU..." -ForegroundColor Yellow
    try {
        $gpuInfo = nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
        Write-Host "✓ GPU detected: $gpuInfo" -ForegroundColor Green
    } catch {
        Write-Host "✗ NVIDIA GPU not found or drivers not installed" -ForegroundColor Red
        Write-Host "  Install NVIDIA drivers: https://www.nvidia.com/Download/index.aspx" -ForegroundColor Yellow
        exit 1
    }
}

# Copy env file
if (-not (Test-Path ".env.pc2")) {
    Copy-Item ".env.pc2.example" ".env.pc2"
    Write-Host "✓ Created .env.pc2 - Please edit with your API keys" -ForegroundColor Green
    notepad.exe ".env.pc2"
    Read-Host "Press Enter after saving changes"
}

# Create directories
New-Item -ItemType Directory -Path "configs/ruvector","configs/letta","configs/dify" -Force | Out-Null

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker compose -f docker-compose.pc2.yml --env-file .env.pc2 up -d

Write-Host ""
Write-Host "Waiting for services to initialize (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Pull Ollama models
if ($PullModels) {
    Write-Host "Pulling Ollama models (this may take 30+ minutes)..." -ForegroundColor Yellow
    docker exec nyra-ollama-pc2 ollama pull llama3.1:70b
    docker exec nyra-ollama-pc2 ollama pull mistral:7b
    docker exec nyra-ollama-pc2 ollama pull codellama:34b
}

Write-Host ""
Write-Host "✓ PC2 setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Ollama:      http://localhost:11434" -ForegroundColor White
Write-Host "  Ruvector:    http://localhost:6370" -ForegroundColor White
Write-Host "  Letta:       http://localhost:8283" -ForegroundColor White
Write-Host "  Mem0:        http://localhost:4321" -ForegroundColor White
Write-Host "  Dify:        http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Run health check: .\health-check-pc2.ps1" -ForegroundColor Yellow
