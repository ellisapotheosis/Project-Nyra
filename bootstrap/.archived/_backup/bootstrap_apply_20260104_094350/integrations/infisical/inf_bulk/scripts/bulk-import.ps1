\
param(
  [Parameter(Mandatory=$true)][ValidateSet("dev","staging","prod")] [string]$Env,
  [string]$ImportsFile = (Join-Path $PSScriptRoot "..\imports.json")
)

$ErrorActionPreference = "Stop"

function Say($m) { Write-Host $m }

if (-not (Test-Path $ImportsFile)) {
  throw "Imports file not found: $ImportsFile"
}

# Speed: reduce CLI chatter
$env:INFISICAL_DISABLE_UPDATE_CHECK = "true"

$imports = Get-Content $ImportsFile -Raw | ConvertFrom-Json

Say "🚀 Bulk importing secrets into Infisical for env=$Env"
Say "Using mapping: $ImportsFile"
Say ""

foreach ($item in $imports) {
  if ($item.env -ne $Env) { continue }

  $path = $item.path
  $file = Join-Path (Join-Path $PSScriptRoot "..") $item.file

  if (-not (Test-Path $file)) {
    Say "⚠️  Skipping missing file: $file"
    continue
  }

  Say "→ infisical secrets set --env $Env --path `"$path`" --file `"$file`""
  & infisical secrets set --env $Env --path $path --file $file --silent | Out-Host
  Say "✅ Imported: $file -> $path"
  Say ""
}

Say "Done."
