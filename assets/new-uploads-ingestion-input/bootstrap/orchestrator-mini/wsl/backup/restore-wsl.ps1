#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Restore WSL distribution from backup
.DESCRIPTION
    Restores a WSL distribution from a backup file created by backup-wsl.ps1
.PARAMETER BackupFile
    Path to backup tar file
.PARAMETER WSLDistro
    Name for the restored WSL distribution (default: Ubuntu-22.04-Restored)
.EXAMPLE
    .\restore-wsl.ps1 -BackupFile "D:\Backups\wsl-nyra-backup-20240115-120000.tar"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$WSLDistro = "Ubuntu-22.04-Restored",
    [string]$InstallPath = "$env:LOCALAPPDATA\WSL\$WSLDistro"
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
}

Write-Log "=========================================="
Write-Log "WSL Restore for Project-Nyra"
Write-Log "=========================================="
Write-Log ""

# Check if backup file exists
if (!(Test-Path $BackupFile)) {
    Write-Log "ERROR: Backup file not found: $BackupFile" "ERROR"
    exit 1
}

# Decompress if gzipped
if ($BackupFile -match "\.gz$") {
    Write-Log "Decompressing backup..."
    $decompressedFile = $BackupFile -replace "\.gz$", ""

    if (Get-Command "gunzip" -ErrorAction SilentlyContinue) {
        gunzip -c $BackupFile > $decompressedFile
        $BackupFile = $decompressedFile
    } else {
        Write-Log "ERROR: gunzip not found. Please decompress manually." "ERROR"
        exit 1
    }
}

# Check if distribution already exists
$existing = wsl --list --quiet | Where-Object { $_ -match $WSLDistro }
if ($existing) {
    Write-Log "WARN: Distribution '$WSLDistro' already exists" "WARN"
    $response = Read-Host "Delete existing and restore? (yes/no)"
    if ($response -ne "yes") {
        Write-Log "Restore cancelled"
        exit 0
    }

    Write-Log "Unregistering existing distribution..."
    wsl --unregister $WSLDistro
    Start-Sleep -Seconds 3
}

# Create install directory
Write-Log "Creating installation directory: $InstallPath"
if (!(Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# Import WSL distribution
Write-Log "Importing WSL distribution (this may take 10-30 minutes)..."
Write-Log "This will restore all files, databases, and configurations"

$startTime = Get-Date

wsl --import $WSLDistro $InstallPath $BackupFile

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Log "Import completed in $($duration.TotalMinutes.ToString('0.00')) minutes"

# Set as default distribution (optional)
$response = Read-Host "Set as default WSL distribution? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    wsl --set-default $WSLDistro
    Write-Log "Set as default distribution"
}

# Verify restoration
Write-Log ""
Write-Log "Verifying restoration..."

# Check if distribution is running
wsl -d $WSLDistro -- echo "WSL is working"

if ($LASTEXITCODE -eq 0) {
    Write-Log "SUCCESS: WSL distribution restored successfully!" "SUCCESS"
} else {
    Write-Log "ERROR: WSL distribution may not be functioning correctly" "ERROR"
    exit 1
}

# Start services
Write-Log ""
Write-Log "Starting services..."
wsl -d $WSLDistro -- bash -c "/opt/nyra/scripts/services/start-all.sh"

Write-Log ""
Write-Log "=========================================="
Write-Log "Restore Complete!"
Write-Log "=========================================="
Write-Log "Distribution: $WSLDistro"
Write-Log "Install path: $InstallPath"
Write-Log ""
Write-Log "Access WSL:"
Write-Log "  wsl -d $WSLDistro"
Write-Log ""
Write-Log "Check services:"
Write-Log "  wsl -d $WSLDistro -- /opt/nyra/scripts/services/status.sh"
Write-Log ""

Write-Log "Restoration completed successfully!"
