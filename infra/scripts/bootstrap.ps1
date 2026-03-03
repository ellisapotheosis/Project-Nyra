$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (!(Test-Path "$root/infra/env/nyra.env")) {
  Copy-Item "$root/infra/env/nyra.env.example" "$root/infra/env/nyra.env"
  Write-Host "Created infra/env/nyra.env"
}

python "$root/infra/scripts/gen_secrets.py"
bash "$root/infra/scripts/bootstrap.sh"
