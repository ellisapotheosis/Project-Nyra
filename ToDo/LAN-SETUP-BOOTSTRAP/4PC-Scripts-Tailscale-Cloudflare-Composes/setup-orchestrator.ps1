<#
.SYNOPSIS
    Bootstraps the Nyra orchestrator on a Windows machine using WSL2.
.DESCRIPTION
    This script installs WSL2 (Ubuntu) if necessary, mirrors the current repository into your WSL home,
    installs Docker and basic packages, and launches the orchestrator compose stack.  Run this script from
    the root of the `nyra-orchestration` repository on Windows.
.PARAMETER Profiles
    A comma‑separated list of compose profiles to enable (e.g. "ui,mcp,security,router,orchestrator,extras").
    Defaults to all orchestrator profiles.
#>
param(
    [string]$Profiles = "ui,mcp,security,router,orchestrator,extras"
)

function Ensure-WSL {
    # Enable WSL and install Ubuntu if not present
    try { wsl --status | Out-Null } catch {
        Write-Host "Installing WSL and Ubuntu..." -ForegroundColor Yellow
        wsl --install -d Ubuntu
    }
}

function Mirror-Repo {
    # Mirror the repo into WSL for faster file access
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot  = Resolve-Path (Join-Path $scriptDir "..")
    Write-Host "Mirroring repository into WSL..."
    # Use wslpath to convert Windows path to Linux path
    $wslSource = wslpath -u $repoRoot
    $wslTarget = "/home/$env:USERNAME/nyra-orchestration"
    wsl -d Ubuntu -- bash -c "rm -rf $wslTarget && mkdir -p $wslTarget && cp -r $wslSource/* $wslTarget"
}

function Install-Dependencies {
    Write-Host "Installing dependencies inside WSL..."
    wsl -d Ubuntu -- bash -c "sudo apt-get update && sudo apt-get install -y docker.io docker-compose npm nodejs python3-pip"
    # Add user to docker group
    wsl -d Ubuntu -- bash -c "sudo usermod -aG docker $(whoami)"
}

function Launch-Compose {
    param([string]$Profiles)
    Write-Host "Launching orchestrator compose stack with profiles: $Profiles"
    $profileArgs = $Profiles.Split(',') | ForEach-Object { "--profile $_" } | Join-String " "
    wsl -d Ubuntu -- bash -lc "cd ~/nyra-orchestration && docker compose -f deploy/compose/nyra.orchestrator.yml $profileArgs up -d"
}

# Main script
Ensure-WSL
Mirror-Repo
Install-Dependencies
Launch-Compose -Profiles $Profiles

Write-Host "\nYour orchestrator is starting.  Access Open WebUI at http://localhost:$env:OWUI_PORT once services are up." -ForegroundColor Green
