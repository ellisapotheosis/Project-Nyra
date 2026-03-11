# setup_wsl_windows.ps1
#
# Prepare a Windows machine for Project Nyra by enabling WSL2,
# installing Ubuntu 22.04, Docker Desktop, NVIDIA drivers, and
# Tailscale.  Run this script in an elevated PowerShell session.

Write-Host "Enabling WSL and Virtual Machine Platform features…" -ForegroundColor Cyan
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart -ErrorAction Stop
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart -ErrorAction Stop

Write-Host "Installing Ubuntu 22.04 from Microsoft Store…" -ForegroundColor Cyan
winget install -e --id Canonical.Ubuntu22.04 --source msstore --accept-package-agreements --accept-source-agreements

Write-Host "Installing Docker Desktop…" -ForegroundColor Cyan
winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements

Write-Host "Enabling WSL integration in Docker Desktop (manual step)…" -ForegroundColor Yellow
Write-Host "After Docker Desktop installs, open Settings > Resources > WSL Integration and enable your Ubuntu distro."

Write-Host "Installing NVIDIA GPU drivers (Game Ready/Studio)…" -ForegroundColor Cyan
Start-Process "https://www.nvidia.com/Download/index.aspx" -UseNewWindow
Write-Host "Please download and install the latest driver for your GPU, then return here."
Pause

Write-Host "Installing Tailscale…" -ForegroundColor Cyan
winget install -e --id TailscaleInc.Tailscale --accept-package-agreements --accept-source-agreements

Write-Host "Done!  Please reboot your machine to finish WSL2 installation." -ForegroundColor Green