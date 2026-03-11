param([switch]$Public,[string]$EndpointName="openwebui-api")
$ErrorActionPreference="Stop"
$envPath = Join-Path $PSScriptRoot "..\env\.env"
if(!(Test-Path $envPath)){ Copy-Item (Join-Path $PSScriptRoot "..\env\.env.example") $envPath -Force }

$seven = (Get-Command 7z -ErrorAction SilentlyContinue)
if($seven){
  Get-ChildItem (Join-Path $PSScriptRoot "..\integrations") -Recurse -Filter *.7z -ErrorAction SilentlyContinue | ForEach-Object {
    & 7z x $_.FullName -o$($_.DirectoryName) -y | Out-Null
  }
}

Push-Location (Join-Path $PSScriptRoot "..\orchestrator")
$profiles = "--profile orchestration --profile ui --profile secrets"
if($Public){ $profiles += " --profile edge" }
cmd /c "docker compose --env-file ..\env\.env -f docker-compose.yml $profiles up -d"
Pop-Location

$files = Get-ChildItem (Join-Path $PSScriptRoot "..\integrations") -Recurse -Include docker-compose*.yml -ErrorAction SilentlyContinue
foreach($f in $files){
  Push-Location $f.Directory
  cmd /c "docker compose --env-file ..\..\env\.env -f $($f.Name) up -d"
  Pop-Location
}

& (Join-Path $PSScriptRoot "metamcp_preseed.ps1") -BaseUrl "http://localhost:12008" -EndpointName $EndpointName
& (Join-Path $PSScriptRoot "register_owui_toolserver.ps1") -OWUI "http://localhost:3000" -EndpointBase "http://localhost:12008/metamcp/openwebui-api/api"
Write-Host "NYRA v6.2 started." -ForegroundColor Green
