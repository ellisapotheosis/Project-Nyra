#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Backup entire WSL distribution
.DESCRIPTION
    Creates a compressed backup of the WSL distribution and databases
.PARAMETER BackupPath
    Path to store backup file (default: current directory)
.EXAMPLE
    .\backup-wsl.ps1 -BackupPath "D:\Backups"
#>

param(
    [string]$BackupPath = $PWD,
    [string]$WSLDistro = "Ubuntu-22.04"
)

$ErrorActionPreference = "Stop"

# Configuration
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "wsl-nyra-backup-$timestamp"
$backupFile = Join-Path $BackupPath "$backupName.tar"
$logFile = Join-Path $BackupPath "$backupName.log"

function Write-Log {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "=========================================="
Write-Log "WSL Backup for Project-Nyra"
Write-Log "=========================================="
Write-Log ""

# Check if backup directory exists
if (!(Test-Path $BackupPath)) {
    Write-Log "Creating backup directory: $BackupPath"
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

# Check WSL distribution exists
$distros = wsl --list --quiet
if (!($distros -match $WSLDistro)) {
    Write-Log "ERROR: WSL distribution '$WSLDistro' not found" "ERROR"
    exit 1
}

# Backup PostgreSQL databases
Write-Log "Backing up PostgreSQL databases..."
wsl -d $WSLDistro -- bash -c @"
    sudo -u postgres pg_dumpall > /tmp/postgres-backup-$timestamp.sql
    gzip /tmp/postgres-backup-$timestamp.sql
"@

# Backup Redis data
Write-Log "Backing up Redis data..."
wsl -d $WSLDistro -- bash -c "sudo redis-cli SAVE"

# Stop services before backup
Write-Log "Stopping services..."
wsl -d $WSLDistro -- bash -c "/opt/nyra/scripts/services/stop-all.sh"

# Wait for services to stop
Start-Sleep -Seconds 5

# Export WSL distribution
Write-Log "Exporting WSL distribution (this may take 10-30 minutes)..."
Write-Log "Output file: $backupFile"

$startTime = Get-Date

wsl --export $WSLDistro $backupFile

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Log "Export completed in $($duration.TotalMinutes.ToString('0.00')) minutes"

# Get backup size
$backupSize = (Get-Item $backupFile).Length / 1GB
Write-Log "Backup size: $($backupSize.ToString('0.00')) GB"

# Compress backup (optional)
Write-Log "Compressing backup..."
$compressedFile = "$backupFile.gz"

if (Get-Command "gzip" -ErrorAction SilentlyContinue) {
    gzip -9 $backupFile
    Write-Log "Backup compressed: $compressedFile"
} else {
    Write-Log "gzip not found, skipping compression" "WARN"
}

# Restart services
Write-Log "Restarting services..."
wsl -d $WSLDistro -- bash -c "/opt/nyra/scripts/services/start-all.sh"

# Create backup manifest
$manifestFile = Join-Path $BackupPath "$backupName-manifest.json"
$manifest = @{
    timestamp = $timestamp
    distro = $WSLDistro
    backupFile = (Split-Path $backupFile -Leaf)
    size = $backupSize
    duration = $duration.TotalMinutes
    postgres = $true
    redis = $true
} | ConvertTo-Json

Set-Content -Path $manifestFile -Value $manifest

Write-Log ""
Write-Log "=========================================="
Write-Log "Backup Complete!"
Write-Log "=========================================="
Write-Log "Backup file: $backupFile"
Write-Log "Manifest: $manifestFile"
Write-Log "Log file: $logFile"
Write-Log ""
Write-Log "To restore:"
Write-Log "  .\restore-wsl.ps1 -BackupFile `"$backupFile`""
Write-Log ""

# Optional: Upload to MinIO or cloud storage
# Add your backup upload logic here

Write-Log "Backup completed successfully!"
