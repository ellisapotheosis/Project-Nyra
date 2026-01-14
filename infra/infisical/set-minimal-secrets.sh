#!/bin/bash
# ============================================================================
# Project Nyra - Minimal Infisical Secrets Setup (Quick Start)
# ============================================================================
# This script sets the MINIMAL required secrets to get Project Nyra running.
# For full production setup, use set-all-secrets.ps1 instead.
#
# Usage:
#   chmod +x set-minimal-secrets.sh
#   ./set-minimal-secrets.sh dev
#
# Prerequisites:
#   - Infisical CLI installed: npm install -g @infisical/cli
#   - Infisical logged in: infisical login
# ============================================================================

ENVIRONMENT=${1:-dev}
PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
PATH_PREFIX="/shared"

echo "============================================================================"
echo "Project Nyra - Minimal Secrets Setup"
echo "============================================================================"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Project ID: $PROJECT_ID"
echo "Path: $PATH_PREFIX"
echo ""

# Check if Infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    echo "ERROR: Infisical CLI not found!"
    echo "Install it with: npm install -g @infisical/cli"
    exit 1
fi

echo "============================================================================"
echo "STEP 1: Enter Required Passwords"
echo "============================================================================"
echo ""

read -sp "PostgreSQL password: " POSTGRES_PASSWORD
echo ""
read -sp "Redis password: " REDIS_PASSWORD
echo ""
read -sp "FalkorDB password: " FALKORDB_PASSWORD
echo ""
read -sp "Letta server password: " LETTA_SERVER_PASSWORD
echo ""
read -sp "Letta DB password: " LETTA_DB_PASSWORD
echo ""

echo ""
echo "============================================================================"
echo "STEP 2: Enter API Keys"
echo "============================================================================"
echo ""

read -p "Anthropic API key: " ANTHROPIC_API_KEY
read -p "OpenRouter API key: " OPENROUTER_API_KEY

echo ""
echo "============================================================================"
echo "STEP 3: Setting secrets in Infisical..."
echo "============================================================================"
echo ""

# Set all minimal secrets in one command
infisical secrets set \
  POSTGRES_USER=nyra \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  POSTGRES_DB=nyra_production \
  POSTGRES_HOST=localhost \
  POSTGRES_PORT=5432 \
  LETTA_DB_NAME=letta \
  TWENTY_DB_NAME=twenty \
  DIFY_DB_NAME=dify \
  N8N_DB_NAME=n8n \
  REDIS_PASSWORD="$REDIS_PASSWORD" \
  REDIS_HOST=localhost \
  REDIS_PORT=6379 \
  REDIS_URL="redis://:$REDIS_PASSWORD@redis:6379" \
  REDIS_MAX_MEMORY=4GB \
  REDIS_EVICTION_POLICY=allkeys-lru \
  FALKORDB_PASSWORD="$FALKORDB_PASSWORD" \
  FALKORDB_PORT=6380 \
  FALKORDB_AOF_SYNC=everysec \
  FALKORDB_MAX_MEMORY=2GB \
  QDRANT_PORT=6333 \
  ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  ANTHROPIC_MODEL=claude-sonnet-4-20250514 \
  ANTHROPIC_MAX_TOKENS=4096 \
  OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  OPENROUTER_BASE_URL=https://openrouter.ai/api/v1 \
  OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-r1 \
  LETTA_SERVER_PASSWORD="$LETTA_SERVER_PASSWORD" \
  LETTA_DB_PASSWORD="$LETTA_DB_PASSWORD" \
  LETTA_POSTGRES_URI="postgresql://letta:$LETTA_DB_PASSWORD@postgresql:5432/letta" \
  DATABASE_URL="postgresql://nyra:$POSTGRES_PASSWORD@postgresql:5432/nyra_production" \
  CLAUDE_FLOW_PORT=9000 \
  CLAUDE_FLOW_MODE=orchestrator \
  CLAUDE_FLOW_TELEMETRY_ENABLED=true \
  CLAUDE_FLOW_PERFORMANCE_MODE=optimized \
  CLAUDE_FLOW_AUTO_COMMIT=true \
  CLAUDE_FLOW_HOOKS_ENABLED=true \
  CLAUDE_FLOW_NEURAL_OPTIMIZATION=true \
  ARCHON_PORT=9001 \
  ARCHON_MCP_PORT=3333 \
  ARCHON_TOPOLOGY=hierarchical \
  ARCHON_MAX_DEPTH=5 \
  ARCHON_PARALLEL_BRANCHES=true \
  NEXUS_ROUTER_PORT=8000 \
  NEXUS_ROUTER_MCP_PORT=4001 \
  MODEL_ROUTING_STRATEGY=cost-optimized \
  MODEL_ROUTING_PREFER_LOCAL=true \
  MODEL_ROUTING_FALLBACK_CLOUD=true \
  MODEL_ROUTING_COST_THRESHOLD=0.10 \
  WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434 \
  WORKER_5090_MODELS=deepseek-r1:236b-q4_K_M,qwen2.5:72b-instruct-q8_0 \
  WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434 \
  WORKER_3090_MODELS=llama3.1:70b-instruct-q4_K_M,mistral-large:123b-instruct-2407-q4_K_M \
  WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434 \
  WORKER_3060_MODELS=codellama:34b-instruct-q8_0,qwen2.5:32b-instruct-q8_0 \
  CLAUDE_FLOW_MCP_URL=http://claude-flow:9000/mcp \
  ARCHON_MCP_URL=http://archon-os:9001/mcp \
  INFISICAL_MCP_URL=http://infisical-mcp:4002 \
  BITWARDEN_MCP_URL=http://bitwarden-mcp:4003 \
  NODE_ENV=production \
  PROJECT_NAME=project-nyra \
  --env="$ENVIRONMENT" --path="$PATH_PREFIX" --projectId="$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================================================"
    echo "SUCCESS! Minimal secrets configured"
    echo "============================================================================"
    echo ""
    echo "Next steps:"
    echo "1. Verify: infisical secrets get POSTGRES_PASSWORD --env=$ENVIRONMENT --path=$PATH_PREFIX"
    echo "2. Start services: cd ../docker && docker compose -f docker-compose.orchestration.yml up -d"
    echo "3. Check health: curl http://localhost:8000/health"
    echo ""
else
    echo ""
    echo "ERROR: Failed to set secrets"
    echo "Please check your Infisical connection and try again"
    exit 1
fi
