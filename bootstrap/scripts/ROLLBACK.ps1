# Project Nyra - Bootstrap Rollback Script
# Version: 1.0.0
# Purpose: Safely rollback to previous configuration if bootstrap fails

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupTimestamp,  # Format: 20250118-143022
    
    [switch]$ListBackups,
    [switch]$Force  # Skip confirmation prompts
)

$ErrorActionPreference = 'Stop'

# Color output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Host "`n🔙 PROJECT NYRA - BOOTSTRAP ROLLBACK`n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Determine backup directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupRoot = Join-Path (Split-Path -Parent (Split-Path -Parent $scriptDir)) "backups"

# ============================================================================
# LIST AVAILABLE BACKUPS
# ============================================================================
if ($ListBackups) {
    Write-Info "Available backups in: $backupRoot`n"
    
    if (-not (Test-Path $backupRoot)) {
        Write-Warning "No backup directory found at: $backupRoot"
        exit 0
    }
    
    $backups = Get-ChildItem -Path $backupRoot -Directory | 
               Where-Object { $_.Name -match 'backup-\d{8}-\d{6}' } |
               Sort-Object Name -Descending
    
    if ($backups.Count -eq 0) {
        Write-Warning "No backups found"
        exit 0
    }
    
    Write-Host "Found $($backups.Count) backup(s):`n" -ForegroundColor Cyan
    
    foreach ($backup in $backups) {
        $timestamp = $backup.Name -replace 'backup-', ''
        $size = (Get-ChildItem -Path $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)
        
        Write-Host "  📦 $timestamp" -ForegroundColor Yellow
        Write-Host "     Path: $($backup.FullName)" -ForegroundColor Gray
        Write-Host "     Size: ${sizeMB}MB" -ForegroundColor Gray
        Write-Host "     Created: $($backup.CreationTime)" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "To rollback: .\ROLLBACK.ps1 -BackupTimestamp <timestamp>`n"
    exit 0
}

# ============================================================================
# VALIDATE BACKUP SELECTION
# ============================================================================
if (-not $BackupTimestamp) {
    Write-Failure "No backup timestamp provided"
    Write-Host "Usage: .\ROLLBACK.ps1 -BackupTimestamp <timestamp>"
    Write-Host "Example: .\ROLLBACK.ps1 -BackupTimestamp 20250118-143022"
    Write-Host ""
    Write-Host "Run with -ListBackups to see available backups"
    exit 1
}

$backupPath = Join-Path $backupRoot "backup-$BackupTimestamp"

if (-not (Test-Path $backupPath)) {
    Write-Failure "Backup not found: $backupPath"
    Write-Host ""
    Write-Info "Run with -ListBackups to see available backups"
    exit 1
}

# ============================================================================
# DISPLAY ROLLBACK PLAN
# ============================================================================
Write-Warning "⚠️  ROLLBACK PLAN:"
Write-Host ""
Write-Host "  1. Stop all Docker containers" -ForegroundColor Yellow
Write-Host "  2. Create pre-rollback backup (safety net)" -ForegroundColor Yellow
Write-Host "  3. Restore configuration from: backup-$BackupTimestamp" -ForegroundColor Yellow
Write-Host "  4. Restart Docker services" -ForegroundColor Yellow
Write-Host "  5. Verify service health" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Source backup: $backupPath" -ForegroundColor Gray
Write-Host "  Target: $(Split-Path -Parent (Split-Path -Parent $scriptDir))" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# CONFIRMATION
# ============================================================================
if (-not $Force) {
    Write-Host "⚠️  THIS WILL OVERWRITE CURRENT CONFIGURATION" -ForegroundColor Red
    Write-Host ""
    $confirmation = Read-Host "Type 'ROLLBACK' to confirm (or Ctrl+C to cancel)"
    
    if ($confirmation -ne 'ROLLBACK') {
        Write-Info "Rollback cancelled by user"
        exit 0
    }
}

# ============================================================================
# PHASE 1: STOP DOCKER CONTAINERS
# ============================================================================
Write-Host "`n📦 PHASE 1: Stopping Docker containers..." -ForegroundColor Cyan

try {
    $projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
    $infraPath = Join-Path $projectRoot "infra"
    
    # Try to stop via docker-compose if compose file exists
    $composeFiles = Get-ChildItem -Path $infraPath -Filter "docker-compose*.yml" -ErrorAction SilentlyContinue
    
    if ($composeFiles) {
        foreach ($composeFile in $composeFiles) {
            Write-Info "Stopping services from: $($composeFile.Name)"
            docker compose -f $composeFile.FullName down --remove-orphans 2>&1 | Out-Null
        }
    } else {
        # Fallback: Stop all containers
        Write-Info "Stopping all running containers..."
        docker stop $(docker ps -q) 2>&1 | Out-Null
    }
    
    Write-Success "Docker containers stopped"
} catch {
    Write-Warning "Could not stop Docker containers: $($_.Exception.Message)"
    Write-Info "Continuing with rollback anyway..."
}

# ============================================================================
# PHASE 2: CREATE PRE-ROLLBACK BACKUP (Safety Net)
# ============================================================================
Write-Host "`n💾 PHASE 2: Creating pre-rollback backup..." -ForegroundColor Cyan

$preRollbackTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$preRollbackPath = Join-Path $backupRoot "pre-rollback-$preRollbackTimestamp"

try {
    New-Item -ItemType Directory -Path $preRollbackPath -Force | Out-Null
    
    $projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
    $itemsToCopy = @("infra", ".env")
    
    foreach ($item in $itemsToCopy) {
        $sourcePath = Join-Path $projectRoot $item
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $preRollbackPath -Recurse -Force
            Write-Info "Backed up: $item"
        }
    }
    
    Write-Success "Pre-rollback backup saved: pre-rollback-$preRollbackTimestamp"
} catch {
    Write-Warning "Could not create pre-rollback backup: $($_.Exception.Message)"
    Write-Info "Continuing with rollback anyway..."
}

# ============================================================================
# PHASE 3: RESTORE FROM BACKUP
# ============================================================================
Write-Host "`n🔄 PHASE 3: Restoring from backup..." -ForegroundColor Cyan

try {
    $projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
    
    # Get all items from backup
    $backupItems = Get-ChildItem -Path $backupPath
    
    foreach ($item in $backupItems) {
        $destPath = Join-Path $projectRoot $item.Name
        
        # Remove existing item if it exists
        if (Test-Path $destPath) {
            Remove-Item -Path $destPath -Recurse -Force
        }
        
        # Copy from backup
        Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force
        Write-Info "Restored: $($item.Name)"
    }
    
    Write-Success "Configuration restored from backup"
} catch {
    Write-Failure "Failed to restore from backup: $($_.Exception.Message)"
    Write-Host ""
    Write-Warning "You may need to manually restore from: $preRollbackPath"
    exit 1
}

# ============================================================================
# PHASE 4: RESTART DOCKER SERVICES
# ============================================================================
Write-Host "`n🚀 PHASE 4: Restarting Docker services..." -ForegroundColor Cyan

try {
    $projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
    $infraPath = Join-Path $projectRoot "infra"
    $composeFiles = Get-ChildItem -Path $infraPath -Filter "docker-compose*.yml" -ErrorAction SilentlyContinue
    
    if ($composeFiles) {
        foreach ($composeFile in $composeFiles) {
            Write-Info "Starting services from: $($composeFile.Name)"
            docker compose -f $composeFile.FullName up -d 2>&1 | Out-Null
        }
        Write-Success "Docker services started"
    } else {
        Write-Warning "No docker-compose files found - skipping service restart"
    }
} catch {
    Write-Warning "Some services may have failed to start: $($_.Exception.Message)"
}

# ============================================================================
# PHASE 5: HEALTH CHECK
# ============================================================================
Write-Host "`n🏥 PHASE 5: Health check..." -ForegroundColor Cyan

Start-Sleep -Seconds 10  # Give services time to start

$healthChecks = @(
    @{Name="Docker Daemon"; Command={docker info 2>&1 | Out-Null; $LASTEXITCODE -eq 0}},
    @{Name="Running Containers"; Command={(docker ps -q | Measure-Object).Count -gt 0}}
)

$healthPassed = $true
foreach ($check in $healthChecks) {
    try {
        $result = & $check.Command
        if ($result) {
            Write-Success "$($check.Name): OK"
        } else {
            Write-Warning "$($check.Name): Failed"
            $healthPassed = $false
        }
    } catch {
        Write-Warning "$($check.Name): Error"
        $healthPassed = $false
    }
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "📊 ROLLBACK SUMMARY`n" -ForegroundColor Cyan

if ($healthPassed) {
    Write-Success "✅ Rollback completed successfully!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Verify service health: docker ps"
    Write-Host "  2. Check logs: docker compose logs -f"
    Write-Host "  3. Review what went wrong before re-attempting bootstrap"
    Write-Host ""
    exit 0
} else {
    Write-Warning "⚠️  Rollback completed with warnings"
    Write-Host ""
    Write-Info "Some services may need manual intervention."
    Write-Host "Check service status: docker ps"
    Write-Host "View logs: docker compose logs"
    Write-Host ""
    Write-Host "Safety backup available at: $preRollbackPath" -ForegroundColor Gray
    Write-Host ""
    exit 0
}
