# Project-Nyra Environment Variables Setup Guide

**Date**: 2026-01-09
**Project**: NYRA-AIO-Bootstrap
**Purpose**: Comprehensive guide for setting up all environment variables for 22 MCP servers

---

## Table of Contents

1. [Infisical Setup](#infisical-setup)
2. [Core MCP Servers](#core-mcp-servers)
3. [Memory Systems](#memory-systems)
4. [Security & Secrets](#security--secrets)
5. [Cloud Services](#cloud-services)
6. [Development Tools](#development-tools)
7. [AI Services](#ai-services)
8. [Quick Setup Script](#quick-setup-script)

---

## Infisical Setup

Infisical is the centralized secret management system. All other secrets can be injected through Infisical.

### Required Credentials:

```bash
INFISICAL_PROJECT_ID=<your-project-id>
INFISICAL_CLIENT_ID=<your-client-id>
INFISICAL_CLIENT_SECRET=<your-client-secret>
INFISICAL_ENVIRONMENT=dev  # or prod
```

### How to Get:
1. Visit [Infisical Dashboard](https://app.infisical.com/)
2. Create a new project or select existing
3. Go to **Project Settings** → **API Keys**
4. Generate **Machine Identity** credentials
5. Copy the Project ID, Client ID, and Client Secret

### Verification:
```bash
# Test Infisical CLI connection
infisical login
infisical secrets list --env dev
```

---

## Core MCP Servers

### 1. Claude Flow (@alpha)

**Environment Variables:**
```bash
CLAUDE_FLOW_MEMORY_ENABLED=true
CLAUDE_FLOW_HOOKS_ENABLED=true
CLAUDE_FLOW_NEURAL_ENABLED=true
CLAUDE_FLOW_GITHUB_ENABLED=true
CLAUDE_FLOW_AUTO_SPAWN=true
CLAUDE_FLOW_SESSION_MEMORY=true
CLAUDE_FLOW_MAX_AGENTS=20
CLAUDE_FLOW_CHECKPOINTS_ENABLED=true
CLAUDE_FLOW_PERFORMANCE_MODE=optimized
CLAUDE_FLOW_CACHE_ENABLED=true
CLAUDE_FLOW_PARALLEL_PROCESSING=true
CLAUDE_FLOW_AGENT_POOL=true
```

**Setup:**
```bash
npm install -g claude-flow@alpha
# or use via npx (recommended)
npx @claude-flow/cli@latest alpha --version
```

---

### 2. RuV-Swarm

**Environment Variables:**
```bash
RUV_SWARM_TOPOLOGY=adaptive
RUV_SWARM_MAX_AGENTS=20
RUV_SWARM_WASM_ENABLED=true
RUV_SWARM_NEURAL_ENABLED=true
RUV_SWARM_DAA_ENABLED=true
RUV_SWARM_MEMORY_MODE=persistent
RUV_SWARM_GPU_WORKERS=3
RUV_SWARM_DISTRIBUTED=true
```

**Setup:**
```bash
npx -y ruv-swarm@latest --version
```

---

### 3. MetaMCP (Intelligent Proxy)

**Environment Variables:**
```bash
METAMCP_CONFIG_PATH=/config/metamcp-config.json
METAMCP_ROUTING_MODE=token_cost
METAMCP_LOG_LEVEL=info
METAMCP_ENABLE_METRICS=true
METAMCP_ENABLE_CACHE=true
METAMCP_CACHE_TTL=3600
METAMCP_COST_OPTIMIZATION=aggressive
```

**Config File Location:**
```
C:\Dev\Projects\Repos\Project-Nyra\config\metamcp\metamcp-config.json
```

**Setup:**
```bash
docker pull ghcr.io/metamcp/mcp-proxy:latest
```

---

### 4. Agentic Flow

**Environment Variables:**
```bash
AGENTIC_FLOW_MAX_AGENTS=15
AGENTIC_FLOW_TOPOLOGY=mesh
AGENTIC_FLOW_MEMORY_ENABLED=true
AGENTIC_FLOW_PARALLEL_EXECUTION=true
```

**Setup:**
```bash
npx -y agentic-flow@latest --version
```

---

## Memory Systems

### 5. AgentDB (150x Faster Vector DB)

**Environment Variables:**
```bash
AGENTDB_STORAGE_PATH=C:\Dev\Projects\Repos\Project-Nyra\data\agentdb
AGENTDB_VECTOR_ENABLED=true
AGENTDB_QUANTIZATION=true
AGENTDB_CACHE_ENABLED=true
AGENTDB_HNSW_INDEX=true
AGENTDB_PERFORMANCE_MODE=fast
```

**Setup:**
```bash
npx -y agentdb@latest --version
mkdir -p C:\Dev\Projects\Repos\Project-Nyra\data\agentdb
```

---

### 6. RuVector (Fast Vector Search)

**Environment Variables:**
```bash
RUVECTOR_STORAGE_PATH=C:\Dev\Projects\Repos\Project-Nyra\data\ruvector
RUVECTOR_DIMENSION=1536
RUVECTOR_METRIC=cosine
RUVECTOR_INDEX_TYPE=hnsw
RUVECTOR_CACHE_SIZE=10000
RUVECTOR_QUANTIZATION=true
```

**Setup:**
```bash
npx -y ruvector@latest --version
mkdir -p C:\Dev\Projects\Repos\Project-Nyra\data\ruvector
```

---

### 7. Letta (Agent Memory System)

**Environment Variables:**
```bash
LETTA_STORAGE_PATH=/data
LETTA_MEMORY_BACKEND=sqlite
LETTA_RETENTION_POLICY=persistent
LETTA_COMPRESSION=true
LETTA_MAX_MEMORY_SIZE=10GB
```

**Setup:**
```bash
docker pull ghcr.io/letta-ai/letta-mcp:latest
mkdir -p C:\Dev\Projects\Repos\Project-Nyra\data\letta
```

---

### 8. Graphiti (Temporal Knowledge Graphs)

**Environment Variables:**
```bash
GRAPHITI_STORAGE_PATH=/data
GRAPHITI_NEO4J_URI=<neo4j-uri>
GRAPHITI_NEO4J_USER=<neo4j-username>
GRAPHITI_NEO4J_PASSWORD=<neo4j-password>
GRAPHITI_TEMPORAL_ENABLED=true
GRAPHITI_KNOWLEDGE_GRAPH=true
```

**How to Get Neo4j:**
1. Install Neo4j Desktop: https://neo4j.com/download/
2. Create a new database
3. Copy the connection URI (e.g., `bolt://localhost:7687`)
4. Use default credentials: `neo4j` / `your-password`

**Setup:**
```bash
docker pull ghcr.io/graphiti-ai/graphiti-mcp:latest
mkdir -p C:\Dev\Projects\Repos\Project-Nyra\data\graphiti
```

---

### 9. Mem0 (User Personalization)

**Environment Variables:**
```bash
MEM0_API_KEY=<mem0-api-key>
MEM0_USER_ID=<your-user-id>
MEM0_PERSONALIZATION=true
MEM0_CONTEXT_AWARE=true
MEM0_LEARNING_ENABLED=true
```

**How to Get:**
1. Visit [Mem0 Platform](https://mem0.ai/)
2. Sign up for an account
3. Go to **API Keys** → **Generate New Key**
4. Copy the API key

**Setup:**
```bash
docker pull ghcr.io/mem0-ai/mem0-mcp:latest
```

---

### 10. OpenMemory (Cross-App Profiles)

**Environment Variables:**
```bash
OPENMEMORY_STORAGE_PATH=C:\Dev\Projects\Repos\Project-Nyra\data\openmemory
OPENMEMORY_PROFILE_SYNC=true
OPENMEMORY_CROSS_APP=true
OPENMEMORY_ENCRYPTION=true
```

**Setup:**
```bash
npx -y @openmemory/mcp@latest --version
mkdir -p C:\Dev\Projects\Repos\Project-Nyra\data\openmemory
```

---

## Security & Secrets

### 11. Bitwarden MCP

**Environment Variables:**
```bash
BW_CLIENTID=<bitwarden-client-id>
BW_CLIENTSECRET=<bitwarden-client-secret>
BW_PASSWORD=<bitwarden-master-password>
BW_SESSION=<bitwarden-session-key>
BW_URL=https://vault.bitwarden.com
BW_AUTO_SYNC=true
```

**How to Get:**
1. Visit [Bitwarden](https://vault.bitwarden.com/)
2. Go to **Settings** → **Security** → **API Key**
3. Copy the Client ID and Client Secret
4. Use your master password for BW_PASSWORD

**Verification:**
```bash
bw login --apikey
bw unlock
```

**Setup:**
```bash
npx -y @bitwarden/mcp-server@latest --version
```

---

## Cloud Services

### 12. Flow Nexus (Cloud Execution Platform)

**Environment Variables:**
```bash
FLOW_NEXUS_API_KEY=<flow-nexus-api-key>
FLOW_NEXUS_USER_ID=<flow-nexus-user-id>
FLOW_NEXUS_CLOUD_ENABLED=true
FLOW_NEXUS_SANDBOXES_ENABLED=true
FLOW_NEXUS_NEURAL_ENABLED=true
FLOW_NEXUS_DISTRIBUTED_TRAINING=true
```

**How to Get:**
1. Visit [Flow Nexus Platform](https://flownexus.ai/) (if available)
2. Sign up and create an account
3. Go to **Profile** → **API Credentials**
4. Generate API key and copy User ID

**Setup:**
```bash
npx -y flow-nexus@latest --version
```

---

### 13. SerenAI MCP

**Environment Variables:**
```bash
SERENAI_API_KEY=<serenai-api-key>
SERENAI_MODEL=claude-sonnet-4-5
SERENAI_MEMORY_ENABLED=true
SERENAI_CONTEXT_WINDOW=200000
SERENAI_MAX_TOKENS=8192
SERENAI_TEMPERATURE=0.7
```

**How to Get:**
1. Contact SerenAI for API access
2. Request API key from your account dashboard

**Setup:**
```bash
docker pull ghcr.io/serenai/mcp-server:latest
```

---

### 14. Archon OS (Multi-Service Orchestration)

**Environment Variables:**
```bash
ARCHON_DB_HOST=<database-host>
ARCHON_DB_PORT=<database-port>
ARCHON_DB_NAME=<database-name>
ARCHON_DB_USER=<database-user>
ARCHON_DB_PASSWORD=<database-password>
ARCHON_API_URL=<archon-api-url>
ARCHON_API_KEY=<archon-api-key>
ARCHON_FRONTEND_URL=<frontend-url>
ARCHON_BACKEND_URL=<backend-url>
ARCHON_REDIS_URL=<redis-connection-url>
ARCHON_STORAGE_PATH=/data/archon
ARCHON_LOG_LEVEL=info
ARCHON_MULTI_SERVICE_ENABLED=true
```

**Setup:**
```bash
# Requires Docker Compose setup
docker-compose -f C:\Dev\Projects\Repos\Project-Nyra\docker\archon\docker-compose.yml up -d
```

---

## Development Tools

### 15. GitHub MCP

**Environment Variables:**
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=<github-pat>
GITHUB_OWNER=ellisapotheosis
GITHUB_REPO=Project-Nyra
GITHUB_AUTO_PUSH=false
GITHUB_BRANCH=main
```

**How to Get:**
1. Visit [GitHub Settings](https://github.com/settings/tokens)
2. Click **Generate new token** → **Classic**
3. Select scopes: `repo`, `workflow`, `read:org`
4. Generate and copy the token

**Setup:**
```bash
npx -y @modelcontextprotocol/server-github@latest --version
```

---

### 16. VS Code MCP

**Environment Variables:**
```bash
VSCODE_WORKSPACE=C:\Dev\Projects\Repos\Project-Nyra
VSCODE_AUTO_SYNC=true
VSCODE_EXTENSION_SYNC=true
```

**Setup:**
```bash
npx -y @vscode/mcp-server@latest --version
```

---

### 17. Claude Code Dev Kit

**Environment Variables:**
```bash
CCDK_TOOLS_ENABLED=all
CCDK_SNIPPETS_PATH=C:\Dev\Projects\Repos\Project-Nyra\snippets
CCDK_TEMPLATES_ENABLED=true
```

**Setup:**
```bash
npx -y claude-code-dev-kit@latest --version
mkdir -p C:\Dev\Projects\Repos\Project-Nyra\snippets
```

---

### 18. Nexus Router

**Environment Variables:**
```bash
NEXUS_ROUTER_STRATEGY=intelligent
NEXUS_ROUTER_COST_AWARE=true
NEXUS_ROUTER_LATENCY_THRESHOLD=100
NEXUS_ROUTER_FALLBACK_ENABLED=true
```

**Setup:**
```bash
npx -y nexus-router@latest --version
```

---

### 19. Agent Booster

**Environment Variables:**
```bash
AGENT_BOOSTER_OPTIMIZATION_ENABLED=true
AGENT_BOOSTER_CACHE_ENABLED=true
AGENT_BOOSTER_PARALLEL_EXECUTION=true
AGENT_BOOSTER_WASM_ENABLED=true
```

**Setup:**
```bash
npx -y agent-booster@latest --version
```

---

### 20. Epic SDK

**Environment Variables:**
```bash
EPIC_SDK_API_KEY=<epic-sdk-api-key>
EPIC_SDK_FEATURES_ENABLED=all
EPIC_SDK_AUTO_UPDATE=true
```

**How to Get:**
1. Visit Epic SDK platform (contact for access)
2. Generate API key from dashboard

**Setup:**
```bash
npx -y epic-sdk@latest --version
```

---

## AI Services

### 21. Google Gemini MCP

**Environment Variables:**
```bash
GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=gemini-2.0-flash-thinking-exp-1219
GEMINI_SAFETY_SETTINGS=BLOCK_NONE
GEMINI_MAX_TOKENS=8192
GEMINI_THINKING_MODE=true
```

**How to Get:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key**
3. Create a new API key
4. Copy the key

**Setup:**
```bash
npx -y @google/generative-ai-mcp@latest --version
```

---

## Quick Setup Script

### PowerShell Script to Set All Environment Variables

Save as `setup-env.ps1`:

```powershell
# NYRA Project Environment Setup Script
# Run with: .\setup-env.ps1

Write-Host "🚀 Setting up Project-Nyra environment variables..." -ForegroundColor Cyan

# Infisical (REQUIRED - Set these first!)
$env:INFISICAL_PROJECT_ID = "<your-project-id>"
$env:INFISICAL_CLIENT_ID = "<your-client-id>"
$env:INFISICAL_CLIENT_SECRET = "<your-client-secret>"
$env:INFISICAL_ENVIRONMENT = "dev"

# Claude Flow
$env:CLAUDE_FLOW_MEMORY_ENABLED = "true"
$env:CLAUDE_FLOW_HOOKS_ENABLED = "true"
$env:CLAUDE_FLOW_NEURAL_ENABLED = "true"
$env:CLAUDE_FLOW_GITHUB_ENABLED = "true"
$env:CLAUDE_FLOW_MAX_AGENTS = "20"

# RuV-Swarm
$env:RUV_SWARM_TOPOLOGY = "adaptive"
$env:RUV_SWARM_MAX_AGENTS = "20"
$env:RUV_SWARM_GPU_WORKERS = "3"

# GitHub
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "<your-github-pat>"
$env:GITHUB_OWNER = "ellisapotheosis"
$env:GITHUB_REPO = "Project-Nyra"

# Gemini
$env:GEMINI_API_KEY = "<your-gemini-key>"

# Bitwarden
$env:BW_CLIENTID = "<your-bw-client-id>"
$env:BW_CLIENTSECRET = "<your-bw-client-secret>"
$env:BW_PASSWORD = "<your-bw-password>"

# Flow Nexus
$env:FLOW_NEXUS_API_KEY = "<your-flow-nexus-key>"
$env:FLOW_NEXUS_USER_ID = "<your-user-id>"

# Epic SDK
$env:EPIC_SDK_API_KEY = "<your-epic-sdk-key>"

# SerenAI
$env:SERENAI_API_KEY = "<your-serenai-key>"

# Mem0
$env:MEM0_API_KEY = "<your-mem0-key>"
$env:MEM0_USER_ID = "<your-user-id>"

# Graphiti / Neo4j
$env:GRAPHITI_NEO4J_URI = "bolt://localhost:7687"
$env:GRAPHITI_NEO4J_USER = "neo4j"
$env:GRAPHITI_NEO4J_PASSWORD = "<your-neo4j-password>"

Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host "💡 To persist across sessions, add these to your PowerShell profile:" -ForegroundColor Yellow
Write-Host "   $PROFILE" -ForegroundColor Cyan
```

### To Persist Environment Variables:

Add to your PowerShell profile (`$PROFILE`):

```powershell
# NYRA Project Environment Variables
$env:INFISICAL_PROJECT_ID = "<your-project-id>"
$env:INFISICAL_CLIENT_ID = "<your-client-id>"
# ... (add all other env vars)
```

Or use Infisical to inject all secrets automatically:

```bash
# Run commands with Infisical secret injection
infis npx @claude-flow/cli@latest --help
infis docker-compose up -d
```

---

## Verification

### Test All MCP Servers:

```bash
# Test Infisical
infisical secrets list

# Test Claude Flow
npx @claude-flow/cli@latest alpha --version

# Test RuV-Swarm
npx -y ruv-swarm@latest --version

# Test GitHub connection
gh auth status

# Test Docker services
docker ps
docker-compose ps

# Test Bitwarden
bw login --check
```

---

## Troubleshooting

### Common Issues:

1. **"INFISICAL_* not set" errors**
   - Solution: Set Infisical credentials first, then run `infisical run -- <command>`

2. **Docker containers not starting**
   - Solution: Check Docker Desktop is running: `docker ps`

3. **NPX packages not found**
   - Solution: Update npm: `npm install -g npm@latest`

4. **GitHub authentication failed**
   - Solution: Regenerate PAT with correct scopes

5. **Neo4j connection refused**
   - Solution: Start Neo4j Desktop and verify connection URI

---

## Security Best Practices

1. **NEVER commit `.env` files or credentials to Git**
2. **Use Infisical for centralized secret management**
3. **Rotate API keys every 90 days**
4. **Use different credentials for dev/staging/prod**
5. **Enable 2FA on all platforms**
6. **Store backup credentials in Bitwarden**

---

**Last Updated**: 2026-01-09
**Maintainer**: NYRA Development Team
**Support**: Check CLAUDE-MCP-CONFIG-PLAN.md for implementation status
