<#
.SYNOPSIS
    Sync root .env from Infisical for local development

.DESCRIPTION
    Exports secrets from Infisical (/shared path) into a .env file at the
    Project-Nyra repo root. This acts as a lightweight "agent" for tools that
    expect a .env file (Claude Code, dev servers, etc.).

.USAGE
    cd infra/infisical
    .\sync-root-dotenv.ps1 -Environment dev
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$INFISICAL_PATH = "/shared"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Project Nyra - Infisical → .env Sync" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project ID: $INFISICAL_PROJECT_ID" -ForegroundColor Yellow
Write-Host "Path: $INFISICAL_PATH" -ForegroundColor Yellow
Write-Host ""

# Check Infisical CLI
if (-not (Get-Command "infisical" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Infisical CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g @infisical/cli" -ForegroundColor Yellow
    exit 1
}

# Determine repo root (two levels up from infra/infisical)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Split-Path -Parent $ScriptDir
$EnvPath   = Join-Path $RepoRoot ".env"

Write-Host "Exporting secrets to: $EnvPath" -ForegroundColor Cyan

# Export secrets as dotenv
$dotenv = infisical secrets --env=$Environment --path=$INFISICAL_PATH --projectId=$INFISICAL_PROJECT_ID --format=dotenv

if (-not $dotenv) {
    Write-Host "ERROR: No secrets returned from Infisical" -ForegroundColor Red
    exit 1
}

$dotenv | Out-File -FilePath $EnvPath -Encoding UTF8

Write-Host ""
Write-Host "✅ .env synced from Infisical" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  - Claude Code / tools will now read env from repo root .env" -ForegroundColor Cyan
Write-Host "  - To update, re-run: infra/infisical/sync-root-dotenv.ps1 -Environment $Environment" -ForegroundColor Cyan