#requires -RunAsAdministrator
param(
  [Parameter(Mandatory=$true)][string]$Root
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Enable-Feature($name) {
  $feature = dism.exe /online /get-featureinfo /featurename:$name 2>$null
  if ($feature -match "State : Enabled") {
    Write-Host "✓ Feature enabled: $name"
    return $false
  }
  Write-Host "-> Enabling Windows feature: $name"
  dism.exe /online /enable-feature /featurename:$name /all /norestart | Out-Null
  return $true
}

Write-Host "=== Configuring WSL2 ===" -ForegroundColor Cyan

$needsReboot = $false
$needsReboot = (Enable-Feature "Microsoft-Windows-Subsystem-Linux") -or $needsReboot
$needsReboot = (Enable-Feature "VirtualMachinePlatform") -or $needsReboot

# Set WSL2 default
try {
  wsl.exe --set-default-version 2 | Out-Null
} catch {
  Write-Host "⚠️ Could not set WSL default version (may require reboot first)." -ForegroundColor Yellow
}

# Install Ubuntu if missing
$distros = & wsl.exe -l -q 2>$null
$hasUbuntu = $false
if ($distros) {
  $hasUbuntu = $distros | Where-Object { $_ -match "Ubuntu" } | ForEach-Object { $true } | Select-Object -First 1
}
if (-not $hasUbuntu) {
  Write-Host "-> Installing Ubuntu via WSL (Ubuntu-24.04)..."
  try {
    wsl.exe --install -d Ubuntu-24.04 | Out-Null
    Write-Host "⚠️ Ubuntu install started. You may be prompted to create a Linux user on first launch." -ForegroundColor Yellow
  } catch {
    Write-Host "⚠️ wsl --install failed (maybe already installed, or needs reboot). Message: $($_.Exception.Message)" -ForegroundColor Yellow
  }
} else {
  Write-Host "✓ Ubuntu distro detected"
}

if ($needsReboot) {
  Write-Host ""
  Write-Host "⚠️ Windows feature enable requires a REBOOT." -ForegroundColor Yellow
  Write-Host "Reboot, then re-run: .\run-admin.ps1"
  Write-Host ""
}

# Attempt to run the WSL setup script (will fail if Ubuntu not initialized yet)
$wslScript = Join-Path $Root "wsl\setup-wsl-worker.sh"
if (Test-Path $wslScript) {
  Write-Host "-> Running WSL setup script (inside Ubuntu): $wslScript"
  try {
    # Copy into WSL home and execute
    $wslHome = "/home/$env:USERNAME"
    wsl.exe -d Ubuntu-24.04 -- bash -lc "mkdir -p ~/nyra-bootstrap && cat > ~/nyra-bootstrap/setup-wsl-worker.sh" < $wslScript
    wsl.exe -d Ubuntu-24.04 -- bash -lc "chmod +x ~/nyra-bootstrap/setup-wsl-worker.sh && sudo ~/nyra-bootstrap/setup-wsl-worker.sh"
  } catch {
    Write-Host "⚠️ Could not run WSL setup automatically. Likely Ubuntu wasn't initialized yet." -ForegroundColor Yellow
    Write-Host "Manual fallback:" -ForegroundColor Yellow
    Write-Host "  1) Open Ubuntu (Start Menu) once and create a Linux user"
    Write-Host "  2) Re-run .\run-admin.ps1"
  }
}

Write-Host "✓ WSL step finished."
