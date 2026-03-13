#requires -RunAsAdministrator
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-ServiceExists($name) {
  try { Get-Service -Name $name -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

$svcName = "windows_exporter"
if (Test-ServiceExists $svcName) {
  Write-Host "✓ windows_exporter already installed"
  return
}

Write-Host "=== Installing windows_exporter (Prometheus) ===" -ForegroundColor Cyan

$api = "https://api.github.com/repos/prometheus-community/windows_exporter/releases/latest"
$release = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "nyra-bootstrap" }

$asset = $release.assets | Where-Object { $_.name -match "windows_exporter-.*-amd64\.msi$" } | Select-Object -First 1
if (-not $asset) {
  throw "Could not find MSI asset in latest release"
}

$temp = Join-Path $env:TEMP $asset.name
Write-Host "-> Downloading $($asset.name)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $temp

Write-Host "-> Installing MSI (enables common collectors, listens on :9182)"
# Install with sane defaults and enable common collectors
$msiArgs = @(
  "/i", "`"$temp`"",
  "/qn",
  "ENABLED_COLLECTORS=cpu,cs,logical_disk,net,os,service,system,process",
  "LISTEN_PORT=9182"
)
$p = Start-Process -FilePath "msiexec.exe" -ArgumentList $msiArgs -Wait -PassThru
if ($p.ExitCode -ne 0) { throw "windows_exporter MSI install failed (exit $($p.ExitCode))" }

Start-Sleep -Seconds 2
if (-not (Test-ServiceExists $svcName)) {
  Write-Host "⚠️ windows_exporter service not detected, but install may still have succeeded." -ForegroundColor Yellow
} else {
  Write-Host "✓ windows_exporter installed. Metrics: http://localhost:9182/metrics" -ForegroundColor Green
}
