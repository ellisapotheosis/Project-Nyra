param([string]$Distro="Ubuntu",[string]$Target="/home/$env:USERNAME/nyra")
$src = Split-Path -Parent $PSScriptRoot
$tar = Join-Path $env:TEMP "nyra_v6_2.tar"
tar -C $src -cf $tar .
wsl -d $Distro -- bash -lc "mkdir -p $Target && tar -C $Target -xf /mnt/c/Windows/Temp/nyra_v6_2.tar"
Start-Process explorer.exe "\\wsl$\$Distro$($Target -replace '/','\\')"
