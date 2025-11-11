Param(
  [int]$ManagerPort = $env:MANAGER_PORT -as [int]
)
if (-not $ManagerPort) { $ManagerPort = 3001 }
Start-Process "http://localhost:$ManagerPort/dashboard"
