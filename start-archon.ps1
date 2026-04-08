<#
.SYNOPSIS
    Start Archon stack using docker-compose.archon.yml

.DESCRIPTION
    Thin wrapper around docker-compose.archon.yml so you can run Archon
    with Infisical providing secrets, e.g.:

        infisical run --token="$INFISICAL_TOKEN" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
          --env="dev" --path="/shared" -- .\start-archon.ps1

    This will bring up the Archon services defined in infra/docker/docker-compose.archon.yml
    using whatever Supabase / Archon secrets you have stored in Infisical.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host " Project Nyra - Starting Archon Stack (docker-compose.archon.yml)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$RepoRoot = Split-Path -Parent $PSCommandPath
Set-Location $RepoRoot

if (-not (Test-Path "infra/docker/docker-compose.archon.yml")) {
    Write-Host "ERROR: infra/docker/docker-compose.archon.yml not found" -ForegroundColor Red
    exit 1
}

Write-Host "Using docker-compose.archon.yml with current environment variables" -ForegroundColor Yellow
Write-Host "(Tip: run via Infisical: infisical run --token=`"$env:INFISICAL_TOKEN`" --projectId=... --env=dev --path=/shared -- .\start-archon.ps1)" -ForegroundColor Yellow
Write-Host ""

# Bring up Archon stack together with base orchestration services (for Postgres, Redis, etc.)
& docker-compose -f infra/docker/docker-compose.orchestration.yml -f infra/docker/docker-compose.archon.yml up -d postgresql archon-server archon-mcp archon-ui

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker-compose up failed" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "✅ Archon stack started" -ForegroundColor Green
Write-Host "Check services:" -ForegroundColor Yellow
Write-Host "  - API:   curl http://localhost:8181/health (or 8092 depending on compose)" -ForegroundColor Cyan
Write-Host "  - MCP:   curl http://localhost:8051/health (or ARCHON_MCP_PORT)" -ForegroundColor Cyan
Write-Host "  - Logs:  docker-compose -f infra/docker/docker-compose.archon.yml logs -f" -ForegroundColor Cyan
