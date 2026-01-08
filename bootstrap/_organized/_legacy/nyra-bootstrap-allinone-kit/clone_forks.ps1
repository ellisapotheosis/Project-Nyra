$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git not found. Install Git for Windows and re-run."
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Vendor = Join-Path $RepoRoot "services\vendor"
New-Item -ItemType Directory -Force -Path $Vendor | Out-Null

function Clone-Or-Pull($Url, $Dest) {
  if (Test-Path $Dest) {
    Write-Host "[Nyra] Updating: $Dest"
    git -C $Dest pull
  } else {
    Write-Host "[Nyra] Cloning: $Url -> $Dest"
    git clone $Url $Dest
  }
}

Clone-Or-Pull "https://github.com/ellisapotheosis/claude-flow" (Join-Path $Vendor "claude-flow")
Clone-Or-Pull "https://github.com/ellisapotheosis/archon" (Join-Path $Vendor "archon")

Write-Host "[Nyra] Forks ready under services/vendor/"
