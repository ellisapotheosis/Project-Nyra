param()

$ErrorActionPreference = 'Stop'

function Cat-VolFile([string]$path){
  docker run --rm -v nyra-secrets:/run/nyra-secrets alpine:3.20 sh -lc "if [ -f '$path' ]; then cat '$path'; fi"
}

Write-Host "nyra-secrets volume contents (selected):"
$keys = @(
  "gitea_db_pass",
  "gitea_admin_pass",
  "webhook_auth_token",
  "webhook_secret",
  "gitea_pat_token",
  "openai_api_key",
  "gitea_runner_token"
)
foreach ($k in $keys) {
  $v = (Cat-VolFile "/run/nyra-secrets/$k").Trim()
  if ($v.Length -gt 0) {
    $prefix = if ($v.Length -gt 8) { $v.Substring(0,8) + "..." } else { $v }
    Write-Host ("{0}={1}" -f $k, $prefix)
  } else {
    Write-Host ("{0}=(empty)" -f $k)
  }
}
