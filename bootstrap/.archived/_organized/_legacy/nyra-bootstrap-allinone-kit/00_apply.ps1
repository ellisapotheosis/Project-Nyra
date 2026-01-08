$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Write-Host "[Nyra] Applying bootstrap payload to repo root: $RepoRoot"
python (Join-Path $PSScriptRoot "nyra_apply.py")
Write-Host "[Nyra] Apply complete. Run ./bootstrap/verify_kit.ps1 next."
