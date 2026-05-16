# Backup all .env files from infra folder to docs/configuration/env-backups
# Preserves directory structure

$ErrorActionPreference = "Continue"
$projectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
Set-Location $projectRoot

$backupRoot = "docs/configuration/env-backups"

# Get all .env files from infra, excluding archived ones
$sourceFiles = Get-ChildItem -Path infra -Filter .env* -Recurse -File | Where-Object { $_.FullName -notlike '*archive*' }

Write-Host "Found $($sourceFiles.Count) .env files in infra folder" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Substring($projectRoot.Length + 1)
    $destPath = Join-Path $backupRoot $relativePath
    $destDir = Split-Path $destPath -Parent

    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    Copy-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "[OK] $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backup complete!" -ForegroundColor Cyan
