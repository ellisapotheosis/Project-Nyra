param(
  [switch]$Addons,
  [switch]$Services,
  [switch]$LocalBuild,
  [switch]$Graphiti
)

$ErrorActionPreference="Stop"
$root = Split-Path -Parent $PSScriptRoot
$stack = Join-Path $root "nyra-stack"

Set-Location $stack

$files = @("docker-compose.yml")
if ($Addons) { $files += "docker-compose.addons.yml" }
if ($Services) { $files += "docker-compose.services.yml" }
if ($LocalBuild) { $files += "docker-compose.local.yml" }
if ($Graphiti) { $files += "docker-compose.graphiti.yml" }

$cmd = @("docker","compose")
foreach ($f in $files) { $cmd += @("-f",$f) }
$cmd += @("up","-d")
if ($LocalBuild -or $Services) { $cmd += "--build" }

Write-Host ("Running: " + ($cmd -join " "))
& $cmd
