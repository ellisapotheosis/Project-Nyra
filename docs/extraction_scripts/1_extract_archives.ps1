# Archive Extraction Script 🐱
# This extracts all ZIP and 7Z files in the Downloads folder

Write-Host "🐱 Starting Archive Extraction Process!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray

# Set location
$downloadsPath = "C:\Users\A1Panda\Downloads"
Set-Location $downloadsPath

# Create extraction log
$logFile = "$downloadsPath\extraction_log.txt"
$extractedList = "$downloadsPath\extracted_archives.txt"
"Extraction started at: $(Get-Date)" | Out-File $logFile

# Get all archives
$zipFiles = Get-ChildItem -Path . -Filter "*.zip" | Where-Object { $_.Name -notmatch '^extracted_' }
$sevenZipFiles = Get-ChildItem -Path . -Filter "*.7z"

$totalArchives = $zipFiles.Count + $sevenZipFiles.Count
Write-Host "Found $totalArchives archives to extract" -ForegroundColor Yellow

# Extract ZIP files
$extracted = 0
foreach ($zip in $zipFiles) {
    $extracted++
    Write-Progress -Activity "Extracting Archives" -Status "Processing: $($zip.Name)" -PercentComplete (($extracted / $totalArchives) * 100)
    
    try {
        # Create folder name without .zip extension
        $folderName = $zip.BaseName
        
        # Extract
        Expand-Archive -Path $zip.FullName -DestinationPath $folderName -Force
        
        Write-Host "✅ Extracted: $($zip.Name)" -ForegroundColor Green
        "$($zip.Name) -> $folderName" | Out-File $logFile -Append
        $zip.Name | Out-File $extractedList -Append
    }
    catch {
        Write-Host "❌ Failed to extract: $($zip.Name) - $_" -ForegroundColor Red
        "FAILED: $($zip.Name) - $_" | Out-File $logFile -Append
    }
}

# Check if 7-Zip is installed
$sevenZipPath = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe",
    "$env:ProgramFiles\7-Zip\7z.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($sevenZipFiles.Count -gt 0) {
    if ($sevenZipPath) {
        Write-Host "`nExtracting 7Z files using 7-Zip..." -ForegroundColor Cyan
        
        foreach ($sevenZ in $sevenZipFiles) {
            $extracted++
            Write-Progress -Activity "Extracting Archives" -Status "Processing: $($sevenZ.Name)" -PercentComplete (($extracted / $totalArchives) * 100)
            
            try {
                $folderName = $sevenZ.BaseName
                
                # Create extraction folder
                New-Item -ItemType Directory -Path $folderName -Force | Out-Null
                
                # Extract using 7-Zip
                & $sevenZipPath x $sevenZ.FullName -o"$folderName" -y
                
                Write-Host "✅ Extracted: $($sevenZ.Name)" -ForegroundColor Green
                "$($sevenZ.Name) -> $folderName" | Out-File $logFile -Append
                $sevenZ.Name | Out-File $extractedList -Append
            }
            catch {
                Write-Host "❌ Failed to extract: $($sevenZ.Name) - $_" -ForegroundColor Red
                "FAILED: $($sevenZ.Name) - $_" | Out-File $logFile -Append
            }
        }
    }
    else {
        Write-Host "`n⚠️  7-Zip not found! Please install 7-Zip to extract .7z files" -ForegroundColor Yellow
        Write-Host "Download from: https://www.7-zip.org/download.html" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ Extraction complete!" -ForegroundColor Green
Write-Host "Log saved to: $logFile" -ForegroundColor Gray
Write-Host "`nNext step: Run 2_scan_extracted.ps1" -ForegroundColor Cyan