$ErrorActionPreference = "Stop"
$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$src = Join-Path $RootDir "infra\.env.example"
$dst = Join-Path $RootDir "infra\.env"
if (-not (Test-Path $dst)) { Copy-Item $src $dst }
Write-Host "[Nyra] Created infra\.env (edit keys!)"
