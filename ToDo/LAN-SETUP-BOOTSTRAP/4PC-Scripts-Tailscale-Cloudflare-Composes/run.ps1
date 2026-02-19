# Add tunnel to Windows Startup folder (runs on boot)
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$batchFile = "C:\Users\edane\cloudflared-configs\start-tunnel.bat"

# Create shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$startupFolder\Start Cloudflared Tunnel.lnk")
$Shortcut.TargetPath = $batchFile
$Shortcut.WorkingDirectory = "C:\Users\edane\cloudflared-configs"
$Shortcut.WindowStyle = 4  # 4 = minimized
$Shortcut.Save()

Write-Host "✓ Startup shortcut created"
Write-Host "Tunnel will auto-start on next boot (minimized)"