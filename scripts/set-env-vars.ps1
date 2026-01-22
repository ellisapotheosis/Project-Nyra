# Set Volta and pnpm environment variables
# Run with: powershell.exe -ExecutionPolicy Bypass -File set-env-vars.ps1

$voltaHome = "$env:LOCALAPPDATA\Volta"
$pnpmHome = "$env:LOCALAPPDATA\pnpm"

# Set user environment variables
[Environment]::SetEnvironmentVariable('VOLTA_HOME', $voltaHome, 'User')
[Environment]::SetEnvironmentVariable('PNPM_HOME', $pnpmHome, 'User')

Write-Host "[OK] Set VOLTA_HOME=$voltaHome" -ForegroundColor Green
Write-Host "[OK] Set PNPM_HOME=$pnpmHome" -ForegroundColor Green

# Update PATH
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$voltaBin = "$voltaHome\bin"
$pnpmBin = $pnpmHome

# Add Volta to PATH if not present
if ($currentPath -notlike "*$voltaBin*") {
    $newPath = "$voltaBin;$currentPath"
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    Write-Host "[OK] Added $voltaBin to PATH" -ForegroundColor Green
} else {
    Write-Host "[SKIP] $voltaBin already in PATH" -ForegroundColor Yellow
}

# Add pnpm to PATH if not present
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($currentPath -notlike "*$pnpmBin*") {
    $newPath = "$pnpmBin;$currentPath"
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    Write-Host "[OK] Added $pnpmBin to PATH" -ForegroundColor Green
} else {
    Write-Host "[SKIP] $pnpmBin already in PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Environment variables configured successfully!" -ForegroundColor Cyan
Write-Host "WARNING: You need to restart your terminal for changes to take effect" -ForegroundColor Yellow
