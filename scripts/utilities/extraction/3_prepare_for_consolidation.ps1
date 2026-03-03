# Preparation Script for Consolidation 🐱
# This prepares the scanned data for the main consolidation process

Write-Host "🐱 Preparing for Consolidation!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray

$projectPath = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra"
$downloadsPath = "C:\Users\A1Panda\Downloads"

# Check if scan files exist
$scanReport = "$projectPath\EXTRACTED_FILES_SCAN.json"
$cleaningReport = "$projectPath\CLEANING_INGESTION_FILES.md"

if (-not (Test-Path $scanReport)) {
    Write-Host "❌ Scan report not found! Please run 2_scan_extracted.ps1 first" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found scan report" -ForegroundColor Green

# Load scan data
$scanData = Get-Content $scanReport | ConvertFrom-Json
Write-Host "📊 Loaded data for $($scanData.Count) files" -ForegroundColor Cyan

# Create consolidation plan
$consolidationPlan = @{
    TotalFiles = $scanData.Count
    CleaningFiles = @()
    BoilerplateFiles = @()
    ArchivesToMove = @()
    Timestamp = Get-Date
}

# Categorize files
$cleaningPatterns = @(
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

foreach ($file in $scanData) {
    $isCleaningFile = $false
    
    foreach ($pattern in $cleaningPatterns) {
        if ($file.FullPath -like $pattern) {
            $consolidationPlan.CleaningFiles += $file
            $isCleaningFile = $true
            break
        }
    }
    
    if (-not $isCleaningFile) {
        $consolidationPlan.BoilerplateFiles += $file
    }
}

# Find archives to move
$archives = Get-ChildItem -Path $downloadsPath -Include "*.zip", "*.7z" -File
foreach ($archive in $archives) {
    # Check if it has been extracted
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($archive.Name)
    if (Test-Path (Join-Path $downloadsPath $baseName)) {
        $consolidationPlan.ArchivesToMove += @{
            Name = $archive.Name
            Path = $archive.FullName
            Size = $archive.Length
        }
    }
}

# Save consolidation plan
$planFile = "$projectPath\CONSOLIDATION_PLAN.json"
$consolidationPlan | ConvertTo-Json -Depth 10 | Out-File $planFile -Encoding UTF8

# Create summary
Write-Host "`n📊 Consolidation Plan Summary:" -ForegroundColor Cyan
Write-Host "  - Total files to process: $($consolidationPlan.TotalFiles)" -ForegroundColor White
Write-Host "  - Cleaning/Ingestion files: $($consolidationPlan.CleaningFiles.Count)" -ForegroundColor Yellow
Write-Host "  - Boilerplate files: $($consolidationPlan.BoilerplateFiles.Count)" -ForegroundColor Green
Write-Host "  - Archives to move: $($consolidationPlan.ArchivesToMove.Count)" -ForegroundColor Magenta

# Create the main bootstrap script in Downloads
$bootstrapScript = @'
# Main Bootstrap Script - Run from Downloads folder! 🐱
# This is the actual consolidation script

Write-Host "🐱 Starting Full Stack Boilerplate Consolidation!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray

$downloadsPath = Get-Location
$projectPath = "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra"

# Load consolidation plan
$planFile = "$projectPath\CONSOLIDATION_PLAN.json"
if (-not (Test-Path $planFile)) {
    Write-Host "❌ Consolidation plan not found! Run preparation script first" -ForegroundColor Red
    exit 1
}

$plan = Get-Content $planFile | ConvertFrom-Json
Write-Host "📋 Loaded consolidation plan" -ForegroundColor Green

# Create main structure
Write-Host "`nCreating all_in_one structure..." -ForegroundColor Yellow
$allInOnePath = "$downloadsPath\all_in_one"
New-Item -ItemType Directory -Path $allInOnePath -Force | Out-Null

# Create cleaning/ingestion segregated folder
$cleaningPath = "$downloadsPath\cleaning-ingestion-systems"
New-Item -ItemType Directory -Path $cleaningPath -Force | Out-Null

# Create subdirectories for cleaning systems
$cleaningDirs = @(
    "$cleaningPath\llamaindex-systems",
    "$cleaningPath\archon-cleaning",
    "$cleaningPath\claude-ingestion",
    "$cleaningPath\fastmcp-ingestion",
    "$cleaningPath\graphrag-pipelines",
    "$cleaningPath\doc-processing",
    "$cleaningPath\other-cleaning"
)

foreach ($dir in $cleaningDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Move archives
Write-Host "`nMoving extracted archives to zip folder..." -ForegroundColor Cyan
$zipFolder = "$downloadsPath\zip"
New-Item -ItemType Directory -Path $zipFolder -Force | Out-Null

foreach ($archive in $plan.ArchivesToMove) {
    try {
        Move-Item -Path $archive.Path -Destination $zipFolder -Force
        Write-Host "  ✅ Moved: $($archive.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Failed to move: $($archive.Name)" -ForegroundColor Red
    }
}

# Process cleaning files
Write-Host "`nSegregating cleaning/ingestion files..." -ForegroundColor Yellow
foreach ($file in $plan.CleaningFiles) {
    $destDir = $cleaningPath
    
    # Determine specific subdirectory
    if ($file.FullPath -match 'llama.*index') { $destDir = "$cleaningPath\llamaindex-systems" }
    elseif ($file.FullPath -match 'archon.*clean') { $destDir = "$cleaningPath\archon-cleaning" }
    elseif ($file.FullPath -match 'claude.*(clean|ingest)') { $destDir = "$cleaningPath\claude-ingestion" }
    elseif ($file.FullPath -match 'fastmcp.*ingest') { $destDir = "$cleaningPath\fastmcp-ingestion" }
    elseif ($file.FullPath -match 'graphrag') { $destDir = "$cleaningPath\graphrag-pipelines" }
    elseif ($file.FullPath -match '(doc.*clean|document.*process)') { $destDir = "$cleaningPath\doc-processing" }
    else { $destDir = "$cleaningPath\other-cleaning" }
    
    # Create source folder structure
    $sourceStructure = Join-Path $destDir $file.SourceFolder
    New-Item -ItemType Directory -Path $sourceStructure -Force | Out-Null
    
    # Create relative path
    $targetPath = Join-Path $sourceStructure $file.RelativePath
    $targetDir = Split-Path $targetPath -Parent
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    
    # Copy file
    try {
        Copy-Item -Path $file.FullPath -Destination $targetPath -Force
        Write-Host "  📋 Segregated: $($file.FileName)" -ForegroundColor Yellow
    }
    catch {
        Write-Host "  ❌ Failed: $($file.FileName)" -ForegroundColor Red
    }
}

# Process boilerplate files
Write-Host "`nConsolidating boilerplate files..." -ForegroundColor Green
foreach ($file in $plan.BoilerplateFiles) {
    # Skip if already processed
    if ($file.FullPath -match 'all_in_one') { continue }
    
    # Determine target location in all_in_one
    $ext = $file.Extension.ToLower()
    $targetSubDir = switch -Regex ($ext) {
        '^\.(js|jsx|ts|tsx)$' { 'src' }
        '^\.(py)$' { 'backend' }
        '^\.(html|css|scss)$' { 'frontend' }
        '^\.(json|yaml|yml|toml)$' { 'config' }
        '^\.(md|txt|rst)$' { 'docs' }
        '^\.(sql)$' { 'database' }
        '^\.(sh|ps1|bat)$' { 'scripts' }
        default { 'misc' }
    }
    
    $targetPath = Join-Path $allInOnePath $targetSubDir
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    
    # Copy file maintaining some structure
    $destFile = Join-Path $targetPath $file.FileName
    
    try {
        Copy-Item -Path $file.FullPath -Destination $destFile -Force
        Write-Host "  ✅ Consolidated: $($file.FileName) -> $targetSubDir" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Failed: $($file.FileName)" -ForegroundColor Red
    }
}

# Create final summary
$summary = @"
# 🐱 Consolidation Complete!

## Results:
- ✅ Created all_in_one boilerplate structure
- 📋 Segregated $($plan.CleaningFiles.Count) cleaning/ingestion files
- 📦 Moved $($plan.ArchivesToMove.Count) archives to zip folder
- 🏗️ Consolidated $($plan.BoilerplateFiles.Count) boilerplate files

## Folders Created:
- **all_in_one/**: Your consolidated boilerplate
- **cleaning-ingestion-systems/**: All cleaning & ingestion tools
- **zip/**: All extracted archives

## Next Steps:
1. Review the all_in_one structure
2. Check cleaning-ingestion-systems for your specialized tools
3. Run any additional setup scripts as needed
"@

$summary | Out-File "$downloadsPath\CONSOLIDATION_SUMMARY.md" -Encoding UTF8
Write-Host $summary -ForegroundColor Cyan

Write-Host "`n🎉 All done! Check CONSOLIDATION_SUMMARY.md for details" -ForegroundColor Green
'@

$bootstrapScript | Out-File "$downloadsPath\scripts\bootstrap_main.ps1" -Encoding UTF8

Write-Host "`n✅ Preparation complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your Downloads folder: cd C:\Users\A1Panda\Downloads" -ForegroundColor Yellow
Write-Host "2. Run the main bootstrap: .\scripts\bootstrap_main.ps1" -ForegroundColor Yellow
Write-Host "`nThis will create your organized structure!" -ForegroundColor Green