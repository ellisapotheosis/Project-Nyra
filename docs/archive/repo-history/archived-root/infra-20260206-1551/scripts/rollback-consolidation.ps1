<#
.SYNOPSIS
    Rollback repository consolidation to pre-consolidation state

.DESCRIPTION
    This script rolls back the Project Nyra repository consolidation
    by restoring files from a pre-consolidation Git tag. It includes
    comprehensive safety checks, backup creation, and validation.

.PARAMETER Mode
    Rollback mode: Full or Partial

.PARAMETER Files
    Comma-separated list of specific files for partial rollback

.PARAMETER DryRun
    Show what would be done without making changes

.PARAMETER SkipBackup
    Skip creating safety backup (NOT RECOMMENDED)

.PARAMETER Force
    Skip confirmations

.EXAMPLE
    .\rollback-consolidation.ps1 -Mode Full -DryRun
    Perform a dry-run of full rollback

.EXAMPLE
    .\rollback-consolidation.ps1 -Mode Full
    Execute full rollback

.EXAMPLE
    .\rollback-consolidation.ps1 -Mode Partial -Files "docs/test-feature.md,MCP-ASSISTANT-RULES.md"
    Rollback specific files

.EXAMPLE
    .\rollback-consolidation.ps1 -Mode Full -Force
    Force full rollback without confirmations

.NOTES
    Version: 1.0.0
    Author: Project Nyra Infrastructure Team
    Requires: Git, PowerShell 5.1+

.LINK
    docs/operations/ROLLBACK-PROCEDURES.md
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory=$true, HelpMessage="Rollback mode: Full or Partial")]
    [ValidateSet("Full", "Partial")]
    [string]$Mode,

    [Parameter(Mandatory=$false, HelpMessage="Comma-separated list of files for partial rollback")]
    [string]$Files = "",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Script configuration
$ErrorActionPreference = "Stop"
$RepoRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $RepoRoot "_backup\rollback-$Timestamp"
$LogDir = Join-Path $RepoRoot "infra\logs"
$LogFile = Join-Path $LogDir "rollback-$Timestamp.log"
$RollbackTag = "cleanup-pre-consolidation-20260114"

# Create log directory
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    Add-Content -Path $LogFile -Value $logMessage

    switch ($Level) {
        "ERROR"   { Write-Host "✗ $Message" -ForegroundColor Red }
        "SUCCESS" { Write-Host "✓ $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "⚠ $Message" -ForegroundColor Yellow }
        "INFO"    { Write-Host "ℹ $Message" -ForegroundColor Cyan }
        default   { Write-Host $Message }
    }
}

function Write-Section {
    param([string]$Title)

    $line = "═" * 55
    Write-Host ""
    Write-Host $line -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host $line -ForegroundColor Cyan
    Write-Host ""

    Add-Content -Path $LogFile -Value "`n$line`n$Title`n$line`n"
}

function Write-ErrorAndExit {
    param([string]$Message)

    Write-Log "FATAL ERROR: $Message" -Level "ERROR"
    Write-Log "Rollback failed. Check log: $LogFile" -Level "ERROR"
    exit 1
}

# Start rollback
Write-Section "Consolidation Rollback Script"
Write-Log "Mode: $Mode" -Level "INFO"
Write-Log "Dry Run: $DryRun" -Level "INFO"
Write-Log "Repository: $RepoRoot" -Level "INFO"
Write-Log "Timestamp: $Timestamp" -Level "INFO"
Write-Log "Log File: $LogFile" -Level "INFO"
Write-Host ""

# Change to repository root
try {
    Set-Location $RepoRoot
} catch {
    Write-ErrorAndExit "Cannot change to repository root: $_"
}

# 1. Pre-flight checks
Write-Section "1. Pre-flight Safety Checks"

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Log "Git installed: $gitVersion" -Level "SUCCESS"
} catch {
    Write-ErrorAndExit "Git is not installed or not in PATH"
}

# Check if Git repository
try {
    git rev-parse --git-dir | Out-Null
    Write-Log "Git repository detected" -Level "SUCCESS"
} catch {
    Write-ErrorAndExit "Not a Git repository"
}

# Check if rollback tag exists
try {
    git rev-parse $RollbackTag 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Tag not found"
    }
    Write-Log "Rollback tag found: $RollbackTag" -Level "SUCCESS"
} catch {
    Write-Log "Rollback tag '$RollbackTag' not found" -Level "ERROR"
    Write-Log "Available tags:" -Level "INFO"
    git tag -l | Select-String "pre-consolidation"
    Write-ErrorAndExit "Cannot proceed without rollback tag"
}

# Check working directory is clean
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Log "Working directory is NOT clean" -Level "ERROR"
        Write-Log "You have uncommitted changes:" -Level "INFO"
        git status --short

        if (-not $Force) {
            $response = Read-Host "`nStash changes and continue? [y/N]"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-ErrorAndExit "Rollback cancelled. Commit or stash changes first."
            }
            git stash push -u -m "Auto-stash before rollback $Timestamp"
            Write-Log "Changes stashed" -Level "SUCCESS"
        }
    } else {
        Write-Log "Working directory is clean" -Level "SUCCESS"
    }
} catch {
    Write-ErrorAndExit "Error checking Git status: $_"
}

# Check disk space
try {
    $drive = (Get-Item $RepoRoot).PSDrive
    $driveInfo = Get-PSDrive $drive.Name
    $freeSpaceGB = [math]::Round($driveInfo.Free / 1GB, 2)
    $usedSpaceGB = [math]::Round($driveInfo.Used / 1GB, 2)
    $totalSpaceGB = [math]::Round(($driveInfo.Used + $driveInfo.Free) / 1GB, 2)
    $usagePercent = [math]::Round(($usedSpaceGB / $totalSpaceGB) * 100, 1)

    Write-Log "Disk space: ${freeSpaceGB}GB available (${usagePercent}% used)" -Level "INFO"

    if ($usagePercent -gt 90) {
        Write-Log "Low disk space! Consider freeing space before rollback" -Level "WARNING"
    }
} catch {
    Write-Log "Could not check disk space: $_" -Level "WARNING"
}

# 2. Create safety backup
if (-not $SkipBackup -and -not $DryRun) {
    Write-Section "2. Creating Safety Backup"

    try {
        New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
        Write-Log "Backup location: $BackupDir" -Level "INFO"

        # Create manifest
        $currentBranch = git branch --show-current
        $currentCommit = git rev-parse HEAD
        $currentCommitMessage = git log -1 --pretty=%B

        $manifest = @"
Rollback Safety Backup
Created: $(Get-Date)
Mode: $Mode
Dry Run: $DryRun
Rollback Tag: $RollbackTag

Current Branch: $currentBranch
Current Commit: $currentCommit
Current Commit Message: $currentCommitMessage
"@

        Set-Content -Path (Join-Path $BackupDir "manifest.txt") -Value $manifest

        # Backup git state
        git log -1 | Out-File (Join-Path $BackupDir "git-log.txt")
        git status | Out-File (Join-Path $BackupDir "git-status.txt")
        git diff | Out-File (Join-Path $BackupDir "git-diff.txt")

        # Backup docs directory
        $backupDocsDir = Join-Path $BackupDir "docs"
        if (Test-Path "docs") {
            Copy-Item -Path "docs" -Destination $backupDocsDir -Recurse -Force -ErrorAction SilentlyContinue
        }

        Write-Log "Safety backup created" -Level "SUCCESS"
    } catch {
        Write-ErrorAndExit "Failed to create backup: $_"
    }
} else {
    Write-Section "2. Safety Backup (SKIPPED)"
    Write-Log "Skipping safety backup" -Level "WARNING"
}

# 3. Analyze files for rollback
Write-Section "3. Analyzing Files for Rollback"

$renamedCount = 0
$modifiedCount = 0
$deletedCount = 0
$newCount = 0

if ($Mode -eq "Full") {
    Write-Log "Analyzing all files changed since consolidation..." -Level "INFO"

    try {
        # Get file changes
        $diffOutput = git diff --name-status $RollbackTag HEAD

        $renamedFiles = $diffOutput | Select-String "^R" | ForEach-Object { $_.ToString() }
        $renamedCount = ($renamedFiles | Measure-Object).Count

        $modifiedFiles = $diffOutput | Select-String "^M" | ForEach-Object { $_.ToString() }
        $modifiedCount = ($modifiedFiles | Measure-Object).Count

        $deletedFiles = $diffOutput | Select-String "^D" | ForEach-Object { $_.ToString() }
        $deletedCount = ($deletedFiles | Measure-Object).Count

        $newFiles = $diffOutput | Select-String "^A" | ForEach-Object { $_.ToString() }
        $newCount = ($newFiles | Measure-Object).Count

        Write-Log "Renamed files: $renamedCount" -Level "INFO"
        Write-Log "Modified files: $modifiedCount" -Level "INFO"
        Write-Log "Deleted files: $deletedCount" -Level "INFO"
        Write-Log "New files: $newCount" -Level "INFO"

        $totalChanges = $renamedCount + $modifiedCount + $deletedCount + $newCount
        Write-Log "Total changes: $totalChanges" -Level "INFO"
    } catch {
        Write-ErrorAndExit "Failed to analyze file changes: $_"
    }
} elseif ($Mode -eq "Partial") {
    Write-Log "Partial rollback mode" -Level "INFO"
    Write-Log "Files: $Files" -Level "INFO"

    if ([string]::IsNullOrWhiteSpace($Files)) {
        Write-ErrorAndExit "Partial mode requires -Files parameter"
    }
}

# 4. Confirmation
if (-not $Force) {
    Write-Section "4. Rollback Confirmation"

    Write-Host "WARNING: This will rollback changes made during consolidation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Mode: $Mode"
    Write-Host "Rollback Tag: $RollbackTag"
    Write-Host "Dry Run: $DryRun"

    if ($Mode -eq "Full") {
        Write-Host "Total Changes: $totalChanges files"
    }

    Write-Host ""

    if (-not $DryRun) {
        $response = Read-Host "Are you sure you want to proceed? [y/N]"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Log "Rollback cancelled by user" -Level "INFO"
            exit 0
        }
    }
}

# 5. Perform rollback
Write-Section "5. Performing Rollback"

if ($DryRun) {
    Write-Log "DRY RUN MODE - No changes will be made" -Level "WARNING"
    Write-Host ""
}

try {
    if ($Mode -eq "Full") {
        Write-Log "Executing full rollback..." -Level "INFO"

        if ($DryRun) {
            Write-Log "Would execute: git checkout $RollbackTag -- ." -Level "INFO"
            Write-Log "Would restore $totalChanges files" -Level "INFO"
        } else {
            Write-Log "Checking out files from $RollbackTag..." -Level "INFO"
            git checkout $RollbackTag -- .

            if ($LASTEXITCODE -ne 0) {
                throw "Git checkout failed"
            }

            Write-Log "Files restored from $RollbackTag" -Level "SUCCESS"

            # Restore deleted files
            if ($deletedFiles) {
                Write-Log "Restoring deleted files..." -Level "INFO"
                foreach ($line in $deletedFiles) {
                    $file = ($line -split '\s+')[1]
                    if ($file) {
                        git checkout $RollbackTag -- $file 2>&1 | Out-Null
                        if ($LASTEXITCODE -eq 0) {
                            Write-Log "Restored: $file" -Level "SUCCESS"
                        } else {
                            Write-Log "Could not restore: $file" -Level "WARNING"
                        }
                    }
                }
            }
        }
    } elseif ($Mode -eq "Partial") {
        Write-Log "Executing partial rollback..." -Level "INFO"

        $fileArray = $Files -split ','
        foreach ($file in $fileArray) {
            $file = $file.Trim()

            if ($DryRun) {
                Write-Log "Would restore: $file" -Level "INFO"
            } else {
                Write-Log "Restoring: $file" -Level "INFO"
                git checkout $RollbackTag -- $file 2>&1 | Out-Null

                if ($LASTEXITCODE -eq 0) {
                    Write-Log "Restored: $file" -Level "SUCCESS"
                } else {
                    Write-Log "Could not restore: $file" -Level "WARNING"
                }
            }
        }
    }

    if (-not $DryRun) {
        Write-Log "Rollback completed" -Level "SUCCESS"
    }
} catch {
    Write-ErrorAndExit "Rollback execution failed: $_"
}

# 6. Validation
Write-Section "6. Rollback Validation"

if (-not $DryRun) {
    Write-Log "Validating rollback..." -Level "INFO"

    try {
        # Check Git status
        $changedFiles = (git status --porcelain | Measure-Object -Line).Lines
        Write-Log "Changed files after rollback: $changedFiles" -Level "INFO"

        # Verify critical files
        $criticalFiles = @("CLAUDE.md", "README.md", ".gitignore")

        foreach ($file in $criticalFiles) {
            if (Test-Path $file) {
                Write-Log "Critical file exists: $file" -Level "SUCCESS"
            } else {
                Write-Log "Critical file missing: $file" -Level "ERROR"
            }
        }

        # Check for broken symlinks (Windows)
        Write-Log "Checking for broken symlinks..." -Level "INFO"
        $brokenLinks = Get-ChildItem -Recurse -Attributes ReparsePoint -ErrorAction SilentlyContinue |
            Where-Object { -not (Test-Path $_.Target) }

        if ($brokenLinks) {
            Write-Log "Found broken symlinks (may be expected)" -Level "WARNING"
        } else {
            Write-Log "No broken symlinks" -Level "SUCCESS"
        }

        Write-Log "Validation complete" -Level "SUCCESS"
    } catch {
        Write-Log "Validation encountered errors: $_" -Level "WARNING"
    }
} else {
    Write-Log "Skipping validation (dry-run mode)" -Level "INFO"
}

# 7. Summary and next steps
Write-Section "7. Summary and Next Steps"

Write-Host ""
Write-Log "Rollback process completed successfully" -Level "SUCCESS"
Write-Host ""

if (-not $DryRun) {
    Write-Log "Changes have been rolled back to: $RollbackTag" -Level "INFO"
    Write-Log "Backup location: $BackupDir" -Level "INFO"

    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Review changes: git status"
    Write-Host "2. Review diff: git diff"
    Write-Host "3. Test functionality"
    Write-Host "4. Commit changes: git commit -m 'Rollback consolidation'"
    Write-Host "5. Review log: $LogFile"
    Write-Host ""
    Write-Host "If rollback is not satisfactory:" -ForegroundColor Yellow
    Write-Host "- Restore from backup: $BackupDir"
    Write-Host "- Or reset: git reset --hard HEAD"
} else {
    Write-Log "This was a DRY RUN - no changes were made" -Level "INFO"
    Write-Host ""
    Write-Host "To execute the rollback:" -ForegroundColor Cyan
    Write-Host "  .\rollback-consolidation.ps1 -Mode $Mode"
}

Write-Host ""
Write-Log "Log file: $LogFile" -Level "INFO"
Write-Log "Done!" -Level "SUCCESS"
