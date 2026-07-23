$ErrorActionPreference = "Stop"

if (-not $env:AGENT_VAULT_ADDR) { throw "Set AGENT_VAULT_ADDR" }
if (-not $env:AGENT_VAULT_TOKEN) { throw "Set AGENT_VAULT_TOKEN" }
if (-not $env:AGENT_VAULT_VAULT) { $env:AGENT_VAULT_VAULT = "nyra-llm" }

if (-not (Get-Command agent-vault -ErrorAction SilentlyContinue)) {
  Write-Host "Install agent-vault CLI first:" -ForegroundColor Red
  Write-Host "  curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fsSL https://get.agent-vault.dev | sh"
  exit 1
}

& agent-vault run -- codex @args
