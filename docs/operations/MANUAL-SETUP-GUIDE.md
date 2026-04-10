# Project Nyra - Comprehensive Manual Setup Guide

**Last Updated**: 2026-01-18
**Status**: Complete - Ready for Manual Configuration
**Scope**: Covers all backend systems, memory services, and MCP infrastructure

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
3. [Backend Database Setup](#backend-database-setup)
4. [Memory Systems Configuration](#memory-systems-configuration)
5. [MCP Server Configuration](#mcp-server-configuration)
6. [Nexus Router Setup](#nexus-router-setup)
7. [Network Configuration](#network-configuration)
8. [Verification Steps](#verification-steps)
9. [Troubleshooting](#troubleshooting)
10. [PC-Specific Setup Notes](#pc-specific-setup-notes)

---

## 🎯 Overview

This guide provides step-by-step instructions for manually configuring Project Nyra's infrastructure without relying on automated deployment scripts. It covers:

- **Backend Databases**: PostgreSQL, Redis, FalkorDB, Qdrant, Neo4j
- **Memory Systems**: Letta, Mem0, letta, ruvector
- **MCP Servers**: Claude Flow, Archon OS, Infisical, Bitwarden
- **Nexus Router**: Intelligent LLM routing gateway
- **Network Configuration**: Docker networking, port assignments, firewall rules

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                      │
│  Open-WebUI, LobeChat, Dify, n8n, Claude Desktop  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              NEXUS ROUTER (8000)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  MCP Proxy + LLM Routing Engine              │  │
│  │  - Tool routing                              │  │
│  │  - Cost-optimized routing                    │  │
│  │  - Response caching (Redis)                  │  │
│  │  - Health monitoring                         │  │
│  └──────────────┬───────────────────────────────┘  │
└─────────────────┼───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐
│ Claude  │ │ Archon  │ │ Cloud APIs   │
│  Flow   │ │   OS    │ │ (Fallback)   │
└────┬────┘ └────┬────┘ └──────────────┘
     │           │
     └─────┬─────┘
           │
    ┌──────▼──────────────────────┐
    │   Memory & Database Layer   │
    ├─────────────────────────────┤
    │ PostgreSQL │ Redis          │
    │ FalkorDB   │ Qdrant         │
    │ Neo4j      │ ruvector        │
    └─────────────────────────────┘
```

---

## Prerequisites & Environment Setup

### System Requirements

**Windows Setup**:
- Windows 10/11 Pro or Server 2019+
- PowerShell 5.1+
- Docker Desktop for Windows (with WSL2)
- Administrator access

**Linux Setup**:
- Ubuntu 22.04 LTS or equivalent
- Docker and Docker Compose
- sudo access
- 10GbE network connectivity (for distributed setup)

### Installation Prerequisites

```bash
# Windows (PowerShell as Administrator)
# Install Chocolatey first if not present
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iex ((New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072); iex (New-Object Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')

# Install required tools
choco install docker-desktop git nodejs -y
npm install -g pnpm

# Linux
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git curl wget
sudo usermod -aG docker $USER
npm install -g pnpm
```

### Environment File Setup

Create `.env` file in project root:

```bash
# Core Configuration
ENVIRONMENT=development
PROJECT_NAME=nyra
DOMAIN=localhost

# Database Credentials (change these to secure values)
POSTGRES_USER=nyra
POSTGRES_PASSWORD=changeme_secure_password_32_chars
POSTGRES_DB=nyra_production
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PASSWORD=changeme_redis_password
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_URL=redis://:changeme_redis_password@redis:6379

# FalkorDB Configuration
FALKORDB_PASSWORD=changeme_falkordb_password
FALKORDB_PORT=6380
FALKORDB_HOST=localhost

# Qdrant Configuration
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_PORT=6333
QDRANT_HOST=localhost

# Nexus Router Configuration
NEXUS_ROUTER_PORT=8000
NEXUS_ROUTER_MCP_PORT=4001
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true

# API Keys (populate with real values)
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENROUTER_API_KEY=sk-or-your-key-here
INFISICAL_TOKEN=your_infisical_token
BW_SESSION=your_bitwarden_session

# Memory Systems
LETTA_DB_NAME=letta
MEM0_API_KEY=optional_mem0_api_key
letta_GROUP_ID=nyra

# Node Environment
NODE_ENV=production
LOG_LEVEL=info
```

### Generate Strong Passwords

```powershell
# PowerShell: Generate 32-character password
$password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
Write-Host "Generated Password: $password"

# Bash: Generate 32-character password
openssl rand -base64 24 | head -c 32
```

---

## Backend Database Setup

### 1. PostgreSQL Setup

PostgreSQL is the primary relational database for business data and CRM systems.

#### Installation

```bash
# Docker Compose (Recommended)
# Add to docker-compose.dev.yml:
services:
  postgres:
    image: postgres:16-alpine
    container_name: nyra-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nyra-network

volumes:
  postgres-data:
    driver: local
```

#### Verification

```bash
# Check PostgreSQL is running
docker logs nyra-postgres

# Connect to PostgreSQL
psql -h localhost -U nyra -d nyra_production
# Password: (use POSTGRES_PASSWORD from .env)

# Verify connection in psql
\dt  # List tables
\l   # List databases
\q   # Quit
```

#### Initial Database Setup

```sql
-- Create application databases
CREATE DATABASE letta WITH OWNER nyra ENCODING 'UTF8';
CREATE DATABASE twenty WITH OWNER nyra ENCODING 'UTF8';
CREATE DATABASE dify WITH OWNER nyra ENCODING 'UTF8';
CREATE DATABASE n8n WITH OWNER nyra ENCODING 'UTF8';

-- Create service users
CREATE USER letta_service WITH PASSWORD 'changeme_letta_service_pw';
CREATE USER twenty_service WITH PASSWORD 'changeme_twenty_service_pw';
CREATE USER dify_service WITH PASSWORD 'changeme_dify_service_pw';
CREATE USER n8n_service WITH PASSWORD 'changeme_n8n_service_pw';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE letta TO letta_service;
GRANT ALL PRIVILEGES ON DATABASE twenty TO twenty_service;
GRANT ALL PRIVILEGES ON DATABASE dify TO dify_service;
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_service;

-- Verify
\list
```

---

### 2. Redis Setup

Redis provides caching, session storage, and Nexus Router response caching.

#### Installation

```bash
# Docker Compose
services:
  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    restart: unless-stopped
    command:
      - redis-server
      - --requirepass
      - ${REDIS_PASSWORD}
      - --maxmemory
      - "4gb"
      - --maxmemory-policy
      - "allkeys-lru"
    volumes:
      - redis-data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nyra-network

volumes:
  redis-data:
    driver: local
```

#### Verification

```bash
# Connect to Redis
redis-cli -h localhost -p 6379
# Authenticate
AUTH your_redis_password

# Test connection
PING
# Expected: PONG

# Set a test key
SET test_key "hello"
GET test_key
# Expected: "hello"

# Check memory
INFO memory

# Quit
QUIT
```

---

### 3. FalkorDB Setup

FalkorDB is a graph database for knowledge graphs and temporal relationships.

#### Installation

```bash
# Docker Compose
services:
  falkordb:
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb
    restart: unless-stopped
    environment:
      FALKORDB_PORT: ${FALKORDB_PORT:-6380}
      # Optional: Set password for production
      # FALKORDB_PASSWORD: ${FALKORDB_PASSWORD}
    volumes:
      - falkordb-data:/data
    ports:
      - "${FALKORDB_PORT:-6380}:6380"
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "${FALKORDB_PORT:-6380}", "PING"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nyra-network

volumes:
  falkordb-data:
    driver: local
```

#### Verification

```bash
# Connect to FalkorDB
redis-cli -h localhost -p 6380

# Test connection
PING
# Expected: PONG

# Create a simple graph
GRAPH.QUERY mygraph "CREATE (n:User {name: 'Alice'})"

# Query the graph
GRAPH.QUERY mygraph "MATCH (n:User) RETURN n"

# Quit
QUIT
```

---

### 4. Qdrant Vector Database Setup

Qdrant stores embeddings for semantic search and similarity matching.

#### Installation

```bash
# Docker Compose
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: nyra-qdrant
    restart: unless-stopped
    environment:
      QDRANT_API_KEY: ${QDRANT_API_KEY:-}
      QDRANT_SNAPSHOT_RECOVERY: "true"
    volumes:
      - qdrant-data:/qdrant/storage
      - qdrant-snapshots:/qdrant/snapshots
    ports:
      - "${QDRANT_PORT:-6333}:6333"
      - "6334:6334"  # gRPC port
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nyra-network

volumes:
  qdrant-data:
    driver: local
  qdrant-snapshots:
    driver: local
```

#### Verification

```bash
# Test REST API
curl http://localhost:6333/health

# Expected response:
# {"status":"ok"}

# Create a collection
curl -X PUT "http://localhost:6333/collections/test_collection" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'

# Verify collection created
curl http://localhost:6333/collections/test_collection
```

---

### 5. Neo4j Setup (Optional - for Advanced Graph Features)

Neo4j provides advanced property graph capabilities for complex relationships.

#### Installation

```bash
# Docker Compose
services:
  neo4j:
    image: neo4j:5-enterprise
    container_name: nyra-neo4j
    restart: unless-stopped
    environment:
      NEO4J_AUTH: neo4j/changeme_neo4j_password_32_chars
      NEO4J_dbms_memory_heap_initial__size: 2G
      NEO4J_dbms_memory_heap_max__size: 4G
      NEO4J_dbms_memory_pagecache_size: 2G
    volumes:
      - neo4j-data:/data
      - neo4j-logs:/logs
    ports:
      - "7687:7687"  # Bolt
      - "7474:7474"  # HTTP
      - "7473:7473"  # HTTPS
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7474"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nyra-network

volumes:
  neo4j-data:
    driver: local
  neo4j-logs:
    driver: local
```

#### Verification

```bash
# Access Neo4j Browser
# Navigate to: http://localhost:7474
# Username: neo4j
# Password: changeme_neo4j_password_32_chars

# Or via Bolt protocol:
# cypher-shell -a bolt://localhost:7687 -u neo4j -p changeme_neo4j_password_32_chars
```

---

## Memory Systems Configuration

### 1. Letta Memory System

Letta provides user personalization and conversation memory.

#### Installation & Configuration

```bash
# Clone Letta repo or use Docker image
docker pull letta/letta:latest

# Add to docker-compose.dev.yml
services:
  letta:
    image: letta/letta:latest
    container_name: nyra-letta
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${LETTA_DB_NAME:-letta}
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      LETTA_API_PORT: 8091
    volumes:
      - letta-data:/root/.letta
    ports:
      - "8091:8091"  # API
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - nyra-network

volumes:
  letta-data:
    driver: local
```

#### Initialization

```bash
# Start Letta service
docker-compose up -d letta

# Initialize Letta database
docker exec nyra-letta letta storage sqlite init

# Create default agent
curl -X POST http://localhost:8091/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "default-agent",
    "agent_type": "user-defined"
  }'

# Verify
curl http://localhost:8091/agents
```

### 2. Mem0 Memory System

Mem0 provides hybrid cloud/local memory management.

#### Installation & Configuration

```bash
# Add to docker-compose.dev.yml
services:
  mem0-mcp:
    build:
      context: ./services/mem0-mcp
      dockerfile: Dockerfile
    container_name: nyra-mem0-mcp
    restart: unless-stopped
    environment:
      PORT: 8081
      # Optional: Cloud API key (if present, proxies to Mem0.ai)
      MEM0_API_KEY: ${MEM0_API_KEY:-}
      # Local mode settings
      STORAGE_PATH: /data/memories.db
      NODE_ENV: production
    volumes:
      - mem0-data:/data
    ports:
      - "8081:8081"
    networks:
      - nyra-network

volumes:
  mem0-data:
    driver: local
```

#### API Endpoints

```bash
# Health check
curl http://localhost:8081/health

# Add memory
curl -X POST http://localhost:8081/memories/add \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "memory": "User prefers detailed explanations",
    "metadata": {"source": "conversation"}
  }'

# Search memories
curl -X POST http://localhost:8081/memories/search \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "query": "user preferences",
    "limit": 5
  }'

# Get memories
curl http://localhost:8081/memories/get/user_123
```

### 3. letta Knowledge Graph

letta provides temporal knowledge graphs for entity relationships.

#### Installation & Configuration

```bash
# Add to docker-compose.dev.yml
services:
  letta:
    image: zepai/knowledge-graph-mcp:standalone
    container_name: nyra-letta
    restart: unless-stopped
    environment:
      # FalkorDB Configuration
      FALKORDB_URI: redis://falkordb:6380
      FALKORDB_PASSWORD: ${FALKORDB_PASSWORD:-}
      FALKORDB_DATABASE: default_db

      # letta Settings
      letta_GROUP_ID: ${letta_GROUP_ID:-nyra}
      SEMAPHORE_LIMIT: 5

      # OpenAI Configuration (for embeddings)
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
      OPENAI_BASE_URL: http://nexus-router:8000/v1
    ports:
      - "9100:8000"  # Map to 9100 externally, 8000 internally
    depends_on:
      - falkordb
    networks:
      - nyra-network
```

#### Verification

```bash
# Health check
curl http://localhost:9100/health

# Extract entities from text
curl -X POST http://localhost:9100/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Alice works for Acme Corporation in New York",
    "user_id": "user_123"
  }'

# Build knowledge graph
curl -X POST http://localhost:9100/api/graph/build \
  -H "Content-Type: application/json" \
  -d '{
    "entities": ["Alice", "Acme", "New York"],
    "user_id": "user_123"
  }'

# Query temporal snapshots
curl http://localhost:9100/api/temporal/snapshot?user_id=user_123
```

### 4. ruvector - Advanced Memory System

ruvector provides HNSW-indexed vector search with 150x-12,500x faster performance.

#### Installation & Configuration

```bash
# Add to docker-compose.dev.yml
services:
  ruvector:
    image: ruvector/ruvector:latest
    container_name: nyra-ruvector
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/ruvector
      VECTOR_DB_HOST: qdrant
      VECTOR_DB_PORT: 6333
      HNSW_ENABLED: "true"
      CACHE_SIZE_MB: 1024
    ports:
      - "8092:8000"
    depends_on:
      - postgres
      - qdrant
    networks:
      - nyra-network

volumes:
  ruvector-data:
    driver: local
```

#### Initialization

```bash
# Create ruvector database
psql -h localhost -U nyra -d postgres -c "CREATE DATABASE ruvector WITH OWNER nyra;"

# Verify connection
curl http://localhost:8092/health
```

---

## MCP Server Configuration

### 1. Claude Flow MCP Server

Claude Flow provides swarm orchestration and agent coordination.

#### Installation

```bash
# Option A: Using npx (Recommended)
npx @archon-os/cli@latest mcp start

# Option B: Global installation
npm install -g archon-os@alpha
archon-os mcp start

# Option C: Docker Compose
services:
  archon-os-mcp:
    image: archon-os:alpha
    container_name: nyra-archon-os-mcp
    restart: unless-stopped
    ports:
      - "3100:3100"
    environment:
      - MCP_PORT=3100
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3100/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - nyra-network
```

#### Configuration

```bash
# Default port: 3100
# Health check: http://localhost:3100/health

# Available tools:
# - swarm_init: Initialize agent swarms
# - agent_spawn: Create new agents
# - task_orchestrate: Coordinate multi-agent tasks
# - memory_usage: Persistent memory operations
# - (and 50+ more tools)
```

### 2. Archon OS MCP Server

Archon OS provides system automation and OS-level operations.

#### Installation

```bash
# Docker Compose
services:
  archon-os-mcp:
    build:
      context: ./services/archon-os-mcp
    container_name: nyra-archon-os-mcp
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "3200:3200"
    environment:
      - MCP_PORT=3200
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3200/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - nyra-network
```

### 3. Infisical MCP Server

Infisical provides secret management and environment variable injection.

#### Installation & Configuration

```bash
# Create Infisical project at: https://app.infisical.com
# Get project ID and API key

# Docker Compose
services:
  infisical-mcp:
    build:
      context: ./services/infisical-mcp
    container_name: nyra-infisical-mcp
    restart: unless-stopped
    environment:
      - PORT=3300
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
      - INFISICAL_PROJECT_ID=your_project_id
      - NODE_ENV=production
    ports:
      - "3300:3300"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3300/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - nyra-network
```

#### Secrets Setup

```bash
# Via Infisical CLI
infisical login

# Set core secrets
infisical secrets set \
  POSTGRES_USER=nyra \
  POSTGRES_PASSWORD=$(openssl rand -base64 24) \
  REDIS_PASSWORD=$(openssl rand -base64 24) \
  FALKORDB_PASSWORD=$(openssl rand -base64 24) \
  --env=dev --path="/shared"

# Set API keys
infisical secrets set \
  ANTHROPIC_API_KEY=sk-ant-xxxxx \
  OPENROUTER_API_KEY=sk-or-xxxxx \
  --env=dev --path="/shared"
```

### 4. Bitwarden MCP Server

Bitwarden provides password and credential management.

#### Installation & Configuration

```bash
# Get Bitwarden session (via CLI or browser)
bw login your-email@example.com
export BW_SESSION=$(bw unlock your-password --raw)

# Docker Compose
services:
  bitwarden-mcp:
    build:
      context: ./services/bitwarden-mcp
    container_name: nyra-bitwarden-mcp
    restart: unless-stopped
    environment:
      - PORT=3400
      - BW_SESSION=${BW_SESSION}
      - NODE_ENV=production
    ports:
      - "3400:3400"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3400/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - nyra-network
```

---

## Nexus Router Setup

Nexus Router is the intelligent LLM routing gateway for Project Nyra.

### Installation

```bash
# Docker Compose
services:
  nexus-router:
    build:
      context: ./services/nexus-router
      dockerfile: Dockerfile
    image: nyra/nexus-router:latest
    container_name: nyra-nexus-router
    restart: unless-stopped
    environment:
      # Server Configuration
      - NEXUS_ROUTER_PORT=8000
      - NEXUS_ROUTER_MCP_PORT=4001
      - NODE_ENV=production
      - LOG_LEVEL=info

      # CORS Configuration
      - CORS_ALLOWED_ORIGINS=http://localhost:3333,http://localhost:3334,http://localhost:3001

      # Redis Configuration
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

      # Model Routing Configuration
      - MODEL_ROUTING_STRATEGY=cost-optimized
      - MODEL_ROUTING_PREFER_LOCAL=true
      - MODEL_ROUTING_FALLBACK_CLOUD=true
      - MODEL_ROUTING_COST_THRESHOLD=0.10

      # Local GPU Workers (4-PC Setup)
      - WORKER_5090_URL=http://172.20.0.50:11434
      - WORKER_5090_MODELS=llama-3.1-405b,qwen-2.5-72b,deepseek-v3
      - WORKER_3090_URL=http://172.20.0.51:11434
      - WORKER_3090_MODELS=llama-3.1-70b,qwen-2.5-32b,mixtral-8x22b
      - WORKER_3060_URL=http://172.20.0.52:11434
      - WORKER_3060_MODELS=llama-3.1-8b,qwen-2.5-7b,deepseek-coder-6.7b

      # Cloud Provider: Anthropic
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - ANTHROPIC_MODEL=claude-sonnet-4-20250514
      - ANTHROPIC_MAX_TOKENS=4096

      # Cloud Provider: OpenRouter
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
      - OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-r1

      # Monitoring
      - NEXUS_MONITORING_ENABLED=true

    volumes:
      - nexus-router-cache:/app/cache

    ports:
      - "${NEXUS_ROUTER_PORT:-8000}:8000"
      - "${NEXUS_ROUTER_MCP_PORT:-4001}:4001"

    depends_on:
      redis:
        condition: service_healthy

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    networks:
      nyra-network:
        ipv4_address: 172.20.0.20

volumes:
  nexus-router-cache:
    driver: local
```

### MCP Server Registration

Register MCP servers with Nexus Router:

```javascript
// services/nexus-router/src/config/mcp-servers.js
module.exports = {
  servers: [
    {
      name: 'archon-os',
      url: 'http://localhost:3100',
      enabled: true,
      priority: 1,
      timeout: 5000,
      healthCheck: true
    },
    {
      name: 'archon-os',
      url: 'http://localhost:3200',
      enabled: true,
      priority: 2,
      timeout: 5000,
      healthCheck: true
    },
    {
      name: 'infisical',
      url: 'http://localhost:3300',
      enabled: true,
      priority: 3,
      timeout: 5000,
      healthCheck: true
    },
    {
      name: 'bitwarden',
      url: 'http://localhost:3400',
      enabled: true,
      priority: 4,
      timeout: 5000,
      healthCheck: true
    }
  ]
};
```

### Build & Deployment

```bash
# Build Nexus Router image
cd services/nexus-router
pnpm install
pnpm build
docker build -t nyra/nexus-router:latest .

# Start Nexus Router
docker-compose up -d nexus-router

# Verify
curl http://localhost:8000/health
curl http://localhost:8000/v1/models
```

---

## Network Configuration

### Docker Network Setup

```yaml
# Create Docker network for all services
networks:
  nyra-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# Use in all services:
services:
  postgres:
    networks:
      nyra-network:
        ipv4_address: 172.20.0.10

  redis:
    networks:
      nyra-network:
        ipv4_address: 172.20.0.11

  # ... etc for other services
```

### Port Assignments

| Service | Port | Purpose |
|---------|------|---------|
| Nexus Router | 8000 | Main API + LLM routing |
| Nexus MCP Proxy | 4001 | MCP gateway |
| Claude Flow MCP | 3100 | Swarm orchestration |
| Archon OS MCP | 3200 | System automation |
| Infisical MCP | 3300 | Secret management |
| Bitwarden MCP | 3400 | Password management |
| PostgreSQL | 5432 | Relational database |
| Redis | 6379 | Cache and sessions |
| FalkorDB | 6380 | Graph database |
| Qdrant | 6333 | Vector database |
| Qdrant gRPC | 6334 | Vector database (gRPC) |
| Neo4j Bolt | 7687 | Graph database (bolt) |
| Neo4j HTTP | 7474 | Graph database (HTTP) |
| Letta | 8091 | Memory system API |
| Mem0 | 8081 | Memory system |
| letta | 9100 | Knowledge graph |
| ruvector | 8092 | Advanced memory |

### 4-PC Distributed Network Setup

For multi-PC deployments, configure static IPs:

```bash
# Network: 10.0.0.0/24
# PC1 (Orchestrator): 10.0.0.1
# PC2 (GPU Worker 1): 10.0.0.2
# PC3 (GPU Worker 2): 10.0.0.3
# PC4 (GPU Worker 3): 10.0.0.4

# Windows - Set static IP (PowerShell as Administrator)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.0.0.1 -PrefixLength 24 -DefaultGateway 10.0.0.254

# Linux - Set static IP (Ubuntu)
# Edit /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.0.0.1/24]
      gateway4: 10.0.0.254
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply changes
sudo netplan apply
```

### Firewall Configuration

```bash
# Windows Firewall (PowerShell as Administrator)
# Allow Docker bridge traffic
New-NetFirewallRule -DisplayName "Allow Docker" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000

# Linux ufw
sudo ufw allow 8000
sudo ufw allow 3100
sudo ufw allow 3200
sudo ufw allow 3300
sudo ufw allow 3400
sudo ufw allow 5432
sudo ufw allow 6379
sudo ufw allow 6380
```

---

## Verification Steps

### 1. Database Verification

```bash
# PostgreSQL
psql -h localhost -U nyra -d nyra_production -c "SELECT version();"

# Redis
redis-cli -h localhost -p 6379 ping

# FalkorDB
redis-cli -h localhost -p 6380 ping

# Qdrant
curl http://localhost:6333/health

# Neo4j (if deployed)
curl http://localhost:7474
```

### 2. Memory Systems Verification

```bash
# Letta
curl http://localhost:8091/agents

# Mem0
curl http://localhost:8081/health

# letta
curl http://localhost:9100/health

# ruvector
curl http://localhost:8092/health
```

### 3. MCP Server Verification

```bash
# Claude Flow
curl http://localhost:3100/health

# Archon OS
curl http://localhost:3200/health

# Infisical
curl http://localhost:3300/health

# Bitwarden
curl http://localhost:3400/health

# All via Nexus Router
curl http://localhost:8000/mcp/health
```

### 4. Nexus Router Verification

```bash
# Health check
curl http://localhost:8000/health

# List models
curl http://localhost:8000/v1/models

# Test chat completion
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [{"role": "user", "content": "Test message"}]
  }'

# List MCP tools
curl http://localhost:8000/mcp/tools

# Test fuzzy search
curl -X POST http://localhost:8000/mcp/search \
  -H "Content-Type: application/json" \
  -d '{"query": "swarm"}'
```

### 5. Full System Health Check

Create a health check script:

```bash
#!/bin/bash
# scripts/health-check.sh

echo "=== Project Nyra Health Check ==="
echo

# Databases
echo "Database Services:"
curl -s http://localhost:5432 > /dev/null && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"
curl -s http://localhost:6379 -o /dev/null && echo "✅ Redis" || echo "❌ Redis"
redis-cli -p 6380 ping > /dev/null 2>&1 && echo "✅ FalkorDB" || echo "❌ FalkorDB"
curl -s http://localhost:6333/health | jq '.' > /dev/null && echo "✅ Qdrant" || echo "❌ Qdrant"

echo
echo "Memory Systems:"
curl -s http://localhost:8091/agents > /dev/null && echo "✅ Letta" || echo "❌ Letta"
curl -s http://localhost:8081/health > /dev/null && echo "✅ Mem0" || echo "❌ Mem0"
curl -s http://localhost:9100/health > /dev/null && echo "✅ letta" || echo "❌ letta"
curl -s http://localhost:8092/health > /dev/null && echo "✅ ruvector" || echo "❌ ruvector"

echo
echo "MCP Servers:"
curl -s http://localhost:3100/health > /dev/null && echo "✅ Claude Flow MCP" || echo "❌ Claude Flow MCP"
curl -s http://localhost:3200/health > /dev/null && echo "✅ Archon OS MCP" || echo "❌ Archon OS MCP"
curl -s http://localhost:3300/health > /dev/null && echo "✅ Infisical MCP" || echo "❌ Infisical MCP"
curl -s http://localhost:3400/health > /dev/null && echo "✅ Bitwarden MCP" || echo "❌ Bitwarden MCP"

echo
echo "Nexus Router:"
curl -s http://localhost:8000/health > /dev/null && echo "✅ Nexus Router API" || echo "❌ Nexus Router API"
curl -s http://localhost:8000/mcp/health > /dev/null && echo "✅ Nexus MCP Proxy" || echo "❌ Nexus MCP Proxy"

echo
echo "=== Health Check Complete ==="
```

Run the script:

```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Failures

**Problem**: Services cannot connect to PostgreSQL/Redis/FalkorDB

**Solutions**:
```bash
# Check if database is running
docker ps | grep postgres

# Check logs
docker logs nyra-postgres

# Verify connection string
# Should be: postgres://user:password@host:port/database
# Not: postgres://user:password@localhost:port/database (use service name for Docker)

# Rebuild connection
docker-compose down postgres
docker volume rm nyra_postgres-data
docker-compose up -d postgres

# Test connection
psql -h postgres -U nyra -d nyra_production -c "SELECT 1;"
```

#### 2. MCP Server Not Starting

**Problem**: MCP servers fail to start or crash immediately

**Solutions**:
```bash
# Check logs
docker logs nyra-archon-os-mcp

# Verify port is not in use
netstat -ano | findstr :3100  # Windows
lsof -i :3100                 # Linux/Mac

# Kill process on port if needed
kill -9 $(lsof -t -i:3100)    # Linux/Mac

# Restart service
docker-compose down archon-os-mcp
docker-compose up -d archon-os-mcp
```

#### 3. Nexus Router Health Check Fails

**Problem**: `curl http://localhost:8000/health` returns error

**Solutions**:
```bash
# Check if Redis is healthy (required dependency)
docker logs nyra-redis
redis-cli -h redis -p 6379 ping

# Check Nexus Router logs
docker logs -f nyra-nexus-router

# Verify environment variables
docker exec nyra-nexus-router env | grep NEXUS

# Rebuild and restart
cd services/nexus-router
pnpm install
pnpm build
docker-compose restart nexus-router
```

#### 4. MCP Tools Not Discoverable

**Problem**: `curl http://localhost:8000/mcp/tools` returns empty or error

**Solutions**:
```bash
# Check MCP server health individually
curl http://localhost:3100/health  # Claude Flow
curl http://localhost:3200/health  # Archon OS

# Check if servers are registered in Nexus Router
curl http://localhost:8000/mcp/health

# Clear MCP cache
curl -X POST http://localhost:8000/mcp/cache/clear

# Restart Nexus Router
docker-compose restart nexus-router

# Check Nexus Router logs for registration errors
docker logs nyra-nexus-router | grep "registration\|error"
```

#### 5. Network Connectivity Issues

**Problem**: Services cannot communicate (host to container or container to container)

**Solutions**:
```bash
# Verify network exists
docker network ls | grep nyra-network

# Recreate network if needed
docker network rm nyra-network
docker network create nyra-network

# Test connectivity between containers
docker exec nyra-postgres ping redis
docker exec nyra-redis ping postgres

# Check Docker DNS resolution
docker exec nyra-nexus-router nslookup postgres
docker exec nyra-nexus-router nslookup redis
```

#### 6. Out of Memory or Resource Issues

**Problem**: Services crash or behave slowly due to resource constraints

**Solutions**:
```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limit (Docker Desktop settings)
# Windows/Mac: Docker Desktop > Settings > Resources
# Increase memory to at least 8GB

# Optimize database memory usage
# PostgreSQL
postgresql_config: "--shared_buffers=256MB --effective_cache_size=1GB"

# Redis
command: "redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru"

# Check available disk space
df -h                    # Linux/Mac
Get-Volume              # Windows PowerShell
```

#### 7. High API Latency

**Problem**: Requests to Nexus Router are slow (>500ms)

**Solutions**:
```bash
# Check Redis caching
redis-cli -h redis -p 6379 info stats

# Verify worker connectivity
curl http://172.20.0.50:11434/api/tags  # Check worker health

# Check Nexus Router metrics
curl http://localhost:8000/health | jq '.metrics'

# Monitor network latency
# Windows
ping -n 1 172.20.0.50
# Linux
ping -c 1 172.20.0.50

# Reduce CORS origins if not needed
# Fewer origins = faster initialization
```

### Debug Mode Logging

Enable verbose logging for troubleshooting:

```bash
# Docker Compose - Enable debug logging
services:
  nexus-router:
    environment:
      - LOG_LEVEL=debug
      - DEBUG=nexus:*

  archon-os-mcp:
    environment:
      - DEBUG=archon-os:*

# Bash - Enable debug output
DEBUG=* npm start
DEBUG=nexus:* docker-compose up nexus-router

# Monitor logs in real-time
docker logs -f nyra-nexus-router
docker logs -f nyra-archon-os-mcp --tail 100
```

---

## PC-Specific Setup Notes

### Single PC Setup (Development)

All services run on localhost with Docker:

```yaml
# docker-compose.dev.yml (all services on one PC)
services:
  postgres:
    networks:
      - nyra-network
  redis:
    networks:
      - nyra-network
  nexus-router:
    networks:
      - nyra-network
    # ... etc
```

No special network configuration needed beyond Docker networking.

### 4-PC Distributed Setup

#### PC1 (Orchestrator)
- Hosts: Nexus Router, Claude Flow MCP, Archon OS MCP, PostgreSQL, Redis, FalkorDB, Qdrant
- IP: 10.0.0.1
- Network: Connected to 10GbE switch

#### PC2 (GPU Worker 1)
- Hosts: Ollama with RTX 5090
- IP: 10.0.0.2
- Models: llama-3.1-405b, qwen-2.5-72b, deepseek-v3

#### PC3 (GPU Worker 2)
- Hosts: Neo4j, PostgreSQL replicas, Letta
- IP: 10.0.0.3
- Models: llama-3.1-70b, qwen-2.5-32b, mixtral-8x22b

#### PC4 (GPU Worker 3)
- Hosts: letta, workflow engines (n8n, Dify)
- IP: 10.0.0.4
- Models: llama-3.1-8b, qwen-2.5-7b, deepseek-coder-6.7b

### Network Configuration for 4-PC Setup

```bash
# On each PC, set static IP
# PC1: 10.0.0.1
# PC2: 10.0.0.2
# PC3: 10.0.0.3
# PC4: 10.0.0.4

# Update Nexus Router to route to workers
WORKER_5090_URL=http://10.0.0.2:11434
WORKER_3090_URL=http://10.0.0.3:11434
WORKER_3060_URL=http://10.0.0.4:11434

# Verify connectivity
ping 10.0.0.2
ping 10.0.0.3
ping 10.0.0.4
```

---

## Maintenance & Operations

### Regular Health Checks

Run health checks weekly:

```bash
./scripts/health-check.sh > health-report-$(date +%Y%m%d).log
```

### Database Backups

```bash
# PostgreSQL backup
docker exec nyra-postgres pg_dump -U nyra nyra_production > backup-$(date +%Y%m%d_%H%M%S).sql

# Redis backup
docker exec nyra-redis redis-cli BGSAVE

# Verify backup
ls -lah backup-*.sql
```

### Log Rotation

```bash
# Archive old logs
find ./logs -name "*.log" -mtime +30 -exec gzip {} \;

# Clean up archived logs
find ./logs -name "*.log.gz" -mtime +90 -delete
```

---

## Support & Resources

- **Documentation**: `docs/` directory
- **Docker Compose**: `infra/docker-compose.dev.yml`
- **Environment**: `infra/.env.example`
- **MCP Server Registry**: `config/mcp-servers.json`
- **Nexus Router Config**: `services/nexus-router/src/config/`

For issues or questions, refer to:
1. This manual setup guide
2. Individual service documentation in `services/*/README.md`
3. Deployment-specific guides in `docs/deployment/`

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-18
**Maintained by**: Project Nyra DevOps Team
