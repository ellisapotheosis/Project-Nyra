Param(
  [string]$Env = 'dev'
)
$ErrorActionPreference = 'Stop'
$composeEnv = Join-Path $PSScriptRoot '..\compose\env'
if (-not (Test-Path $composeEnv)) { New-Item -ItemType Directory -Force -Path $composeEnv | Out-Null }
$dest = Join-Path $composeEnv 'merged.env'
# Requires Infisical CLI installed and logged in
infisical export --env $Env --format dotenv > $dest
Write-Host "Wrote $dest"
