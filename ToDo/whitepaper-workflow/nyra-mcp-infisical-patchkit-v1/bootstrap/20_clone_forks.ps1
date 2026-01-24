$ErrorActionPreference = "Stop"
$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Vendor = Join-Path $RootDir "vendor"
New-Item -ItemType Directory -Force -Path $Vendor | Out-Null
Set-Location $Vendor

if (-not (Test-Path ".\claude-flow")) { git clone https://github.com/ellisapotheosis/claude-flow.git } else { Write-Host "claude-flow already exists" }
if (-not (Test-Path ".\archon")) { git clone https://github.com/ellisapotheosis/archon.git } else { Write-Host "archon already exists" }

Write-Host "[Nyra] Forks cloned into $Vendor"
