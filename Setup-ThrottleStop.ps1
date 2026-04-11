# -----------------------------------------------------------------------------
# 🚀 PROJECT NYRA: THROTTLESTOP STARTUP SETUP
# -----------------------------------------------------------------------------
# This script sets up ThrottleStop to start automatically at Windows logon 
# with the highest privileges, ensuring it can bypass UAC prompts.
# -----------------------------------------------------------------------------

$TaskName = "ThrottleStop_Startup"
$ThrottleStopPath = "C:\Users\edane\OneDrive\Documents\ThrottleStop_9.7.3\ThrottleStop.exe"
$Description = "Starts ThrottleStop automatically at logon with admin privileges."

Write-Host "Setting up ThrottleStop Task Scheduler task..." -ForegroundColor Cyan

# Check if the file exists from the Windows perspective
if (!(Test-Path $ThrottleStopPath)) {
    Write-Warning "ThrottleStop.exe not found at $ThrottleStopPath"
    Write-Host "Please ensure the path is correct and try again."
    exit 1
}

# Define the action (start the program)
# Using -WorkingDirectory is important for some apps to find their config files
$Action = New-ScheduledTaskAction -Execute $ThrottleStopPath -WorkingDirectory (Split-Path $ThrottleStopPath)

# Define the trigger (at logon of any user or current user)
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Define the principal (run as the current user with highest privileges)
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest

# Define the settings (don't stop on battery, etc.)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0

# Register (or overwrite) the task
Write-Host "Registering task: $TaskName" -ForegroundColor Yellow
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "✅ ThrottleStop has been successfully configured to start with Windows." -ForegroundColor Green
    Write-Host "You can find it in Task Scheduler under the name: $TaskName" -ForegroundColor Gray
} else {
    Write-Error "Failed to register the scheduled task."
    exit 1
}
