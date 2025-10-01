# Scan Extracted Files Script 🐱
# This scans all extracted folders and creates a comprehensive file list

Write-Host "🐱 Scanning Extracted Files!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray

$downloadsPath = "C:\Users\A1Panda\Downloads"
$outputPath = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra"

# Create comprehensive scan report
$scanReport = "$outputPath\EXTRACTED_FILES_SCAN.json"
$cleaningReport = "$outputPath\CLEANING_INGESTION_FILES.md"

Write-Host "Scanning Downloads folder for extracted content..." -ForegroundColor Yellow

# Get all directories (excluding the ones that are clearly archives)
$extractedFolders = Get-ChildItem -Path $downloadsPath -Directory | Where-Object { 
    $_.Name -notmatch '^(scripts|zip)$' -and
    $_.Name -notmatch '\.(zip|7z|rar|tar)$'
}

Write-Host "Found $($extractedFolders.Count) extracted folders" -ForegroundColor Green

# Initialize results
$allFiles = @()
$cleaningFiles = @()
$ingestionPatterns = @(
    '*llama*index*',
    '*archon*clean*',
    '*claude*clean*',
    '*claude*ingest*',
    '*fastmcp*ingest*',
    '*clean*setup*',
    '*input_to_clean*',
    '*graphrag*',
    '*ingest*pipeline*',
    '*doc*clean*',
    '*document*process*',
    '*extraction*pipeline*',
    '*rag*pipeline*',
    '*embeddings*',
    '*vector*store*',
    '*chunk*process*'
)

# Scan each folder
foreach ($folder in $extractedFolders) {
    Write-Host "`nScanning: $($folder.Name)" -ForegroundColor Cyan
    
    # Get all files recursively
    $files = Get-ChildItem -Path $folder.FullName -Recurse -File -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $fileInfo = @{
            SourceFolder = $folder.Name
            RelativePath = $file.FullName.Replace($folder.FullName, '').TrimStart('\')
            FileName = $file.Name
            Extension = $file.Extension
            Size = $file.Length
            FullPath = $file.FullName
        }
        
        $allFiles += $fileInfo
        
        # Check if it's a cleaning/ingestion file
        $isCleaningFile = $false
        foreach ($pattern in $ingestionPatterns) {
            if ($file.FullName -like $pattern) {
                $isCleaningFile = $true
                $cleaningFiles += $fileInfo
                Write-Host "  📋 Found cleaning/ingestion file: $($file.Name)" -ForegroundColor Yellow
                break
            }
        }
    }
}

# Save comprehensive scan
$allFiles | ConvertTo-Json -Depth 10 | Out-File $scanReport -Encoding UTF8

# Create cleaning files report
$cleaningContent = @"
# 🐱 Cleaning & Ingestion Files Report

Generated: $(Get-Date)

## Summary
- Total extracted folders: $($extractedFolders.Count)
- Total files found: $($allFiles.Count)
- Cleaning/Ingestion files found: $($cleaningFiles.Count)

## Cleaning & Ingestion Files by Category

"@

# Group cleaning files by patterns
$llamaIndexFiles = $cleaningFiles | Where-Object { $_.FullPath -match 'llama.*index' }
$archonFiles = $cleaningFiles | Where-Object { $_.FullPath -match 'archon.*clean' }
$claudeFiles = $cleaningFiles | Where-Object { $_.FullPath -match 'claude.*(clean|ingest)' }
$fastmcpFiles = $cleaningFiles | Where-Object { $_.FullPath -match 'fastmcp.*ingest' }
$graphragFiles = $cleaningFiles | Where-Object { $_.FullPath -match 'graphrag' }
$otherCleaningFiles = $cleaningFiles | Where-Object { 
    $_.FullPath -notmatch 'llama.*index' -and
    $_.FullPath -notmatch 'archon.*clean' -and
    $_.FullPath -notmatch 'claude.*(clean|ingest)' -and
    $_.FullPath -notmatch 'fastmcp.*ingest' -and
    $_.FullPath -notmatch 'graphrag'
}

# Add sections to report
if ($llamaIndexFiles.Count -gt 0) {
    $cleaningContent += "`n### 🦙 LlamaIndex Files ($($llamaIndexFiles.Count))`n"
    foreach ($file in $llamaIndexFiles) {
        $cleaningContent += "- **$($file.SourceFolder)**: $($file.RelativePath)`n"
    }
}

if ($archonFiles.Count -gt 0) {
    $cleaningContent += "`n### 🏛️ Archon Cleaning Files ($($archonFiles.Count))`n"
    foreach ($file in $archonFiles) {
        $cleaningContent += "- **$($file.SourceFolder)**: $($file.RelativePath)`n"
    }
}

if ($claudeFiles.Count -gt 0) {
    $cleaningContent += "`n### 🤖 Claude Cleaning/Ingestion Files ($($claudeFiles.Count))`n"
    foreach ($file in $claudeFiles) {
        $cleaningContent += "- **$($file.SourceFolder)**: $($file.RelativePath)`n"
    }
}

if ($fastmcpFiles.Count -gt 0) {
    $cleaningContent += "`n### ⚡ FastMCP Ingestion Files ($($fastmcpFiles.Count))`n"
    foreach ($file in $fastmcpFiles) {
        $cleaningContent += "- **$($file.SourceFolder)**: $($file.RelativePath)`n"
    }
}

if ($graphragFiles.Count -gt 0) {
    $cleaningContent += "`n### 📊 GraphRAG Files ($($graphragFiles.Count))`n"
    foreach ($file in $graphragFiles) {
        $cleaningContent += "- **$($file.SourceFolder)**: $($file.RelativePath)`n"
    }
}

if ($otherCleaningFiles.Count -gt 0) {
    $cleaningContent += "`n### 🔧 Other Cleaning/Ingestion Files ($($otherCleaningFiles.Count))`n"
    foreach ($file in $otherCleaningFiles) {
        $cleaningContent += "- **$($file.SourceFolder)**: $($file.RelativePath)`n"
    }
}

$cleaningContent | Out-File $cleaningReport -Encoding UTF8

Write-Host "`n✅ Scan complete!" -ForegroundColor Green
Write-Host "📄 Full scan report: $scanReport" -ForegroundColor Cyan
Write-Host "📋 Cleaning files report: $cleaningReport" -ForegroundColor Yellow
Write-Host "`nNext step: Run 3_prepare_for_consolidation.ps1" -ForegroundColor Cyan