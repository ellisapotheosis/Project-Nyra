Param([switch]$Recreate)
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ../compose
if ($Recreate) { docker network rm nyra 2>$null | Out-Null }
docker network create nyra 2>$null | Out-Null
$files = @('compose.base.yml','compose.nyra-stack.yml','compose.metatool.yml','compose.mcp.yml','compose.mcp.services.yml')
$compose = $files | ForEach-Object { '-f ' + $_ }
$cmd = 'docker compose ' + ($compose -join ' ') + ' up -d'
Write-Host $cmd
Invoke-Expression $cmd
