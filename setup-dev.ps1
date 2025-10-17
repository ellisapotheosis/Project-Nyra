#!/usr/bin/env pwsh
<#
.SYNOPSIS
NYRA Development Environment Setup
#>

Write-Host "🏠🤖 Setting up NYRA development environment..." -ForegroundColor Magenta

# Create Python virtual environment
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Python virtual environment created" -ForegroundColor Green
}

# Activate environment and install dependencies
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Start Docker services
docker-compose up -d
Write-Host "✅ Docker services started" -ForegroundColor Green

# Initialize NYRA agents
python scripts\initialize-agents.py
Write-Host "✅ NYRA agents initialized" -ForegroundColor Green

Write-Host "🎉 NYRA development environment ready!" -ForegroundColor Green
Write-Host "Access NYRA at: http://localhost:3000" -ForegroundColor Cyan
