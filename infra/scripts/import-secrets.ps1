# Import all Nyra secrets into Infisical using the PowerShell CLI.
# Requires environment variables INFISICAL_TOKEN and INFISICAL_PROJECT_ID to be set.
param (
    [string]$Env = $Env:INFISICAL_ENVIRONMENT
)

if (-not $env:INFISICAL_TOKEN -or -not $env:INFISICAL_PROJECT_ID) {
    Write-Error "You must set INFISICAL_TOKEN and INFISICAL_PROJECT_ID before running this script."
    exit 1
}

if (-not $Env) { $Env = "development" }

# Helper function for import
function Import-Secrets {
    param(
        [string]$Path,
        [string]$File
    )
    Write-Host "Importing secrets from $File to $Path" -ForegroundColor Cyan
    infisical secrets upload --project-id $env:INFISICAL_PROJECT_ID --env $Env --path $Path --file $File
}

# Import master secrets
Import-Secrets -Path "/nyra/shared" -File "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\..\envs\.env.master-infisical"

# Import orchestrator
Import-Secrets -Path "/nyra/orchestrator" -File "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\..\envs\.env.orchestrator"

# Import workers
$workers = @("worker-rtx3060", "worker-rtx3090", "worker-rtx5090")
foreach ($worker in $workers) {
    Import-Secrets -Path "/nyra/$worker" -File "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\..\envs\.env.$worker"
}

