#requires -RunAsAdministrator
param(
  [Parameter(Mandatory=$true)][string]$Root
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Has-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Ensure-Winget {
  if (Has-Command "winget") { return }
  Write-Host "❌ winget not found. Install 'App Installer' from Microsoft Store, then re-run." -ForegroundColor Red
  throw "winget missing"
}

function Winget-Install($id) {
  Write-Host "-> winget install $id"
  $args = @("install","-e","--id",$id,"--accept-source-agreements","--accept-package-agreements")
  $p = Start-Process -FilePath "winget" -ArgumentList $args -Wait -PassThru
  if ($p.ExitCode -ne 0) { throw "winget install failed for $id (exit $($p.ExitCode))" }
}

Write-Host "=== Installing prerequisites ===" -ForegroundColor Cyan

Ensure-Winget

# Git (nice to have)
try {
  if (-not (Has-Command "git")) {
    Winget-Install "Git.Git"
  } else {
    Write-Host "✓ Git already installed"
  }
} catch {
  Write-Host "⚠️ Git install skipped/failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Docker Desktop
try {
  $dockerDesktop = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -like "Docker Desktop*" } | Select-Object -First 1
  if (-not $dockerDesktop) {
    Winget-Install "Docker.DockerDesktop"
    Write-Host "⚠️ Docker Desktop installed. Launch it once to finish setup, then re-run if needed." -ForegroundColor Yellow
  } else {
    Write-Host "✓ Docker Desktop already installed"
  }
} catch {
  Write-Host "⚠️ Docker Desktop install may have failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Tailscale (optional but recommended)
try {
  $tailscale = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -like "Tailscale*" } | Select-Object -First 1
  if (-not $tailscale) {
    Winget-Install "Tailscale.Tailscale"
    Write-Host "ℹ️ Tailscale installed. You'll still need to login (GUI) once." -ForegroundColor Cyan
  } else {
    Write-Host "✓ Tailscale already installed"
  }
} catch {
  Write-Host "⚠️ Tailscale install skipped/failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Windows Exporter (Prometheus) - native metrics for Windows host
& (Join-Path $PSScriptRoot "Install-WindowsExporter.ps1")

Write-Host "✓ Prereqs step finished."
