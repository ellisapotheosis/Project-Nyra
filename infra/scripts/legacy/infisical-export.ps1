Param(
  [string]$Env = 'dev'
)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\..\..\..\scripts\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId
Assert-NyraInfisicalToken
$composeEnv = Join-Path $PSScriptRoot '..\compose\env'
if (-not (Test-Path $composeEnv)) { New-Item -ItemType Directory -Force -Path $composeEnv | Out-Null }
$dest = Join-Path $composeEnv 'merged.env'
infisical export --projectId $projectId --env $Env --format dotenv > $dest
Write-Host "Wrote $dest"
