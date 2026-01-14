\
param(
  [Parameter(Mandatory=$true)][ValidateSet("dev","staging","prod")] [string]$Env,
  [string]$Root = (Join-Path $PSScriptRoot "..\envtree"),
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$env:INFISICAL_DISABLE_UPDATE_CHECK = "true"

function Say($m) { Write-Host $m }

$envRoot = Join-Path $Root $Env
if (-not (Test-Path $envRoot)) { throw "Env root not found: $envRoot" }

Say "🚀 Bulk importing env=$Env from: $envRoot"
Say "DryRun=$DryRun"
Say ""

$files = Get-ChildItem -Path $envRoot -Recurse -File | Where-Object {
  $_.Extension -in @(".env", ".txt", ".dotenv")
}

if ($files.Count -eq 0) {
  Say "No env files found under $envRoot"
  exit 0
}

foreach ($f in $files) {
  $rel = $f.FullName.Substring($envRoot.Length).TrimStart("\","/")
  $relNoExt = [System.IO.Path]::ChangeExtension($rel, $null)
  $infPath = "/" + ($relNoExt -replace "\\", "/")

  if ($infPath.EndsWith("/index")) {
    $infPath = $infPath.Substring(0, $infPath.Length - "/index".Length)
    if ($infPath -eq "") { $infPath = "/" }
  }

  Say "→ $($f.FullName)"
  Say "   env=$Env path=$infPath"

  if (-not $DryRun) {
    & infisical secrets set --env $Env --path $infPath --file $f.FullName --silent | Out-Host
    Say "✅ Imported"
  } else {
    Say "🧪 DryRun: skipped import"
  }

  Say ""
}

Say "Done."
