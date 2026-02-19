[CmdletBinding()]
param(
  [string]$ComposeFile = "..\orchestrator\docker-compose.yml",
  [string]$ProjectId = $env:INFISICAL_PROJECT_ID,
  [string]$Env = $(if($env:INFISICAL_ENV){$env:INFISICAL_ENV}else{"dev"}),
  [string]$PathsCsv = $(if($env:INFISICAL_FOLDER_PATHS){$env:INFISICAL_FOLDER_PATHS}else{$env:INFISICAL_FOLDER_PATH})
)
if(-not $env:INFISICAL_TOKEN){
  $env:INFISICAL_TOKEN = (infisical login --method=universal-auth --client-id=$env:INFISICAL_UNIVERSAL_AUTH_CLIENT_ID --client-secret=$env:INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET --silent --plain)
}
$paths = @()
if($PathsCsv){ $paths = $PathsCsv.Split(",") } else { $paths=@("/shared") }
foreach($p in $paths){
  $cmd = "infisical run --env=$Env --projectId=$ProjectId --path=$p -- docker compose -f $ComposeFile up -d"
  Write-Host $cmd -ForegroundColor Cyan
  cmd /c $cmd
}
