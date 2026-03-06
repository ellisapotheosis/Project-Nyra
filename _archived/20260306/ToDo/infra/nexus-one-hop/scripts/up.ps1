$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  throw "Missing .env. Copy .env.example to .env and fill keys."
}

docker compose up -d

Write-Host "Nexus is running on http://localhost:8000"
Write-Host "OpenAI base:    /llm/openai/v1"
Write-Host "Anthropic base: /llm/anthropic"
Write-Host "MCP endpoint:   /mcp"
