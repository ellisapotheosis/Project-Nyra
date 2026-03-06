param(
  [ValidateSet('auto','orchestrator','worker-rtx3060','worker-rtx3090ti','worker-rtx5090')]
  [string]$MachineRole = 'auto',
  [switch]$EnableAIReviewer,
  [switch]$EnableActionsRunner,
  [switch]$EnableInfisicalAgent,
  [switch]$EnableInfisicalServer,
  [switch]$Force,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Log([string]$msg, [ValidateSet('INFO','WARN','ERR','OK')][string]$lvl='INFO'){
  $c = @{INFO='Cyan';WARN='Yellow';ERR='Red';OK='Green'}[$lvl]
  $ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  Write-Host "[$ts][$lvl] $msg" -ForegroundColor $c
}

function Ensure-FileFromTemplate([string]$template, [string]$dest){
  if (!(Test-Path $template)) { throw "Missing template: $template" }
  if ((Test-Path $dest) -and -not $Force) { return }
  if ($DryRun) { Log "[DRYRUN] Would write $dest from $template" 'INFO'; return }
  Copy-Item -Force $template $dest
  Log "Wrote $dest" 'OK'
}

function Ensure-Docker(){
  try { docker --version | Out-Null } catch { throw "Docker not found. Install Docker Desktop." }
  try { docker compose version | Out-Null } catch { throw "Docker Compose not found (docker compose)." }
}

function Ensure-Network([string]$name){
  $existing = docker network ls --format "{{.Name}}" | Select-String -SimpleMatch $name -Quiet
  if ($existing) { Log "Docker network exists: $name" 'OK'; return }
  if ($DryRun) { Log "[DRYRUN] Would create network: $name" 'INFO'; return }
  docker network create $name | Out-Null
  Log "Created network: $name" 'OK'
}

function Detect-Role([string]$role){
  if ($role -ne 'auto') { return $role }

  $hostname = $env:COMPUTERNAME
  if ([string]::IsNullOrWhiteSpace($hostname)) {
    try { $hostname = [System.Net.Dns]::GetHostName() } catch { $hostname = '' }
  }

  $hn = $hostname.ToLower()
  if ($hn -match '3060') { return 'worker-rtx3060' }
  if ($hn -match '3090') { return 'worker-rtx3090ti' }
  if ($hn -match '5090') { return 'worker-rtx5090' }
  return 'orchestrator'
}

function Compose-Up([string]$file, [string]$envFile, [string[]]$profiles){
  $args = @('-f', $file, '--env-file', $envFile)
  foreach ($p in $profiles) { $args += @('--profile', $p) }
  $args += @('up','-d')
  if ($DryRun) { Log "[DRYRUN] docker compose $($args -join ' ')" 'INFO'; return }
  & docker compose @args
}

function Print-Secrets(){
  if ($DryRun) { return }
  if (!(docker volume ls --format "{{.Name}}" | Select-String -SimpleMatch "nyra-secrets" -Quiet)) {
    Log "nyra-secrets volume not found yet." 'WARN'
    return
  }

  Log "Secrets live in Docker volume: nyra-secrets (NOT in .env files)" 'OK'

  $cmd = @"
set -eu
f(){ [ -f "$1" ] && (echo -n "$2="; head -c 6 "$1"; echo "...") || true; }
f /run/nyra-secrets/gitea_db_pass gitea_db_pass
f /run/nyra-secrets/gitea_admin_pass gitea_admin_pass
f /run/nyra-secrets/webhook_auth_token webhook_auth_token
f /run/nyra-secrets/webhook_secret webhook_secret
f /run/nyra-secrets/gitea_pat_token gitea_pat_token
f /run/nyra-secrets/openai_api_key openai_api_key
f /run/nyra-secrets/gitea_runner_token gitea_runner_token
"@

  docker run --rm -v nyra-secrets:/run/nyra-secrets alpine:3.20 sh -lc $cmd
}

Log "=== NYRA Gitea Bootstrap ===" 'INFO'
$detected = Detect-Role $MachineRole
Log "MachineRole: $detected" 'OK'

Ensure-Docker
Ensure-FileFromTemplate ".env.gitea.template" ".env.gitea"
Ensure-FileFromTemplate ".env.infisical.template" ".env.infisical"

$nyraNet = (Select-String -Path ".env.gitea" -Pattern "^NYRA_NETWORK=" -ErrorAction SilentlyContinue | ForEach-Object { $_.Line.Split('=')[1].Trim() })
if ([string]::IsNullOrWhiteSpace($nyraNet)) { $nyraNet = "nyra-net" }
Ensure-Network $nyraNet

if ($EnableInfisicalServer) {
  Log "Starting Infisical self-host stack..." 'INFO'
  Compose-Up "docker-compose.infisical.yml" ".env.infisical" @()
}

$profiles = @()
if ($EnableInfisicalAgent) { $profiles += 'infisical' }
if ($EnableAIReviewer) { $profiles += 'ai' }
if ($EnableActionsRunner) { $profiles += 'actions' }

Log "Starting Gitea stack (profiles: $($profiles -join ', '))..." 'INFO'
Compose-Up "docker-compose.gitea.yml" ".env.gitea" $profiles

if (-not $DryRun) { docker compose -f docker-compose.gitea.yml --env-file .env.gitea ps }

Log "Gitea UI: http://localhost:3100" 'OK'
Log "Gitea SSH: ssh -p 2222 git@localhost" 'OK'
Print-Secrets
