[CmdletBinding()]
param(
  [string[]]$Files = @(".\nyra-infra\nyra-stack-v6_2\secrets\example.shared.env"),
  [string[]]$Paths = @("/shared"),
  [string]$ProjectId = $env:INFISICAL_PROJECT_ID,
  [string]$Env = $(if($env:INFISICAL_ENV){$env:INFISICAL_ENV}else{"dev"}),
  [string]$ApiUrl = $(if($env:INFISICAL_API_URL){$env:INFISICAL_API_URL}else{"https://app.infisical.com"}),
  [string]$ClientId = $env:INFISICAL_UNIVERSAL_AUTH_CLIENT_ID,
  [string]$ClientSecret = $env:INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
)
$ErrorActionPreference="Stop"
function Need($n,$v){ if(-not $v){ throw "Missing $n" } }
Need "INFISICAL_PROJECT_ID" $ProjectId
Need "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" $ClientId
Need "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" $ClientSecret

$token = (infisical login --method=universal-auth --client-id=$ClientId --client-secret=$ClientSecret --silent --plain) 2>$null
if(-not $token){ throw "Infisical login failed" }
$env:INFISICAL_TOKEN=$token
$env:INFISICAL_API_URL=$ApiUrl

function Parse-Dotenv($path){
  $map=@{}
  Get-Content $path | ForEach-Object {
    if($_ -match '^\s*#') { return }
    if($_ -match '^\s*$') { return }
    $kv = $_ -split '=',2
    if($kv.Length -eq 2){ $map[$kv[0].Trim()]=$kv[1].Trim() }
  }
  return $map
}
foreach($f in $Files){
  if(!(Test-Path $f)){ Write-Warning "Missing $f"; continue }
  $vars = Parse-Dotenv $f
  foreach($p in $Paths){
    Write-Host "Uploading $f → $p ($Env)" -ForegroundColor Cyan
    foreach($k in $vars.Keys){
      $v=$vars[$k]
      cmd /c "infisical secrets set --projectId=$ProjectId --env=$Env --path=$p $k=$v" | Out-Null
    }
  }
}
Write-Host "Infisical upload complete." -ForegroundColor Green
