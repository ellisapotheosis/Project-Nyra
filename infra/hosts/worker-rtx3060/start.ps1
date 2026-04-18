#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Quick start script for Worker-3060
.DESCRIPTION
    Starts all services with proper checks
#>

$ErrorActionPreference = "Stop"

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║           Starting Worker-3060 Services                    ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting 30 seconds for Docker to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30

    # Verify Docker is now running
    $dockerRunning = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker failed to start. Please start Docker Desktop manually." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Docker is running" -ForegroundColor Green

# Check if Ollama service is running
Write-Host "`nChecking Ollama..." -ForegroundColor Yellow
$ollamaRunning = Get-Process "ollama" -ErrorAction SilentlyContinue
if (!$ollamaRunning) {
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}
Write-Host "Ollama is running" -ForegroundColor Green

# Check Tailscale
Write-Host "`nChecking Tailscale..." -ForegroundColor Yellow
$tailscaleStatus = tailscale status 2>&1
if ($tailscaleStatus -like "*Logged out*") {
    Write-Host "WARNING: Tailscale not connected. Run: tailscale up" -ForegroundColor Yellow
} else {
    Write-Host "Tailscale is connected" -ForegroundColor Green
}

# Start Docker Compose services
Write-Host "`nStarting Docker Compose services..." -ForegroundColor Yellow
docker-compose -f docker-compose.worker-3060.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker Compose services started successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to start Docker Compose services" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`nWaiting for services to be healthy (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Run health check
Write-Host "`nRunning health check..." -ForegroundColor Yellow
.\health-check.ps1

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║                   Services Started                         ║
╚════════════════════════════════════════════════════════════╝

Access services at:
  - Ollama: http://localhost:11434
  - Embeddings: http://localhost:8080
  - Health Monitor: http://localhost:9090

View logs:
  docker-compose -f docker-compose.worker-3060.yml logs -f

"@ -ForegroundColor Green
