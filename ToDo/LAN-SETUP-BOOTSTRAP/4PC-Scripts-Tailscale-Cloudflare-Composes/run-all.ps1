
# Project Nyra: Warp & Gemini bootstrap (Windows PowerShell). Run from repo root.
$ErrorActionPreference = "Stop"

function Ensure-Choco {
  if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
  }
}

Write-Host "==> Checking prerequisites"
Ensure-Choco
if (!(Get-Command git -ErrorAction SilentlyContinue)) { choco install -y git }
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { choco install -y docker-desktop }

Write-Host "==> Ensuring Node.js >= 20"
if (!(Get-Command node -ErrorAction SilentlyContinue)) { choco install -y nodejs-lts }

Write-Host "==> Installing global CLIs (Gemini CLI, Gemini Flow, Claude Code)"
npm install -g @google/gemini-cli @clduab11/gemini-flow @anthropic-ai/claude-code

Write-Host "==> Installing uv (Python)"
python -m pip install -U uv

Write-Host "==> Rust/Cargo (Codanna)"
if (!(Get-Command cargo -ErrorAction SilentlyContinue)) {
  choco install -y rust
}
cargo install codanna --locked

Write-Host "==> Creating ~/.gemini/settings.json with MCP servers"
$geminiDir = Join-Path $HOME ".gemini"
New-Item -ItemType Directory -Force -Path $geminiDir | Out-Null
@'
{
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["-y","@modelcontextprotocol/server-filesystem"] },
    "serena": { "command": "uvx", "args": ["--from","git+https://github.com/oraios/serena","serena","start-mcp-server"] },
    "codanna": { "command": "codanna", "args": ["serve","--watch"] },
    "playwright": { "command": "npx", "args": ["-y","@microsoft/mcp-server-playwright"] }
  },
  "context": { "include": ["README.md", "README-SETUP.md", "nyra.flow.yaml"] }
}
'@ | Set-Content -Path (Join-Path $geminiDir "settings.json")

Write-Host "==> Setting default MODE and .env"
bash scripts/nyra-mode.sh cheap-gemini

Write-Host "==> Starting provider router (LiteLLM) & MCPO"
docker compose -f docker/litellm/docker-compose.yml up -d
docker compose -f docker/mcpo/docker-compose.yml up -d

Write-Host "`nNEXT STEPS:"
Write-Host "1) Authenticate Gemini CLI: run 'gemini' and complete login (Google OAuth)"
Write-Host "   Or set GOOGLE_API_KEY + GOOGLE_GENAI_USE_VERTEXAI=true for Vertex; or GEMINI_API_KEY for AI Studio."
Write-Host "2) Test: gemini -p 'Summarize this repo structure'"
Write-Host "3) Optional: gemini-flow --help"
