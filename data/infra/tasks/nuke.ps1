param (
    [switch]$RemoveVolumes,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$composeFile = "$PSScriptRoot/../compose/compose.all.yml"
$envFile = "$PSScriptRoot/../.env"
$envFileLocal = "$PSScriptRoot/../.env.local"

Write-Host "CAUTION: This will stop and remove all Nyra containers" -ForegroundColor Red
if ($RemoveVolumes) {
    Write-Host "WARNING: This will also REMOVE ALL DATA VOLUMES!" -ForegroundColor Red -BackgroundColor Yellow
}

if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to proceed? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Green
        exit 0
    }
}

# First stop all containers with the compose file
Write-Host "`nStopping all Nyra containers..." -ForegroundColor Yellow

# Build the docker compose down command
$cmd = "docker compose -f `"$composeFile`""

# Add env files if they exist
if (Test-Path $envFile) {
    $cmd += " --env-file `"$envFile`""
}

if (Test-Path $envFileLocal) {
    $cmd += " --env-file `"$envFileLocal`""
}

# Add profile for all
$cmd += " --profile all down"

# Add volume removal if specified
if ($RemoveVolumes) {
    $cmd += " -v"
}

Write-Host "`nRunning command:" -ForegroundColor Green
Write-Host "  $cmd" -ForegroundColor Gray

# Execute the command
try {
    Invoke-Expression $cmd
}
catch {
    Write-Host "Error stopping containers: $_" -ForegroundColor Red
}

# Remove any other containers with nyra label (belt and suspenders)
Write-Host "`nRemoving any remaining Nyra containers..." -ForegroundColor Yellow
$containers = docker ps -a --filter "name=nyra-" --format "{{.Names}}"
if ($containers) {
    foreach ($container in $containers -split "`n") {
        if ($container) {
            Write-Host "Removing container: $container" -ForegroundColor Gray
            docker rm -f $container 2>$null
        }
    }
}

# Remove the network if it exists
Write-Host "`nRemoving Nyra network..." -ForegroundColor Yellow
docker network rm nyra-network 2>$null

# Clean up dangling images
Write-Host "`nCleaning up dangling images..." -ForegroundColor Yellow
docker image prune -f

Write-Host "`nNuke operation completed." -ForegroundColor Green
if ($RemoveVolumes) {
    Write-Host "All containers and volumes have been removed." -ForegroundColor Green
}
else {
    Write-Host "All containers have been removed. Volumes are still intact." -ForegroundColor Green
}