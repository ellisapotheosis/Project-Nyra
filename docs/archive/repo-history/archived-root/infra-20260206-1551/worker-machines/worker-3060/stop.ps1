#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Stop Worker-3060 services
.DESCRIPTION
    Gracefully stops all services
#>

$ErrorActionPreference = "Stop"

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║           Stopping Worker-3060 Services                    ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Stop Docker Compose services
Write-Host "Stopping Docker Compose services..." -ForegroundColor Yellow
docker-compose -f docker-compose.worker-3060.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker Compose services stopped" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to stop services" -ForegroundColor Red
}

# Optional: Stop Ollama service
$stopOllama = Read-Host "`nStop Ollama service? (y/N)"
if ($stopOllama -eq "y") {
    Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
    Write-Host "Ollama service stopped" -ForegroundColor Green
}

Write-Host "`nAll services stopped.`n" -ForegroundColor Green
