# =====================================================
# Project Nyra - Step 1: ANALYZE
# =====================================================
# This script safely analyzes all your bootstrap
# materials WITHOUT making any changes
# =====================================================

param(
    [switch]$Verbose,
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"  # Don't stop on errors during analysis

# =====================================================
# CONFIGURATION
# =====================================================

$Script:RepoRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$Script:BootstrapDir = "$Script:RepoRoot\bootstrap"
$Script:ConsolidationKit = "$Script:BootstrapDir\consolidation-kit"

# Source locations to analyze
$Script:SourceLocations = @(
    @{
        Name = "Repo-Bootstrap"
        Path = $Script:BootstrapDir
        Description = "Your existing repo bootstrap folder (HIGHEST PRIORITY - Never overwritten)"
        Priority = 1
        Exclude = @("consolidation-kit", "backups", ".git")
        Color = "Green"
    },
    @{
        Name = "AllInOne-Kit"
        Path = "C:\Users\edane\Downloads\nyra-bootstrap-allinone-kit"
        Description = "All-in-one bootstrap kit from downloads"
        Priority = 2
        Color = "Cyan"
    },
    @{
        Name = "NewClaude-Files"
        Path = "C:\Users\edane\Downloads\newclaudefiles"
        Description = "New Claude configuration files"
        Priority = 3
        Color = "Yellow"
    },
    @{
        Name = "Ultimate-Configs"
        Path = "$Script:ConsolidationKit\configs"
        Description = "Ultimate configuration files with memory systems"
        Priority = 4
        Color = "Magenta"
    }
)

# =====================================================
# HELPER FUNCTIONS
# =====================================================

function Write-ColorOutput {
    param(
        [string]$Color,
        [string]$Message
    )
    
    $oldColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $oldColor
}

function Write-Section {
    param([string]$Title)
    Write-ColorOutput "Cyan" "`n$('='*70)"
    Write-ColorOutput "Cyan" $Title
    Write-ColorOutput "Cyan" $('='*70)
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "Green" "✓ $Message"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "White" "ℹ $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "Yellow" "⚠ $Message"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "Red" "✗ $Message"
}

function Get-FileHashQuick {
    param([string]$Path)
    
    try {
        # For large files, just use size and first 1KB for speed
        $file = Get-Item $Path
        if ($file.Length -gt 1MB) {
            $reader = [System.IO.File]::OpenRead($Path)
            $buffer = New-Object byte[] 1024
            $reader.Read($buffer, 0, 1024) | Out-Null
            $reader.Close()
            $hash = [BitConverter]::ToString([System.Security.Cryptography.MD5]::Create().ComputeHash($buffer))
            return "$($file.Length)-$hash"
        } else {
            return (Get-FileHash $Path -Algorithm MD5).Hash
        }
    } catch {
        return "ERROR"
    }
}

# =====================================================
# ANALYSIS FUNCTIONS
# =====================================================

function Invoke-SourceAnalysis {
    Write-Section "PHASE 1: Source Location Analysis"
    
    $analysis = @{
        Sources = @()
        TotalFiles = 0
        TotalSize = 0
    }
    
    foreach ($source in $Script:SourceLocations) {
        Write-Info "Analyzing: $($source.Name)"
        Write-Info "  Path: $($source.Path)"
        
        if (-not (Test-Path $source.Path)) {
            Write-Warning "  Location not found - will be skipped"
            $sourceResult = @{
                Name = $source.Name
                Exists = $false
                Files = @()
                FileCount = 0
                TotalSize = 0
            }
        } else {
            Write-Success "  Location found"
            
            # Get all files
            $files = @()
            
            if ($source.Exclude) {
                $allItems = Get-ChildItem -Path $source.Path -File -Recurse -ErrorAction SilentlyContinue
                $files = $allItems | Where-Object {
                    $relativePath = $_.FullName.Replace($source.Path, "").TrimStart('\')
                    $excluded = $false
                    foreach ($exclude in $source.Exclude) {
                        if ($relativePath -like "$exclude*") {
                            $excluded = $true
                            break
                        }
                    }
                    -not $excluded
                }
            } else {
                $files = Get-ChildItem -Path $source.Path -File -Recurse -ErrorAction SilentlyContinue
            }
            
            $totalSize = ($files | Measure-Object -Property Length -Sum).Sum
            
            $fileList = @()
            foreach ($file in $files) {
                $relativePath = $file.FullName.Replace($source.Path, "").TrimStart('\')
                $fileList += @{
                    RelativePath = $relativePath
                    FullPath = $file.FullName
                    Size = $file.Length
                    Modified = $file.LastWriteTime
                    Hash = Get-FileHashQuick $file.FullName
                }
            }
            
            Write-Success "  Found $($files.Count) files ($([math]::Round($totalSize / 1MB, 2)) MB)"
            
            $sourceResult = @{
                Name = $source.Name
                Exists = $true
                Path = $source.Path
                Files = $fileList
                FileCount = $files.Count
                TotalSize = $totalSize
                Priority = $source.Priority
                Description = $source.Description
            }
            
            $analysis.TotalFiles += $files.Count
            $analysis.TotalSize += $totalSize
        }
        
        $analysis.Sources += $sourceResult
    }
    
    Write-Info "`nTotal files across all sources: $($analysis.TotalFiles)"
    Write-Info "Total size: $([math]::Round($analysis.TotalSize / 1MB, 2)) MB"
    
    return $analysis
}

function Invoke-DuplicateAnalysis {
    param($SourceAnalysis)
    
    Write-Section "PHASE 2: Duplicate and Conflict Detection"
    
    $fileMap = @{}
    
    # Build map of all files by relative path
    foreach ($source in $SourceAnalysis.Sources | Where-Object { $_.Exists }) {
        foreach ($file in $source.Files) {
            if (-not $fileMap.ContainsKey($file.RelativePath)) {
                $fileMap[$file.RelativePath] = @()
            }
            
            $fileMap[$file.RelativePath] += @{
                Source = $source.Name
                FullPath = $file.FullPath
                Size = $file.Size
                Modified = $file.Modified
                Hash = $file.Hash
                Priority = $source.Priority
            }
        }
    }
    
    # Analyze duplicates and conflicts
    $analysis = @{
        UniqueFiles = 0
        DuplicateFiles = 0
        ConflictingFiles = 0
        IdenticalDuplicates = @()
        DifferentDuplicates = @()
        Details = @{}
    }
    
    foreach ($entry in $fileMap.GetEnumerator()) {
        $relativePath = $entry.Key
        $versions = $entry.Value | Sort-Object -Property Priority
        
        if ($versions.Count -eq 1) {
            # Unique file
            $analysis.UniqueFiles++
        } else {
            # File exists in multiple sources
            $analysis.DuplicateFiles++
            
            # Check if all versions are identical
            $firstHash = $versions[0].Hash
            $allIdentical = $true
            
            foreach ($version in $versions[1..($versions.Count-1)]) {
                if ($version.Hash -ne $firstHash) {
                    $allIdentical = $false
                    break
                }
            }
            
            if ($allIdentical) {
                # Identical duplicates (safe to merge)
                $analysis.IdenticalDuplicates += @{
                    File = $relativePath
                    Sources = ($versions | ForEach-Object { $_.Source })
                    WillUse = $versions[0].Source
                }
            } else {
                # Different versions (conflict)
                $analysis.ConflictingFiles++
                $analysis.DifferentDuplicates += @{
                    File = $relativePath
                    Versions = $versions
                    WillUse = $versions[0]
                    Alternatives = $versions[1..($versions.Count-1)]
                }
            }
        }
        
        $analysis.Details[$relativePath] = $versions
    }
    
    Write-Info "Unique files: $($analysis.UniqueFiles)"
    Write-Info "Duplicate files (identical): $($analysis.IdenticalDuplicates.Count)"
    Write-Warning "Conflicting files (different versions): $($analysis.ConflictingFiles)"
    
    if ($analysis.ConflictingFiles -gt 0) {
        Write-Warning "`n⚠ ATTENTION: Found $($analysis.ConflictingFiles) files with different versions!"
        Write-Info "These will be detailed in the analysis report."
    }
    
    return $analysis
}

function Invoke-TypeAnalysis {
    param($DuplicateAnalysis)
    
    Write-Section "PHASE 3: File Type Analysis"
    
    $typeMap = @{
        "PowerShell Scripts" = @{Extensions = @(".ps1"); Count = 0; Size = 0}
        "Bash Scripts" = @{Extensions = @(".sh", ".bash"); Count = 0; Size = 0}
        "Batch Scripts" = @{Extensions = @(".bat", ".cmd"); Count = 0; Size = 0}
        "Docker Files" = @{Extensions = @("dockerfile", ".dockerignore"); Patterns = @("*docker-compose*"); Count = 0; Size = 0}
        "Configuration Files" = @{Extensions = @(".json", ".yaml", ".yml", ".toml", ".ini", ".conf"); Count = 0; Size = 0}
        "Environment Files" = @{Extensions = @(".env"); Patterns = @("*.env.*"); Count = 0; Size = 0}
        "Markdown Docs" = @{Extensions = @(".md"); Count = 0; Size = 0}
        "Templates" = @{Patterns = @("*.template", "*CLAUDE.md"); Count = 0; Size = 0}
        "Executables" = @{Extensions = @(".exe", ".msi"); Count = 0; Size = 0}
        "Other" = @{Count = 0; Size = 0}
    }
    
    foreach ($entry in $DuplicateAnalysis.Details.GetEnumerator()) {
        $file = $entry.Key
        $versions = $entry.Value
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $name = [System.IO.Path]::GetFileName($file).ToLower()
        
        $classified = $false
        
        foreach ($type in $typeMap.GetEnumerator()) {
            if ($type.Value.Extensions -contains $ext -or 
                ($type.Value.Patterns | Where-Object { $name -like $_ })) {
                $type.Value.Count++
                $type.Value.Size += $versions[0].Size
                $classified = $true
                break
            }
        }
        
        if (-not $classified) {
            $typeMap["Other"].Count++
            $typeMap["Other"].Size += $versions[0].Size
        }
    }
    
    foreach ($type in $typeMap.GetEnumerator() | Sort-Object -Property {$_.Value.Count} -Descending) {
        if ($type.Value.Count -gt 0) {
            $sizeM B = [math]::Round($type.Value.Size / 1MB, 2)
            Write-Info "$($type.Key): $($type.Value.Count) files ($sizeMB MB)"
        }
    }
    
    return $typeMap
}

# =====================================================
# REPORT GENERATION
# =====================================================

function New-AnalysisReport {
    param(
        $SourceAnalysis,
        $DuplicateAnalysis,
        $TypeAnalysis
    )
    
    Write-Section "PHASE 4: Generating Analysis Report"
    
    $reportPath = "$Script:ConsolidationKit\analysis-report.md"
    
    $report = @"
# Project Nyra Bootstrap Consolidation - Analysis Report

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Executive Summary

This report analyzes all your bootstrap materials from multiple locations and identifies what will happen when you run the consolidation script.

### Statistics

- **Unique files:** $($DuplicateAnalysis.UniqueFiles)
- **Identical duplicates:** $($DuplicateAnalysis.IdenticalDuplicates.Count)
- **Conflicting files:** $($DuplicateAnalysis.ConflictingFiles)
- **Total files to consolidate:** $($DuplicateAnalysis.Details.Count)

### Safety Assessment

"@

    if ($DuplicateAnalysis.ConflictingFiles -eq 0) {
        $report += "`n✅ **SAFE TO PROCEED** - No conflicts detected. All duplicate files are identical.`n"
    } elseif ($DuplicateAnalysis.ConflictingFiles -lt 10) {
        $report += "`n⚠ **REVIEW RECOMMENDED** - Found $($DuplicateAnalysis.ConflictingFiles) conflicting files. Review the conflicts section before proceeding.`n"
    } else {
        $report += "`n⚠ **MANUAL REVIEW REQUIRED** - Found $($DuplicateAnalysis.ConflictingFiles) conflicting files. Carefully review all conflicts before proceeding.`n"
    }

    $report += @"

---

## Source Locations Analyzed

"@

    foreach ($source in $SourceAnalysis.Sources) {
        $status = if ($source.Exists) { "✓ Found" } else { "✗ Not Found" }
        $report += "`n### $($source.Name) - $status`n"
        $report += "`n- **Path:** ``$($source.Path)```n"
        $report += "- **Description:** $($source.Description)`n"
        $report += "- **Priority:** $($source.Priority) (1 = highest, never overwritten)`n"
        
        if ($source.Exists) {
            $sizeMB = [math]::Round($source.TotalSize / 1MB, 2)
            $report += "- **Files:** $($source.FileCount)`n"
            $report += "- **Total Size:** $sizeMB MB`n"
        }
    }

    if ($DuplicateAnalysis.ConflictingFiles -gt 0) {
        $report += "`n---`n`n## ⚠ Conflicting Files (Requires Your Attention)`n"
        $report += "`nThese files exist in multiple locations with **different content**. The consolidation script will use the version from the highest priority source (lowest priority number), but you should review these to ensure you're keeping the right version.`n"
        
        foreach ($conflict in $DuplicateAnalysis.DifferentDuplicates) {
            $report += "`n### ``$($conflict.File)```n"
            $report += "`n**✓ Version that will be used:**`n"
            $report += "- Source: **$($conflict.WillUse.Source)** (Priority $($conflict.WillUse.Priority))`n"
            $report += "- Path: ``$($conflict.WillUse.FullPath)```n"
            $report += "- Size: $([math]::Round($conflict.WillUse.Size / 1KB, 2)) KB`n"
            $report += "- Modified: $($conflict.WillUse.Modified)`n"
            
            $report += "`n**Alternative versions (will be backed up):**`n"
            foreach ($alt in $conflict.Alternatives) {
                $report += "- Source: $($alt.Source) (Priority $($alt.Priority))`n"
                $report += "  - Path: ``$($alt.FullPath)```n"
                $report += "  - Size: $([math]::Round($alt.Size / 1KB, 2)) KB`n"
                $report += "  - Modified: $($alt.Modified)`n"
            }
            
            $report += "`n**Recommendation:** Review both versions. If you want the alternative version instead, manually copy it to your repo bootstrap folder before running consolidation.`n"
        }
    }

    if ($DuplicateAnalysis.IdenticalDuplicates.Count -gt 0) {
        $report += "`n---`n`n## ✓ Identical Duplicate Files (Safe to Merge)`n"
        $report += "`nThese files exist in multiple locations but are identical. Only one copy will be kept.`n"
        
        foreach ($dup in $DuplicateAnalysis.IdenticalDuplicates) {
            $sources = $dup.Sources -join ", "
            $report += "`n- ``$($dup.File)```n"
            $report += "  - Found in: $sources`n"
            $report += "  - Will use version from: $($dup.WillUse)`n"
        }
    }

    $report += "`n---`n`n## File Type Breakdown`n"
    
    foreach ($type in $TypeAnalysis.GetEnumerator() | Sort-Object -Property {$_.Value.Count} -Descending) {
        if ($type.Value.Count -gt 0) {
            $sizeMB = [math]::Round($type.Value.Size / 1MB, 2)
            $report += "`n- **$($type.Key):** $($type.Value.Count) files ($sizeMB MB)`n"
        }
    }

    $report += "`n---`n`n## Recommended Next Steps`n"
    $report += "`n1. **Review this report thoroughly** - Pay special attention to any conflicting files`n"
    $report += "2. **Manually resolve conflicts** (if any) - Copy the version you want to keep to your repo bootstrap folder`n"
    $report += "3. **Run consolidation with backup** - Use the command: ``.\02-CONSOLIDATE.ps1 -Backup -Verbose```n"
    $report += "4. **Test the results** - Verify the consolidated structure contains what you expect`n"
    $report += "5. **Use the GUI installer** - Bootstrap your PCs with: ``.\03-GUI-INSTALLER.ps1```n"

    $report += "`n---`n`n## What Happens During Consolidation`n"
    $report += "`n### Directory Structure`n"
    $report += "`nFiles will be organized into these directories:`n"
    $report += "`n- ``configs/`` - Configuration files (JSON, YAML, ENV, settings)`n"
    $report += "- ``scripts/`` - PowerShell, Bash, Batch scripts`n"
    $report += "- ``templates/`` - CLAUDE.md templates, workflow templates`n"
    $report += "- ``docker/`` - Docker compose files, Dockerfiles`n"
    $report += "- ``installers/`` - GUI installers, setup wizards`n"
    $report += "- ``docs/`` - Documentation and guides`n"

    $report += "`n### Safety Measures`n"
    $report += "`n- All existing files in your repo bootstrap folder are **never overwritten**`n"
    $report += "- A timestamped backup is created before any changes`n"
    $report += "- You get confirmation prompts before major operations`n"
    $report += "- Detailed logging shows every file processed`n"
    $report += "- You can cancel at any time`n"

    $report | Out-File -FilePath $reportPath -Encoding UTF8 -Force
    
    return $reportPath
}

# =====================================================
# MAIN EXECUTION
# =====================================================

Write-ColorOutput "Magenta" @"

╔═══════════════════════════════════════════════════════════╗
║   Project Nyra - Bootstrap Consolidation Analysis        ║
║   Step 1: Analyze all sources (NO CHANGES MADE)          ║
╚═══════════════════════════════════════════════════════════╝

"@

if ($DryRun) {
    Write-Warning "DRY RUN MODE - Analysis only, no report file created`n"
}

try {
    # Phase 1: Analyze sources
    $sourceAnalysis = Invoke-SourceAnalysis
    
    # Phase 2: Find duplicates and conflicts
    $duplicateAnalysis = Invoke-DuplicateAnalysis $sourceAnalysis
    
    # Phase 3: Analyze file types
    $typeAnalysis = Invoke-TypeAnalysis $duplicateAnalysis
    
    # Phase 4: Generate report
    if (-not $DryRun) {
        $reportPath = New-AnalysisReport $sourceAnalysis $duplicateAnalysis $typeAnalysis
        Write-Success "`nAnalysis complete!"
        Write-ColorOutput "Cyan" "`nDetailed report saved to:`n  $reportPath"
        Write-Info "`nOpen the report with:`n  notepad `"$reportPath`""
        
        # Ask if they want to open it now
        Write-Output ""
        $response = Read-Host "Open the analysis report now? (Y/n)"
        if ($response -eq '' -or $response -eq 'Y' -or $response -eq 'y') {
            Start-Process "notepad.exe" -ArgumentList "`"$reportPath`""
        }
    } else {
        Write-Success "`nDry run complete! No report file created."
    }
    
    Write-ColorOutput "Green" "`n✓ Analysis completed successfully!"
    
    if ($duplicateAnalysis.ConflictingFiles -gt 0) {
        Write-Output ""
        Write-Warning "⚠ Found $($duplicateAnalysis.ConflictingFiles) conflicting files."
        Write-Info "Review the analysis report before running consolidation."
        Write-Info "If you're happy with using the highest priority version for conflicts,"
        Write-Info "you can proceed with: .\02-CONSOLIDATE.ps1 -Backup -Verbose"
    } else {
        Write-Output ""
        Write-Success "✓ No conflicts detected! Safe to proceed with consolidation."
        Write-Info "Next step: .\02-CONSOLIDATE.ps1 -Backup -Verbose"
    }
    
} catch {
    Write-Error "`nAnalysis failed: $_"
    Write-Info "Error details: $($_.Exception.Message)"
    exit 1
}
