\
param(
  [string]$RepoRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
Write-Host "🐾 Nyra bootstrap (Windows → WSL) repo: $RepoRoot"

if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
  throw "wsl.exe not found. Install WSL2 first."
}

$wslPath = wsl.exe wslpath -a "$RepoRoot"
if (-not $wslPath) { throw "Failed to resolve WSL path for repo root." }

wsl.exe -e bash -lc "cd '$wslPath' && bash ./infra/scripts/bootstrap.sh"
