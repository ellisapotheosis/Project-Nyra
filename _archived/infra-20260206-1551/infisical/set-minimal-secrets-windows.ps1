# ============================================================================
# Project Nyra - Minimal Infisical Secrets Setup (Windows PowerShell)
# ============================================================================
# Sets only the 7 CRITICAL secrets needed to start the system.
# These secrets are stored in Infisical cloud and will be accessible
# from your Linux orchestrator when you run services there.
#
# Usage:
#   .\set-minimal-secrets-windows.ps1 -Environment dev
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

$PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$PATH_PREFIX = "/shared"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Project Nyra - Minimal Secrets Setup (7 secrets only)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "Path: $PATH_PREFIX" -ForegroundColor Yellow
Write-Host ""
Write-Host "These secrets will be stored in Infisical cloud and accessible" -ForegroundColor Green
Write-Host "from your Linux orchestrator when you deploy services there." -ForegroundColor Green
Write-Host ""

# Check if Infisical CLI is installed
if (-not (Get-Command "infisical" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Infisical CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g @infisical/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Enter Database Passwords" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Get passwords securely
$POSTGRES_PASSWORD = Read-Host "PostgreSQL password (32+ chars recommended)" -AsSecureString
$POSTGRES_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($POSTGRES_PASSWORD))

$REDIS_PASSWORD = Read-Host "Redis password (32+ chars recommended)" -AsSecureString
$REDIS_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($REDIS_PASSWORD))

$FALKORDB_PASSWORD = Read-Host "FalkorDB password (32+ chars recommended)" -AsSecureString
$FALKORDB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($FALKORDB_PASSWORD))

$LETTA_SERVER_PASSWORD = Read-Host "Letta server password (32+ chars recommended)" -AsSecureString
$LETTA_SERVER_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($LETTA_SERVER_PASSWORD))

$LETTA_DB_PASSWORD = Read-Host "Letta database password (32+ chars recommended)" -AsSecureString
$LETTA_DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($LETTA_DB_PASSWORD))

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "STEP 2: Enter API Keys" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Get Anthropic API key from: https://console.anthropic.com/settings/keys" -ForegroundColor Yellow
Write-Host "Get OpenRouter API key from: https://openrouter.ai/keys" -ForegroundColor Yellow
Write-Host ""

$ANTHROPIC_API_KEY = Read-Host "Anthropic API key (sk-ant-...)"
$OPENROUTER_API_KEY = Read-Host "OpenRouter API key (sk-or-...)"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "STEP 3: Setting secrets in Infisical cloud..." -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Set all minimal secrets + essential configuration in one command
$result = infisical secrets set `
  POSTGRES_USER=nyra `
  POSTGRES_PASSWORD=$POSTGRES_PASSWORD_PLAIN `
  POSTGRES_DB=nyra_production `
  POSTGRES_HOST=localhost `
  POSTGRES_PORT=5432 `
  LETTA_DB_NAME=letta `
  TWENTY_DB_NAME=twenty `
  DIFY_DB_NAME=dify `
  N8N_DB_NAME=n8n `
  REDIS_PASSWORD=$REDIS_PASSWORD_PLAIN `
  REDIS_HOST=localhost `
  REDIS_PORT=6379 `
  REDIS_URL="redis://:$REDIS_PASSWORD_PLAIN@redis:6379" `
  REDIS_MAX_MEMORY=4GB `
  REDIS_EVICTION_POLICY=allkeys-lru `
  FALKORDB_PASSWORD=$FALKORDB_PASSWORD_PLAIN `
  FALKORDB_PORT=6380 `
  FALKORDB_AOF_SYNC=everysec `
  FALKORDB_MAX_MEMORY=2GB `
  QDRANT_PORT=6333 `
  ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY `
  ANTHROPIC_MODEL=claude-sonnet-4-20250514 `
  ANTHROPIC_MAX_TOKENS=4096 `
  OPENROUTER_API_KEY=$OPENROUTER_API_KEY `
  OPENROUTER_BASE_URL=https://openrouter.ai/api/v1 `
  OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-r1 `
  LETTA_SERVER_PASSWORD=$LETTA_SERVER_PASSWORD_PLAIN `
  LETTA_DB_PASSWORD=$LETTA_DB_PASSWORD_PLAIN `
  LETTA_POSTGRES_URI="postgresql://letta:$LETTA_DB_PASSWORD_PLAIN@postgresql:5432/letta" `
  DATABASE_URL="postgresql://nyra:$POSTGRES_PASSWORD_PLAIN@postgresql:5432/nyra_production" `
  CLAUDE_FLOW_PORT=9000 `
  CLAUDE_FLOW_MODE=orchestrator `
  CLAUDE_FLOW_TELEMETRY_ENABLED=true `
  CLAUDE_FLOW_PERFORMANCE_MODE=optimized `
  CLAUDE_FLOW_AUTO_COMMIT=true `
  CLAUDE_FLOW_HOOKS_ENABLED=true `
  CLAUDE_FLOW_NEURAL_OPTIMIZATION=true `
  ARCHON_PORT=9001 `
  ARCHON_MCP_PORT=3333 `
  ARCHON_TOPOLOGY=hierarchical `
  ARCHON_MAX_DEPTH=5 `
  ARCHON_PARALLEL_BRANCHES=true `
  NEXUS_ROUTER_PORT=8000 `
  NEXUS_ROUTER_MCP_PORT=4001 `
  MODEL_ROUTING_STRATEGY=cost-optimized `
  MODEL_ROUTING_PREFER_LOCAL=true `
  MODEL_ROUTING_FALLBACK_CLOUD=true `
  MODEL_ROUTING_COST_THRESHOLD=0.10 `
  WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434 `
  WORKER_5090_MODELS=deepseek-r1:236b-q4_K_M,qwen2.5:72b-instruct-q8_0 `
  WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434 `
  WORKER_3090_MODELS=llama3.1:70b-instruct-q4_K_M,mistral-large:123b-instruct-2407-q4_K_M `
  WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434 `
  WORKER_3060_MODELS=codellama:34b-instruct-q8_0,qwen2.5:32b-instruct-q8_0 `
  CLAUDE_FLOW_MCP_URL=http://claude-flow:9000/mcp `
  ARCHON_MCP_URL=http://archon-os:9001/mcp `
  INFISICAL_MCP_URL=http://infisical-mcp:4002 `
  BITWARDEN_MCP_URL=http://bitwarden-mcp:4003 `
  NODE_ENV=production `
  PROJECT_NAME=project-nyra `
  --env=$Environment --path=$PATH_PREFIX --projectId=$PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "SUCCESS! Minimal secrets configured in Infisical cloud" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "These secrets are now available for your Linux orchestrator!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Verify: infisical secrets get POSTGRES_PASSWORD --env=$Environment --path=$PATH_PREFIX" -ForegroundColor Cyan
    Write-Host "2. On Linux orchestrator: cd infra/docker && ./start-all.sh" -ForegroundColor Cyan
    Write-Host "3. Check health: curl http://localhost:8000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can continue development on this Windows PC now!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to set secrets" -ForegroundColor Red
    Write-Host "Please check your Infisical connection and try again" -ForegroundColor Yellow
    exit 1
}

# Clear sensitive variables
Remove-Variable POSTGRES_PASSWORD_PLAIN
Remove-Variable REDIS_PASSWORD_PLAIN
Remove-Variable FALKORDB_PASSWORD_PLAIN
Remove-Variable LETTA_SERVER_PASSWORD_PLAIN
Remove-Variable LETTA_DB_PASSWORD_PLAIN
Remove-Variable ANTHROPIC_API_KEY
Remove-Variable OPENROUTER_API_KEY

Write-Host "Sensitive variables cleared from memory" -ForegroundColor Gray
