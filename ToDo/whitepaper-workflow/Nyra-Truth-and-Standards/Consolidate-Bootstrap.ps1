# =====================================================
# Project Nyra - Safe Bootstrap Consolidation Script
# =====================================================
# This script safely consolidates all your bootstrap
# materials without overwriting existing work
# =====================================================

param(
    [switch]$DryRun,
    [switch]$Backup,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# =====================================================
# CONFIGURATION
# =====================================================

$RepoRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$BootstrapDir = "$RepoRoot\bootstrap"
$BackupDir = "$RepoRoot\.bootstrap-backups\$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"

# Source locations to consolidate
$SourceLocations = @{
    "Repo" = @{
        Path = "$RepoRoot\bootstrap"
        Description = "Existing repo bootstrap folder"
        Priority = 1  # Highest priority - don't overwrite these
    }
    "AllInOne" = @{
        Path = "C:\Users\edane\Downloads\nyra-bootstrap-allinone-kit"
        Description = "All-in-one bootstrap kit"
        Priority = 2
    }
    "NewClaude" = @{
        Path = "C:\Users\edane\Downloads\newclaudefiles"
        Description = "New Claude configuration files"
        Priority = 3
    }
    "Downloads" = @{
        Path = "C:\Users\edane\Downloads"
        Description = "Downloaded configuration files"
        Priority = 4
        Filter = "PROJECT-NYRA-*"  # Only files matching this pattern
    }
}

# Target structure
$TargetStructure = @{
    "configs" = "Configuration files (env, settings, batch configs)"
    "scripts" = "Automation and setup scripts"
    "templates" = "CLAUDE.md and other templates"
    "installers" = "GUI installers and bootstrap tools"
    "docker" = "Docker and container configurations"
    "docs" = "Bootstrap documentation and guides"
    "backups" = "Backup storage"
}

# =====================================================
# HELPER FUNCTIONS
# =====================================================

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($Message) {
    Write-ColorOutput Cyan "`n===> $Message"
}

function Write-Success($Message) {
    Write-ColorOutput Green "✓ $Message"
}

function Write-Warning($Message) {
    Write-ColorOutput Yellow "⚠ $Message"
}

function Write-Error($Message) {
    Write-ColorOutput Red "✗ $Message"
}

function New-DirectoryIfNotExists($Path) {
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        if ($Verbose) { Write-Success "Created directory: $Path" }
    }
}

# =====================================================
# ANALYSIS PHASE
# =====================================================

function Invoke-AnalysisPhase {
    Write-Step "Phase 1: Analyzing existing files"
    
    $analysis = @{
        ExistingFiles = @{}
        Conflicts = @()
        SafeToMerge = @()
        RequiresReview = @()
    }
    
    # Check each source location
    foreach ($source in $SourceLocations.GetEnumerator()) {
        $sourceName = $source.Key
        $sourcePath = $source.Value.Path
        
        if (-not (Test-Path $sourcePath)) {
            Write-Warning "Source location not found: $sourceName ($sourcePath)"
            continue
        }
        
        Write-Output "Analyzing: $sourceName - $($source.Value.Description)"
        
        # Get all files in source
        $filter = $source.Value.Filter
        if ($filter) {
            $files = Get-ChildItem -Path $sourcePath -Filter $filter -File -Recurse -ErrorAction SilentlyContinue
        } else {
            $files = Get-ChildItem -Path $sourcePath -File -Recurse -ErrorAction SilentlyContinue
        }
        
        foreach ($file in $files) {
            $relativePath = $file.FullName.Replace($sourcePath, "").TrimStart('\')
            
            if (-not $analysis.ExistingFiles.ContainsKey($relativePath)) {
                $analysis.ExistingFiles[$relativePath] = @()
            }
            
            $analysis.ExistingFiles[$relativePath] += @{
                Source = $sourceName
                FullPath = $file.FullName
                Size = $file.Length
                LastModified = $file.LastWriteTime
                Priority = $source.Value.Priority
            }
        }
    }
    
    # Identify conflicts
    foreach ($file in $analysis.ExistingFiles.GetEnumerator()) {
        if ($file.Value.Count -gt 1) {
            # Multiple sources have this file
            $sortedSources = $file.Value | Sort-Object -Property Priority
            $primary = $sortedSources[0]
            $alternatives = $sortedSources[1..($sortedSources.Count-1)]
            
            $conflict = @{
                RelativePath = $file.Key
                Primary = $primary
                Alternatives = $alternatives
                Action = "UsePrimary"  # Default action
            }
            
            # Check if files are identical
            $allIdentical = $true
            if ($sortedSources.Count -gt 1) {
                $primaryHash = (Get-FileHash $primary.FullPath -Algorithm MD5).Hash
                foreach ($alt in $alternatives) {
                    $altHash = (Get-FileHash $alt.FullPath -Algorithm MD5).Hash
                    if ($primaryHash -ne $altHash) {
                        $allIdentical = $false
                        break
                    }
                }
            }
            
            if ($allIdentical) {
                $conflict.Action = "SkipDuplicate"
                $analysis.SafeToMerge += $conflict
            } else {
                $conflict.Action = "RequireReview"
                $analysis.RequiresReview += $conflict
            }
            
            $analysis.Conflicts += $conflict
        }
    }
    
    return $analysis
}

# =====================================================
# BACKUP PHASE
# =====================================================

function Invoke-BackupPhase {
    param($Analysis)
    
    Write-Step "Phase 2: Creating backups"
    
    if (-not $Backup -and -not $DryRun) {
        $response = Read-Host "Create backup of existing files? (Y/n)"
        if ($response -eq '' -or $response -eq 'Y' -or $response -eq 'y') {
            $Backup = $true
        }
    }
    
    if ($Backup -or $DryRun) {
        New-DirectoryIfNotExists $BackupDir
        
        # Backup repo bootstrap folder
        if (Test-Path "$RepoRoot\bootstrap") {
            Write-Output "Backing up existing bootstrap folder..."
            if (-not $DryRun) {
                Copy-Item -Path "$RepoRoot\bootstrap" -Destination "$BackupDir\bootstrap-original" -Recurse -Force
            }
            Write-Success "Backup created: $BackupDir\bootstrap-original"
        }
        
        # Backup .claude/settings.json
        if (Test-Path "$RepoRoot\.claude\settings.json") {
            Write-Output "Backing up .claude/settings.json..."
            if (-not $DryRun) {
                New-DirectoryIfNotExists "$BackupDir\.claude"
                Copy-Item -Path "$RepoRoot\.claude\settings.json" -Destination "$BackupDir\.claude\settings.json" -Force
            }
            Write-Success "Backup created: $BackupDir\.claude\settings.json"
        }
        
        # Backup root CLAUDE.md
        if (Test-Path "$RepoRoot\CLAUDE.md") {
            Write-Output "Backing up root CLAUDE.md..."
            if (-not $DryRun) {
                Copy-Item -Path "$RepoRoot\CLAUDE.md" -Destination "$BackupDir\CLAUDE.md" -Force
            }
            Write-Success "Backup created: $BackupDir\CLAUDE.md"
        }
        
        # Backup .env
        if (Test-Path "$RepoRoot\.env") {
            Write-Output "Backing up .env..."
            if (-not $DryRun) {
                Copy-Item -Path "$RepoRoot\.env" -Destination "$BackupDir\.env" -Force
            }
            Write-Success "Backup created: $BackupDir\.env"
        }
    }
}

# =====================================================
# REPORT GENERATION
# =====================================================

function New-AnalysisReport {
    param($Analysis)
    
    $reportPath = "$RepoRoot\bootstrap-consolidation-report.md"
    
    $report = @"
# Bootstrap Consolidation Analysis Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary

- **Total unique files**: $($Analysis.ExistingFiles.Count)
- **Files with conflicts**: $($Analysis.Conflicts.Count)
- **Safe to merge**: $($Analysis.SafeToMerge.Count)
- **Requires review**: $($Analysis.RequiresReview.Count)

## Source Locations Analyzed

"@
    
    foreach ($source in $SourceLocations.GetEnumerator()) {
        $sourcePath = $source.Value.Path
        $exists = Test-Path $sourcePath
        $report += "`n- **$($source.Key)**: $($source.Value.Description)"
        $report += "`n  - Path: ``$sourcePath``"
        $report += "`n  - Priority: $($source.Value.Priority)"
        $report += "`n  - Exists: $exists"
    }
    
    if ($Analysis.RequiresReview.Count -gt 0) {
        $report += "`n`n## Files Requiring Review`n"
        $report += "`nThese files exist in multiple locations with different content:`n"
        
        foreach ($conflict in $Analysis.RequiresReview) {
            $report += "`n### $($conflict.RelativePath)`n"
            $report += "`n**Primary source** (will be used): $($conflict.Primary.Source)"
            $report += "`n- File: ``$($conflict.Primary.FullPath)``"
            $report += "`n- Size: $([math]::Round($conflict.Primary.Size / 1KB, 2)) KB"
            $report += "`n- Modified: $($conflict.Primary.LastModified)"
            
            $report += "`n`n**Alternative versions**:"
            foreach ($alt in $conflict.Alternatives) {
                $report += "`n- Source: $($alt.Source)"
                $report += "`n  - File: ``$($alt.FullPath)``"
                $report += "`n  - Size: $([math]::Round($alt.Size / 1KB, 2)) KB"
                $report += "`n  - Modified: $($alt.LastModified)"
            }
            $report += "`n"
        }
    }
    
    if ($Analysis.SafeToMerge.Count -gt 0) {
        $report += "`n## Files Safe to Merge`n"
        $report += "`nThese files are identical across multiple sources:`n"
        
        foreach ($safe in $Analysis.SafeToMerge) {
            $report += "`n- $($safe.RelativePath) (found in: $($safe.Alternatives.Source -join ', '))"
        }
    }
    
    $report += "`n`n## Recommended Actions`n"
    $report += "`n1. **Review conflicting files** manually to determine which version to keep"
    $report += "`n2. **Run consolidation script** with ``-DryRun`` to see what would happen"
    $report += "`n3. **Create backup** before making any changes"
    $report += "`n4. **Run consolidation script** to merge files"
    $report += "`n5. **Test the consolidated bootstrap** on a non-production PC first"
    
    $report | Out-File -FilePath $reportPath -Encoding UTF8 -Force
    
    return $reportPath
}

# =====================================================
# CONSOLIDATION PHASE
# =====================================================

function Invoke-ConsolidationPhase {
    param($Analysis)
    
    Write-Step "Phase 3: Consolidating files"
    
    # Create target directory structure
    foreach ($dir in $TargetStructure.GetEnumerator()) {
        $targetPath = Join-Path $BootstrapDir $dir.Key
        New-DirectoryIfNotExists $targetPath
        
        # Create README in each directory
        $readmePath = Join-Path $targetPath "README.md"
        if (-not (Test-Path $readmePath) -and -not $DryRun) {
            @"
# $($dir.Key)

$($dir.Value)

This directory is part of the Project Nyra consolidated bootstrap system.
"@ | Out-File -FilePath $readmePath -Encoding UTF8
        }
    }
    
    # Copy files based on analysis
    $filesCopied = 0
    $filesSkipped = 0
    
    foreach ($file in $Analysis.ExistingFiles.GetEnumerator()) {
        $relativePath = $file.Key
        $sources = $file.Value | Sort-Object -Property Priority
        $primary = $sources[0]
        
        # Determine target directory based on file type
        $targetSubDir = "configs"  # Default
        
        if ($relativePath -match '\.ps1$|\.sh$|\.bat$|\.cmd$') {
            $targetSubDir = "scripts"
        } elseif ($relativePath -match 'CLAUDE\.md$|\.template$') {
            $targetSubDir = "templates"
        } elseif ($relativePath -match 'docker-compose|Dockerfile|\.dockerignore') {
            $targetSubDir = "docker"
        } elseif ($relativePath -match '\.md$|\.txt$|README') {
            $targetSubDir = "docs"
        } elseif ($relativePath -match '\.exe$|\.msi$|installer') {
            $targetSubDir = "installers"
        }
        
        $targetPath = Join-Path $BootstrapDir "$targetSubDir\$relativePath"
        $targetDir = Split-Path $targetPath -Parent
        
        # Check if target already exists
        if ((Test-Path $targetPath) -and $primary.Source -ne "Repo") {
            if ($Verbose) { Write-Warning "Skipping (already exists): $relativePath" }
            $filesSkipped++
            continue
        }
        
        # Copy file
        if ($Verbose) { Write-Output "Copying: $relativePath -> $targetSubDir\" }
        
        if (-not $DryRun) {
            New-DirectoryIfNotExists $targetDir
            Copy-Item -Path $primary.FullPath -Destination $targetPath -Force
        }
        
        $filesCopied++
    }
    
    Write-Success "Files copied: $filesCopied"
    Write-Success "Files skipped: $filesSkipped"
}

# =====================================================
# MAIN EXECUTION
# =====================================================

Write-ColorOutput Magenta @"

╔═══════════════════════════════════════════════════════╗
║   Project Nyra Bootstrap Consolidation Script        ║
║   Safe merge of all bootstrap materials              ║
╚═══════════════════════════════════════════════════════╝

"@

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No changes will be made"
}

# Run analysis
$analysis = Invoke-AnalysisPhase

# Generate report
$reportPath = New-AnalysisReport $analysis
Write-Success "Analysis report generated: $reportPath"

# Show summary
Write-Step "Summary"
Write-Output "Total unique files found: $($analysis.ExistingFiles.Count)"
Write-Output "Files requiring review: $($analysis.RequiresReview.Count)"
Write-Output "Safe to merge: $($analysis.SafeToMerge.Count)"

if ($analysis.RequiresReview.Count -gt 0) {
    Write-Warning "`nFound $($analysis.RequiresReview.Count) files with conflicts!"
    Write-Output "Review the analysis report for details: $reportPath"
    
    $response = Read-Host "`nContinue with consolidation? (y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Output "Consolidation cancelled. Review the report and run again."
        exit 0
    }
}

# Create backup
Invoke-BackupPhase $analysis

# Run consolidation
if (-not $DryRun) {
    $response = Read-Host "`nReady to consolidate files. Continue? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Invoke-ConsolidationPhase $analysis
        Write-Success "`nConsolidation complete!"
        Write-Output "Consolidated bootstrap location: $BootstrapDir"
        if ($Backup) {
            Write-Output "Backup location: $BackupDir"
        }
    } else {
        Write-Output "Consolidation cancelled."
    }
} else {
    Write-Warning "Dry run complete. Run without -DryRun to apply changes."
}

Write-ColorOutput Green "`n✓ Script completed successfully!"
