param(
  [ValidateSet('auto','orchestrator','worker-rtx3060','worker-rtx3090ti','worker-rtx5090')]
  [string]$MachineRole = 'auto',
  [switch]$EnableAIReviewer,
  [switch]$EnableActionsRunner,
  [switch]$EnableInfisicalAgent,
  [switch]$EnableInfisicalServer,
  [switch]$Force,
  [switch]$DryRun
)

$canonicalScript = Join-Path $PSScriptRoot "scripts/setup/bootstrap-gitea.ps1"
if (!(Test-Path $canonicalScript)) {
  throw "Missing canonical bootstrap script: $canonicalScript"
}

& $canonicalScript @PSBoundParameters
