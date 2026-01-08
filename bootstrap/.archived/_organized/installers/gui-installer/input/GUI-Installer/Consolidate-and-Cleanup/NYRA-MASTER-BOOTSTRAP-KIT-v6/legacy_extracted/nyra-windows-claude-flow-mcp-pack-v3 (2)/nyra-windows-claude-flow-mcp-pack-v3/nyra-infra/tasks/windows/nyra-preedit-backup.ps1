param([string]$FilePath)
if(-not $FilePath){exit 1}
$ts=Get-Date -Format "yyyy-MM-dd"
$dest=Join-Path ("archive\{0}-repo-cleanup" -f $ts) $FilePath
$dir=Split-Path -Parent $dest
New-Item -ItemType Directory -Force -Path $dir|Out-Null
if(Test-Path $FilePath){Copy-Item $FilePath $dest -Force}
Write-Output "Backup: $dest"
