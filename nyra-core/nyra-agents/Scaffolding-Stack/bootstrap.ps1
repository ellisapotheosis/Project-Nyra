<# 
NYRA-Orch Bootstrap (Rye + Orchestrator + FastMCP + Chroma)
- Ensures Git/Node (best-effort), Rye (via pipx), Python 3.11+
- rye sync to install deps
- Starts FastMCP (stdio)
- Seeds tasks
- Launches orchestrator to spawn DeepCode per-task
#>

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Ensure-Tool($name, $wingetId) {
  if (Get-Command $name -ErrorAction SilentlyContinue) { return }
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    try { winget install --id $wingetId -e --silent --accept-package-agreements --accept-source-agreements } catch {}
  } else {
    Write-Warning "winget not found; please install $name manually"
  }
}

Write-Host "[+] Checking core tools (best-effort)..."
Ensure-Tool git "Git.Git"
Ensure-Tool node "OpenJS.NodeJS.LTS"

# Ensure pipx (for Rye install) ----------------------------------------
if (-not (Get-Command pipx -ErrorAction SilentlyContinue)) {
  Write-Host "[+] Installing pipx (Python launcher for apps)"
  py -m pip install --user pipx
  py -m pipx ensurepath
}

# Ensure Rye ------------------------------------------------------------
if (-not (Get-Command rye -ErrorAction SilentlyContinue)) {
  Write-Host "[+] Installing Rye via pipx"
  pipx install rye
}

Write-Host "[+] rye sync (this may take a minute)..."
rye sync

# Create .env if missing -----------------------------------------------
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }

# Seed tasks ------------------------------------------------------------
Write-Host "[+] Seeding demo tasks for orchestrator..."
rye run deepcode-seed

# Start FastMCP (stdio) ------------------------------------------------
Write-Host "[+] Launching FastMCP server (stdio)..."
Start-Process -WindowStyle Minimized powershell -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-Command","cd `"$Root`"; rye run mcp") | Out-Null
Start-Sleep -Seconds 2

# Start orchestrator (spawns DeepCode instances per-task) --------------
Write-Host "[+] Launching orchestrator..."
rye run archon

Write-Host "`n[✓] Bootstrap initiated. Watch the console for orchestrator logs."
Write-Host "DeepCode UIs will appear on ports starting at DEEPCODE_BASE_PORT."
Write-Host "Chroma memory is local at: .\memory\chroma"
