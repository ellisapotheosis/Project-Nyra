# PowerShell Script: Backup Docker Volumes
# Description: Backup all Docker volumes to compressed archives

param(
    [string]$BackupDir = "C:\Backups\docker",
    [switch]$Orchestrator,
    [switch]$Worker,
    [switch]$All,
    [switch]$Compress = $true,
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Ensure backup directory exists
function Initialize-BackupDirectory {
    if (-not (Test-Path $BackupDir)) {
        New-Item -Path $BackupDir -ItemType Directory -Force | Out-Null
        Write-Info "Created backup directory: $BackupDir"
    }
}

# Get volume size
function Get-VolumeSize {
    param([string]$VolumeName)

    try {
        $size = docker run --rm -v "${VolumeName}:/data" alpine du -sh /data | Select-String -Pattern "^\d+\.*\d*[KMGT]*" | ForEach-Object { $_.Matches.Value }
        return $size
    } catch {
        return "unknown"
    }
}

# Backup a volume
function Backup-Volume {
    param(
        [string]$VolumeName,
        [string]$BackupPath
    )

    Write-Info "Backing up volume: $VolumeName"

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $volumeSize = Get-VolumeSize -VolumeName $VolumeName
    $backupFile = Join-Path $BackupPath "${VolumeName}_${timestamp}.tar"

    Write-Info "  Volume size: $volumeSize"
    Write-Info "  Destination: $backupFile"

    try {
        # Create tar backup
        docker run --rm `
            -v "${VolumeName}:/source:ro" `
            -v "${BackupPath}:/backup" `
            alpine `
            tar -czf "/backup/$(Split-Path $backupFile -Leaf).gz" -C /source .

        if ($LASTEXITCODE -eq 0) {
            $backupSize = (Get-Item "$backupFile.gz").Length
            $backupSizeMB = [math]::Round($backupSize / 1MB, 2)
            Write-Success "  ✓ Backup completed: $backupSizeMB MB"

            return @{
                success = $true
                volume = $VolumeName
                file = "$backupFile.gz"
                size = $backupSizeMB
                timestamp = $timestamp
            }
        } else {
            Write-Error "  ✗ Backup failed"
            return @{
                success = $false
                volume = $VolumeName
                error = "Docker command failed"
            }
        }
    } catch {
        Write-Error "  ✗ Backup failed: $_"
        return @{
            success = $false
            volume = $VolumeName
            error = $_.Exception.Message
        }
    }
}

# Backup PostgreSQL database
function Backup-PostgreSQL {
    param(
        [string]$ContainerName,
        [string]$BackupPath
    )

    Write-Info "Backing up PostgreSQL from $ContainerName"

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path $BackupPath "postgres_dump_${timestamp}.sql.gz"

    try {
        docker exec $ContainerName pg_dumpall -U admin | gzip > $backupFile

        if ($LASTEXITCODE -eq 0) {
            $backupSize = (Get-Item $backupFile).Length
            $backupSizeMB = [math]::Round($backupSize / 1MB, 2)
            Write-Success "  ✓ Database backup completed: $backupSizeMB MB"

            return @{
                success = $true
                database = "PostgreSQL"
                file = $backupFile
                size = $backupSizeMB
                timestamp = $timestamp
            }
        } else {
            Write-Error "  ✗ Database backup failed"
            return @{
                success = $false
                database = "PostgreSQL"
                error = "pg_dumpall failed"
            }
        }
    } catch {
        Write-Error "  ✗ Database backup failed: $_"
        return @{
            success = $false
            database = "PostgreSQL"
            error = $_.Exception.Message
        }
    }
}

# Clean old backups
function Remove-OldBackups {
    param(
        [string]$BackupPath,
        [int]$RetentionDays
    )

    Write-Info "Cleaning backups older than $RetentionDays days..."

    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldBackups = Get-ChildItem -Path $BackupPath -Filter "*.tar.gz" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

    if ($oldBackups.Count -gt 0) {
        foreach ($backup in $oldBackups) {
            Remove-Item $backup.FullName -Force
            Write-Info "  Removed: $($backup.Name)"
        }
        Write-Success "Removed $($oldBackups.Count) old backup(s)"
    } else {
        Write-Info "No old backups to remove"
    }
}

# Backup orchestrator volumes
function Backup-OrchestratorVolumes {
    Write-Info "`n=== Backing up Orchestrator Volumes ==="

    $backupPath = Join-Path $BackupDir "orchestrator"
    Initialize-BackupDirectory
    New-Item -Path $backupPath -ItemType Directory -Force | Out-Null

    $volumes = @(
        "docker_postgres_data",
        "docker_redis_data",
        "docker_minio_data",
        "docker_open_webui_data",
        "docker_lobechat_data",
        "docker_grafana_data",
        "docker_prometheus_data"
    )

    $results = @()

    # Backup PostgreSQL databases
    $results += Backup-PostgreSQL -ContainerName "orchestrator-postgres" -BackupPath $backupPath

    # Backup volumes
    foreach ($volume in $volumes) {
        $results += Backup-Volume -VolumeName $volume -BackupPath $backupPath
    }

    Remove-OldBackups -BackupPath $backupPath -RetentionDays $RetentionDays

    return $results
}

# Backup worker volumes
function Backup-WorkerVolumes {
    Write-Info "`n=== Backing up Worker Volumes ==="

    $backupPath = Join-Path $BackupDir "worker"
    Initialize-BackupDirectory
    New-Item -Path $backupPath -ItemType Directory -Force | Out-Null

    $volumes = @(
        "docker_ollama_data",
        "docker_vllm_cache",
        "docker_grafana_data",
        "docker_prometheus_data"
    )

    $results = @()

    foreach ($volume in $volumes) {
        $results += Backup-Volume -VolumeName $volume -BackupPath $backupPath
    }

    Remove-OldBackups -BackupPath $backupPath -RetentionDays $RetentionDays

    return $results
}

# Generate backup report
function Show-BackupReport {
    param([array]$Results)

    Write-Info "`n=== Backup Summary ==="

    $successful = ($Results | Where-Object { $_.success }).Count
    $failed = ($Results | Where-Object { -not $_.success }).Count
    $totalSize = ($Results | Where-Object { $_.success } | Measure-Object -Property size -Sum).Sum

    Write-Info "Total backups: $($Results.Count)"
    Write-Success "Successful: $successful"
    if ($failed -gt 0) {
        Write-Error "Failed: $failed"
    }
    Write-Info "Total size: $([math]::Round($totalSize, 2)) MB"
    Write-Info "Backup location: $BackupDir"

    if ($failed -gt 0) {
        Write-Warning "`nFailed backups:"
        $Results | Where-Object { -not $_.success } | ForEach-Object {
            Write-Error "  - $($_.volume): $($_.error)"
        }
    }
}

# Main execution
function Main {
    Write-Info "=== Docker Volume Backup Tool ==="
    Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Info "Backup directory: $BackupDir"
    Write-Info "Retention: $RetentionDays days`n"

    Initialize-BackupDirectory

    $allResults = @()

    if ($All -or (-not $Orchestrator -and -not $Worker)) {
        $allResults += Backup-OrchestratorVolumes
        $allResults += Backup-WorkerVolumes
    } else {
        if ($Orchestrator) {
            $allResults += Backup-OrchestratorVolumes
        }
        if ($Worker) {
            $allResults += Backup-WorkerVolumes
        }
    }

    Show-BackupReport -Results $allResults

    Write-Success "`n✓ Backup process completed!"
}

# Run main function
try {
    Main
} catch {
    Write-Error "Backup error: $_"
    exit 1
}
