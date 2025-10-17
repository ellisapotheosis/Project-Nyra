# wire_infisical_into_nyratools.ps1
[CmdletBinding()]
param(
  [string]$NyraToolsDir = "C:\Dev\Tools\MCP-Servers\NyraTools",
  [string]$NyraRoot     = "C:\Dev\Tools\MCP-Servers\FileSystemMCP",
  [string]$GithubRoot   = "C:\Dev\Tools\MCP-Servers\GithubMCP",
  [string]$InfisicalProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
  [string]$InfisicalEnv       = "dev",
  [switch]$ConvertComposeToInterpolation  # set to enable ${VAR} rewrite for compose files
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

Ensure-Dir $NyraToolsDir

# ---- Optional: rewrite compose files to use ${VAR} placeholders (so Infisical can inject) ----
if ($ConvertComposeToInterpolation) {
  $targets = @(
    Join-Path $NyraRoot   'docker-compose.yml',
    Join-Path $GithubRoot 'docker-compose.yml'
  ) | Where-Object { Test-Path $_ }

  foreach ($compose in $targets) {
    $content = Get-Content -Raw -LiteralPath $compose

    # Standardize environment substitutions
    $repl = @{
      '^\s*-\s*MCP_API_KEY\s*=\s*.*$'      = '      - MCP_API_KEY=${MCP_API_KEY}'
      '^\s*-\s*GITHUB_TOKEN\s*=\s*.*$'     = '      - GITHUB_TOKEN=${GITHUB_TOKEN}'
      '^\s*-\s*GIT_AUTHOR_NAME\s*=\s*.*$'  = '      - GIT_AUTHOR_NAME=${GIT_AUTHOR_NAME}'
      '^\s*-\s*GIT_AUTHOR_EMAIL\s*=\s*.*$' = '      - GIT_AUTHOR_EMAIL=${GIT_AUTHOR_EMAIL}'
      '^\s*-\s*NGROK_AUTHTOKEN\s*=\s*.*$'  = '      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}'
      '^\s*-\s*NGROK_API_KEY\s*=\s*.*$'    = '      - NGROK_API_KEY=${NGROK_API_KEY}'
    }
    foreach ($k in $repl.Keys) { $content = [regex]::Replace($content, $k, $repl[$k], 'IgnoreCase, Multiline') }

    Set-Content -Encoding UTF8 -LiteralPath $compose -Value $content
    Write-Host "updated for interpolation: $compose"
  }

  Write-Host "Note: Compose will substitute \${VAR} from the environment; when you launch via Infisical, it injects those vars into the child process that runs 'docker compose up'." -ForegroundColor Yellow
}

# ---- Write Infisical-powered launchers (.bat) ----
$nyraBat = @"
@echo off
set INFISICAL_PROJECT_ID=$InfisicalProjectId
set INFISICAL_ENV=$InfisicalEnv
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File "$NyraToolsDir\mcp_manager.ps1" -Stack nyra -Action start ^
  -UseInfisical -InfisicalProjectId "%INFISICAL_PROJECT_ID%" -InfisicalEnv "%INFISICAL_ENV%"
"@
$githubBat = @"
@echo off
set INFISICAL_PROJECT_ID=$InfisicalProjectId
set INFISICAL_ENV=$InfisicalEnv
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File "$NyraToolsDir\mcp_manager.ps1" -Stack github -Action start ^
  -UseInfisical -InfisicalProjectId "%INFISICAL_PROJECT_ID%" -InfisicalEnv "%INFISICAL_ENV%"
"@
$menuBat = @"
@echo off
set INFISICAL_PROJECT_ID=$InfisicalProjectId
set INFISICAL_ENV=$InfisicalEnv
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File "$NyraToolsDir\mcp_manager.ps1" -Stack menu -Action menu ^
  -UseInfisical -InfisicalProjectId "%INFISICAL_PROJECT_ID%" -InfisicalEnv "%INFISICAL_ENV%"
"@

$nyraPath   = Join-Path $NyraToolsDir 'start_nyra_infisical.bat'
$githubPath = Join-Path $NyraToolsDir 'start_github_infisical.bat'
$menuPath   = Join-Path $NyraToolsDir 'mcp_menu_infisical.bat'

$nyraBat   | Set-Content -Encoding ASCII -LiteralPath $nyraPath
$githubBat | Set-Content -Encoding ASCII -LiteralPath $githubPath
$menuBat   | Set-Content -Encoding ASCII -LiteralPath $menuPath

Write-Host "created:" -ForegroundColor Green
Write-Host "  $nyraPath"
Write-Host "  $githubPath"
Write-Host "  $menuPath"

Write-Host "`nDouble-click any of the above to start stacks with Infisical injected."
Write-Host "Requirements: Infisical CLI installed & logged-in: 'infisical login'." -ForegroundColor Yellow
