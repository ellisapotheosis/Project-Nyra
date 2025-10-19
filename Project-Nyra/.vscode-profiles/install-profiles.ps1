param(
  [ValidateSet("Default-AllAround","Default-Light","AI-Stack")]
  [string]$ProfileName = "Default-AllAround"
)
$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$extFile = Join-Path $dir "$ProfileName.extensions.txt"
if (!(Test-Path $extFile)) { Write-Error "Extensions file not found: $extFile"; exit 1 }
Get-Content $extFile | ForEach-Object {
  $ext = $_.Trim()
  if ($ext -and ($ext -notmatch "^#")) {
    Write-Host "Installing $ext"
    code --install-extension $ext --force
  }
}
Write-Host "Done. In VS Code: Profiles -> Import from file -> pick $ProfileName.code-profile"