
param(
  [string]$RepoUrl = "https://github.com/ellisapotheosis/project-nyra.git",
  [string]$Dest = "C:\Dev\Projects\Repos\Project-Nyra"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Have-Command($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

$parent = Split-Path -Parent $Dest
New-Item -ItemType Directory -Force -Path $parent | Out-Null

if (-not (Have-Command "git")) {
  Write-Host "git not found. Installing Git via winget..."
  if (Have-Command "winget") {
    winget install -e --id Git.Git --silent --accept-package-agreements --accept-source-agreements
  } else {
    throw "winget not available. Install Git manually."
  }
}

if (Test-Path (Join-Path $Dest ".git")) {
  Write-Host "Repo exists. Pulling latest..."
  Push-Location $Dest
  git pull --rebase
  Pop-Location
} else {
  Write-Host "Cloning repo to $Dest ..."
  git clone $RepoUrl $Dest
}

Write-Host "Repo ready: $Dest"
