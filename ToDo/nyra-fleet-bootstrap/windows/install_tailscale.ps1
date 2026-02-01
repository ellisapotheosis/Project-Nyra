
param(
  [string]$AuthKey = $env:TAILSCALE_AUTHKEY,
  [switch]$NoLoginUI
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Have-Command($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

if (-not (Have-Command "tailscale")) {
  Write-Host "Installing Tailscale..."
  if (Have-Command "winget") {
    winget install -e --id Tailscale.Tailscale --silent --accept-package-agreements --accept-source-agreements
  } else {
    throw "winget not found. Install Tailscale manually from tailscale.com."
  }
}

Write-Host "Starting / joining tailnet..."
if ($AuthKey) {
  & tailscale up --auth-key=$AuthKey | Out-Host
} elseif (-not $NoLoginUI) {
  & tailscale up | Out-Host
} else {
  Write-Host "TAILSCALE_AUTHKEY not set and -NoLoginUI given; skipping tailscale up."
}

Write-Host "Tailscale status:"
& tailscale status | Select-Object -First 20 | Out-Host
