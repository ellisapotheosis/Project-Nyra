param (
    [string]$Service = "",
    [switch]$Follow,
    [int]$Lines = 100,
    [switch]$All,
    [switch]$MetaMCP,
    [switch]$Memory,
    [switch]$UI,
    [switch]$Orchestration
)

$ErrorActionPreference = "Stop"
$composeFile = "$PSScriptRoot/../compose/compose.all.yml"
$envFile = "$PSScriptRoot/../.env"
$envFileLocal = "$PSScriptRoot/../.env.local"

# Determine which profiles to use
$profiles = @()
if ($All) {
    $profiles += "all"
}
else {
    if ($MetaMCP) {
        $profiles += "metamcp"
    }
    if ($Memory) {
        $profiles += "memory"
    }
    if ($UI) {
        $profiles += "ui"
    }
    if ($Orchestration) {
        $profiles += "orchestration"
    }
}

# If no profiles specified and no specific service, default to all
if ($profiles.Count -eq 0 -and $Service -eq "") {
    $profiles += "all"
    Write-Host "No profiles or service specified, showing logs for all services" -ForegroundColor Yellow
}

# Build the docker compose command
$cmd = "docker compose -f `"$composeFile`""

# Add env files if they exist
if (Test-Path $envFile) {
    $cmd += " --env-file `"$envFile`""
}

if (Test-Path $envFileLocal) {
    $cmd += " --env-file `"$envFileLocal`""
}

# Add profiles
foreach ($profile in $profiles) {
    $cmd += " --profile $profile"
}

# Add logs command
$cmd += " logs"

# Add follow flag if specified
if ($Follow) {
    $cmd += " -f"
}

# Add number of lines to show
$cmd += " --tail=$Lines"

# Add specific service if provided
if ($Service -ne "") {
    $cmd += " $Service"
    Write-Host "Showing logs for service: $Service" -ForegroundColor Cyan
}
else {
    if ($profiles.Count -gt 0) {
        Write-Host "Showing logs for profiles: $($profiles -join ', ')" -ForegroundColor Cyan
    }
}

Write-Host "`nRunning command:" -ForegroundColor Green
Write-Host "  $cmd" -ForegroundColor Gray

# Execute the command
try {
    Invoke-Expression $cmd
}
catch {
    Write-Host "Error getting logs: $_" -ForegroundColor Red
    exit 1
}