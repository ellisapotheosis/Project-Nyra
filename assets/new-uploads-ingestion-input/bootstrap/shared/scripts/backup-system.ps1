<#
.SYNOPSIS
    Automated backup system for Project-Nyra

.DESCRIPTION
    Comprehensive backup solution:
    - Docker volumes
    - Configuration files
    - Database dumps
    - Incremental backups with retention
    - Remote backup support
#>

[CmdletBinding()]
param(
    [ValidateSet('full', 'incremental', 'config-only', 'docker-only')]
    [string]$BackupType = 'incremental',

    [string]$BackupPath = 'C:\nyra\backups',

    [string]$RemoteBackupPath = '',

    [int]$RetentionDays = 30,

    [switch]$Compress,

    [switch]$Encrypt
)

$ErrorActionPreference = 'Stop'

# Backup configuration
$script:BackupConfig = @{
    Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    BackupName = "nyra-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    TempPath = "$env:TEMP\nyra-backup-staging"
    LogPath = "$BackupPath\logs\backup-$(Get-Date -Format 'yyyy-MM-dd').log"
}

function Write-BackupLog {
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

    # Log to file
    $logDir = Split-Path $script:BackupConfig.LogPath
    $null = New-Item -ItemType Directory -Path $logDir -Force -ErrorAction SilentlyContinue
    Add-Content -Path $script:BackupConfig.LogPath -Value "[$timestamp] [$Level] $Message"
}

function New-BackupDirectories {
    Write-BackupLog "Creating backup directories..." -Level Info

    $directories = @(
        $BackupPath,
        $script:BackupConfig.TempPath,
        "$BackupPath\full",
        "$BackupPath\incremental",
        "$BackupPath\logs"
    )

    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            $null = New-Item -ItemType Directory -Path $dir -Force
            Write-BackupLog "Created: $dir" -Level Success
        }
    }
}

function Backup-DockerVolumes {
    Write-BackupLog "Backing up Docker volumes..." -Level Info

    $volumes = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match 'nyra|worker|orchestrator' }

    $volumeBackupPath = "$($script:BackupConfig.TempPath)\docker-volumes"
    $null = New-Item -ItemType Directory -Path $volumeBackupPath -Force

    foreach ($volume in $volumes) {
        Write-BackupLog "Backing up volume: $volume" -Level Info

        try {
            # Create tar archive of volume
            docker run --rm `
                -v "$($volume):/source:ro" `
                -v "$volumeBackupPath:/backup" `
                alpine tar czf "/backup/$volume.tar.gz" -C /source .

            if ($LASTEXITCODE -eq 0) {
                Write-BackupLog "Volume backed up: $volume" -Level Success
            } else {
                Write-BackupLog "Failed to backup volume: $volume" -Level Error
            }
        } catch {
            Write-BackupLog "Error backing up volume $volume : $_" -Level Error
        }
    }

    Write-BackupLog "Docker volumes backup completed" -Level Success
}

function Backup-Configurations {
    Write-BackupLog "Backing up configurations..." -Level Info

    $configBackupPath = "$($script:BackupConfig.TempPath)\configs"
    $null = New-Item -ItemType Directory -Path $configBackupPath -Force

    # Bootstrap configurations
    $bootstrapPath = Split-Path (Split-Path (Split-Path $PSScriptRoot))
    if (Test-Path $bootstrapPath) {
        $configDirs = @('config', 'orchestrator-mini\config', 'shared\configs')

        foreach ($dir in $configDirs) {
            $sourcePath = Join-Path $bootstrapPath $dir
            if (Test-Path $sourcePath) {
                $destPath = Join-Path $configBackupPath $dir
                Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
                Write-BackupLog "Backed up: $dir" -Level Success
            }
        }
    }

    # WSL configuration
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"
    if (Test-Path $wslConfigPath) {
        Copy-Item -Path $wslConfigPath -Destination $configBackupPath -Force
        Write-BackupLog "Backed up: .wslconfig" -Level Success
    }

    Write-BackupLog "Configuration backup completed" -Level Success
}

function Backup-Databases {
    Write-BackupLog "Backing up databases..." -Level Info

    $dbBackupPath = "$($script:BackupConfig.TempPath)\databases"
    $null = New-Item -ItemType Directory -Path $dbBackupPath -Force

    # Gitea PostgreSQL backup
    try {
        $giteaDbContainer = docker ps --filter "name=nyra-gitea-db" --format "{{.ID}}"

        if ($giteaDbContainer) {
            Write-BackupLog "Backing up Gitea database..." -Level Info

            docker exec $giteaDbContainer pg_dump -U gitea gitea > "$dbBackupPath\gitea.sql"

            if ($LASTEXITCODE -eq 0) {
                Write-BackupLog "Gitea database backed up" -Level Success
            }
        }
    } catch {
        Write-BackupLog "Error backing up Gitea database: $_" -Level Error
    }

    # Grafana SQLite backup
    try {
        $grafanaContainer = docker ps --filter "name=nyra-grafana" --format "{{.ID}}"

        if ($grafanaContainer) {
            Write-BackupLog "Backing up Grafana database..." -Level Info

            docker cp "$($grafanaContainer):/var/lib/grafana/grafana.db" "$dbBackupPath\grafana.db"

            if ($LASTEXITCODE -eq 0) {
                Write-BackupLog "Grafana database backed up" -Level Success
            }
        }
    } catch {
        Write-BackupLog "Error backing up Grafana database: $_" -Level Error
    }

    Write-BackupLog "Database backup completed" -Level Success
}

function Backup-WSLDistributions {
    Write-BackupLog "Backing up WSL distributions..." -Level Info

    $wslBackupPath = "$($script:BackupConfig.TempPath)\wsl"
    $null = New-Item -ItemType Directory -Path $wslBackupPath -Force

    # Get all distributions
    $distributions = wsl --list --quiet | Where-Object { $_ -ne '' }

    foreach ($distro in $distributions) {
        $distroName = $distro.Trim()

        Write-BackupLog "Exporting WSL distribution: $distroName" -Level Info

        try {
            wsl --export $distroName "$wslBackupPath\$distroName.tar"

            if ($LASTEXITCODE -eq 0) {
                Write-BackupLog "WSL distribution exported: $distroName" -Level Success
            } else {
                Write-BackupLog "Failed to export: $distroName" -Level Error
            }
        } catch {
            Write-BackupLog "Error exporting $distroName : $_" -Level Error
        }
    }

    Write-BackupLog "WSL backup completed" -Level Success
}

function New-BackupArchive {
    Write-BackupLog "Creating backup archive..." -Level Info

    $backupTypePath = Join-Path $BackupPath $BackupType
    $archivePath = Join-Path $backupTypePath "$($script:BackupConfig.BackupName).zip"

    # Create archive
    Compress-Archive -Path "$($script:BackupConfig.TempPath)\*" -DestinationPath $archivePath -Force

    if (Test-Path $archivePath) {
        $archiveSize = (Get-Item $archivePath).Length / 1MB
        Write-BackupLog "Backup archive created: $archivePath ($([math]::Round($archiveSize, 2)) MB)" -Level Success
    } else {
        throw "Failed to create backup archive"
    }

    return $archivePath
}

function Sync-RemoteBackup {
    param([string]$ArchivePath)

    if ([string]::IsNullOrEmpty($RemoteBackupPath)) {
        return
    }

    Write-BackupLog "Syncing to remote backup location..." -Level Info

    try {
        # Ensure remote path exists
        if (-not (Test-Path $RemoteBackupPath)) {
            $null = New-Item -ItemType Directory -Path $RemoteBackupPath -Force
        }

        # Copy archive to remote location
        Copy-Item -Path $ArchivePath -Destination $RemoteBackupPath -Force

        Write-BackupLog "Remote backup synced successfully" -Level Success
    } catch {
        Write-BackupLog "Failed to sync remote backup: $_" -Level Error
    }
}

function Remove-OldBackups {
    Write-BackupLog "Cleaning up old backups..." -Level Info

    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)

    $backupTypes = @('full', 'incremental')
    foreach ($type in $backupTypes) {
        $typePath = Join-Path $BackupPath $type

        if (Test-Path $typePath) {
            $oldBackups = Get-ChildItem -Path $typePath -Filter '*.zip' |
                Where-Object { $_.LastWriteTime -lt $cutoffDate }

            foreach ($backup in $oldBackups) {
                Remove-Item -Path $backup.FullName -Force
                Write-BackupLog "Removed old backup: $($backup.Name)" -Level Info
            }

            Write-BackupLog "Removed $($oldBackups.Count) old backups from $type" -Level Success
        }
    }
}

function New-BackupManifest {
    param([string]$ArchivePath)

    Write-BackupLog "Creating backup manifest..." -Level Info

    $manifest = @{
        BackupType = $BackupType
        Timestamp = $script:BackupConfig.Timestamp
        BackupName = $script:BackupConfig.BackupName
        ArchivePath = $ArchivePath
        ArchiveSize = (Get-Item $ArchivePath).Length
        Contents = @{
            DockerVolumes = (Get-ChildItem "$($script:BackupConfig.TempPath)\docker-volumes" -ErrorAction SilentlyContinue).Count
            Configurations = (Get-ChildItem "$($script:BackupConfig.TempPath)\configs" -Recurse -ErrorAction SilentlyContinue).Count
            Databases = (Get-ChildItem "$($script:BackupConfig.TempPath)\databases" -ErrorAction SilentlyContinue).Count
            WSLDistributions = (Get-ChildItem "$($script:BackupConfig.TempPath)\wsl" -ErrorAction SilentlyContinue).Count
        }
        System = @{
            Hostname = $env:COMPUTERNAME
            WindowsVersion = (Get-CimInstance Win32_OperatingSystem).Version
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        }
    }

    $manifestPath = "$ArchivePath.manifest.json"
    $manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath

    Write-BackupLog "Manifest created: $manifestPath" -Level Success
}

function Show-BackupSummary {
    param([string]$ArchivePath)

    Write-BackupLog "" -Level Info
    Write-BackupLog "===== BACKUP SUMMARY =====" -Level Success
    Write-BackupLog "Backup Type: $BackupType" -Level Info
    Write-BackupLog "Backup Name: $($script:BackupConfig.BackupName)" -Level Info
    Write-BackupLog "Archive: $ArchivePath" -Level Info
    Write-BackupLog "Size: $([math]::Round((Get-Item $ArchivePath).Length / 1MB, 2)) MB" -Level Info
    Write-BackupLog "Retention: $RetentionDays days" -Level Info

    if ($RemoteBackupPath) {
        Write-BackupLog "Remote: $RemoteBackupPath" -Level Info
    }

    Write-BackupLog "=========================" -Level Success
}

# Main execution
try {
    Write-BackupLog "Project-Nyra Backup System" -Level Info
    Write-BackupLog "Backup Type: $BackupType" -Level Info

    # Create directories
    New-BackupDirectories

    # Perform backups based on type
    switch ($BackupType) {
        'full' {
            Backup-DockerVolumes
            Backup-Configurations
            Backup-Databases
            Backup-WSLDistributions
        }
        'incremental' {
            Backup-DockerVolumes
            Backup-Configurations
            Backup-Databases
        }
        'config-only' {
            Backup-Configurations
        }
        'docker-only' {
            Backup-DockerVolumes
        }
    }

    # Create archive
    $archivePath = New-BackupArchive

    # Create manifest
    New-BackupManifest -ArchivePath $archivePath

    # Sync to remote
    if ($RemoteBackupPath) {
        Sync-RemoteBackup -ArchivePath $archivePath
    }

    # Cleanup old backups
    Remove-OldBackups

    # Cleanup temp files
    if (Test-Path $script:BackupConfig.TempPath) {
        Remove-Item -Path $script:BackupConfig.TempPath -Recurse -Force
    }

    # Show summary
    Show-BackupSummary -ArchivePath $archivePath

    Write-BackupLog "Backup completed successfully!" -Level Success

} catch {
    Write-BackupLog "Backup failed: $_" -Level Error
    Write-BackupLog "Stack trace: $($_.ScriptStackTrace)" -Level Error
    exit 1
}
