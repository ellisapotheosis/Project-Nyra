# Bootstrap Folder Structure Verification
# Run this to see what's actually in your bootstrap folder

Write-Host "`n=== Bootstrap Folder Structure ===" -ForegroundColor Cyan
Write-Host "Location: $PWD`n" -ForegroundColor Yellow

# Check main directories
$folders = @("installer", "scripts", "configs", "docker", "docs")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "✓ $folder/" -ForegroundColor Green

        # Show key files in each folder
        if ($folder -eq "scripts") {
            Get-ChildItem $folder -Filter "*.ps1" | ForEach-Object {
                Write-Host "  - $($_.Name)" -ForegroundColor Gray
            }
        } elseif ($folder -eq "installer") {
            if (Test-Path "$folder\package.json") {
                Write-Host "  - package.json (GUI installer)" -ForegroundColor Gray
            }
        } elseif ($folder -eq "docker") {
            Get-ChildItem $folder -Filter "*.yml" | ForEach-Object {
                Write-Host "  - $($_.Name)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "✗ $folder/ (not found)" -ForegroundColor Red
    }
}

# Check for launchers
Write-Host "`n=== Launchers ===" -ForegroundColor Cyan
$launchers = @("LAUNCHER.bat", "LAUNCHER.ps1", "LAUNCHER.sh")
foreach ($launcher in $launchers) {
    if (Test-Path $launcher) {
        Write-Host "✓ $launcher" -ForegroundColor Green
    } else {
        Write-Host "✗ $launcher (not found)" -ForegroundColor Yellow
    }
}

# Check for documentation
Write-Host "`n=== Documentation ===" -ForegroundColor Cyan
$docs = @("README.md", "QUICK-START.md", "BOOTSTRAP-QUICK-START.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✓ $doc" -ForegroundColor Green
    } else {
        Write-Host "✗ $doc (not found)" -ForegroundColor Yellow
    }
}

# Check for main bootstrap scripts
Write-Host "`n=== Main Bootstrap Scripts ===" -ForegroundColor Cyan
$mainScripts = @(
    "scripts\bootstrap-orchestrator.ps1",
    "scripts\bootstrap-worker.ps1",
    "scripts\health-check-all.ps1",
    "scripts\configure-static-ip.ps1"
)
foreach ($script in $mainScripts) {
    if (Test-Path $script) {
        Write-Host "✓ $script" -ForegroundColor Green
    } else {
        Write-Host "✗ $script (not found)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Your bootstrap folder is at: $PWD" -ForegroundColor White

# Determine recommended bootstrap method
Write-Host "`n=== Recommended Bootstrap Method ===" -ForegroundColor Cyan
if (Test-Path "LAUNCHER.bat") {
    Write-Host "✓ Use LAUNCHER.bat (interactive menu)" -ForegroundColor Green
    Write-Host "  Run: .\LAUNCHER.bat" -ForegroundColor Gray
} elseif (Test-Path "scripts\bootstrap-orchestrator.ps1") {
    Write-Host "✓ Use bootstrap script directly" -ForegroundColor Green
    Write-Host "  Run: .\scripts\bootstrap-orchestrator.ps1" -ForegroundColor Gray
} elseif (Test-Path "installer\package.json") {
    Write-Host "✓ Use GUI installer" -ForegroundColor Green
    Write-Host "  Run: cd installer; npm install; npm run dev" -ForegroundColor Gray
} else {
    Write-Host "⚠ No clear bootstrap method found" -ForegroundColor Yellow
    Write-Host "  Check the documentation in this folder" -ForegroundColor Gray
}

Write-Host ""
