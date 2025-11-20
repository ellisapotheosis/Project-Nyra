<##
.SYNOPSIS
    Codex-friendly environment bootstrap for Project Nyra on Windows 11 (PowerShell).
.DESCRIPTION
    Installs core prerequisites for browser/VSC-based coding and headless AI automation.
    Run from an elevated prompt. Supports optional switches for devcontainer tooling and
    offline/AI automation runners.
.PARAMETER DevContainer
    Ensure Docker Desktop and VS Code Remote Containers tooling are present.
.PARAMETER AiRunner
    Optimizes for headless/CI/WSL automation (installs just enough for the stack to run).
.PARAMETER NoNode
    Skip Node.js installation (useful when Node is already managed elsewhere).
.PARAMETER NoPython
    Skip Python/uv installation.
.EXAMPLE
    ./codex-env-setup.ps1 -DevContainer
##>
param(
    [switch]$DevContainer,
    [switch]$AiRunner,
    [switch]$NoNode,
    [switch]$NoPython
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Assert-Command {
    param(
        [string]$Name,
        [string]$InstallHint
    )
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "[missing] $Name -> $InstallHint" -ForegroundColor Yellow
        return $false
    }
    return $true
}

function Ensure-Winget {
    if (Assert-Command -Name 'winget' -InstallHint 'Install App Installer from Microsoft Store, then rerun.') {
        return $true
    }
    throw 'winget is required for automated install. Install it from the Store and rerun.'
}

function Install-IfMissing {
    param(
        [string]$Command,
        [string]$WingetId,
        [string]$DisplayName,
        [switch]$SkipIfMissingWinget
    )
    if (Assert-Command -Name $Command -InstallHint "winget install $WingetId ($DisplayName)") { return }
    if ($SkipIfMissingWinget) { return }
    Ensure-Winget | Out-Null
    Write-Host "Installing $DisplayName via winget..." -ForegroundColor Cyan
    winget install --id $WingetId --source winget --accept-package-agreements --accept-source-agreements | Out-Null
}

Write-Host "[codex] Starting Project Nyra Windows bootstrap" -ForegroundColor Green

Install-IfMissing -Command git -WingetId Git.Git -DisplayName 'Git'
Install-IfMissing -Command unzip -WingetId 7zip.7zip -DisplayName '7zip' -SkipIfMissingWinget
Install-IfMissing -Command curl -WingetId Curl.Curl -DisplayName 'curl' -SkipIfMissingWinget

if (-not $NoNode) {
    Install-IfMissing -Command node -WingetId OpenJS.NodeJS.LTS -DisplayName 'Node.js LTS'
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host '[install] pnpm (global)' -ForegroundColor Cyan
        npm install -g pnpm
    }
}

if (-not $NoPython) {
    Install-IfMissing -Command python -WingetId Python.Python.3.11 -DisplayName 'Python 3.11'
    if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
        Write-Host '[install] uv (Python package manager)' -ForegroundColor Cyan
        python -m pip install --upgrade pip
        python -m pip install --user uv
    }
}

if ($DevContainer -or $AiRunner) {
    Install-IfMissing -Command docker -WingetId Docker.DockerDesktop -DisplayName 'Docker Desktop'
}

if ($DevContainer) {
    Write-Host '[devcontainer] Install VS Code + Remote Containers extension if missing' -ForegroundColor Cyan
    Install-IfMissing -Command code -WingetId Microsoft.VisualStudioCode -DisplayName 'VS Code' -SkipIfMissingWinget
    Write-Host '    -> Extension: ms-vscode-remote.remote-containers' -ForegroundColor DarkGray
    Write-Host '    -> Copy nyra-scripts/devcontainer/* into .devcontainer/ at repo root, then "Dev Containers: Reopen in Container".' -ForegroundColor DarkGray
}

if ($AiRunner) {
    Write-Host '[ai-runner] Enabling WSL optimizations' -ForegroundColor Cyan
    Write-Host '    -> Ensure "Windows Subsystem for Linux" and "Virtual Machine Platform" optional features are enabled.' -ForegroundColor DarkGray
    Write-Host '    -> Recommended distro: Ubuntu or Debian. Launch WSL and run ./nyra-scripts/codex-env-setup.sh' -ForegroundColor DarkGray
}

Write-Host "[codex] Bootstrap complete. Next: run 'uv sync' and 'pnpm install' within the repo." -ForegroundColor Green
