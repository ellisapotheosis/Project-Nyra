# Claude Flow V3 + Nexus Router Architecture Design

> **Hybrid Local + Container Development Setup**
> Single MCP Entry Point with Local CLI Development

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT ENVIRONMENT                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    WSL LOCAL DEVELOPMENT                │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ Claude Flow  │  │    Bun CLI   │  │ Editor/IDE   │  │   │
│  │  │     CLI      │  │  (local)     │  │   (VS Code)  │  │   │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘  │   │
│  │         │                                                │   │
│  │         │ gRPC/HTTP                                     │   │
│  │         ↓                                                │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │        Nexus Router (MCP Proxy Aggregator)      │   │   │
│  │  │         :6000 (localhost inside Docker)         │   │   │
│  │  └──────────────────┬──────────────────────────────┘   │   │
│  │                     │                                    │   │
│  └─────────────────────┼────────────────────────────────────┘   │
│                        │ Docker Network                         │
│     ┌──────────────────┼──────────────────┐                    │
│     │                  │                  │                    │
│  ┌──▼───────┐  ┌──────▼────────┐  ┌─────▼───────┐            │
│  │ Claude   │  │  Other MCP    │  │ Data Layer  │            │
│  │ Flow MCP │  │  Servers      │  │             │            │
│  │ Server   │  │ (GitHub, etc) │  │ ┌────────┐  │            │
│  └──────────┘  └───────────────┘  │ │ RuVect │  │            │
│  Port: 3001   │ Docker Compose    │ │ FalkorDB  │            │
│               │ Services          │ │ GraphiTi  │            │
│               │ Network           │ │ Redis    │            │
│               │ (claude-flow-net) │ │ PostrgreSQL            │
│               │                   │ └────────┘  │            │
│               │                   └─────────────┘            │
│               └───────────────────────────────────┘            │
│                                                                │
└────────────────────────────────────────────────────────────────┘

KEY:
- Local (WSL): Claude Flow CLI + development
- Docker: Nexus Router + MCP Servers + Data Services
- Network: Docker network for inter-service communication
- Entry Point: Nexus Router :6000 (single MCP aggregator)
```

---

## 📦 Tech Stack

### Local Development (WSL)
- **Runtime**: Bun (v1.0+)
- **Package Manager**: Bun
- **CLI**: `@claude-flow/cli@v3`
- **Language**: TypeScript/JavaScript
- **IDE**: VS Code (local)

### Containerized Services (Docker)
```
Service                 | Port   | Image/Command
────────────────────────┼────────┼──────────────────────────────
Nexus Router (MCP)      | 6000   | graphbase/nexus:latest
Claude Flow MCP         | 3001   | node @claude-flow/mcp start
RuVector API            | 7070   | ruvector:latest
FalkorDB                | 6379   | falkordb/falkordb:latest
PostgreSQL (RuVector)   | 5432   | postgres:16-alpine
Redis (Cache)           | 6379   | redis:7-alpine
Graphiti MCP            | 3002   | @graphiti/mcp
```

### Memory Architecture
```
┌──────────────────────────────────────────────┐
│          HYBRID MEMORY SYSTEM                │
├──────────────────────────────────────────────┤
│                                              │
│  PRIMARY: RuVector                          │
│  ├─ Semantic vector search (1536-dim)      │
│  ├─ HNSW indexing (fast retrieval)         │
│  ├─ Persistent: PostgreSQL + Redis         │
│  └─ Performance: 150x-12,500x faster       │
│                                              │
│  SECONDARY: FalkorDB                        │
│  ├─ Knowledge graph storage                │
│  ├─ Relationship tracking                  │
│  └─ Query interface (Cypher)              │
│                                              │
│  TERTIARY: Graphiti                         │
│  ├─ Temporal knowledge graphs              │
│  ├─ Agent memory context                   │
│  └─ Workflow tracking                      │
│                                              │
│  CACHE: Redis                               │
│  ├─ Session storage                        │
│  ├─ Token caching                          │
│  └─ LRU eviction                           │
│                                              │
│  PERSISTENCE: PostgreSQL                   │
│  ├─ RuVector embeddings                    │
│  ├─ Memory indices                         │
│  └─ Audit trails                           │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🔌 MCP Architecture

### Single Entry Point: Nexus Router

**Role**: MCP Proxy Aggregator
- Receives all Claude Flow CLI requests on port 6000
- Routes to appropriate MCP servers
- Handles authentication and request validation
- Manages service discovery

### MCP Servers Behind Nexus

1. **Claude Flow MCP** (Port 3001 → Nexus 6000)
   - Agent orchestration
   - Swarm coordination
   - Memory management

2. **Graphiti MCP** (Port 3002 → Nexus 6000)
   - Knowledge graph operations
   - Temporal memory

3. **GitHub MCP** (Port 3003 → Nexus 6000)
   - Repository operations
   - PR management

4. **Custom MCP Servers** (Port 3004+ → Nexus 6000)
   - Domain-specific operations

### Connection Flow

```
Claude Flow CLI (Local)
        ↓
   localhost:6000
        ↓
  Nexus Router (Docker)
        ├→ Claude Flow MCP :3001
        ├→ Graphiti MCP :3002
        ├→ GitHub MCP :3003
        └→ Custom MCPs :3004+
```

---

## 🐳 Docker Compose Architecture

### Services Organization

```yaml
version: '3.9'

services:
  # === MCP PROXY AGGREGATOR ===
  nexus-router:
    container_name: nexus-router
    ports: ["6000:6000"]

  # === MCP SERVERS ===
  claude-flow-mcp:
    container_name: claude-flow-mcp
    ports: ["3001:3001"]

  graphiti-mcp:
    container_name: graphiti-mcp
    ports: ["3002:3002"]

  # === DATA LAYER ===
  postgres:           # RuVector persistence
  redis:              # Caching & sessions
  falkordb:           # Knowledge graphs

networks:
  claude-flow-net:    # Shared network for all services
```

---

## 💻 Local Development Workflow

### Setup (One Time)

```bash
# 1. Install Bun
curl -fsSL https://bun.sh/install | bash

# 2. Clone & install dependencies
cd project-nyra
bun install

# 3. Start Docker services
docker compose up -d

# 4. Initialize Claude Flow
bun run claude-flow init
```

### Daily Development

```bash
# Terminal 1: Docker services (runs in background)
docker compose up -d

# Terminal 2: Local development
bun run dev
bun run test
bun run lint

# Optional: Watch Docker logs
docker compose logs -f

# When done
docker compose down
```

---

## 🔄 Environment-Specific Setup

### Development Environment

**Location**: Local WSL
- Claude Flow CLI runs locally
- Edit code with hot reload
- Connect to containerized services via Docker network
- Full debugging support

### How It Works

1. **Local CLI** → Connects to **Nexus Router** at `localhost:6000`
2. **Nexus Router** → Routes to **Claude Flow MCP** at `claude-flow-mcp:3001` (Docker DNS)
3. **Claude Flow MCP** → Connects to **Data Layer** (RuVector, Redis, etc.)

### Key: Docker Network Resolution

Inside Docker containers, service names resolve via DNS:
- `claude-flow-mcp:3001` ← Docker DNS resolves to container IP
- Works seamlessly because Nexus Router is also in Docker network

### Local CLI Configuration

```bash
# .env.local (for local development)
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_PORT=6000
NEXUS_ROUTER_HOST=localhost
NEXUS_ROUTER_PORT=6000
```

---

## 🚀 Container vs Local: Decision Matrix

| Component | Location | Reason |
|-----------|----------|--------|
| **Claude Flow CLI** | Local (WSL) | Development, debugging, immediate feedback |
| **Nexus Router** | Docker | Single entry point, service aggregation |
| **Claude Flow MCP** | Docker | Background service, memory management |
| **Graphiti MCP** | Docker | Graph operations, background processing |
| **Data Services** | Docker | Shared state, persistence, reproducibility |
| **Source Code** | Local (WSL) | Editing, version control, IDE integration |

---

## 📁 Project Structure

```
project-nyra/
├── docker-compose.dev.yml          ← Development services
├── docker-compose.override.yml      ← Local overrides
├── .env.dev.local                   ← Local environment
├── .env.example                     ← Template
│
├── src/
│   ├── services/                    ← Backend services
│   │   ├── claude-flow-mcp/         ← Claude Flow MCP (containerized)
│   │   ├── graphiti-integration/    ← Graphiti operations
│   │   └── providers/               ← Provider implementations
│   ├── lib/                         ← Shared utilities
│   └── types/                       ← TypeScript types
│
├── .claude-flow/
│   ├── config.json                  ← Local CLI configuration
│   ├── providers/                   ← Provider configurations
│   └── scripts/                     ← Utility scripts
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.nexus         ← Nexus Router
│   │   ├── Dockerfile.claude-flow   ← Claude Flow MCP
│   │   └── Dockerfile.mcp-servers   ← Generic MCP
│   ├── k8s/                         ← Future: Kubernetes
│   └── compose/
│       ├── base.yml                 ← Core services
│       ├── mcp-servers.yml          ← MCP services
│       ├── data-layer.yml           ← Data services
│       └── overrides/               ← Environment-specific
│
├── bun.lock                         ← Bun lockfile
└── package.json                     ← Bun configuration
```

---

## 🔌 Provider System

Claude Flow V3 includes a modular provider system:

```
@claude-flow/providers
├── llm/                    ← LLM providers
│   ├── anthropic/
│   ├── openrouter/
│   └── local/
├── memory/                 ← Memory providers
│   ├── ruvector/
│   ├── agentdb/
│   ├── graphiti/
│   └── redis/
├── embedding/              ← Embedding providers
│   ├── openai/
│   └── local/
└── search/                 ← Search providers
    ├── ruvector-search/
    └── falkordb-query/
```

Each provider is independently configurable and loadable.

---

## 🎯 Setup Recommendation

### Recommended Local + Container Split

**Local (Your Machine)**
```bash
- Bun CLI + development
- IDE + code editing
- Claude Flow CLI (v3)
- Package management
```

**Docker (Abstracted)**
```bash
- Nexus Router (single MCP entry)
- Claude Flow MCP (coordination)
- Graphiti MCP (knowledge graphs)
- RuVector + Redis + FalkorDB + PostgreSQL
- All data persistence
```

**Benefits**
✅ Hot reload local development
✅ Single MCP entry point (Nexus)
✅ Reproducible data layer
✅ Easy debugging with local CLI
✅ Scalable to production (same Docker setup)
✅ No need to containerize CLI for development
✅ Smooth WSL ↔ Docker integration

---

## 🔗 Connection Details

### From Local CLI to Docker Services

```javascript
// Local configuration
const config = {
  mcp: {
    host: 'localhost',      // Accessible from WSL
    port: 6000,             // Nexus Router exposed port
    providers: {
      ruvector: {
        host: 'localhost',  // Via docker-compose port mapping
        port: 7070
      },
      postgres: {
        host: 'localhost',
        port: 5432
      },
      redis: {
        host: 'localhost',
        port: 6379
      }
    }
  }
};
```

### Inside Docker Network (Service-to-Service)

```javascript
// Docker service configuration
const config = {
  mcp: {
    host: 'nexus-router',           // Docker DNS (container name)
    port: 6000,                     // Internal port
    providers: {
      ruvector: {
        host: 'ruvector',           // Docker service name
        port: 7070
      },
      postgres: {
        host: 'postgres',           // Docker service name
        port: 5432
      }
    }
  }
};
```

---

## 📊 Data Flow Examples

### Example 1: Local Development

```
1. Developer: bun run dev
2. Local CLI connects to localhost:6000 (Nexus Router)
3. Nexus routes to claude-flow-mcp container
4. Claude Flow MCP queries RuVector (Docker service)
5. RuVector persists to PostgreSQL (Docker service)
6. Developer sees results in terminal
```

### Example 2: Agent Orchestration

```
1. Claude Flow CLI spawns mesh topology swarm
2. Agents coordinate via Nexus Router (6000)
3. Memory operations hit RuVector (localhost:7070)
4. Cache operations hit Redis (localhost:6379)
5. Knowledge graph queries hit FalkorDB (localhost:6379)
6. Audit trail persisted to PostgreSQL (localhost:5432)
```

### Example 3: Production Deployment

```
Same Docker Compose, different environment:
1. Deploy entire stack to Kubernetes/Docker Swarm
2. Local paths become container volumes
3. localhost:6000 becomes service DNS
4. Everything else unchanged
```

---

## ✅ Verification Checklist

After setup, verify:

```bash
# ✓ Local Claude Flow CLI works
bun run claude-flow status

# ✓ Nexus Router accessible
curl localhost:6000/health

# ✓ Docker services running
docker compose ps

# ✓ RuVector accessible
curl localhost:7070/health

# ✓ Redis accessible
redis-cli -h localhost ping

# ✓ PostgreSQL accessible
psql -h localhost -U postgres -d ruvector -c "SELECT 1;"

# ✓ Full integration
bun run claude-flow memory search --query "test"
```

