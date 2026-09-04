# Backward-compatible wrapper.
# Canonical implementation moved to scripts/power-orchestration/Invoke-WorkerPower.ps1

[CmdletBinding()]
param(
 [ValidateSet('', 'worker-rtx3090ti', 'worker-rtx5090', 'worker1', 'worker2', 'worker3', 'all')]
    [string]$Target = 'all',

    [ValidateSet('wake', 'status', 'shutdown', 'sleep', 'deploy')]
    [string]$Action = 'status',

    [int]$TimeoutMinutes = 10,

    [switch]$AsJson
)

# Support legacy worker IDs and deploy action
$workerMapping = @{
 'worker1' = ''
    'worker2'   = 'worker-rtx5090'
    'worker3'   = 'worker-rtx3090ti'
}

$finalTarget = if ($workerMapping.ContainsKey($Target)) { $workerMapping[$Target] } else { $Target }

$mappedAction = if ($Action -eq 'shutdown') { 'sleep' } elseif ($Action -eq 'deploy') {
    Write-Warning "'deploy' action requires wake and deployment logic. Merging wake into flow."
    'wake'
} else { $Action }

$scriptPath = Join-Path $PSScriptRoot 'power-orchestration/Invoke-WorkerPower.ps1'

& $scriptPath -Action $mappedAction -Target $finalTarget -WaitTimeoutSeconds ($TimeoutMinutes * 60) -AsJson:$AsJson
exit $LASTEXITCODE
