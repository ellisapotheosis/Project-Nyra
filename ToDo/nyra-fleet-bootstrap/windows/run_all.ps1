
param(
  [ValidateSet("orchestrator","worker")]
  [string]$Role = "worker",
  [string]$RepoUrl = "https://github.com/ellisapotheosis/project-nyra.git",
  [string]$RepoDest = "C:\Dev\Projects\Repos\Project-Nyra",
  [string]$InventoryRoot = "",
  [string]$TailscaleAuthKey = $env:TAILSCALE_AUTHKEY,
  [string]$CloudflaredTunnelToken = $env:CLOUDFLARED_TUNNEL_TOKEN
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== Nyra Fleet Bootstrap (Windows) ==="
Write-Host "Role: $Role"
Write-Host "Repo: $RepoUrl -> $RepoDest"

& (Join-Path $PSScriptRoot "setup_repo.ps1") -RepoUrl $RepoUrl -Dest $RepoDest
& (Join-Path $PSScriptRoot "install_tailscale.ps1") -AuthKey $TailscaleAuthKey
& (Join-Path $PSScriptRoot "install_cloudflared.ps1") -TunnelToken $CloudflaredTunnelToken
& (Join-Path $PSScriptRoot "collect_inventory.ps1") -Role $Role -InventoryRoot $InventoryRoot

Write-Host "Done."
