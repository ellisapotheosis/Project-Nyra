#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Install and activate the enhanced watercolor Oh-My-Posh theme

.DESCRIPTION
    This script:
    1. Clears Oh-My-Posh cache to prevent template errors
    2. Installs the enhanced watercolor theme with NO background colors
    3. Sets it as the active theme
    4. Verifies Nerd Font is installed

.NOTES
    Part of NYRA PowerShell Runtime
    Enhanced watercolor theme features:
    - NO background colors (transparent backgrounds, colored text only)
    - Watercolor color palette (Lavender, Seafoam, Mint, Watermelon, Soft Purple, Pale Blue)
    - Docker, Git, GitHub, Node.js, UV (Python), WSL detection
    - Project-Nyra directory detection
    - System info, battery, time, execution time
#>

[CmdletBinding()]
param(
    [switch]$SkipFontCheck
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Enhanced Watercolor Theme Installer" -ForegroundColor Magenta
Write-Host "  NO Background Colors | Pure Watercolor Palette" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Oh-My-Posh is installed
if (-not (Get-Command oh-my-posh -ErrorAction SilentlyContinue)) {
    Write-Error "Oh-My-Posh is not installed. Run: winget install JanDeDobbeleer.OhMyPosh"
}

# Check for Nerd Font (unless skipped)
if (-not $SkipFontCheck) {
    Write-Host "[1/5] Checking for Nerd Font..." -ForegroundColor Yellow

    $fonts = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" -ErrorAction SilentlyContinue |
        Select-Object * |
        Where-Object { $_ -match "Nerd" }

    if (-not $fonts) {
        Write-Warning "⚠️  No Nerd Font detected!"
        Write-Host ""
        Write-Host "  Oh-My-Posh requires a Nerd Font to display icons correctly." -ForegroundColor Cyan
        Write-Host "  Recommended: CaskaydiaCove Nerd Font" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Install now: " -NoNewline -ForegroundColor Yellow
        Write-Host "winget install --id=DEVCOM.CascadiaCodeNF -e" -ForegroundColor Green
        Write-Host ""
        Write-Host "  After installation, configure Windows Terminal:" -ForegroundColor Cyan
        Write-Host "  Settings → Profiles → PowerShell → Appearance → Font face → CaskaydiaCove Nerd Font" -ForegroundColor White
        Write-Host ""

        $response = Read-Host "Continue without Nerd Font? (y/N)"
        if ($response -notmatch '^y(es)?$') {
            Write-Host "Installation cancelled. Install a Nerd Font first." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ✅ Nerd Font found" -ForegroundColor Green
    }
}

# Clear Oh-My-Posh cache
Write-Host "[2/5] Clearing Oh-My-Posh cache..." -ForegroundColor Yellow

$cacheLocations = @(
    "$env:LOCALAPPDATA\oh-my-posh",
    "$env:TEMP\oh-my-posh",
    "$env:USERPROFILE\.cache\oh-my-posh"
)

foreach ($cache in $cacheLocations) {
    if (Test-Path $cache) {
        Remove-Item -Path $cache -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Cleared: $cache" -ForegroundColor Gray
    }
}

Write-Host "  ✅ Cache cleared" -ForegroundColor Green

# Install enhanced theme
Write-Host "[3/5] Installing enhanced watercolor theme..." -ForegroundColor Yellow

$themesDir = "C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes"
$sourceTheme = Join-Path $themesDir "nyra-watercolor-enhanced.omp.json"
$targetTheme = Join-Path $themesDir "nyra-watercolor.omp.json"

if (-not (Test-Path $sourceTheme)) {
    Write-Error "Enhanced theme not found at: $sourceTheme"
}

# Backup existing theme
if (Test-Path $targetTheme) {
    $backupPath = "$targetTheme.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -Path $targetTheme -Destination $backupPath -Force
    Write-Host "  Backed up existing theme to: $backupPath" -ForegroundColor Gray
}

# Install enhanced theme
Copy-Item -Path $sourceTheme -Destination $targetTheme -Force
Write-Host "  ✅ Enhanced theme installed" -ForegroundColor Green

# Test theme for errors
Write-Host "[4/5] Testing theme..." -ForegroundColor Yellow

try {
    $testOutput = oh-my-posh print primary --config=$targetTheme 2>&1

    if ($testOutput -match "error|unable to create") {
        Write-Warning "⚠️  Theme test produced warnings. Output:"
        Write-Host $testOutput -ForegroundColor Yellow
        Write-Host ""
        Write-Host "If you see template errors, ensure:" -ForegroundColor Cyan
        Write-Host "  1. Nerd Font is installed" -ForegroundColor White
        Write-Host "  2. Windows Terminal is configured to use the Nerd Font" -ForegroundColor White
        Write-Host "  3. You've restarted Windows Terminal" -ForegroundColor White
    } else {
        Write-Host "  ✅ Theme test passed" -ForegroundColor Green
    }
} catch {
    Write-Warning "Could not test theme: $_"
}

# Activate theme
Write-Host "[5/5] Activating theme..." -ForegroundColor Yellow

# Update profile to use this theme
$profilePath = $PROFILE.CurrentUserCurrentHost

if (Test-Path $profilePath) {
    $profileContent = Get-Content $profilePath -Raw

    # Check if Oh-My-Posh init is present
    if ($profileContent -match 'oh-my-posh init pwsh') {
        # Update existing init
        $profileContent = $profileContent -replace 'oh-my-posh init pwsh[^\r\n]+', "oh-my-posh init pwsh --config '$targetTheme' | Invoke-Expression"
        Set-Content -Path $profilePath -Value $profileContent
        Write-Host "  Updated existing Oh-My-Posh init in profile" -ForegroundColor Gray
    } else {
        # Add Oh-My-Posh init
        Add-Content -Path $profilePath -Value "`n# Oh-My-Posh - Enhanced Watercolor Theme`noh-my-posh init pwsh --config '$targetTheme' | Invoke-Expression`n"
        Write-Host "  Added Oh-My-Posh init to profile" -ForegroundColor Gray
    }

    Write-Host "  ✅ Theme activated in profile" -ForegroundColor Green
}

# Reload Oh-My-Posh in current session
Write-Host ""
Write-Host "Reloading Oh-My-Posh..." -ForegroundColor Yellow
oh-my-posh init pwsh --config=$targetTheme | Invoke-Expression

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✨ Enhanced Watercolor Theme Installed!" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Features:" -ForegroundColor Cyan
Write-Host "  ✓ NO background colors (transparent backgrounds)" -ForegroundColor White
Write-Host "  ✓ Watercolor palette (Lavender, Seafoam, Mint, Watermelon)" -ForegroundColor White
Write-Host "  ✓ Docker context detection" -ForegroundColor White
Write-Host "  ✓ Project-Nyra directory detection" -ForegroundColor White
Write-Host "  ✓ Git status with beautiful colors" -ForegroundColor White
Write-Host "  ✓ Node.js, UV (Python), WSL detection" -ForegroundColor White
Write-Host "  ✓ System info, battery, execution time" -ForegroundColor White
Write-Host ""
Write-Host "Note: Restart Windows Terminal to ensure all changes take effect" -ForegroundColor Yellow
Write-Host ""
Write-Host "Theme location: " -NoNewline -ForegroundColor Gray
Write-Host $targetTheme -ForegroundColor Cyan
Write-Host ""
