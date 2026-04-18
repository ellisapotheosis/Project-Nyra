Param(
  [int]$Start = ($env:PORT_RANGE_START -as [int]),
  [int]$End   = ($env:PORT_RANGE_END -as [int]),
  [string]$OutFile = "$PSScriptRoot/../compose/compose.nyra-stack.ports.yml"
)
$ErrorActionPreference = 'Stop'
if (-not $Start) { $Start = 4200 }
if (-not $End)   { $End   = 4300 }
if ($End -lt $Start) { throw 'PORT_RANGE_END must be >= PORT_RANGE_START' }
$ports = @()
for ($p = $Start; $p -le $End; $p++) { $ports += "      - '$p:$p'" }
$yml = @("version: '3.9'","services:","  nyra-stack-manager:","    ports:") + $ports
$yml -join [Environment]::NewLine | Set-Content -Encoding UTF8 $OutFile
Write-Host "Wrote $OutFile with ports $Start..$End"
