<#
.SYNOPSIS
    Update script for Project-Nyra bootstrap package

.DESCRIPTION
    Updates bootstrap package from GitHub, applies configuration changes,
    and restarts services with zero-downtime migrations

.PARAMETER Source
    Update source: github, local

.PARAMETER Version
    Specific version to update to (defaults to latest)

.PARAMETER DryRun
    Simulate update without applying changes
#>

[CmdletBinding()]
param(
    [ValidateSet('github', 'local')]
    [string]$Source = 'github',

    [string]$Version = 'latest',

    [switch]$DryRun,

    [string]$RepositoryUrl = 'https://github.com/yourusername/project-nyra-bootstrap'
)

$ErrorActionPreference = 'Stop'

# Update configuration
$script:UpdateConfig = @{
    BackupPath = "$PSScriptRoot\..\backups\update-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    TempPath = "$env:TEMP\bootstrap-update"
    CurrentVersion = '1.0.0'
}

function Write-UpdateLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message
}

function New-BootstrapBackup {
    Write-UpdateLog "Creating backup..." -Level Info

    $backupPath = $script:UpdateConfig.BackupPath
    $sourcePath = Split-Path (Split-Path $PSScriptRoot)

    $null = New-Item -ItemType Directory -Path $backupPath -Force

    # Backup critical directories
    $criticalDirs = @('config', 'scripts', 'orchestrator-mini', 'shared')
    foreach ($dir in $criticalDirs) {
        $dirPath = Join-Path $sourcePath $dir
        if (Test-Path $dirPath) {
            $destPath = Join-Path $backupPath $dir
            Copy-Item -Path $dirPath -Destination $destPath -Recurse -Force
            Write-UpdateLog "Backed up: $dir" -Level Success
        }
    }

    # Create backup manifest
    $manifest = @{
        Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
        Version = $script:UpdateConfig.CurrentVersion
        Files = Get-ChildItem -Path $backupPath -Recurse | Select-Object -ExpandProperty FullName
    } | ConvertTo-Json

    Set-Content -Path "$backupPath\manifest.json" -Value $manifest
    Write-UpdateLog "Backup completed: $backupPath" -Level Success
}

function Get-LatestBootstrapVersion {
    Write-UpdateLog "Checking for latest version..." -Level Info

    if ($Source -eq 'github') {
        try {
            # Check GitHub API for latest release
            $apiUrl = "$RepositoryUrl/releases/latest" -replace 'github.com', 'api.github.com/repos'
            $response = Invoke-RestMethod -Uri $apiUrl -Method Get

            return @{
                Version = $response.tag_name
                DownloadUrl = $response.zipball_url
                Changes = $response.body
            }
        } catch {
            Write-UpdateLog "Failed to check GitHub: $_" -Level Warning
            return $null
        }
    } else {
        # Local update source
        return @{
            Version = $Version
            DownloadUrl = $null
            Changes = 'Local update'
        }
    }
}

function Get-BootstrapPackage {
    param([hashtable]$VersionInfo)

    Write-UpdateLog "Downloading bootstrap package..." -Level Info

    $tempPath = $script:UpdateConfig.TempPath
    $null = New-Item -ItemType Directory -Path $tempPath -Force

    if ($Source -eq 'github') {
        $zipPath = Join-Path $tempPath 'bootstrap.zip'
        Invoke-WebRequest -Uri $VersionInfo.DownloadUrl -OutFile $zipPath

        # Extract
        Expand-Archive -Path $zipPath -DestinationPath $tempPath -Force

        Write-UpdateLog "Package downloaded and extracted" -Level Success
    }

    return $tempPath
}

function Test-ConfigurationChanges {
    param([string]$NewConfigPath, [string]$CurrentConfigPath)

    Write-UpdateLog "Checking configuration changes..." -Level Info

    if (-not (Test-Path $CurrentConfigPath)) {
        Write-UpdateLog "No existing configuration found" -Level Warning
        return $false
    }

    $newConfig = Get-Content $NewConfigPath -Raw | ConvertFrom-Json
    $currentConfig = Get-Content $CurrentConfigPath -Raw | ConvertFrom-Json

    # Compare versions
    if ($newConfig.Version -ne $currentConfig.Version) {
        Write-UpdateLog "Configuration version changed: $($currentConfig.Version) -> $($newConfig.Version)" -Level Info
        return $true
    }

    return $false
}

function Invoke-ConfigurationMigration {
    param([string]$UpdatePath)

    Write-UpdateLog "Running configuration migrations..." -Level Info

    $migrationsPath = Join-Path $UpdatePath 'migrations'
    if (-not (Test-Path $migrationsPath)) {
        Write-UpdateLog "No migrations found" -Level Info
        return
    }

    # Get all migration scripts
    $migrations = Get-ChildItem -Path $migrationsPath -Filter '*.ps1' | Sort-Object Name

    foreach ($migration in $migrations) {
        Write-UpdateLog "Running migration: $($migration.Name)" -Level Info

        if (-not $DryRun) {
            & $migration.FullName

            if ($LASTEXITCODE -eq 0) {
                Write-UpdateLog "Migration completed: $($migration.Name)" -Level Success
            } else {
                throw "Migration failed: $($migration.Name)"
            }
        } else {
            Write-UpdateLog "DRY RUN: Would execute $($migration.Name)" -Level Info
        }
    }
}

function Update-BootstrapFiles {
    param([string]$UpdatePath)

    Write-UpdateLog "Updating bootstrap files..." -Level Info

    $targetPath = Split-Path (Split-Path $PSScriptRoot)

    # Update scripts
    $scriptsSource = Join-Path $UpdatePath 'scripts'
    if (Test-Path $scriptsSource) {
        Copy-Item -Path "$scriptsSource\*" -Destination "$targetPath\scripts" -Recurse -Force
        Write-UpdateLog "Scripts updated" -Level Success
    }

    # Update shared resources
    $sharedSource = Join-Path $UpdatePath 'shared'
    if (Test-Path $sharedSource) {
        Copy-Item -Path "$sharedSource\*" -Destination "$targetPath\shared" -Recurse -Force
        Write-UpdateLog "Shared resources updated" -Level Success
    }

    # Update PC-specific configurations
    $pcs = @('orchestrator-mini', 'worker-rtx3090ti', 'worker-rtx3060', 'worker-rtx5090')
    foreach ($pc in $pcs) {
        $pcSource = Join-Path $UpdatePath $pc
        if (Test-Path $pcSource) {
            Copy-Item -Path "$pcSource\*" -Destination "$targetPath\$pc" -Recurse -Force
            Write-UpdateLog "$pc updated" -Level Success
        }
    }
}

function Restart-BootstrapServices {
    Write-UpdateLog "Restarting services..." -Level Info

    # Restart Docker services with zero downtime
    $composeFiles = Get-ChildItem -Path (Split-Path (Split-Path $PSScriptRoot)) -Filter 'docker-compose.yml' -Recurse

    foreach ($composeFile in $composeFiles) {
        Write-UpdateLog "Restarting services in: $($composeFile.Directory.Name)" -Level Info

        if (-not $DryRun) {
            Push-Location $composeFile.Directory

            # Rolling restart
            docker-compose up -d --no-deps --build

            Pop-Location
            Write-UpdateLog "Services restarted: $($composeFile.Directory.Name)" -Level Success
        } else {
            Write-UpdateLog "DRY RUN: Would restart services in $($composeFile.Directory.Name)" -Level Info
        }
    }
}

function Test-UpdateSuccess {
    Write-UpdateLog "Validating update..." -Level Info

    # Run validation script
    $validationScript = "$PSScriptRoot\validate-bootstrap.ps1"
    if (Test-Path $validationScript) {
        & powershell.exe -ExecutionPolicy Bypass -File $validationScript

        if ($LASTEXITCODE -eq 0) {
            Write-UpdateLog "Validation passed" -Level Success
            return $true
        } else {
            Write-UpdateLog "Validation failed" -Level Error
            return $false
        }
    }

    Write-UpdateLog "Validation script not found" -Level Warning
    return $false
}

function Restore-BootstrapBackup {
    Write-UpdateLog "Restoring from backup..." -Level Warning

    $backupPath = $script:UpdateConfig.BackupPath
    $targetPath = Split-Path (Split-Path $PSScriptRoot)

    if (-not (Test-Path $backupPath)) {
        throw "Backup not found: $backupPath"
    }

    # Restore critical directories
    Copy-Item -Path "$backupPath\*" -Destination $targetPath -Recurse -Force

    Write-UpdateLog "Backup restored successfully" -Level Success
}

# Main execution
try {
    Write-UpdateLog "Project-Nyra Bootstrap Update" -Level Info
    Write-UpdateLog "Source: $Source | Version: $Version | Dry Run: $DryRun" -Level Info

    # Create backup
    if (-not $DryRun) {
        New-BootstrapBackup
    }

    # Get latest version
    $versionInfo = Get-LatestBootstrapVersion
    if ($versionInfo) {
        Write-UpdateLog "Latest version: $($versionInfo.Version)" -Level Info
        Write-UpdateLog "Changes: $($versionInfo.Changes)" -Level Info
    } else {
        throw "Failed to retrieve version information"
    }

    # Download package
    $updatePath = Get-BootstrapPackage -VersionInfo $versionInfo

    # Run migrations
    Invoke-ConfigurationMigration -UpdatePath $updatePath

    # Update files
    if (-not $DryRun) {
        Update-BootstrapFiles -UpdatePath $updatePath
    } else {
        Write-UpdateLog "DRY RUN: Would update bootstrap files" -Level Info
    }

    # Restart services
    Restart-BootstrapServices

    # Validate
    $success = Test-UpdateSuccess

    if (-not $success -and -not $DryRun) {
        Write-UpdateLog "Update validation failed, restoring backup..." -Level Error
        Restore-BootstrapBackup
        throw "Update failed and was rolled back"
    }

    Write-UpdateLog "Update completed successfully!" -Level Success

    # Cleanup
    if (Test-Path $script:UpdateConfig.TempPath) {
        Remove-Item -Path $script:UpdateConfig.TempPath -Recurse -Force
    }

} catch {
    Write-UpdateLog "Update failed: $_" -Level Error
    Write-UpdateLog "Backup available at: $($script:UpdateConfig.BackupPath)" -Level Info
    exit 1
}
