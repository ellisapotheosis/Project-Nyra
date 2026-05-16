#!/usr/bin/env pwsh

<#
.SYNOPSIS
Upload shared secrets to Infisical

.DESCRIPTION
Uploads all shared secrets (API keys, tokens) to /shared path in Infisical.
These secrets are read by all PCs but only writable by orchestrator.

.PARAMETER Environment
Target environment (development, staging, production)

.EXAMPLE
.\upload-shared-secrets.ps1 -Environment development
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\..\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId
Assert-NyraInfisicalToken

Write-Host "`n🔐 Uploading Shared Secrets to Infisical" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Define shared secrets
$sharedSecrets = @{
    "ANTHROPIC_API_KEY" = $env:ANTHROPIC_API_KEY
    "GOOGLE_API_KEY" = $env:GOOGLE_API_KEY
    "GOOGLE_GEMINI_API_KEY" = $env:GOOGLE_API_KEY  # Alias
    "OPENROUTER_API_KEY" = $env:OPENROUTER_API_KEY
    "CONTEXT7_API_KEY" = $env:CONTEXT7_API_KEY
    "GITHUB_TOKEN" = $env:GITHUB_TOKEN
    "DOMAIN" = "projectnyra.com"
    "SUBDOMAIN_NYRA" = "app.projectnyra.com"
    "SUBDOMAIN_API" = "api.projectnyra.com"
    "SUBDOMAIN_ADMIN" = "admin.projectnyra.com"
    "NODE_ENV" = $Environment
    "ENVIRONMENT" = $Environment
}

$successCount = 0
$skipCount = 0
$failCount = 0

foreach ($key in $sharedSecrets.Keys) {
    $value = $sharedSecrets[$key]

    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "⚠️  Skipping $key (not set in current environment)" -ForegroundColor Yellow
        $skipCount++
        continue
    }

    try {
        # Mask sensitive values in output
        $maskedValue = if ($value.Length -gt 10) {
            $value.Substring(0, 8) + "..."
        } else {
            "***"
        }

        # Upload to Infisical
        Set-NyraInfisicalSecret -Name $key -Value $value -Environment $Environment -Path "/shared" -ProjectId $projectId | Out-Null
        Write-Host "✅ Set $key = $maskedValue in /shared" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "❌ Failed to set $key : $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n=========================================`n" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Success: $successCount" -ForegroundColor Green
Write-Host "   ⚠️  Skipped: $skipCount" -ForegroundColor Yellow
Write-Host "   ❌ Failed: $failCount" -ForegroundColor Red
Write-Host "`n🎉 Shared secrets upload complete!`n" -ForegroundColor Green

if ($failCount -gt 0) {
    exit 1
}
