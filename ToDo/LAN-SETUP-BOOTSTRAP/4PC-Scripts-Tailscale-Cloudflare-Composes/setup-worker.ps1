<#
.SYNOPSIS
    Bootstraps a GPU worker node for Project Nyra.
.DESCRIPTION
    Installs WSL and Docker if necessary, mirrors the current repository into your WSL home,
    launches the Ollama container via docker-compose, and optionally pulls default models.  Run this script
    from the root of the `nyra-orchestration` repository on Windows.
#>
param(
    [switch]$SeedModels
)

function Ensure-WSL {
    try { wsl --status | Out-Null } catch {
        Write-Host "Installing WSL and Ubuntu..." -ForegroundColor Yellow
        wsl --install -d Ubuntu
    }
}

function Mirror-Repo {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot  = Resolve-Path (Join-Path $scriptDir "..")
    Write-Host "Mirroring repository into WSL..."
    $wslSource = wslpath -u $repoRoot
    $wslTarget = "/home/$env:USERNAME/nyra-orchestration"
    wsl -d Ubuntu -- bash -c "rm -rf $wslTarget && mkdir -p $wslTarget && cp -r $wslSource/* $wslTarget"
}

function Install-Dependencies {
    Write-Host "Installing dependencies inside WSL..."
    wsl -d Ubuntu -- bash -c "sudo apt-get update && sudo apt-get install -y docker.io docker-compose curl"
    wsl -d Ubuntu -- bash -c "sudo usermod -aG docker $(whoami)"
}

function Launch-Ollama {
    Write-Host "Launching Ollama via docker-compose..."
    wsl -d Ubuntu -- bash -lc "cd ~/nyra-orchestration && docker compose -f deploy/compose/nyra.worker.yml up -d"
}

function Seed-Models {
    Write-Host "Seeding default models into Ollama..."
    wsl -d Ubuntu -- bash -lc "sleep 5 && curl -fsS http://localhost:11434/api/pull -d '{"name":"qwen2.5:7b-instruct"}' && curl -fsS http://localhost:11434/api/pull -d '{"name":"nomic-embed-text"}'"
}

Ensure-WSL
Mirror-Repo
Install-Dependencies
Launch-Ollama
if ($SeedModels) { Seed-Models }

Write-Host "GPU worker is ready.  Ollama listens on port 11434." -ForegroundColor Green
