# Nyra Memory Stack Installer (Windows 11)
param([switch]$WithModels)
$ErrorActionPreference = "Stop"
$root = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent | Split-Path -Parent
docker compose -f "$root\deployment\docker-compose.memory.yml" up -d
if ($WithModels) { docker compose -f "$root\deployment\docker-compose.model.yml" up -d }
Start-Sleep -Seconds 4
Write-Host "Qdrant:            http://localhost:6333"
Write-Host "Neo4j (Browser):   http://localhost:7474"
Write-Host "Graphiti MCP SSE:  http://localhost:7459/sse"
Write-Host "OpenMemory UI/API: http://localhost:3000   /   http://localhost:8765/docs"
Write-Host "MetaMCP UI:        http://localhost:12008"
