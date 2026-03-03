# Project Nyra - Duplicate File Scanner
# Scans multiple directories for duplicate files using SHA256 content hashing

param(
    [string[]]$ScanPaths = @(
        "C:\Dev\NyraDocs",
        "$PSScriptRoot\..\bootstrap",
        "$PSScriptRoot\..\NYRA-AIO-Bootstrap"
    ),
    [string]$OutputReport = "$PSScriptRoot\..\DUPLICATE-FILES-REPORT.md",
    [int]$MinFileSizeKB = 10  # Ignore files smaller than 10KB
)

$ErrorActionPreference = "Stop"

Write-Host "==================================="
Write-Host "  Project Nyra Duplicate Scanner"
Write-Host "==================================="
Write-Host ""

# Track statistics
$stats = @{
    TotalFiles = 0
    TotalSize = 0
    DuplicateGroups = 0
    DuplicateFiles = 0
    WastedSpace = 0
    ScannedPaths = @()
}

# Hash table to store file hashes
$fileHashes = @{}

Write-Host "Scanning directories..."
foreach ($path in $ScanPaths) {
    if (Test-Path $path) {
        Write-Host "  [+] $path" -ForegroundColor Green
        $stats.ScannedPaths += $path
    } else {
        Write-Host "  [!] $path (not found, skipping)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Scan all files
Write-Host "Computing file hashes..."
$progressCount = 0

foreach ($scanPath in $stats.ScannedPaths) {
    Get-ChildItem -Path $scanPath -Recurse -File | Where-Object {
        $_.Length -gt ($MinFileSizeKB * 1024)  # Skip small files
    } | ForEach-Object {
        $progressCount++
        if ($progressCount % 100 -eq 0) {
            Write-Host "  Processed $progressCount files..." -ForegroundColor Cyan
        }

        $file = $_
        $stats.TotalFiles++
        $stats.TotalSize += $file.Length

        try {
            # Compute SHA256 hash
            $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash

            # Store file info by hash
            if (-not $fileHashes.ContainsKey($hash)) {
                $fileHashes[$hash] = @()
            }

            $fileHashes[$hash] += @{
                Path = $file.FullName
                Size = $file.Length
                LastModified = $file.LastWriteTime
                RelativePath = $file.FullName.Replace($scanPath, "").TrimStart('\')
            }
        } catch {
            Write-Host "  [!] Error hashing: $($file.FullName)" -ForegroundColor Red
        }
    }
}

Write-Host "  Processed $progressCount files total." -ForegroundColor Green
Write-Host ""

# Identify duplicates
Write-Host "Analyzing duplicates..."
$duplicateGroups = $fileHashes.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 } | Sort-Object { $_.Value[0].Size } -Descending

$stats.DuplicateGroups = $duplicateGroups.Count
$stats.DuplicateFiles = ($duplicateGroups | ForEach-Object { $_.Value.Count - 1 } | Measure-Object -Sum).Sum
$stats.WastedSpace = ($duplicateGroups | ForEach-Object {
    $size = $_.Value[0].Size
    $count = $_.Value.Count - 1
    $size * $count
} | Measure-Object -Sum).Sum

Write-Host "  Found $($stats.DuplicateGroups) duplicate groups" -ForegroundColor Yellow
Write-Host "  Total duplicate files: $($stats.DuplicateFiles)" -ForegroundColor Yellow
Write-Host "  Wasted space: $([math]::Round($stats.WastedSpace / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host ""

# Generate markdown report
Write-Host "Generating report: $OutputReport"

$report = @"
# Project Nyra - Duplicate Files Report

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary

| Metric | Value |
|--------|-------|
| Total Files Scanned | $($stats.TotalFiles) |
| Total Size Scanned | $([math]::Round($stats.TotalSize / 1GB, 2)) GB |
| Duplicate Groups Found | $($stats.DuplicateGroups) |
| Duplicate Files | $($stats.DuplicateFiles) |
| Wasted Space | $([math]::Round($stats.WastedSpace / 1MB, 2)) MB |

## Scanned Paths

$($stats.ScannedPaths | ForEach-Object { "- ``$_``" } | Out-String)

## Duplicate File Groups

"@

$groupNum = 0
foreach ($group in $duplicateGroups) {
    $groupNum++
    $files = $group.Value
    $size = $files[0].Size
    $wastedInGroup = $size * ($files.Count - 1)

    $report += @"

### Group $groupNum - $([math]::Round($size / 1KB, 2)) KB ($($files.Count) copies, $([math]::Round($wastedInGroup / 1KB, 2)) KB wasted)

**Hash**: ``$($group.Key)``

| File Path | Last Modified | Location |
|-----------|---------------|----------|
$($files | ForEach-Object {
    $location = switch -Regex ($_.Path) {
        "NyraDocs" { "NyraDocs" }
        "bootstrap[^-]" { "bootstrap" }
        "NYRA-AIO-Bootstrap" { "NYRA-AIO-Bootstrap" }
        default { "Unknown" }
    }
    "| ``$($_.RelativePath)`` | $($_.LastModified.ToString('yyyy-MM-dd HH:mm')) | $location |"
} | Out-String)

**Recommendation**: Keep the most recent version in NYRA-AIO-Bootstrap, remove duplicates from other locations.

"@
}

# Add consolidation recommendations
$report += @"

---

## Consolidation Recommendations

### High Priority (Largest Space Savings)

$($duplicateGroups | Select-Object -First 10 | ForEach-Object {
    $files = $_.Value
    $size = $files[0].Size
    $wastedInGroup = $size * ($files.Count - 1)
    "- **$([math]::Round($wastedInGroup / 1KB, 2)) KB** - $($files.Count) copies of file ($(Split-Path -Leaf $files[0].Path))"
} | Out-String)

### Strategy

1. **NYRA-AIO-Bootstrap as Master**: This is the production-ready bootstrap kit. Keep the most recent/correct version here.

2. **Archive NyraDocs Duplicates**: Move unique documentation to ``docs/`` directory, remove duplicates.

3. **Clean Legacy Bootstrap**: The ``bootstrap/`` directory appears to have legacy content. Consolidate into NYRA-AIO-Bootstrap structure.

4. **Git Ignore Patterns**: Add ``.gitignore`` entries to prevent duplicate binaries:
   ```
   *.egg-info/
   __pycache__/
   *.pyc
   node_modules/
   .next/
   ```

### Automated Cleanup Script

Run the following PowerShell commands to consolidate duplicates:

``````powershell
# Backup before cleanup
.\scripts\backup-daily.ps1

# Remove duplicate .egg-info directories
Get-ChildItem -Path . -Recurse -Directory -Filter "*.egg-info" |
    Where-Object { `$_.FullName -notlike "*NYRA-AIO-Bootstrap*" } |
    Remove-Item -Recurse -Force

# Remove duplicate __pycache__ directories
Get-ChildItem -Path . -Recurse -Directory -Filter "__pycache__" |
    Remove-Item -Recurse -Force

# Remove duplicate .pyc files
Get-ChildItem -Path . -Recurse -File -Filter "*.pyc" |
    Remove-Item -Force
``````

### Verification

After cleanup, re-run this scanner to verify duplicates removed:

``````powershell
.\scripts\scan-duplicates.ps1
``````

---

**Total Potential Space Savings**: $([math]::Round($stats.WastedSpace / 1MB, 2)) MB

"@

# Write report
$report | Out-File -FilePath $OutputReport -Encoding UTF8

Write-Host "[+] Report generated: $OutputReport" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:"
Write-Host "  - Total files scanned: $($stats.TotalFiles)"
Write-Host "  - Duplicate groups: $($stats.DuplicateGroups)"
Write-Host "  - Wasted space: $([math]::Round($stats.WastedSpace / 1MB, 2)) MB"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Review the report: $OutputReport"
Write-Host "  2. Run backup before cleanup: .\scripts\backup-daily.ps1"
Write-Host "  3. Execute consolidation recommendations"
Write-Host ""
