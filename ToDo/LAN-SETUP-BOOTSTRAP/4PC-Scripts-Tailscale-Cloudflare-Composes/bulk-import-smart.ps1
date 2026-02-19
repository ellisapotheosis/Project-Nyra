<#
.SYNOPSIS
Smart bulk importer for Infisical - routes secrets to correct paths based on variable patterns

.DESCRIPTION
This script:
1. Parses .env files from network exports
2. Intelligently routes variables to their correct Infisical paths
3. Uploads without quote issues (clean secrets)
4. Supports dev/staging/prod environments
5. Prevents duplicates via secret import graph

.PARAMETER Env
Environment to upload to: dev, staging, or prod

.PARAMETER ProjectId
Infisical Project ID (required first time, then cached)

.PARAMETER DryRun
Show what would be imported without actually uploading

.EXAMPLE
.\bulk-import-smart.ps1 -Env dev
.\bulk-import-smart.ps1 -Env staging -DryRun
#>

[CmdletBinding()]
param(
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Env = 'dev',
    [string]$ProjectId,
    [switch]$DryRun = $false,
    [string]$ConfigPath = "$PSScriptRoot\..\paths-mapping.json"
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = 'Stop'
$VerbosePreference = 'Continue'

# Paths configuration
$exportsDir = Resolve-Path "$PSScriptRoot\..\..\network\exports" -ErrorAction Stop
$configFile = $ConfigPath
$cacheFile = "$PSScriptRoot\..\.infisical-config-cache.json"

# Path-to-prefix mapping (for intelligent routing)
$pathPrefixMap = @{
    '/machines/orchestrator'       = @('ORCHESTRATOR_', 'MINISA')
    '/machines/worker-rtx3060'     = @('WORKER_RTX3060_', 'ALIENA')
    '/machines/worker-rtx3090ti'   = @('WORKER_RTX3090TI_', 'RTX3090')
    '/machines/worker-rtx5090'     = @('WORKER_RTX5090_', 'AREA51', 'LAN_', 'WIFI_', 'HYPERV_', 'TAILSCALE_', 'CLOUDFLARE_')
    '/shared/shared-network'       = @('GATEWAY_', 'DNS_', 'INTERNAL_')
    '/shared/shared-base'          = @('LOG_', 'TIMEOUT_', 'NAMESPACE_')
    '/clients/cloudflare'          = @('CLOUDFLARE_API_', 'CLOUDFLARE_ZONE_', 'CLOUDFLARE_TUNNEL_')
    '/clients/tailscale'           = @('TAILSCALE_API_', 'TAILSCALE_AUTH_', 'TAILSCALE_TAILNET')
    '/clients/github'              = @('GITHUB_TOKEN', 'GITHUB_APP_', 'GITHUB_WEBHOOK_')
    '/providers/huggingface'       = @('HF_TOKEN', 'HF_HOME', 'HF_API_')
    '/databases/redis'             = @('REDIS_')
    '/databases/postgres'          = @('POSTGRES_', 'DATABASE_URL')
    '/router/nexus'                = @('NEXUS_')
    '/adapters/litellm'            = @('LITELLM_')
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Get-CachedProjectId {
    if (Test-Path $cacheFile) {
        $cache = Get-Content $cacheFile -Raw | ConvertFrom-Json
        return $cache.ProjectId
    }
    return $null
}

function Save-CachedProjectId {
    param([string]$Id)
    $cache = @{ ProjectId = $Id }
    $cache | ConvertTo-Json | Set-Content $cacheFile
}

function Parse-EnvFile {
    param(
        [string]$FilePath,
        [string]$MachineName
    )
    
    $secrets = @{}
    
    if (-not (Test-Path $FilePath)) {
        Write-Warning "File not found: $FilePath"
        return $secrets
    }
    
    $lines = @(Get-Content $FilePath -ErrorAction SilentlyContinue)
    
    foreach ($line in $lines) {
        # Skip empty lines and comments
        if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) {
            continue
        }
        
        # Parse KEY=VALUE (no quotes, no spaces around =)
        if ($line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            
            # Remove surrounding quotes if present
            if ($value -match '^["\'](.+)["\']$') {
                $value = $matches[1]
            }
            
            # Skip placeholder values
            if ($value -match 'TO_BE_COLLECTED|PENDING|PLACEHOLDER' -or [string]::IsNullOrWhiteSpace($value)) {
                Write-Verbose "Skipping placeholder: $key=$value"
                continue
            }
            
            $secrets[$key] = $value
        }
    }
    
    return $secrets
}

function Get-TargetPath {
    param(
        [string]$VariableName,
        [string]$Source
    )
    
    # Check prefix-based routing
    foreach ($path in $pathPrefixMap.Keys) {
        $prefixes = $pathPrefixMap[$path]
        foreach ($prefix in $prefixes) {
            if ($VariableName.StartsWith($prefix)) {
                return $path
            }
        }
    }
    
    # Fallback routing by machine source
    if ($Source -like '*rtx5090*' -or $Source -like '*AREA51*') {
        if ($VariableName -match 'LAN_|WIFI_|HYPERV_') {
            return '/machines/worker-rtx5090'
        }
    }
    
    if ($Source -like '*rtx3060*' -or $Source -like '*ALIENA*') {
        return '/machines/worker-rtx3060'
    }
    
    if ($Source -like '*rtx3090*') {
        return '/machines/worker-rtx3090ti'
    }
    
    if ($Source -like '*orchestrator*' -or $Source -like '*MINISA*') {
        return '/machines/orchestrator'
    }
    
    # Final fallback
    Write-Warning "Could not determine path for $VariableName from source $Source, defaulting to /shared/shared-base"
    return '/shared/shared-base'
}

function Format-SecretForInfisical {
    param(
        [string]$Value
    )
    
    # Clean up quotes and escaping
    $value = $value -replace '^[\"\']|[\"\']$', ''  # Remove outer quotes
    $value = $value -replace '\\\"', '"'             # Unescape quotes
    $value = $value -replace '\\\\', '\'             # Unescape backslashes
    
    return $value
}

function Import-SecretsToInfisical {
    param(
        [hashtable]$SecretsByPath,
        [string]$Environment,
        [string]$ProjectId
    )
    
    $imported = 0
    $failed = 0
    
    foreach ($path in $SecretsByPath.Keys) {
        $secrets = $SecretsByPath[$path]
        
        Write-Host "`n[*] Processing path: $path" -ForegroundColor Cyan
        Write-Host "    Secrets to upload: $($secrets.Count)"
        
        foreach ($key in $secrets.Keys) {
            $value = $secrets[$key]
            $safeValue = Format-SecretForInfisical $value
            
            if ($DryRun) {
                Write-Host "    [DRY RUN] Would set: $key = $([System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String([System.Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($safeValue)))))" -ForegroundColor Yellow
            } else {
                try {
                    # Use infisical CLI to set secret
                    # Note: value is passed as argument, NOT via stdin, to avoid quote issues
                    $result = & infisical secrets set --path=$path --env=$Environment --project-id=$ProjectId $key $safeValue 2>&1
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "    [+] $key" -ForegroundColor Green
                        $imported++
                    } else {
                        Write-Host "    [!] Failed: $key" -ForegroundColor Red
                        Write-Verbose "Error: $result"
                        $failed++
                    }
                } catch {
                    Write-Host "    [!] Exception setting $key : $_" -ForegroundColor Red
                    $failed++
                }
            }
        }
    }
    
    return @{
        Imported = $imported
        Failed   = $failed
    }
}

# ============================================================================
# MAIN
# ============================================================================

Write-Host "=== Infisical Smart Bulk Import ===" -ForegroundColor Cyan
Write-Host "Environment: $Env"
Write-Host "Source: $exportsDir"
Write-Host ""

# Load paths mapping
if (-not (Test-Path $configFile)) {
    Write-Error "Config file not found: $configFile"
    exit 1
}

$pathsConfig = Get-Content $configFile -Raw | ConvertFrom-Json

# Get or prompt for ProjectId
$ProjectId = $ProjectId -or (Get-CachedProjectId)
if (-not $ProjectId) {
    $ProjectId = Read-Host "Enter your Infisical Project ID"
    Save-CachedProjectId $ProjectId
}

Write-Host "Project ID: $ProjectId" -ForegroundColor Green

# Parse all .env files from exports
$allSecrets = @{}
$fileCount = 0

Write-Host "`n[*] Parsing export files..." -ForegroundColor Cyan

Get-ChildItem $exportsDir -Filter "*.env" | ForEach-Object {
    if ($_.Name -notmatch 'mac-addresses') {
        Write-Host "  Reading: $($_.Name)" -ForegroundColor Yellow
        
        $parsed = Parse-EnvFile -FilePath $_.FullName -MachineName $_.BaseName
        $fileCount++
        
        # Organize by target path
        foreach ($key in $parsed.Keys) {
            $targetPath = Get-TargetPath -VariableName $key -Source $_.Name
            
            if (-not $allSecrets.ContainsKey($targetPath)) {
                $allSecrets[$targetPath] = @{}
            }
            
            $allSecrets[$targetPath][$key] = $parsed[$key]
        }
    }
}

Write-Host "Parsed $fileCount files" -ForegroundColor Green

# Group by path for display
Write-Host "`n[*] Organized by Infisical path:" -ForegroundColor Cyan
foreach ($path in ($allSecrets.Keys | Sort-Object)) {
    $count = $allSecrets[$path].Count
    Write-Host "  $path : $count secrets" -ForegroundColor Cyan
}

# Show sample (first 5 per path)
if (-not $DryRun) {
    Write-Host "`n[?] Continue with import? (y/n)" -ForegroundColor Yellow
    $confirm = Read-Host
    if ($confirm -ne 'y') {
        Write-Host "Aborted." -ForegroundColor Red
        exit 0
    }
}

# Import to Infisical
Write-Host "`n[*] Importing secrets to Infisical ($Env)..." -ForegroundColor Cyan

$results = Import-SecretsToInfisical -SecretsByPath $allSecrets -Environment $Env -ProjectId $ProjectId

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Imported: $($results.Imported)" -ForegroundColor Green
Write-Host "Failed: $($results.Failed)" -ForegroundColor $(if ($results.Failed -gt 0) { "Red" } else { "Green" })

if ($DryRun) {
    Write-Host "`nDRY RUN COMPLETE - No changes made" -ForegroundColor Yellow
} else {
    Write-Host "`nImport complete!" -ForegroundColor Green
}
