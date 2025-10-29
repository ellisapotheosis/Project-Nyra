param (
    [switch]$All,
    [switch]$MetaMCP,
    [switch]$Memory,
    [switch]$UI,
    [switch]$Orchestration,
    [switch]$Detached
)

$ErrorActionPreference = "Stop"
$composeFile = "$PSScriptRoot/../compose/compose.all.yml"
$envFile = "$PSScriptRoot/../.env"
$envFileLocal = "$PSScriptRoot/../.env.local"

Write-Host "Starting Nyra Infrastructure..." -ForegroundColor Cyan

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

# If no profiles specified, use metamcp and memory as default
if ($profiles.Count -eq 0) {
    $profiles += "metamcp"
    $profiles += "memory"
    Write-Host "No profiles specified, defaulting to MetaMCP and Memory" -ForegroundColor Yellow
}

# Build the docker compose command
$cmd = "docker compose -f `"$composeFile`""

# Add env files if they exist
if (Test-Path $envFile) {
    $cmd += " --env-file `"$envFile`""
}
else {
    Write-Host "Warning: .env file not found at $envFile" -ForegroundColor Yellow
}

if (Test-Path $envFileLocal) {
    $cmd += " --env-file `"$envFileLocal`""
}

# Add profiles
foreach ($profile in $profiles) {
    $cmd += " --profile $profile"
}

# Add up command
$cmd += " up"

# Add detached mode if specified
if ($Detached) {
    $cmd += " -d"
}

# Display what's being started
Write-Host "`nStarting with profiles:" -ForegroundColor Green
foreach ($profile in $profiles) {
    Write-Host "  - $profile" -ForegroundColor White
}

Write-Host "`nRunning command:" -ForegroundColor Green
Write-Host "  $cmd" -ForegroundColor Gray

# Execute the command
try {
    Invoke-Expression $cmd
}
catch {
    Write-Host "Error starting containers: $_" -ForegroundColor Red
    exit 1
}