param(
  [switch]$Addons,
  [switch]$Services,
  [switch]$LocalBuild,
  [switch]$letta
)

$ErrorActionPreference="Stop"
$root = Split-Path -Parent $PSScriptRoot
$stack = Join-Path $root "nyra-stack"

Set-Location $stack

$files = @("docker-compose.yml")
if ($Addons) { $files += "docker-compose.addons.yml" }
if ($Services) { $files += "docker-compose.services.yml" }
if ($LocalBuild) { $files += "docker-compose.local.yml" }
if ($letta) { $files += "docker-compose.letta.yml" }

$cmd = @("docker","compose")
foreach ($f in $files) { $cmd += @("-f",$f) }
$cmd += @("up","-d")
if ($LocalBuild -or $Services) { $cmd += "--build" }

Write-Host ("Running: " + ($cmd -join " "))
& $cmd
