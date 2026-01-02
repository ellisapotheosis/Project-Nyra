# restore_nyramcp.ps1
[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Dev\Tools\MCP-Servers\FileSystemMCP",
  [int]$HealthPort = 8000,
  [int]$NgrokHostPort = 4040
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Wait-Url($u, $min=3){
  $deadline=(Get-Date).AddMinutes($min)
  while((Get-Date) -lt $deadline){
    try{ $r=Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 5; if($r.StatusCode -eq 200){ return $true } }catch{}
    Start-Sleep -Milliseconds 600
  }
  return $false
}

$root = $ProjectRoot
$health = "http://127.0.0.1:$HealthPort/"
$ngrokStatus = "http://127.0.0.1:$NgrokHostPort/status"
$ngrokApi    = "http://127.0.0.1:$NgrokHostPort/api/tunnels"
Push-Location $root
try {
  docker compose up -d --build | Out-Null
} finally { Pop-Location }

if(-not (Wait-Url $health)){ throw "FileSystemMCP not healthy on :$HealthPort" }
if(-not (Wait-Url $ngrokStatus)){ throw "ngrok admin not healthy on :$NgrokHostPort" }

$tunnels = Invoke-RestMethod $ngrokApi
$pub = $tunnels.tunnels | ? { $_.public_url -like 'https://*' } | select -First 1 -ExpandProperty public_url
if(-not $pub){ throw "No https tunnel found on $ngrokApi" }

$connectorUrl = "$pub/mcp"
$desc = @"
FileSystemMCP (filesystem tools). HTTPS MCP endpoint for ChatGPT Developer Mode. No Auth expected.
"@.Trim()
$Form = Join-Path $root 'CONNECTOR_CREATE_FORM.txt'
@"
Name:
Nyra Filesystem (NyraFS)

Description:
$desc

Connector URL:
$connectorUrl

Authentication:
No Auth
"@ | Set-Content -Encoding UTF8 -LiteralPath $Form

Write-Host "FileSystemMCP is up."
Write-Host "Public MCP endpoint: $connectorUrl"
Write-Host "Paste EXACTLY from: $Form"
