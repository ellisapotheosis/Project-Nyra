param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Command
)

if (-not $env:INFISICAL_PROJECT_ID) {
  Write-Error "INFISICAL_PROJECT_ID is required. Do not hardcode secrets."
  exit 1
}

$environment = if ($env:INFISICAL_ENVIRONMENT) { $env:INFISICAL_ENVIRONMENT } else { "prod" }
$path = if ($env:INFISICAL_PATH) { $env:INFISICAL_PATH } else { "/" }

infisical run --projectId $env:INFISICAL_PROJECT_ID --env $environment --path $path -- @Command

