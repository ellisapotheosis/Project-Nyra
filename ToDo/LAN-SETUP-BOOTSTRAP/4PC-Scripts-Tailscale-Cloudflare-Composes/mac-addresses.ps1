# Add to: bootstrap/.env.template
# Create: bootstrap/get-mac-addresses.ps1
Write-Host "Run this on each worker PC to get MAC address:"
Write-Host ""
Write-Host "Command: ipconfig /all | Select-String 'Physical Address'"
Write-Host ""
Write-Host "Then update .env file with XX-XX-XX-XX-XX-XX format"