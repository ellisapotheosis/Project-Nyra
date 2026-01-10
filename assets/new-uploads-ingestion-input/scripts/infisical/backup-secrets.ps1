#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Backup Infisical secrets with versioning and rollback support

.DESCRIPTION
    This script creates versioned backups of Infisical secrets with the ability
    to rollback to previous versions. Supports multiple formats and compression.

.PARAMETER ProjectId
    Infisical project ID (uses camelCase --projectId flag)

.PARAMETER Environment
    Environment to backup (development, staging, production)

.PARAMETER Path
    Specific path/folder to backup (optional, backups all if not specified)

.PARAMETER Format
    Backup format: json, yaml, env, encrypted

.PARAMETER Compress
    Compress backup file

.PARAMETER Encrypt
    Encrypt backup with password

.PARAMETER OutputDir
    Custom output directory for backup

.PARAMETER ListBackups
    List all available backups

.PARAMETER Rollback
    Rollback to a specific backup version

.PARAMETER Compare
    Compare two backup versions

.EXAMPLE
    .\backup-secrets.ps1 -ProjectId proj_abc123 -Environment production -Encrypt

.EXAMPLE
    .\backup-secrets.ps1 -ListBackups

.EXAMPLE
    .\backup-secrets.ps1 -Rollback -BackupFile "backup-20250131-120000.json"
#>

[CmdletBinding(DefaultParameterSetName = 'Backup')]
param(
    [Parameter(ParameterSetName = 'Backup', Mandatory = $true)]
    [Parameter(ParameterSetName = 'Rollback')]
    [string]$ProjectId,

    [Parameter(ParameterSetName = 'Backup', Mandatory = $true)]
    [Parameter(ParameterSetName = 'Rollback')]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment,

    [Parameter(ParameterSetName = 'Backup')]
    [string]$Path = '',

    [Parameter(ParameterSetName = 'Backup')]
    [ValidateSet('json', 'yaml', 'env', 'encrypted')]
    [string]$Format = 'json',

    [Parameter(ParameterSetName = 'Backup')]
    [switch]$Compress,

    [Parameter(ParameterSetName = 'Backup')]
    [switch]$Encrypt,

    [Parameter(ParameterSetName = 'Backup')]
    [string]$OutputDir,

    [Parameter(ParameterSetName = 'List')]
    [switch]$ListBackups,

    [Parameter(ParameterSetName = 'Rollback')]
    [switch]$Rollback,

    [Parameter(ParameterSetName = 'Rollback')]
    [string]$BackupFile,

    [Parameter(ParameterSetName = 'Compare')]
    [switch]$Compare,

    [Parameter(ParameterSetName = 'Compare')]
    [string]$BackupFile1,

    [Parameter(ParameterSetName = 'Compare')]
    [string]$BackupFile2
)

$ErrorActionPreference = 'Stop'

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }

# Default backup directory
$BackupBaseDir = if ($OutputDir) { $OutputDir } else { Join-Path $PSScriptRoot "backups" }

# Ensure backup directory exists
if (-not (Test-Path $BackupBaseDir)) {
    New-Item -Path $BackupBaseDir -ItemType Directory -Force | Out-Null
}

# Fetch secrets from Infisical
function Get-InfisicalSecrets {
    param(
        [string]$ProjectIdValue,
        [string]$EnvironmentValue,
        [string]$PathValue
    )

    Write-Info "Fetching secrets from Infisical..."

    try {
        # Use camelCase --projectId flag
        $cmd = "infisical secrets --projectId $ProjectIdValue --env $EnvironmentValue"
        if ($PathValue) {
            $cmd += " --path `"$PathValue`""
        }
        $cmd += " --format json"

        $result = Invoke-Expression $cmd 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "Failed to fetch secrets: $result"
        }

        $secrets = $result | ConvertFrom-Json
        Write-Success "Fetched $($secrets.Count) secrets"
        return $secrets
    }
    catch {
        Write-Error "Error fetching secrets: $_"
        throw
    }
}

# Create backup
function New-SecretBackup {
    param(
        [string]$ProjectIdValue,
        [string]$EnvironmentValue,
        [string]$PathValue,
        [string]$FormatValue,
        [bool]$CompressValue,
        [bool]$EncryptValue
    )

    Write-Info "Creating backup..."

    # Fetch secrets
    $secrets = Get-InfisicalSecrets -ProjectIdValue $ProjectIdValue -EnvironmentValue $EnvironmentValue -PathValue $PathValue

    # Generate filename
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $baseName = "backup-$ProjectIdValue-$EnvironmentValue-$timestamp"

    # Create backup metadata
    $metadata = @{
        version = "1.0.0"
        timestamp = Get-Date -Format 'o'
        project_id = $ProjectIdValue
        environment = $EnvironmentValue
        path = $PathValue
        format = $FormatValue
        encrypted = $EncryptValue
        compressed = $CompressValue
        secret_count = $secrets.Count
        created_by = $env:USERNAME
        machine = $env:COMPUTERNAME
    }

    $backup = @{
        metadata = $metadata
        secrets = $secrets
    }

    # Save based on format
    $outputPath = $null
    switch ($FormatValue) {
        'json' {
            $outputPath = Join-Path $BackupBaseDir "$baseName.json"
            $backup | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8
        }
        'yaml' {
            $outputPath = Join-Path $BackupBaseDir "$baseName.yaml"
            # Convert to YAML (requires powershell-yaml module)
            if (Get-Module -ListAvailable -Name powershell-yaml) {
                Import-Module powershell-yaml
                $backup | ConvertTo-Yaml | Out-File -FilePath $outputPath -Encoding UTF8
            }
            else {
                Write-Warning "powershell-yaml module not found. Falling back to JSON."
                $outputPath = Join-Path $BackupBaseDir "$baseName.json"
                $backup | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8
            }
        }
        'env' {
            $outputPath = Join-Path $BackupBaseDir "$baseName.env"
            $envContent = "# Backup created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
            $envContent += "# Project: $ProjectIdValue | Environment: $EnvironmentValue`n`n"

            foreach ($secret in $secrets) {
                $envContent += "$($secret.key)=$($secret.value)`n"
            }

            $envContent | Out-File -FilePath $outputPath -Encoding UTF8
        }
        'encrypted' {
            $outputPath = Join-Path $BackupBaseDir "$baseName.enc"
            $jsonContent = $backup | ConvertTo-Json -Depth 10

            # Encrypt with password
            $password = Read-Host -Prompt "Enter encryption password" -AsSecureString
            $key = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
                [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)),
                [System.Text.Encoding]::UTF8.GetBytes("InfisicalBackupSalt"),
                10000
            )

            $aes = [System.Security.Cryptography.Aes]::Create()
            $aes.Key = $key.GetBytes(32)
            $aes.IV = $key.GetBytes(16)

            $encryptor = $aes.CreateEncryptor()
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
            $encrypted = $encryptor.TransformFinalBlock($bytes, 0, $bytes.Length)

            [System.IO.File]::WriteAllBytes($outputPath, $encrypted)
        }
    }

    # Compress if requested
    if ($CompressValue -and $outputPath) {
        Write-Info "Compressing backup..."
        $compressedPath = "$outputPath.gz"

        $inputStream = [System.IO.File]::OpenRead($outputPath)
        $outputStream = [System.IO.File]::Create($compressedPath)
        $gzipStream = [System.IO.Compression.GZipStream]::new($outputStream, [System.IO.Compression.CompressionMode]::Compress)

        $inputStream.CopyTo($gzipStream)

        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()

        Remove-Item $outputPath
        $outputPath = $compressedPath
    }

    Write-Success "Backup created: $outputPath"

    # Create metadata file
    $metadataPath = "$outputPath.meta"
    $metadata | ConvertTo-Json | Out-File -FilePath $metadataPath -Encoding UTF8

    return $outputPath
}

# List all backups
function Get-BackupList {
    Write-Info "Listing backups in: $BackupBaseDir"

    $backups = Get-ChildItem -Path $BackupBaseDir -Filter "backup-*" | Where-Object { $_.Name -match '\.(json|yaml|env|enc)(\.gz)?$' }

    if ($backups.Count -eq 0) {
        Write-Warning "No backups found"
        return
    }

    $backupList = @()

    foreach ($backup in $backups) {
        $metaPath = "$($backup.FullName).meta"
        if (Test-Path $metaPath) {
            $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
            $backupList += [PSCustomObject]@{
                Filename = $backup.Name
                Timestamp = $meta.timestamp
                ProjectId = $meta.project_id
                Environment = $meta.environment
                Count = $meta.secret_count
                Size = "{0:N2} KB" -f ($backup.Length / 1KB)
                Encrypted = $meta.encrypted
                Compressed = $meta.compressed
            }
        }
        else {
            $backupList += [PSCustomObject]@{
                Filename = $backup.Name
                Timestamp = $backup.LastWriteTime.ToString('o')
                ProjectId = 'N/A'
                Environment = 'N/A'
                Count = 'N/A'
                Size = "{0:N2} KB" -f ($backup.Length / 1KB)
                Encrypted = $false
                Compressed = $backup.Extension -eq '.gz'
            }
        }
    }

    $backupList | Sort-Object Timestamp -Descending | Format-Table -AutoSize
}

# Rollback to backup
function Restore-SecretBackup {
    param(
        [string]$BackupFilePath,
        [string]$ProjectIdValue,
        [string]$EnvironmentValue
    )

    Write-Info "Restoring from backup: $BackupFilePath"

    if (-not (Test-Path $BackupFilePath)) {
        Write-Error "Backup file not found: $BackupFilePath"
        return
    }

    # Confirm rollback
    $confirm = Read-Host "This will overwrite current secrets in $EnvironmentValue. Continue? (yes/no)"
    if ($confirm -ne 'yes') {
        Write-Warning "Rollback cancelled"
        return
    }

    # Create a backup of current state before rollback
    Write-Info "Creating backup of current state before rollback..."
    New-SecretBackup -ProjectIdValue $ProjectIdValue -EnvironmentValue $EnvironmentValue -PathValue '' -FormatValue 'json' -CompressValue $false -EncryptValue $false

    # Load backup
    $backup = Get-Content $BackupFilePath -Raw | ConvertFrom-Json

    $successCount = 0
    $failCount = 0

    foreach ($secret in $backup.secrets) {
        try {
            $cmd = "infisical secrets set $($secret.key) `"$($secret.value)`" --projectId $ProjectIdValue --env $EnvironmentValue"
            Invoke-Expression $cmd 2>&1 | Out-Null

            if ($LASTEXITCODE -eq 0) {
                $successCount++
                Write-Verbose "Restored: $($secret.key)"
            }
            else {
                $failCount++
                Write-Warning "Failed to restore: $($secret.key)"
            }
        }
        catch {
            $failCount++
            Write-Warning "Error restoring $($secret.key): $_"
        }
    }

    Write-Host "`n" + ("═" * 60) -ForegroundColor Cyan
    Write-Success "Rollback complete!"
    Write-Info "Success: $successCount"
    if ($failCount -gt 0) {
        Write-Warning "Failed: $failCount"
    }
    Write-Host ("═" * 60) -ForegroundColor Cyan
}

# Compare two backups
function Compare-Backups {
    param(
        [string]$File1,
        [string]$File2
    )

    Write-Info "Comparing backups..."

    $backup1 = Get-Content $File1 -Raw | ConvertFrom-Json
    $backup2 = Get-Content $File2 -Raw | ConvertFrom-Json

    $secrets1 = @{}
    foreach ($s in $backup1.secrets) {
        $secrets1[$s.key] = $s.value
    }

    $secrets2 = @{}
    foreach ($s in $backup2.secrets) {
        $secrets2[$s.key] = $s.value
    }

    $allKeys = ($secrets1.Keys + $secrets2.Keys) | Sort-Object -Unique

    Write-Host "`n" + ("═" * 80) -ForegroundColor Cyan
    Write-Host "BACKUP COMPARISON" -ForegroundColor Cyan
    Write-Host ("═" * 80) -ForegroundColor Cyan
    Write-Info "File 1: $File1"
    Write-Info "File 2: $File2"
    Write-Host ""

    $same = 0
    $different = 0
    $onlyIn1 = 0
    $onlyIn2 = 0

    foreach ($key in $allKeys) {
        $val1 = $secrets1[$key]
        $val2 = $secrets2[$key]

        if ($val1 -and $val2) {
            if ($val1 -eq $val2) {
                $same++
                Write-Host "  ✓ $key" -ForegroundColor Green -NoNewline
                Write-Host " (same)" -ForegroundColor Gray
            }
            else {
                $different++
                Write-Host "  ≠ $key" -ForegroundColor Yellow -NoNewline
                Write-Host " (different)" -ForegroundColor Gray
            }
        }
        elseif ($val1) {
            $onlyIn1++
            Write-Host "  ← $key" -ForegroundColor Red -NoNewline
            Write-Host " (only in file 1)" -ForegroundColor Gray
        }
        else {
            $onlyIn2++
            Write-Host "  → $key" -ForegroundColor Blue -NoNewline
            Write-Host " (only in file 2)" -ForegroundColor Gray
        }
    }

    Write-Host "`n" + ("═" * 80) -ForegroundColor Cyan
    Write-Success "Same: $same"
    Write-Warning "Different: $different"
    Write-Host "Only in File 1: $onlyIn1" -ForegroundColor Red
    Write-Host "Only in File 2: $onlyIn2" -ForegroundColor Blue
    Write-Host ("═" * 80) -ForegroundColor Cyan
}

# Main execution
try {
    Write-Info "Infisical Secrets Backup Manager"
    Write-Info "═" * 60

    switch ($PSCmdlet.ParameterSetName) {
        'Backup' {
            New-SecretBackup `
                -ProjectIdValue $ProjectId `
                -EnvironmentValue $Environment `
                -PathValue $Path `
                -FormatValue $Format `
                -CompressValue $Compress `
                -EncryptValue $Encrypt
        }
        'List' {
            Get-BackupList
        }
        'Rollback' {
            $backupPath = if ($BackupFile) {
                if ([System.IO.Path]::IsPathRooted($BackupFile)) {
                    $BackupFile
                }
                else {
                    Join-Path $BackupBaseDir $BackupFile
                }
            }
            else {
                # Interactive selection
                Get-BackupList
                $filename = Read-Host "`nEnter backup filename to restore"
                Join-Path $BackupBaseDir $filename
            }

            Restore-SecretBackup -BackupFilePath $backupPath -ProjectIdValue $ProjectId -EnvironmentValue $Environment
        }
        'Compare' {
            $path1 = Join-Path $BackupBaseDir $BackupFile1
            $path2 = Join-Path $BackupBaseDir $BackupFile2
            Compare-Backups -File1 $path1 -File2 $path2
        }
    }

    Write-Info "═" * 60
}
catch {
    Write-Error "An error occurred: $_"
    Write-Error $_.ScriptStackTrace
    exit 1
}
