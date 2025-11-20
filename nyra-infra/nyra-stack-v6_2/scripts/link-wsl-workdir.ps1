param([string]$Distro="Ubuntu",[string]$Target="/home/$env:USERNAME/nyra",[string]$WindowsPath="C:\\Dev\\nyra-v6_2")
$unc="\\wsl$\\$Distro$($Target -replace '/','\\')"
Start-Process explorer.exe $unc
Write-Host "Create a Windows symlink if desired:"
Write-Host "mklink /D \"$WindowsPath\" \"$unc\""
