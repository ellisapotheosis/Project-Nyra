# NYRA System Shutdown Script
# Gracefully stops all NYRA services

param()

$ErrorActionPreference = 'Continue'

Write-Host "🔻 Shutting down NYRA services..." -ForegroundColor Cyan

# Get paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraDir = Split-Path -Parent (Split-Path -Parent $scriptDir)
$projectRoot = Split-Path -Parent $infraDir

# Navigate to project root
Set-Location $projectRoot

# Stop Docker services
if ((Test-Path "docker\.env") -and (Test-Path "docker\docker-compose.nyra.yml")) {
    Write-Host "→ Stopping Docker Compose services..." -ForegroundColor Yellow
    docker compose --env-file docker\.env -f docker\docker-compose.nyra.yml down
    Write-Host "✓ Docker services stopped" -ForegroundColor Green
} else {
    Write-Host "⚠  Docker configuration not found, skipping..." -ForegroundColor Yellow
}

# Stop Python processes
$pythonProcesses = Get-Process python* -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*nyra_a2a_server.py*" -or $_.CommandLine -like "*orchestrators/ag2/host.py*"
}

if ($pythonProcesses) {
    Write-Host "→ Stopping Python orchestrators..." -ForegroundColor Yellow
    $pythonProcesses | Stop-Process -Force
    Write-Host "✓ Python orchestrators stopped" -ForegroundColor Green
}

Write-Host "✅ NYRA shutdown complete" -ForegroundColor Green
