# Backward-compatible wrapper.
# Canonical implementation moved to scripts/power-orchestration/Invoke-WorkerPower.ps1

[CmdletBinding()]
param(
    [ValidateSet('worker-rtx3060', 'worker-rtx3090ti', 'worker-rtx5090', 'all')]
    [string]$Target = 'all',

    [ValidateSet('wake', 'status', 'shutdown', 'sleep')]
    [string]$Action = 'status',

    [int]$TimeoutMinutes = 10,

    [switch]$AsJson
)

$mappedAction = if ($Action -eq 'shutdown') { 'sleep' } else { $Action }
$scriptPath = Join-Path $PSScriptRoot 'power-orchestration/Invoke-WorkerPower.ps1'

& $scriptPath -Action $mappedAction -Target $Target -WaitTimeoutSeconds ($TimeoutMinutes * 60) -AsJson:$AsJson
exit $LASTEXITCODE
