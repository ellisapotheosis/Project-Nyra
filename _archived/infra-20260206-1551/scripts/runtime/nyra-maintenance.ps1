# NYRA System Maintenance Script
# Performs routine maintenance tasks

param()

$ErrorActionPreference = 'Continue'

Write-Host "🔧 Starting NYRA maintenance routine..." -ForegroundColor Cyan

# Get paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraDir = Split-Path -Parent (Split-Path -Parent $scriptDir)
$projectRoot = Split-Path -Parent $infraDir

Set-Location $projectRoot

# Docker cleanup
Write-Host "→ Cleaning Docker resources..." -ForegroundColor Yellow
docker system prune -f --volumes 2>$null
Write-Host "✓ Docker cleanup complete" -ForegroundColor Green

# Check disk space
Write-Host "→ Checking disk space..." -ForegroundColor Yellow
$drive = (Get-Location).Drive
$disk = Get-PSDrive $drive.Name
Write-Host "  Free: $([math]::Round($disk.Free / 1GB, 2)) GB / Total: $([math]::Round(($disk.Used + $disk.Free) / 1GB, 2)) GB"
Write-Host "✓ Disk space checked" -ForegroundColor Green

# Update dependencies if package files exist
if (Test-Path "package.json") {
    Write-Host "→ Checking npm dependencies..." -ForegroundColor Yellow
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        try {
            pnpm install --frozen-lockfile 2>$null
        } catch {
            pnpm install
        }
        Write-Host "✓ pnpm dependencies updated" -ForegroundColor Green
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
        Write-Host "✓ npm dependencies updated" -ForegroundColor Green
    }
}

# Clean up logs older than 7 days
if (Test-Path "logs") {
    Write-Host "→ Cleaning old logs..." -ForegroundColor Yellow
    Get-ChildItem -Path "logs" -Filter "*.log" -Recurse | Where-Object {
        $_.LastWriteTime -lt (Get-Date).AddDays(-7)
    } | Remove-Item -Force
    Write-Host "✓ Old logs cleaned" -ForegroundColor Green
}

# Verify critical directories
Write-Host "→ Verifying directory structure..." -ForegroundColor Yellow
$dirs = @(
    "infra\shared\scripts",
    "infra\orchestrator-mini\scripts",
    "infra\worker-rtx3060\scripts",
    "infra\worker-rtx3090ti\scripts",
    "infra\worker-rtx5090\scripts"
)
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}
Write-Host "✓ Directory structure verified" -ForegroundColor Green

Write-Host "✅ NYRA maintenance complete" -ForegroundColor Green
