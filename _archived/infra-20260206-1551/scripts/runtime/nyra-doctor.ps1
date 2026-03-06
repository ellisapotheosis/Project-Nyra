# NYRA System Health Check Script
# Diagnoses system configuration and health

param()

$ErrorActionPreference = 'Continue'

$issues = 0

function Test-Command {
    param($Command)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Host "✓ $Command is installed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Command is NOT installed" -ForegroundColor Red
        $script:issues++
        return $false
    }
}

function Test-DockerService {
    try {
        docker ps 2>$null | Out-Null
        Write-Host "✓ Docker daemon is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Docker daemon is NOT running" -ForegroundColor Red
        $script:issues++
        return $false
    }
}

function Test-Port {
    param($Port, $Service)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "! Port $Port ($Service) is in use" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Port $Port ($Service) is available" -ForegroundColor Green
    }
}

Write-Host "🔍 NYRA System Health Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraDir = Split-Path -Parent (Split-Path -Parent $scriptDir)
$projectRoot = Split-Path -Parent $infraDir

Set-Location $projectRoot

# Check system requirements
Write-Host "📋 System Requirements:" -ForegroundColor Cyan
Test-Command "docker"
Test-Command "git"
Test-Command "node"
$hasPnpm = Test-Command "pnpm"
if (-not $hasPnpm) { Test-Command "npm" }
Test-Command "python"
Write-Host ""

# Check Docker status
Write-Host "🐳 Docker Status:" -ForegroundColor Cyan
if (Test-DockerService) {
    Write-Host "   Running containers:" -ForegroundColor Gray
    docker ps --format "table {{.Names}}\t{{.Status}}" 2>$null
}
Write-Host ""

# Check critical directories
Write-Host "📁 Directory Structure:" -ForegroundColor Cyan
$dirs = @(
    "infra\shared\scripts",
    "infra\orchestrator-mini\scripts",
    "infra\worker-rtx3060\scripts",
    "infra\worker-rtx3090ti\scripts",
    "infra\worker-rtx5090\scripts"
)
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir exists" -ForegroundColor Green
    } else {
        Write-Host "! $dir missing (will be created)" -ForegroundColor Yellow
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}
Write-Host ""

# Check configuration files
Write-Host "⚙️  Configuration Files:" -ForegroundColor Cyan
$files = @(".env", "package.json", "docker\.env", "docker\docker-compose.nyra.yml")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "! $file missing" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check common ports
Write-Host "🔌 Port Availability:" -ForegroundColor Cyan
Test-Port 3000 "Web UI"
Test-Port 8000 "API Server"
Test-Port 5432 "PostgreSQL"
Test-Port 6379 "Redis"
Test-Port 12008 "MetaMCP"
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
if ($issues -eq 0) {
    Write-Host "✅ System health check passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Found $issues issue(s)" -ForegroundColor Red
    Write-Host "Please resolve the issues above before continuing." -ForegroundColor Yellow
    exit 1
}
