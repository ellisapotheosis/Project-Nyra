<#
.SYNOPSIS
  One-shot Archon MCP bootstrap for Windows (per LAN PC).

.DESCRIPTION
  - Clones Archon MCP from GitHub
  - Installs Node dependencies
  - Generates a basic config pointing at Claude Flow as primary orchestrator
  - Leaves env values to be provided by Infisical (no hardcoded secrets)
#>

param(
  [string]$InstallRoot = "C:\Dev\ArchonMCP",
  [string]$RepoUrl = "https://github.com/archon-mcp/archon-mcp.git"
)

Write-Host "🚀 Archon MCP bootstrap starting..." -ForegroundColor Cyan

if (-not (Test-Path $InstallRoot)) {
  New-Item -ItemType Directory -Path $InstallRoot | Out-Null
}

Set-Location $InstallRoot

if (-not (Test-Path "$InstallRoot\.git")) {
  git clone $RepoUrl . || throw "Failed to clone Archon MCP repo."
} else {
  Write-Host "Repo already present, pulling latest..." -ForegroundColor Yellow
  git pull
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Please install Node 20+ and re-run." -ForegroundColor Red
  exit 1
}

npm install

$configDir = Join-Path $InstallRoot ".archon"
if (-not (Test-Path $configDir)) {
  New-Item -ItemType Directory -Path $configDir | Out-Null
}

$configPath = Join-Path $configDir "archon.config.json"
$config = @{
  orchestrator = @{
    role = "secondary"
    primary = "claude-flow"
  }
  mcp = @{
    enableServerManagement = $true
    autoDiscover = $true
  }
  routing = @{
    strategy = "capability-based"
  }
  env = @{
    # All of these should be injected via Infisical on each LAN PC
    CLAUDE_FLOW_API_KEY = "$env:CLAUDE_FLOW_API_KEY"
    ANTHROPIC_API_KEY   = "$env:ANTHROPIC_API_KEY"
    OPENAI_API_KEY      = "$env:OPENAI_API_KEY"
  }
}

$config | ConvertTo-Json -Depth 6 | Set-Content -Path $configPath -Encoding UTF8

Write-Host "✅ Archon MCP installed at $InstallRoot" -ForegroundColor Green
Write-Host "Config written to $configPath" -ForegroundColor Green
Write-Host "Remember: bind secrets via Infisical on this host." -ForegroundColor Yellow