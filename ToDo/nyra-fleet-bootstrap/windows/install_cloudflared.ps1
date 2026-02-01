
param(
  [string]$TunnelToken = $env:CLOUDFLARED_TUNNEL_TOKEN
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Have-Command($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

if (-not (Have-Command "cloudflared")) {
  Write-Host "Installing cloudflared..."
  if (Have-Command "winget") {
    winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements
  } else {
    throw "winget not found. Install cloudflared from Cloudflare docs."
  }
}

Write-Host "cloudflared version:"
& cloudflared version | Out-Host

if ($TunnelToken) {
  Write-Host "Installing cloudflared service with tunnel token (best effort)."
  try {
    & cloudflared service install $TunnelToken | Out-Host
  } catch {
    Write-Warning "Service install with token failed. You can still run: cloudflared tunnel run --token <TOKEN>."
  }
} else {
  Write-Host "CLOUDFLARED_TUNNEL_TOKEN not set; skipping token step."
}
