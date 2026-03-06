param(
  [Parameter(Mandatory=$true)][string]$Owner,
  [Parameter(Mandatory=$true)][string]$Repo,
  [string]$GiteaBaseUrl = "http://localhost:3100",
  [string]$WebhookUrl = "http://gitea-ai-reviewer:8080/webhook/gitea"
)

$ErrorActionPreference = 'Stop'

function Read-VolSecret([string]$name){
  $cmd = "if [ -f '/run/nyra-secrets/$name' ]; then cat '/run/nyra-secrets/$name'; fi"
  (docker run --rm -v nyra-secrets:/run/nyra-secrets alpine:3.20 sh -lc $cmd).Trim()
}

$pat = Read-VolSecret "gitea_pat_token"
if ([string]::IsNullOrWhiteSpace($pat)) {
  throw "Missing gitea_pat_token in nyra-secrets."
}

$authToken = Read-VolSecret "webhook_auth_token"
$secret = Read-VolSecret "webhook_secret"

$body = @{
  active = $true
  type = "gitea"
  events = @("pull_request")
  authorization_header = ("Bearer " + $authToken)
  config = @{
    url = $WebhookUrl
    content_type = "json"
    secret = $secret
  }
} | ConvertTo-Json -Depth 6

$uri = "$($GiteaBaseUrl.TrimEnd('/'))/api/v1/repos/$Owner/$Repo/hooks"
$r = Invoke-RestMethod -Method Post -Uri $uri -Headers @{ Authorization = "token $pat" } -ContentType "application/json" -Body $body
Write-Host "Created hook id: $($r.id)"
