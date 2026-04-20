[CmdletBinding()]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'workers.json')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$example = Join-Path $PSScriptRoot 'workers.example.json'
if (-not (Test-Path -LiteralPath $ConfigPath)) {
    Copy-Item -LiteralPath $example -Destination $ConfigPath
    Write-Host "Created $ConfigPath from workers.example.json" -ForegroundColor Green
} else {
    Write-Host "Config already exists: $ConfigPath" -ForegroundColor Yellow
}

if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host 'WARNING: ssh is not available in PATH. Install OpenSSH client on orchestrator host.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Cyan
Write-Host "1) Edit $ConfigPath and fill MAC addresses + SSH user" -ForegroundColor White
Write-Host '2) Verify BIOS/UEFI Wake-on-LAN is enabled for each worker' -ForegroundColor White
Write-Host '3) Test status:  ./Invoke-WorkerPower.ps1 -Action status -Target all' -ForegroundColor White
Write-Host '4) Test wake:    ./Invoke-WorkerPower.ps1 -Action wake -Target worker-rtx5090' -ForegroundColor White
Write-Host '5) Test sleep:   ./Invoke-WorkerPower.ps1 -Action sleep -Target worker-rtx5090' -ForegroundColor White
