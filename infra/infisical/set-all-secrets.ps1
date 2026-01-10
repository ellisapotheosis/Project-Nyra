# ============================================================================
# Project Nyra - Infisical Secrets Setup Script
# ============================================================================
# This script sets all required secrets in Infisical for the Project Nyra
# orchestration stack. Run this once after configuring your Infisical project.
#
# Usage:
#   .\set-all-secrets.ps1 -Environment dev
#
# Prerequisites:
#   - Infisical CLI installed: npm install -g @infisical/cli
#   - Infisical logged in: infisical login
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev"
)

$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$INFISICAL_PATH = "/shared"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Project Nyra - Infisical Secrets Setup" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project ID: $INFISICAL_PROJECT_ID" -ForegroundColor Yellow
Write-Host "Path: $INFISICAL_PATH" -ForegroundColor Yellow
Write-Host ""

# Check if Infisical CLI is installed
if (-not (Get-Command "infisical" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Infisical CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g @infisical/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "CORE PROJECT SETTINGS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# Basic project configuration
Write-Host "Setting basic project configuration..." -ForegroundColor Green
infisical secrets set `
  PROJECT_NAME=project-nyra `
  PROJECT_ENV=production `
  NODE_ENV=production `
  LOG_LEVEL=info `
  DEBUG=false `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DATABASE CREDENTIALS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# PostgreSQL
$POSTGRES_PASSWORD = Read-Host "Enter PostgreSQL password" -AsSecureString
$POSTGRES_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($POSTGRES_PASSWORD))

Write-Host "Setting PostgreSQL credentials..." -ForegroundColor Green
infisical secrets set `
  POSTGRES_USER=nyra `
  POSTGRES_PASSWORD=$POSTGRES_PASSWORD_PLAIN `
  POSTGRES_DB=nyra_production `
  POSTGRES_HOST=localhost `
  POSTGRES_PORT=5432 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

# Database names for services
Write-Host "Setting service database names..." -ForegroundColor Green
infisical secrets set `
  LETTA_DB_NAME=letta `
  TWENTY_DB_NAME=twenty `
  DIFY_DB_NAME=dify `
  N8N_DB_NAME=n8n `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "REDIS & CACHE CREDENTIALS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$REDIS_PASSWORD = Read-Host "Enter Redis password" -AsSecureString
$REDIS_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($REDIS_PASSWORD))

Write-Host "Setting Redis credentials..." -ForegroundColor Green
infisical secrets set `
  REDIS_PASSWORD=$REDIS_PASSWORD_PLAIN `
  REDIS_HOST=localhost `
  REDIS_PORT=6379 `
  REDIS_DB=0 `
  REDIS_MAX_MEMORY=4GB `
  REDIS_EVICTION_POLICY=allkeys-lru `
  REDIS_URL=redis://:$REDIS_PASSWORD_PLAIN@redis:6379 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "FALKORDB & GRAPH DATABASE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$FALKORDB_PASSWORD = Read-Host "Enter FalkorDB password" -AsSecureString
$FALKORDB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($FALKORDB_PASSWORD))

Write-Host "Setting FalkorDB credentials..." -ForegroundColor Green
infisical secrets set `
  FALKORDB_PASSWORD=$FALKORDB_PASSWORD_PLAIN `
  FALKORDB_PORT=6380 `
  FALKORDB_AOF_SYNC=everysec `
  FALKORDB_MAX_MEMORY=2GB `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "QDRANT VECTOR DATABASE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$QDRANT_API_KEY = Read-Host "Enter Qdrant API key (leave empty for none)" -AsSecureString
$QDRANT_API_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($QDRANT_API_KEY))

if ($QDRANT_API_KEY_PLAIN) {
    Write-Host "Setting Qdrant credentials..." -ForegroundColor Green
    infisical secrets set `
      QDRANT_API_KEY=$QDRANT_API_KEY_PLAIN `
      QDRANT_PORT=6333 `
      --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"
} else {
    Write-Host "Setting Qdrant without API key..." -ForegroundColor Green
    infisical secrets set `
      QDRANT_PORT=6333 `
      --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "AI MODEL API KEYS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$ANTHROPIC_API_KEY = Read-Host "Enter Anthropic API key" -AsSecureString
$ANTHROPIC_API_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ANTHROPIC_API_KEY))

Write-Host "Setting Anthropic API key..." -ForegroundColor Green
infisical secrets set `
  ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_PLAIN `
  ANTHROPIC_MODEL=claude-sonnet-4-20250514 `
  ANTHROPIC_MAX_TOKENS=4096 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

$OPENROUTER_API_KEY = Read-Host "Enter OpenRouter API key" -AsSecureString
$OPENROUTER_API_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($OPENROUTER_API_KEY))

Write-Host "Setting OpenRouter API key..." -ForegroundColor Green
infisical secrets set `
  OPENROUTER_API_KEY=$OPENROUTER_API_KEY_PLAIN `
  OPENROUTER_BASE_URL=https://openrouter.ai/api/v1 `
  OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-r1 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "LETTA MEMORY SYSTEM" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$LETTA_SERVER_PASSWORD = Read-Host "Enter Letta server password" -AsSecureString
$LETTA_SERVER_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($LETTA_SERVER_PASSWORD))

$LETTA_DB_PASSWORD = Read-Host "Enter Letta database password" -AsSecureString
$LETTA_DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($LETTA_DB_PASSWORD))

Write-Host "Setting Letta credentials..." -ForegroundColor Green
infisical secrets set `
  LETTA_SERVER_PASSWORD=$LETTA_SERVER_PASSWORD_PLAIN `
  LETTA_DB_PASSWORD=$LETTA_DB_PASSWORD_PLAIN `
  LETTA_POSTGRES_URI=postgresql://letta:$LETTA_DB_PASSWORD_PLAIN@postgresql:5432/letta `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "CLAUDE FLOW ORCHESTRATION" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

Write-Host "Setting Claude Flow configuration..." -ForegroundColor Green
infisical secrets set `
  CLAUDE_FLOW_PORT=9000 `
  CLAUDE_FLOW_MODE=orchestrator `
  CLAUDE_FLOW_TELEMETRY_ENABLED=true `
  CLAUDE_FLOW_PERFORMANCE_MODE=optimized `
  CLAUDE_FLOW_AUTO_COMMIT=true `
  CLAUDE_FLOW_HOOKS_ENABLED=true `
  CLAUDE_FLOW_NEURAL_OPTIMIZATION=true `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

# Database URL for Claude Flow
Write-Host "Setting database URLs..." -ForegroundColor Green
infisical secrets set `
  DATABASE_URL=postgresql://nyra:$POSTGRES_PASSWORD_PLAIN@postgresql:5432/nyra_production `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "ARCHON OS AGENT SYSTEM" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

Write-Host "Setting Archon OS configuration..." -ForegroundColor Green
infisical secrets set `
  ARCHON_PORT=9001 `
  ARCHON_MCP_PORT=3333 `
  ARCHON_TOPOLOGY=hierarchical `
  ARCHON_MAX_DEPTH=5 `
  ARCHON_PARALLEL_BRANCHES=true `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "NEXUS ROUTER & MODEL ROUTING" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

Write-Host "Setting Nexus Router configuration..." -ForegroundColor Green
infisical secrets set `
  NEXUS_ROUTER_PORT=8000 `
  NEXUS_ROUTER_MCP_PORT=4001 `
  MODEL_ROUTING_STRATEGY=cost-optimized `
  MODEL_ROUTING_PREFER_LOCAL=true `
  MODEL_ROUTING_FALLBACK_CLOUD=true `
  MODEL_ROUTING_COST_THRESHOLD=0.10 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

# GPU Worker URLs (these should be your actual Tailscale URLs)
Write-Host "Setting GPU worker URLs..." -ForegroundColor Green
infisical secrets set `
  WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434 `
  WORKER_5090_MODELS=deepseek-r1:236b-q4_K_M,qwen2.5:72b-instruct-q8_0 `
  WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434 `
  WORKER_3090_MODELS=llama3.1:70b-instruct-q4_K_M,mistral-large:123b-instruct-2407-q4_K_M `
  WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434 `
  WORKER_3060_MODELS=codellama:34b-instruct-q8_0,qwen2.5:32b-instruct-q8_0 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "GITHUB INTEGRATION (Optional)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$GITHUB_TOKEN = Read-Host "Enter GitHub Personal Access Token (leave empty to skip)" -AsSecureString
$GITHUB_TOKEN_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GITHUB_TOKEN))

if ($GITHUB_TOKEN_PLAIN) {
    $GITHUB_OWNER = Read-Host "Enter GitHub username/organization"

    Write-Host "Setting GitHub integration..." -ForegroundColor Green
    infisical secrets set `
      GITHUB_TOKEN=$GITHUB_TOKEN_PLAIN `
      GITHUB_REPO=Project-Nyra `
      GITHUB_OWNER=$GITHUB_OWNER `
      --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"
} else {
    Write-Host "Skipping GitHub integration..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "MCP SERVER URLS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

Write-Host "Setting MCP server URLs..." -ForegroundColor Green
infisical secrets set `
  CLAUDE_FLOW_MCP_URL=http://claude-flow:9000/mcp `
  ARCHON_MCP_URL=http://archon-os:9001/mcp `
  INFISICAL_MCP_URL=http://infisical-mcp:4002 `
  BITWARDEN_MCP_URL=http://bitwarden-mcp:4003 `
  --env=$Environment --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "SUCCESS! All secrets have been set in Infisical" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify secrets: infisical secrets get --env=$Environment --path=$INFISICAL_PATH" -ForegroundColor Cyan
Write-Host "2. Start services: cd ..\docker && .\start-all.ps1 -Environment $Environment" -ForegroundColor Cyan
Write-Host "3. Check health: curl http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation: docs/deployment/QUICK-START.md" -ForegroundColor Yellow
