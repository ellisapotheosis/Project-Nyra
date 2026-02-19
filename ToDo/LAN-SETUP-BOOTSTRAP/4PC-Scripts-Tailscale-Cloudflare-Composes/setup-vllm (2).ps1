<#
.SYNOPSIS
    Bootstraps a vLLM worker node on an RTX5090 for Project Nyra.
.DESCRIPTION
    Installs WSL and Docker if necessary, mirrors the repository, and launches a vLLM server via docker-compose.
    The model and max context length are read from your .env file (VLLM_MODEL and VLLM_MAX_MODEL_LEN).  Run
    this script from the root of the `nyra-orchestration` repository on Windows.
#>
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
    wsl -d Ubuntu -- bash -c "sudo apt-get update && sudo apt-get install -y docker.io docker-compose"
    wsl -d Ubuntu -- bash -c "sudo usermod -aG docker $(whoami)"
}

function Launch-vLLM {
    Write-Host "Launching vLLM via docker-compose..."
    wsl -d Ubuntu -- bash -lc "cd ~/nyra-orchestration && docker compose -f deploy/compose/nyra.vllm.yml up -d"
}

Ensure-WSL
Mirror-Repo
Install-Dependencies
Launch-vLLM

Write-Host "vLLM worker is ready.  The OpenAI-compatible endpoint is exposed on port 8000." -ForegroundColor Green
