$ErrorActionPreference = "Stop"
function Ensure-Choco {
  if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
  }
}
Ensure-Choco
if (!(Get-Command git -ErrorAction SilentlyContinue)) { choco install -y git }
if (!(Get-Command node -ErrorAction SilentlyContinue)) { choco install -y nodejs-lts }
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { choco install -y docker-desktop }
$pkgs = @("@anthropic-ai/claude-code","claude-flow@alpha","flow-nexus@latest","@anthropic-ai/claude-agent-sdk","@supabase/mcp-server-supabase@latest")
foreach ($p in $pkgs) { try { npm install -g $p } catch { Write-Warning "Failed: $p => $($_.Exception.Message)" } }
$extras = @("ruv-swarm@latest","ruv-nexus-flow@latest","agentic-flow@latest","agentdb@latest","roo@latest","codebooster@latest","agentbooster@latest")
foreach ($p in $extras) { try { npm install -g $p } catch { Write-Warning "Optional failed: $p" } }
Write-Host "`nNext:"
Write-Host " 1) Create nyra-infra\.env with APP_URL=http://localhost:12008"
Write-Host " 2) docker network create nyra-network"
Write-Host " 3) docker compose -f nyra-infra\compose\compose.core.yml --env-file nyra-infra\.env up -d"
Write-Host " 4) npx claude-flow@alpha init --force"
