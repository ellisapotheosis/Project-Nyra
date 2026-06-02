# Setup X: Drive Mapping from worker-rtx3090ti (100.64.0.13)
# Run as Administrator in PowerShell

param(
    [string]$Server = "100.64.0.13",
    [string]$ShareName = "x",
    [string]$DriveLetter = "X",
    [string]$Username = "edane",
    [string]$Password = "1th7aa6ch8oA1!!!!!!",
    [int]$DelaySeconds = 30
)

$ErrorActionPreference = "Stop"

Write-Host "[*] Waiting $DelaySeconds seconds for Tailscale to initialize..."
Start-Sleep -Seconds $DelaySeconds

Write-Host "[*] Testing connectivity to $Server..."
$ping = Test-Connection -ComputerName $Server -Count 1 -Quiet
if (-not $ping) {
    Write-Host "[!] ERROR: Cannot reach $Server" -ForegroundColor Red
    exit 1
}

Write-Host "[+] $Server is reachable"

Write-Host "[*] Cleaning up existing $($DriveLetter): mapping..."
net use "$($DriveLetter):" /delete /y 2>&1 | Out-Null

Write-Host "[*] Storing credentials in Windows Credential Manager..."
cmdkey /add:$Server /user:$Username /pass:"$Password" 2>&1 | Out-Null

Write-Host "[*] Mapping $($DriveLetter): to \\$Server\$ShareName..."
$result = net use "$($DriveLetter):" "\\$Server\$ShareName" /persistent:yes 2>&1

if ($result -match "successfully") {
    Write-Host "[+] SUCCESS: $($DriveLetter): drive is now mapped" -ForegroundColor Green
    Write-Host "[+] Mapping: \\$Server\$ShareName -> $($DriveLetter):"
    Get-PSDrive | Where-Object { $_.Name -eq $DriveLetter }
} else {
    Write-Host "[!] ERROR: Failed to map drive" -ForegroundColor Red
    Write-Host $result
    exit 1
}

# Create scheduled task
Write-Host "`n[*] Creating Windows Scheduled Task..."

$taskName = "Mount X Drive from worker-rtx3090ti"
$taskPath = "\Nyra\"

# Remove existing task if present
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create task action
$scriptContent = @"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command {
    `$server = '$Server'
    `$share = '$ShareName'
    `$drive = '$DriveLetter'
    `$user = '$Username'
    `$pass = '$Password'

    Start-Sleep -Seconds 30

    if (Test-Connection `$server -Count 1 -Quiet) {
        net use `$drive /delete /y 2>null
        cmdkey /add:`$server /user:`$user /pass:`$pass 2>null
        net use `$drive "\\`$server\`$share" /persistent:yes
    }
}
"@

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$scriptContent`""

# Create trigger for logon
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Create principal (run as current user)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

# Register the task
Register-ScheduledTask -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null

Write-Host "[+] Task created: '$taskName'" -ForegroundColor Green
Write-Host "[+] Task will run at each logon and map $($DriveLetter): automatically"
Write-Host "`n[✓] Setup complete! Reboot to test persistence."
