#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Start Project Nyra services on PC1 (Orchestrator)

.DESCRIPTION
    Starts all orchestrator services including databases, MCP servers, monitoring,
    and routing infrastructure. This script should be run on PC1 (Mini PC Orchestrator).

.PARAMETER Build
    Rebuild images before starting services

.PARAMETER Verbose
    Show detailed output including logs

.PARAMETER DetachedOnly
    Start services in detached mode only, skip verification

.EXAMPLE
    .\up.ps1
    Start all services

.EXAMPLE
    .\up.ps1 -Build
    Rebuild and start all services

.EXAMPLE
    .\up.ps1 -Verbose
    Start services with detailed output

.NOTES
    PC: PC1 (Orchestrator)
    Role: MCP servers, databases, monitoring, routing
    Author: Project Nyra Team
#>

param(
    [switch]$Build,
    [switch]$Verbose,
    [switch]$DetachedOnly
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path (Split-Path $ScriptDir -Parent) -Parent
$ComposeFile = Join-Path $ProjectRoot "infra\docker-compose.dev.yml"

# Color functions
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Header { param($Message) Write-Host "`n====== $Message ======" -ForegroundColor Magenta }

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Failure "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    }
}

# Check if docker-compose file exists
function Test-ComposeFile {
    if (-not (Test-Path $ComposeFile)) {
        Write-Failure "❌ Docker Compose file not found: $ComposeFile"
        exit 1
    }
}

# Main execution
Write-Header "Project Nyra - PC1 Orchestrator Startup"
Write-Info "Compose File: $ComposeFile"
Write-Info "Working Directory: $ProjectRoot\infra"

# Verify prerequisites
Test-DockerRunning
Test-ComposeFile

# Build if requested
if ($Build) {
    Write-Header "Building Docker Images"
    Set-Location "$ProjectRoot\infra"
    docker-compose -f docker-compose.dev.yml build
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "❌ Build failed"
        exit 1
    }
    Write-Success "✅ Build completed"
}

# Start services
Write-Header "Starting Services"
Set-Location "$ProjectRoot\infra"

if ($DetachedOnly) {
    docker-compose -f docker-compose.dev.yml up -d
} else {
    docker-compose -f docker-compose.dev.yml up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Success "`n✅ Services started successfully"

        # Wait for services to initialize
        Write-Info "`nWaiting for services to initialize..."
        Start-Sleep -Seconds 10

        # Show service status
        Write-Header "Service Status"
        docker-compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

        if ($Verbose) {
            Write-Header "Recent Logs"
            docker-compose -f docker-compose.dev.yml logs --tail=20
        }

        # Show quick stats
        Write-Header "Resource Usage"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | Select-Object -First 15

        # Show access URLs
        Write-Header "Access URLs"
        Write-Info "📊 Grafana:        http://localhost:3000 (admin/admin)"
        Write-Info "📈 Prometheus:     http://localhost:9090"
        Write-Info "🗄️  PostgreSQL:     localhost:5432 (postgres/postgres)"
        Write-Info "🔴 Redis:          localhost:6380"
        Write-Info "🔷 Qdrant:         http://localhost:6333"
        Write-Info "🎯 LiteLLM:        http://localhost:4000"
        Write-Info "🤖 Dify:           http://localhost:3001"
        Write-Info "🔄 n8n:            http://localhost:5678 (admin/admin)"
        Write-Info "📋 Activepieces:   http://localhost:3002"
        Write-Info "💼 TwentyCRM:      http://localhost:3010"
        Write-Info "🧠 Letta:          http://localhost:8283"

        Write-Success "`n✅ All services running. Use './down.ps1' to stop."
    } else {
        Write-Failure "❌ Failed to start services"
        Write-Info "Check logs: docker-compose -f $ComposeFile logs"
        exit 1
    }
}
