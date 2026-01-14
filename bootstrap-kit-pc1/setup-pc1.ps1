# Project Nyra - PC1 Orchestrator Setup Script
# Sets up the orchestration node with Nexus Router, Claude Flow, Archon OS, and monitoring

param(
    [switch]$SkipPrereqs = $false,
    [switch]$PullImages = $true,
    [switch]$StartServices = $true
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$PC_NAME = "PC1-Orchestrator"
$PC_IP = "10.0.0.1"
$REQUIRED_RAM_GB = 8
$REQUIRED_DISK_GB = 50

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Nyra - $PC_NAME Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# FUNCTIONS
# ============================================================================

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow

    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
        exit 1
    }

    # Check Docker Compose
    try {
        $composeVersion = docker compose version
        Write-Host "✓ Docker Compose installed: $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker Compose not found." -ForegroundColor Red
        exit 1
    }

    # Check RAM
    $ram = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum).Sum / 1GB
    if ($ram -lt $REQUIRED_RAM_GB) {
        Write-Host "✗ Insufficient RAM: $ram GB (need $REQUIRED_RAM_GB GB)" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ RAM: $ram GB" -ForegroundColor Green

    # Check Disk Space
    $disk = Get-PSDrive C | Select-Object -ExpandProperty Free
    $diskGB = [math]::Round($disk / 1GB, 2)
    if ($diskGB -lt $REQUIRED_DISK_GB) {
        Write-Host "✗ Insufficient disk space: $diskGB GB (need $REQUIRED_DISK_GB GB)" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Disk space: $diskGB GB available" -ForegroundColor Green

    Write-Host ""
}

function Copy-EnvFile {
    Write-Host "Setting up environment file..." -ForegroundColor Yellow

    if (-not (Test-Path ".env.pc1")) {
        if (Test-Path ".env.pc1.example") {
            Copy-Item ".env.pc1.example" ".env.pc1"
            Write-Host "✓ Created .env.pc1 from example" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  IMPORTANT: Edit .env.pc1 and add your API keys!" -ForegroundColor Yellow
            Write-Host "   Required keys:" -ForegroundColor Yellow
            Write-Host "   - ANTHROPIC_API_KEY" -ForegroundColor Yellow
            Write-Host "   - OPENROUTER_API_KEY" -ForegroundColor Yellow
            Write-Host "   - GEMINI_API_KEY" -ForegroundColor Yellow
            Write-Host ""

            # Ask if user wants to edit now
            $edit = Read-Host "Open .env.pc1 for editing now? (y/n)"
            if ($edit -eq "y") {
                notepad.exe ".env.pc1"
                Write-Host "Press Enter after saving your changes..." -ForegroundColor Yellow
                Read-Host
            }
        } else {
            Write-Host "✗ .env.pc1.example not found" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✓ .env.pc1 already exists" -ForegroundColor Green
    }

    Write-Host ""
}

function Test-EnvFile {
    Write-Host "Validating environment file..." -ForegroundColor Yellow

    if (-not (Test-Path ".env.pc1")) {
        Write-Host "✗ .env.pc1 not found" -ForegroundColor Red
        exit 1
    }

    $envContent = Get-Content ".env.pc1" -Raw

    $requiredKeys = @(
        "ANTHROPIC_API_KEY",
        "OPENROUTER_API_KEY",
        "GEMINI_API_KEY"
    )

    $missingKeys = @()
    foreach ($key in $requiredKeys) {
        if ($envContent -notmatch "$key=.+") {
            $missingKeys += $key
        }
    }

    if ($missingKeys.Count -gt 0) {
        Write-Host "✗ Missing or empty API keys:" -ForegroundColor Red
        foreach ($key in $missingKeys) {
            Write-Host "  - $key" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "Please edit .env.pc1 and add your API keys." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✓ Environment file validated" -ForegroundColor Green
    Write-Host ""
}

function Initialize-Directories {
    Write-Host "Creating directory structure..." -ForegroundColor Yellow

    $dirs = @(
        "configs/nexus",
        "configs/prometheus",
        "configs/grafana/dashboards",
        "configs/grafana/datasources",
        "configs/loki",
        "configs/alertmanager",
        "logs",
        "data"
    )

    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "✓ Created $dir" -ForegroundColor Green
        }
    }

    Write-Host ""
}

function Pull-DockerImages {
    if (-not $PullImages) {
        Write-Host "Skipping Docker image pull..." -ForegroundColor Yellow
        return
    }

    Write-Host "Pulling Docker images..." -ForegroundColor Yellow
    Write-Host "This may take 10-20 minutes on first run..." -ForegroundColor Yellow
    Write-Host ""

    try {
        docker compose -f docker-compose.pc1.yml pull
        Write-Host "✓ Docker images pulled successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Some images may need to be built locally" -ForegroundColor Yellow
    }

    Write-Host ""
}

function Build-LocalImages {
    Write-Host "Building local Docker images..." -ForegroundColor Yellow

    # Check if vendor/forks exist
    $vendorPath = Join-Path $PSScriptRoot "..\vendor\forks"

    if (-not (Test-Path "$vendorPath\claude-flow")) {
        Write-Host "⚠️  Claude Flow source not found at $vendorPath\claude-flow" -ForegroundColor Yellow
        Write-Host "   Skipping Claude Flow build..." -ForegroundColor Yellow
    }

    if (-not (Test-Path "$vendorPath\archon")) {
        Write-Host "⚠️  Archon OS source not found at $vendorPath\archon" -ForegroundColor Yellow
        Write-Host "   Skipping Archon OS build..." -ForegroundColor Yellow
    }

    Write-Host ""
}

function Start-Services {
    if (-not $StartServices) {
        Write-Host "Skipping service startup..." -ForegroundColor Yellow
        return
    }

    Write-Host "Starting services..." -ForegroundColor Yellow
    Write-Host ""

    try {
        # Load environment
        docker compose -f docker-compose.pc1.yml --env-file .env.pc1 up -d
        Write-Host "✓ Services started successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to start services" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }

    Write-Host ""
}

function Show-Status {
    Write-Host "Checking service status..." -ForegroundColor Yellow
    Write-Host ""

    docker compose -f docker-compose.pc1.yml ps

    Write-Host ""
}

function Show-Summary {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Yellow
    Write-Host "  Nexus Router:      http://localhost:8000" -ForegroundColor White
    Write-Host "  Nexus Admin:       http://localhost:4001" -ForegroundColor White
    Write-Host "  Claude Flow:       http://localhost:9000" -ForegroundColor White
    Write-Host "  Claude Flow UI:    http://localhost:9001" -ForegroundColor White
    Write-Host "  Archon OS:         http://localhost:9002" -ForegroundColor White
    Write-Host "  Archon OS UI:      http://localhost:9003" -ForegroundColor White
    Write-Host "  Prometheus:        http://localhost:9090" -ForegroundColor White
    Write-Host "  Grafana:           http://localhost:3005 (admin/admin)" -ForegroundColor White
    Write-Host "  Loki:              http://localhost:3100" -ForegroundColor White
    Write-Host "  AlertManager:      http://localhost:9093" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run health checks: .\health-check-pc1.ps1" -ForegroundColor White
    Write-Host "  2. Configure PC2, PC3, PC4 with their bootstrap kits" -ForegroundColor White
    Write-Host "  3. Test inter-PC communication" -ForegroundColor White
    Write-Host "  4. Set up Cloudflare Tunnels" -ForegroundColor White
    Write-Host ""
    Write-Host "Logs:" -ForegroundColor Yellow
    Write-Host "  View all logs:     docker compose -f docker-compose.pc1.yml logs -f" -ForegroundColor White
    Write-Host "  View specific:     docker logs nyra-nexus-pc1 -f" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

# Check admin rights
if (-not (Test-Administrator)) {
    Write-Host "⚠️  This script should be run as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

# Change to script directory
Set-Location $PSScriptRoot

# Run setup steps
if (-not $SkipPrereqs) {
    Test-Prerequisites
}

Copy-EnvFile
Test-EnvFile
Initialize-Directories

if ($PullImages) {
    Pull-DockerImages
}

Build-LocalImages

if ($StartServices) {
    Start-Services
    Start-Sleep -Seconds 10
    Show-Status
}

Show-Summary

Write-Host "Setup script completed!" -ForegroundColor Green
Write-Host ""
