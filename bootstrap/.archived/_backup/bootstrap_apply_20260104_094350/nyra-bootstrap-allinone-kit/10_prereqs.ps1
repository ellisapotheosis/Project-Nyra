$ErrorActionPreference = "Stop"
Write-Host "[Nyra] Checking prerequisites..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git missing" }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "docker missing" }
Write-Host "[Nyra] OK"
