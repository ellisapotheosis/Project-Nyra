#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Interactive script to save secrets to Infisical

.DESCRIPTION
    This script provides an interactive interface to save environment variables
    to Infisical. It guides you through setting up all required secrets,
    validates inputs, and handles the proper camelCase --projectId flag.

.PARAMETER ProjectId
    Infisical project ID (required)

.PARAMETER Environment
    Environment to save to (development, staging, production)

.PARAMETER Path
    Infisical path/folder (e.g., /project-nyra/core)

.PARAMETER Category
    Specific category to configure (Core, Database, Authentication, etc.)

.PARAMETER NonInteractive
    Run in non-interactive mode with predefined values

.PARAMETER FromFile
    Load secrets from a file (JSON or ENV format)

.PARAMETER Backup
    Create backup before saving

.EXAMPLE
    .\save-infisical-secrets.ps1 -ProjectId proj_abc123 -Environment development

.EXAMPLE
    .\save-infisical-secrets.ps1 -ProjectId proj_abc123 -Category Database -Backup

.EXAMPLE
    .\save-infisical-secrets.ps1 -ProjectId proj_abc123 -FromFile secrets.json
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [Parameter(Mandatory = $false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',

    [Parameter(Mandatory = $false)]
    [string]$Path = '/project-nyra/core',

    [Parameter(Mandatory = $false)]
    [ValidateSet('Core', 'Database', 'Authentication', 'ClaudeFlow', 'GitHub', 'Docker', 'Infrastructure', 'All')]
    [string]$Category = 'All',

    [Parameter(Mandatory = $false)]
    [switch]$NonInteractive,

    [Parameter(Mandatory = $false)]
    [string]$FromFile,

    [Parameter(Mandatory = $false)]
    [switch]$Backup
)

$ErrorActionPreference = 'Stop'

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Question { param($Message) Write-Host "? $Message" -ForegroundColor Magenta -NoNewline }

# Secret templates by category
$SecretTemplates = @{
    'Core' = @(
        @{Name='PROJECT_NAME'; Description='Project identifier'; Required=$true; Default='nyra-multi-agent-orchestration'},
        @{Name='ENVIRONMENT'; Description='Environment type'; Required=$true; Default='development'; Options=@('development','staging','production')},
        @{Name='LOG_LEVEL'; Description='Logging level'; Required=$false; Default='info'; Options=@('debug','info','warn','error')},
        @{Name='API_BASE_URL'; Description='API base URL'; Required=$true; Example='http://localhost:8000'},
        @{Name='WEB_BASE_URL'; Description='Web base URL'; Required=$true; Example='http://localhost:3000'},
        @{Name='CORS_ORIGINS'; Description='CORS origins (comma-separated)'; Required=$true; Example='http://localhost:3000,http://localhost:8000'}
    )
    'Database' = @(
        @{Name='POSTGRES_HOST'; Description='PostgreSQL host'; Required=$true; Default='postgres'},
        @{Name='POSTGRES_PORT'; Description='PostgreSQL port'; Required=$true; Default='5432'},
        @{Name='POSTGRES_DB'; Description='Database name'; Required=$true; Default='nyra_db'},
        @{Name='POSTGRES_USER'; Description='Database user'; Required=$true; Default='nyra_user'},
        @{Name='POSTGRES_PASSWORD'; Description='Database password'; Required=$true; Sensitive=$true; Generate='password'},
        @{Name='REDIS_HOST'; Description='Redis host'; Required=$true; Default='redis'},
        @{Name='REDIS_PORT'; Description='Redis port'; Required=$true; Default='6379'},
        @{Name='REDIS_PASSWORD'; Description='Redis password'; Required=$true; Sensitive=$true; Generate='password'}
    )
    'Authentication' = @(
        @{Name='JWT_SECRET'; Description='JWT signing secret'; Required=$true; Sensitive=$true; Generate='jwt'},
        @{Name='JWT_REFRESH_SECRET'; Description='JWT refresh secret'; Required=$true; Sensitive=$true; Generate='jwt'},
        @{Name='JWT_EXPIRES_IN'; Description='JWT expiration'; Required=$false; Default='15m'},
        @{Name='JWT_REFRESH_EXPIRES_IN'; Description='Refresh token expiration'; Required=$false; Default='7d'},
        @{Name='SESSION_SECRET'; Description='Session encryption secret'; Required=$true; Sensitive=$true; Generate='session'}
    )
    'ClaudeFlow' = @(
        @{Name='CLAUDE_FLOW_API_URL'; Description='Claude Flow API URL'; Required=$true; Default='https://api.claude-flow.ai'},
        @{Name='CLAUDE_FLOW_API_KEY'; Description='Claude Flow API key'; Required=$true; Sensitive=$true},
        @{Name='CLAUDE_FLOW_WORKSPACE_ID'; Description='Workspace ID'; Required=$true; Example='ws_abc123xyz'},
        @{Name='CLAUDE_FLOW_PROJECT_ID'; Description='Project ID'; Required=$true; Example='proj_abc123xyz'},
        @{Name='CLAUDE_MODEL'; Description='Claude model version'; Required=$false; Default='claude-sonnet-4-5'},
        @{Name='MAX_AGENTS'; Description='Maximum agents'; Required=$false; Default='5'}
    )
    'GitHub' = @(
        @{Name='GITHUB_TOKEN'; Description='GitHub personal access token'; Required=$true; Sensitive=$true},
        @{Name='GITHUB_OWNER'; Description='Repository owner'; Required=$true; Example='myorg'},
        @{Name='GITHUB_REPO'; Description='Repository name'; Required=$true; Example='nyra-project'},
        @{Name='GITHUB_BRANCH'; Description='Default branch'; Required=$false; Default='main'}
    )
    'Docker' = @(
        @{Name='DOCKER_REGISTRY_URL'; Description='Docker registry URL'; Required=$true; Default='https://registry.hub.docker.com'},
        @{Name='DOCKER_REGISTRY_USERNAME'; Description='Registry username'; Required=$true},
        @{Name='DOCKER_REGISTRY_PASSWORD'; Description='Registry password'; Required=$true; Sensitive=$true},
        @{Name='DOCKER_REGISTRY_NAMESPACE'; Description='Registry namespace'; Required=$true; Example='myorg'}
    )
    'Infrastructure' = @(
        @{Name='MACHINE_ROLE'; Description='Machine role'; Required=$true; Options=@('orchestrator','worker')},
        @{Name='MACHINE_HOSTNAME'; Description='Machine hostname'; Required=$true; Default=$env:COMPUTERNAME},
        @{Name='DOCKER_HOST'; Description='Docker daemon host'; Required=$false; Default='unix:///var/run/docker.sock'}
    )
}

# Generate secure values
function New-SecureValue {
    param([string]$Type)

    switch ($Type) {
        'password' {
            # Generate 32-character password
            $bytes = New-Object byte[] 32
            [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
            return [Convert]::ToBase64String($bytes)
        }
        'jwt' {
            # Generate 64-character JWT secret
            $bytes = New-Object byte[] 64
            [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
            return [Convert]::ToBase64String($bytes)
        }
        'session' {
            # Generate 32-character session secret
            $bytes = New-Object byte[] 32
            [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
            return [Convert]::ToBase64String($bytes)
        }
        default {
            return $null
        }
    }
}

# Prompt for value
function Read-SecretValue {
    param(
        [hashtable]$Template,
        [bool]$IsInteractive = $true
    )

    if (-not $IsInteractive) {
        if ($Template.Default) {
            return $Template.Default
        }
        elseif ($Template.Generate) {
            return New-SecureValue -Type $Template.Generate
        }
        return $null
    }

    Write-Host "`n" -NoNewline
    Write-Question "$($Template.Name)"
    Write-Host ""
    Write-Host "  Description: $($Template.Description)" -ForegroundColor Gray

    if ($Template.Example) {
        Write-Host "  Example: $($Template.Example)" -ForegroundColor Gray
    }

    if ($Template.Options) {
        Write-Host "  Options: $($Template.Options -join ', ')" -ForegroundColor Gray
    }

    if ($Template.Default) {
        Write-Host "  Default: $($Template.Default)" -ForegroundColor Gray
    }

    if ($Template.Generate) {
        Write-Host "  Press Enter to generate secure value, or type custom value" -ForegroundColor Yellow
    }

    Write-Host "  Value: " -ForegroundColor Cyan -NoNewline

    if ($Template.Sensitive) {
        $secureString = Read-Host -AsSecureString
        $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
        $value = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
    else {
        $value = Read-Host
    }

    # Handle empty input
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($Template.Generate) {
            $value = New-SecureValue -Type $Template.Generate
            Write-Info "  Generated secure value"
        }
        elseif ($Template.Default) {
            $value = $Template.Default
            Write-Info "  Using default value"
        }
    }

    # Validate options
    if ($Template.Options -and $value -notin $Template.Options) {
        Write-Warning "  Invalid option. Using default: $($Template.Default)"
        $value = $Template.Default
    }

    return $value
}

# Save secret to Infisical
function Set-InfisicalSecret {
    param(
        [string]$Key,
        [string]$Value,
        [string]$ProjectIdValue,
        [string]$EnvironmentValue,
        [string]$PathValue
    )

    try {
        # Use camelCase --projectId flag
        $cmd = "infisical secrets set $Key `"$Value`" --projectId $ProjectIdValue --env $EnvironmentValue"
        if ($PathValue) {
            $cmd += " --path `"$PathValue`""
        }

        Write-Verbose "Executing: infisical secrets set $Key *** --projectId $ProjectIdValue --env $EnvironmentValue"

        $result = Invoke-Expression $cmd 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Success "  Saved: $Key"
            return $true
        }
        else {
            Write-Error "  Failed to save $Key : $result"
            return $false
        }
    }
    catch {
        Write-Error "  Error saving $Key : $_"
        return $false
    }
}

# Create backup
function Backup-Secrets {
    param(
        [string]$ProjectIdValue,
        [string]$EnvironmentValue
    )

    Write-Info "Creating backup..."

    try {
        $backupDir = Join-Path $PSScriptRoot "backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
        }

        $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $backupFile = Join-Path $backupDir "secrets-backup-$timestamp.json"

        # Export all secrets
        $cmd = "infisical secrets --projectId $ProjectIdValue --env $EnvironmentValue --format json"
        $secrets = Invoke-Expression $cmd | ConvertFrom-Json

        $backup = @{
            Timestamp = Get-Date -Format 'o'
            ProjectId = $ProjectIdValue
            Environment = $EnvironmentValue
            Secrets = $secrets
        }

        $backup | ConvertTo-Json -Depth 10 | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Success "Backup created: $backupFile"
        return $true
    }
    catch {
        Write-Warning "Failed to create backup: $_"
        return $false
    }
}

# Load secrets from file
function Import-SecretsFromFile {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        return $null
    }

    $extension = [IO.Path]::GetExtension($FilePath)

    try {
        switch ($extension) {
            '.json' {
                $data = Get-Content $FilePath -Raw | ConvertFrom-Json
                return $data
            }
            '.env' {
                $secrets = @{}
                Get-Content $FilePath | ForEach-Object {
                    if ($_ -match '^([^=]+)=(.*)$') {
                        $secrets[$matches[1].Trim()] = $matches[2].Trim().Trim('"')
                    }
                }
                return $secrets
            }
            default {
                Write-Error "Unsupported file format: $extension"
                return $null
            }
        }
    }
    catch {
        Write-Error "Failed to load file: $_"
        return $null
    }
}

# Main interactive configuration
function Start-InteractiveConfiguration {
    param(
        [string]$CategoryName,
        [string]$ProjectIdValue,
        [string]$EnvironmentValue,
        [string]$PathValue
    )

    Write-Info "═" * 60
    Write-Info "Configuring: $CategoryName"
    Write-Info "═" * 60

    $templates = if ($CategoryName -eq 'All') {
        $SecretTemplates.Values | ForEach-Object { $_ }
    }
    else {
        $SecretTemplates[$CategoryName]
    }

    $savedCount = 0
    $failedCount = 0

    foreach ($template in $templates) {
        $value = Read-SecretValue -Template $template -IsInteractive (-not $NonInteractive)

        if ([string]::IsNullOrWhiteSpace($value) -and $template.Required) {
            Write-Warning "Skipping required field: $($template.Name)"
            $failedCount++
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($value)) {
            if (Set-InfisicalSecret -Key $template.Name -Value $value -ProjectIdValue $ProjectIdValue -EnvironmentValue $EnvironmentValue -PathValue $PathValue) {
                $savedCount++
            }
            else {
                $failedCount++
            }
        }
    }

    Write-Host "`n" + ("═" * 60) -ForegroundColor Cyan
    Write-Success "Saved: $savedCount secrets"
    if ($failedCount -gt 0) {
        Write-Warning "Failed: $failedCount secrets"
    }
    Write-Info "═" * 60
}

# Main execution
try {
    Write-Info "Infisical Secrets Configuration"
    Write-Info "═" * 60
    Write-Info "Project ID: $ProjectId"
    Write-Info "Environment: $Environment"
    Write-Info "Path: $Path"
    Write-Info "Category: $Category"
    Write-Info "═" * 60

    # Create backup if requested
    if ($Backup) {
        Backup-Secrets -ProjectIdValue $ProjectId -EnvironmentValue $Environment
    }

    # Import from file if specified
    if ($FromFile) {
        Write-Info "Importing secrets from file: $FromFile"
        $importedSecrets = Import-SecretsFromFile -FilePath $FromFile

        if ($importedSecrets) {
            $savedCount = 0
            foreach ($key in $importedSecrets.PSObject.Properties.Name) {
                $value = $importedSecrets.$key
                if (Set-InfisicalSecret -Key $key -Value $value -ProjectIdValue $ProjectId -EnvironmentValue $Environment -PathValue $Path) {
                    $savedCount++
                }
            }
            Write-Success "Imported $savedCount secrets from file"
        }
    }
    else {
        # Interactive configuration
        Start-InteractiveConfiguration -CategoryName $Category -ProjectIdValue $ProjectId -EnvironmentValue $Environment -PathValue $Path
    }

    Write-Info "`nConfiguration complete!"
    Write-Info "Verify with: .\check-infisical-vars.ps1 -ProjectId $ProjectId -Environment $Environment"
}
catch {
    Write-Error "An error occurred: $_"
    Write-Error $_.ScriptStackTrace
    exit 1
}
