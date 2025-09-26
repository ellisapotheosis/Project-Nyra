# quiet, surgical bootstrap for Claude automation
$ErrorActionPreference = 'SilentlyContinue'

# Put Rye + Scoop shims + npm user bin first so tools resolve predictably
$paths = @(
  "$HOME\.rye\shims",
  "$env:USERPROFILE\scoop\shims",
  "$env:APPDATA\npm",
  "$env:USERPROFILE\scoop\apps\nodejs-lts\current\bin"
) | Where-Object { $_ -and (Test-Path $_) }

foreach ($p in $paths) {
  if (-not (($env:PATH -split ';') -contains $p)) { $env:PATH = "$p;$env:PATH" }
}

# Optional: set working dir to project root Claude opened
if ($env:WORKSPACE_ROOT) { Set-Location $env:WORKSPACE_ROOT }

# stay silent; no banners, no prompts
