# Make-NyraMemoryZip.ps1
# Builds nyra-memory-stack\ with full docs & configs, then zips to nyra-memory-stack-pro.zip

$ErrorActionPreference = "Stop"
$Root = Join-Path (Get-Location) "nyra-memory-stack"
if (Test-Path $Root) { Remove-Item -Recurse -Force $Root }
New-Item -ItemType Directory -Path $Root | Out-Null
function W($Rel,$Txt){$p=Join-Path $Root $Rel; New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($p))|Out-Null; $e=New-Object Text.UTF8Encoding($false);[IO.File]::WriteAllText($p,($Txt -replace "`r?`n","`r`n"),$e)}

# --- docker compose (memory) ---
W "deployment\docker-compose.memory.yml" @"
version: "3.9"
networks: { nyra_net: { driver: bridge } }
volumes: { qdrant_data: {}, neo4j_data: {}, neo4j_logs: {}, metamcp_pg: {} }
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: nyra-qdrant
    ports: ["6333:6333"]
    volumes: [ "qdrant_data:/qdrant/storage" ]
    networks: [ nyra_net ]

  neo4j:
    image: neo4j:5-community
    container_name: nyra-neo4j
    environment:
      - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD:-neo4j-password}
      - NEO4J_dbms_security_procedures_unrestricted=apoc.*
      - NEO4J_PLUGINS=["apoc"]
    ports: ["7474:7474","7687:7687"]
    volumes: [ "neo4j_data:/data", "neo4j_logs:/logs" ]
    networks: [ nyra_net ]

  graphiti-mcp:
    image: ghcr.io/getzep/graphiti-mcp:latest
    container_name: nyra-graphiti-mcp
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MODEL_NAME=${MODEL_NAME:-gpt-4o-mini}
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=${NEO4J_PASSWORD:-neo4j-password}
      - GRAPHITI_TRANSPORT=sse
      - GRAPHITI_PORT=8000
    depends_on: { neo4j: { condition: service_started } }
    ports: ["7459:8000"]
    networks: [ nyra_net ]
    restart: unless-stopped

  qdrant-mcp:
    image: ghcr.io/qdrant/mcp-server-qdrant:latest
    container_name: nyra-qdrant-mcp
    environment:
      - QDRANT_URL=http://qdrant:6333
      - COLLECTION_NAME=${QDRANT_COLLECTION:-nyra}
      - EMBEDDING_PROVIDER=fastembed
      - EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
      - FASTMCP_PORT=8066
      - FASTMCP_HOST=0.0.0.0
    depends_on: { qdrant: { condition: service_started } }
    ports: ["8066:8066"]
    networks: [ nyra_net ]
    restart: unless-stopped

  openmemory:
    image: ghcr.io/mem0ai/openmemory:latest
    container_name: nyra-openmemory
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_API_URL=http://localhost:8765
      - NEXT_PUBLIC_USER_ID=${OPENMEMORY_USER:-nyra}
      - USER=${OPENMEMORY_USER:-nyra}
    ports: ["8765:8765","3000:3000"]
    networks: [ nyra_net ]
    restart: unless-stopped

  metamcp:
    image: ghcr.io/metatool-ai/metamcp:latest
    container_name: nyra-metamcp
    env_file: [ "./metamcp/.env" ]
    volumes:
      - metamcp_pg:/var/lib/postgresql/data
      - ./metamcp/servers.json:/app/servers.json:ro
      - ./metamcp/namespaces.json:/app/namespaces.json:ro
      - ./metamcp/endpoints.json:/app/endpoints.json:ro
    ports: ["12008:12008","12005:12005"]
    networks: [ nyra_net ]
    restart: unless-stopped
"@

# --- docker compose (optional vLLM model server) ---
W "deployment\docker-compose.model.yml" @"
version: "3.9"
services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: nyra-vllm
    runtime: nvidia
    environment:
      - HUGGING_FACE_HUB_TOKEN=${HF_TOKEN}
    command: >
      --host 0.0.0.0 --port 8000
      --model NousResearch/Meta-Llama-3-8B-Instruct
      --dtype auto
      --api-key token-abc123
    ports: ["8000:8000"]
    volumes:
      - ${USERPROFILE}/.cache/huggingface:/root/.cache/huggingface
"@

# --- MetaMCP channels (servers / namespaces / endpoints) ---
W "deployment\metamcp\.env" @"
APP_URL=http://localhost:12008
API_URL=http://localhost:12008
ADMIN_EMAIL=admin@nyra.local
ADMIN_PASSWORD=ChangeMe_123!
METAMCP_API_KEY=nyra-local-key
"@
W "deployment\metamcp\servers.json" @"
{
  "mcpServers": {
    "openmemory": {"type":"SSE","url":"http://openmemory:8765/mcp/nyra/sse/nyra","description":"Local-first dev memory bus"},
    "qdrant-vector": {"type":"SSE","url":"http://qdrant-mcp:8066/sse","description":"Vector memory over Qdrant (FastEmbed)"},
    "graphiti-kg": {"type":"SSE","url":"http://graphiti-mcp:8000/sse","description":"Temporal knowledge graph (Neo4j)"}
  }
}
"@
W "deployment\metamcp\namespaces.json" @"
{
  "namespaces": [
    {
      "name": "memory-core",
      "servers": ["qdrant-vector", "graphiti-kg"],
      "toolFilter": { "mode": "allow",
        "tools": ["qdrant-store*", "qdrant-find*", "search_nodes", "search_facts", "get_episodes", "add_episode", "add_edge", "clear_graph"] }
    },
    {
      "name": "memory-bus",
      "servers": ["openmemory"],
      "toolFilter": { "mode": "allow",
        "tools": ["add_memories", "search_memory", "list_memories", "delete_all_memories"] }
    },
    {
      "name": "memory-all",
      "servers": ["qdrant-vector", "graphiti-kg", "openmemory"],
      "toolFilter": { "mode": "deny", "tools": ["*danger*", "*delete*"] }
    }
  ]
}
"@
W "deployment\metamcp\endpoints.json" @"
{
  "endpoints": [
    { "name": "nyra-core", "namespace": "memory-core", "transport": "SSE", "auth": { "type": "apiKey", "key": "${METAMCP_API_KEY}" } },
    { "name": "nyra-bus",  "namespace": "memory-bus",  "transport": "SSE", "auth": { "type": "apiKey", "key": "${METAMCP_API_KEY}" } },
    { "name": "nyra-all",  "namespace": "memory-all",  "transport": "SSE", "auth": { "type": "apiKey", "key": "${METAMCP_API_KEY}" } }
  ]
}
"@

# --- scripts ---
W "scripts\install.ps1" @"
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
"@
W "RUN_ME.bat" '@echo off
powershell -ExecutionPolicy Bypass -File ".\scripts\install.ps1"
pause
'

# --- .env.example ---
W ".env.example" @"
OPENAI_API_KEY=sk-your-key
NEO4J_PASSWORD=neo4j-password
QDRANT_COLLECTION=nyra
MODEL_NAME=gpt-4o-mini
OPENMEMORY_USER=nyra
HF_TOKEN=your-hf-token
"@

# --- Clients ---
W "clients\claude_desktop_config.json" '{"mcpServers":{"MetaMCP-Nyra":{"url":"http://localhost:12008/metamcp/nyra-core/sse","apiKey":"nyra-local-key"}}}'
W "clients\cursor_mcp.json"        '{"mcpServers":{"MetaMCP-Nyra":{"url":"http://localhost:12008/metamcp/nyra-core/sse","apiKey":"nyra-local-key"}}}'

# --- README (summaries/explanations of each file) ---
$today = (Get-Date).ToString("yyyy-MM-dd")
W "docs\README.md" @"
# Nyra Memory Stack — Bundle Overview
**Date:** $today

## What this is
A local-first, composable memory layer:
- **Qdrant MCP** for vector recall (FastEmbed → \$0 embeddings) [vector].
- **Graphiti MCP** for temporal knowledge graphs over Neo4j [KG].
- **OpenMemory MCP** for dev shared memory (local-first) [bus].
- **MetaMCP** namespaces + endpoints (SSE + API keys) [orchestration].
- **vLLM (optional)** OpenAI-compatible local model server.

## Files & Usage
- **deployment/docker-compose.memory.yml** — Spins up Qdrant, Neo4j, Graphiti MCP, Qdrant MCP, OpenMemory, MetaMCP.
- **deployment/docker-compose.model.yml** — Optional vLLM OpenAI-compatible server.
- **deployment/metamcp/.env** — MetaMCP admin/API key bootstrap. *Don’t commit secrets.*
- **deployment/metamcp/servers.json** — Raw MCP servers (Graphiti, Qdrant, OpenMemory).
- **deployment/metamcp/namespaces.json** — Logical groups; tight tool filters (safer prod).
- **deployment/metamcp/endpoints.json** — Public endpoints (SSE) + API keys.
- **scripts/install.ps1** — Windows launcher; add `-WithModels` for vLLM.
- **RUN_ME.bat** — Double-click convenience wrapper.
- **.env.example** — Copy → `.env` and fill secrets.
- **clients/** — Example configs for Claude Desktop / Cursor.
- **docs/IMPLEMENTATION.md** — Step-by-step.
- **docs/WHITEPAPER.md** — Architecture, flows, ops, security.

## Design Notes
- **Prod**: use `nyra-core` (vector+KG). Keep OpenMemory (`nyra-bus`) for dev unless you need a shared memory plane in prod.
- **Backends**: Graphiti supports Neo4j and others (FalkorDB/Memgraph in its docs). Qdrant MCP supports FastEmbed for local embeddings.
"@

# --- IMPLEMENTATION (step-by-step) ---
W "docs\IMPLEMENTATION.md" @"
# Implementation Guide (Windows 11)
## 0) Prereqs
- Windows 11, Docker Desktop (WSL2); (optional) NVIDIA GPU for vLLM.
- Copy `.env.example` → `.env` and set:
  - `OPENAI_API_KEY`, `NEO4J_PASSWORD`, `QDRANT_COLLECTION`, etc.

## 1) Start
- Double-click `RUN_ME.bat` **or**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
