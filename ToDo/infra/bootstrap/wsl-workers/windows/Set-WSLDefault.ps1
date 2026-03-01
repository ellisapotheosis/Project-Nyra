param([string]$UbuntuDistro="Ubuntu-24.04")
wsl -l -v
wsl --set-default $UbuntuDistro
Write-Host "Default WSL distro set to $UbuntuDistro" -ForegroundColor Green
