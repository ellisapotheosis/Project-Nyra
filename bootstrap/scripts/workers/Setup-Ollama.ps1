<#
.SYNOPSIS
    Setup Ollama for RTX 3060 worker (PC2)
.DESCRIPTION
    Installs Ollama and pulls specified models for development/testing
.PARAMETER Models
    Comma-separated list of models to pull (e.g., "llama3:8b,qwen2.5:32b")
.EXAMPLE
    .\Setup-Ollama.ps1 -Models "llama3:8b,mistral:7b,qwen2.5:32b"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Models
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Project Nyra - Ollama Setup (RTX 3060)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Ollama (if not installed)
Write-Host "[1/3] Checking Ollama installation..." -ForegroundColor Cyan
$ollama = Get-Command ollama -ErrorAction SilentlyContinue

if (-not $ollama) {
    Write-Host "Installing Ollama..." -ForegroundColor Yellow
    winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements --silent
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ Ollama installed" -ForegroundColor Green
} else {
    Write-Host "✓ Ollama already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Pull models
Write-Host "[2/3] Pulling models..." -ForegroundColor Cyan
$modelList = $Models -split ','

foreach ($model in $modelList) {
    Write-Host "Pulling: $model" -ForegroundColor Yellow
    ollama pull $model.Trim()
    Write-Host "✓ $model downloaded" -ForegroundColor Green
}
Write-Host ""

# Step 3: Verify
Write-Host "[3/3] Verifying installation..." -ForegroundColor Cyan
ollama list
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Ollama Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ollama is running on: http://localhost:11434" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test a model:" -ForegroundColor Cyan
Write-Host "  ollama run $($modelList[0]) \`"Hello!\`"" -ForegroundColor Gray
Write-Host ""
