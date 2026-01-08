param([string]$FilePath)
if (-not $FilePath) { Write-Error "No file path"; exit 1 }
$timestamp = Get-Date -Format "yyyy-MM-dd"
$rel = $FilePath
$dest = Join-Path ("archive\{0}-repo-cleanup" -f $timestamp) $rel
$destDir = Split-Path -Parent $dest
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
if (Test-Path $FilePath) { Copy-Item -Path $FilePath -Destination $dest -Force -ErrorAction SilentlyContinue }
Write-Output "Backup saved: $dest"
