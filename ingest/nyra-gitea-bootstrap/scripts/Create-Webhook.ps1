<#
Creates/updates a repo webhook that points to the ai-reviewer container.
Requires: GITEA_TOKEN in .env.gitea
#>
param(
  [Parameter(Mandatory=$true)][string]$Owner,
  [Parameter(Mandatory=$true)][string]$Repo,
  [string]$EnvFile = ".env.gitea"
)

function Read-Env($path) {
  $map = @{}
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*$') { return }
    $kv = $_.Split('=',2)
    if ($kv.Count -eq 2) { $map[$kv[0]] = $kv[1] }
  }
  return $map
}

$env = Read-Env $EnvFile
$baseUrl = $env["GITEA_ROOT_URL"].TrimEnd('/')
$token = $env["GITEA_TOKEN"]
$secret = $env["WEBHOOK_SECRET"]
$auth = $env["WEBHOOK_AUTH_TOKEN"]

if (-not $token -or $token -like "REPLACE_*") { throw "GITEA_TOKEN missing in $EnvFile" }

$api = "$baseUrl/api/v1/repos/$Owner/$Repo/hooks"

$payload = @{
  active = $true
  type = "gitea"
  events = @("pull_request")
  authorization_header = "Bearer $auth"
  config = @{
    url = "http://gitea-ai-reviewer:8080/webhook/gitea"
    content_type = "json"
    secret = $secret
  }
} | ConvertTo-Json -Depth 8

$headers = @{ Authorization = "token $token"; "Content-Type"="application/json"; Accept="application/json" }

Write-Host "Creating webhook on $Owner/$Repo → ai-reviewer ..."
$r = Invoke-RestMethod -Method Post -Uri $api -Headers $headers -Body $payload
$r | ConvertTo-Json -Depth 6
