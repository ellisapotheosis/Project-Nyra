#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Stop Project Nyra services on PC1 (Orchestrator)

.DESCRIPTION
    Stops all orchestrator services gracefully. Optionally removes volumes
    for a clean reset.

.PARAMETER Volumes
    Remove all volumes (WARNING: This deletes all data!)

.PARAMETER Force
    Force stop without confirmation

.EXAMPLE
    .\down.ps1
    Stop all services

.EXAMPLE
    .\down.ps1 -Volumes
    Stop services and remove volumes

.EXAMPLE
    .\down.ps1 -Force -Volumes
    Stop services and remove volumes without confirmation

.NOTES
    PC: PC1 (Orchestrator)
    Role: Stop all PC1 services
    Author: Project Nyra Team
#>

param(
    [switch]$Volumes,
    [switch]$Force
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

# Confirm if removing volumes
if ($Volumes -and -not $Force) {
    Write-Warning "⚠️  WARNING: This will DELETE ALL DATA including:"
    Write-Warning "   - PostgreSQL databases"
    Write-Warning "   - Redis cache"
    Write-Warning "   - Qdrant vectors"
    Write-Warning "   - Grafana dashboards"
    Write-Warning "   - All service data"
    Write-Warning ""
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"

    if ($confirm -ne "yes") {
        Write-Info "Aborted"
        exit 0
    }
}

Write-Header "Project Nyra - PC1 Orchestrator Shutdown"
Write-Info "Compose File: $ComposeFile"

Set-Location "$ProjectRoot\infra"

if ($Volumes) {
    Write-Warning "🛑 Stopping services and removing volumes..."
    docker-compose -f docker-compose.dev.yml down -v
} else {
    Write-Info "🛑 Stopping services (preserving volumes)..."
    docker-compose -f docker-compose.dev.yml down
}

if ($LASTEXITCODE -eq 0) {
    Write-Success "`n✅ Services stopped successfully"

    if ($Volumes) {
        Write-Success "✅ Volumes removed"
    } else {
        Write-Info "💾 Volumes preserved. Use './down.ps1 -Volumes' to remove data."
    }

    # Show remaining containers
    $containers = docker ps -a --filter "name=nyra-" --format "{{.Names}}"
    if ($containers) {
        Write-Warning "`n⚠️  Some containers still exist:"
        $containers | ForEach-Object { Write-Warning "   - $_" }
    }
} else {
    Write-Failure "❌ Failed to stop services"
    exit 1
}
