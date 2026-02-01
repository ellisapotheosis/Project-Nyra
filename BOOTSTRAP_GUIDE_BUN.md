# Claude Flow V3 Development Bootstrap Guide (Bun + Docker)

> **Hybrid Local Development + Containerized Services**
> Single MCP Entry Point via Nexus Router
> Optimized for WSL Development

---

## 📋 Quick Start (5 minutes)

```bash
# 1. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# 2. Navigate to project
cd ~/projects/project-nyra

# 3. Install dependencies
bun install

# 4. Start Docker services
docker compose -f docker-compose.dev.yml up -d

# 5. Initialize Claude Flow
bun run claude-flow init --development

# 6. Verify setup
bun run verify
```

Done! You're ready to develop.

---

## 📦 Phase 1: Prerequisites & Local Setup

### Step 1.1: Verify Bun Installation

```bash
# Check Bun version (should be v1.0+)
bun --version

# Check Node compatibility
bun --version  # Uses bundled Node

# Verify Bun can access npm registry
bun install --dry-run
```

### Step 1.2: Initialize Bun Project

```bash
# From project root, ensure bun.lock exists
ls bun.lock

# If not, initialize
bun init --yes

# Verify bun.lock is tracked (gitignore should exclude it)
git status | grep -E "bun.lock|node_modules"
```

### Step 1.3: Create Local Environment File

Create `.env.local` (never commit):

```bash
# === LOCAL DEVELOPMENT ===
ENVIRONMENT=development
DEBUG=claude-flow:*

# === CLAUDE FLOW CONFIG ===
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_PORT=6000
CLAUDE_FLOW_DATA_DIR=./.swarm

# === NEXUS ROUTER ===
NEXUS_ROUTER_HOST=localhost
NEXUS_ROUTER_PORT=6000

# === RUVECTOR (Local Access via Docker Port Mapping) ===
RUVECTOR_HOST=localhost
RUVECTOR_PORT=7070
RUVECTOR_DIMENSION=1536
RUVECTOR_MAX_ELEMENTS=100000

# === MEMORY BACKENDS ===
MEMORY_BACKEND=hybrid
MEMORY_PRIMARY=ruvector
MEMORY_SECONDARY=graphiti,falkordb,redis

# === DATA SERVICES ===
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=ruvector
POSTGRES_PASSWORD=dev-password
POSTGRES_DB=ruvector

REDIS_HOST=localhost
REDIS_PORT=6379

FALKORDB_HOST=localhost
FALKORDB_PORT=6379  # FalkorDB runs as Redis module

# === PROVIDERS ===
ANTHROPIC_API_KEY=sk-ant-...  # Fill in
OPENROUTER_API_KEY=...        # Optional
GITHUB_TOKEN=...              # Optional

# === LOGGING ===
LOG_LEVEL=debug
LOG_FORMAT=pretty              # Pretty output for local development
```

---

## 📦 Phase 2: Bun Dependencies Installation

### Step 2.1: Core Claude Flow Packages

```bash
# Main CLI and core modules
bun add -D \
  @claude-flow/cli@latest \
  @claude-flow/core@latest \
  @claude-flow/providers@latest \
  @claude-flow/memory@latest \
  @claude-flow/agents@latest \
  @claude-flow/swarm@latest \
  @claude-flow/hooks@latest \
  @claude-flow/plugins@latest \
  @claude-flow/mcp-sdk@latest

# Alternatively, add individually for better control
bun add -D @claude-flow/cli
bun add -D @claude-flow/core
bun add -D @claude-flow/providers
```

Check what's available:

```bash
# View installed Claude Flow packages
bun pm ls | grep claude-flow

# View package contents
bun pm ls @claude-flow/providers
```

### Step 2.2: Memory System Dependencies

```bash
# Primary: RuVector
bun add @ruvector/sdk @ruvector/hnsw

# Secondary: FalkorDB (Redis module)
bun add falkordb

# Secondary: Graphiti (Knowledge graphs)
bun add @graphiti/sdk

# Tertiary: AgentDB (if compatible with RuVector)
bun add @agentdb/client

# Cache: Redis
bun add redis ioredis

# Data: PostgreSQL (RuVector persistence)
bun add pg
```

### Step 2.3: Provider Dependencies

```bash
# LLM Providers
bun add @anthropic-ai/sdk openrouter

# Embedding Providers
bun add @xenova/transformers  # Local embeddings

# Search/Query Providers
bun add axios graphql

# MCP Servers & Integrations
bun add @modelcontextprotocol/sdk
```

### Step 2.4: Development Dependencies

```bash
# TypeScript & Types
bun add -d typescript @types/bun @types/node

# Testing
bun add -d vitest @vitest/ui

# Quality Tools
bun add -d eslint prettier @typescript-eslint/eslint-plugin

# Utilities
bun add dotenv pino pino-pretty
```

### Step 2.5: Update package.json

Add to `scripts` section:

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --target=node",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "type-check": "tsc --noEmit",

    "claude-flow": "bun ./node_modules/@claude-flow/cli/bin/cli.js",
    "claude-flow:init": "bun run claude-flow init --development",
    "claude-flow:status": "bun run claude-flow status",
    "claude-flow:swarm:init": "bun run claude-flow swarm init --topology mesh --max-agents 8",
    "claude-flow:memory:init": "bun run claude-flow memory init --force",
    "claude-flow:memory:search": "bun run claude-flow memory search",
    "claude-flow:daemon:start": "bun run claude-flow daemon start",
    "claude-flow:daemon:stop": "bun run claude-flow daemon stop",
    "claude-flow:mcp:list": "bun run claude-flow mcp list",

    "docker:up": "docker compose -f docker-compose.dev.yml up -d",
    "docker:down": "docker compose -f docker-compose.dev.yml down",
    "docker:logs": "docker compose -f docker-compose.dev.yml logs -f",
    "docker:ps": "docker compose -f docker-compose.dev.yml ps",

    "verify": "bun run verify.ts",
    "health": "bun run health-check.ts",

    "setup": "bun install && bun run docker:up && bun run claude-flow:init"
  }
}
```

---

## 🐳 Phase 3: Docker Services Setup

### Step 3.1: Create docker-compose.dev.yml

```yaml
version: '3.9'

services:
  # ========== MCP PROXY AGGREGATOR ==========
  nexus-router:
    image: graphbase/nexus:latest
    container_name: nexus-router
    ports:
      - "6000:6000"
    environment:
      LOG_LEVEL: debug
      SERVICE_NAME: nexus-router
      NEXUS_CONFIG: /etc/nexus/config.json
    volumes:
      - ./infra/nexus-config.json:/etc/nexus/config.json
    networks:
      - claude-flow-net
    depends_on:
      - claude-flow-mcp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ========== CLAUDE FLOW MCP SERVER ==========
  claude-flow-mcp:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.claude-flow-mcp
    container_name: claude-flow-mcp
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
      RUVECTOR_HOST: ruvector
      RUVECTOR_PORT: 7070
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_USER: ruvector
      POSTGRES_PASSWORD: dev-password
      POSTGRES_DB: ruvector
      REDIS_HOST: redis
      REDIS_PORT: 6379
      FALKORDB_HOST: falkordb
      FALKORDB_PORT: 6379
    volumes:
      - ./src:/app/src
      - ./.swarm:/app/.swarm
    networks:
      - claude-flow-net
    depends_on:
      - postgres
      - redis
      - ruvector
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ========== GRAPHITI MCP SERVER ==========
  graphiti-mcp:
    image: @graphiti/mcp:latest
    container_name: graphiti-mcp
    ports:
      - "3002:3002"
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
      FALKORDB_HOST: falkordb
      FALKORDB_PORT: 6379
    networks:
      - claude-flow-net
    depends_on:
      - falkordb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ========== DATA LAYER ==========

  # PostgreSQL (RuVector persistence)
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ruvector
      POSTGRES_PASSWORD: dev-password
      POSTGRES_DB: ruvector
      POSTGRES_INITDB_ARGS: "-c shared_buffers=256MB -c max_connections=200"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - claude-flow-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ruvector"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (Caching & Sessions)
  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - claude-flow-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RuVector (Vector database)
  ruvector:
    image: ruvector:latest
    container_name: ruvector
    ports:
      - "7070:7070"
    environment:
      LOG_LEVEL: debug
      DIMENSION: 1536
      MAX_ELEMENTS: 100000
      DATABASE_URL: postgresql://ruvector:dev-password@postgres:5432/ruvector
    volumes:
      - ruvector_data:/data
    networks:
      - claude-flow-net
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7070/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FalkorDB (Graph database, Redis module)
  falkordb:
    image: falkordb/falkordb:latest
    container_name: falkordb
    ports:
      - "6380:6379"
    environment:
      LOGLEVEL: debug
    volumes:
      - falkordb_data:/data
    networks:
      - claude-flow-net
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6379", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  claude-flow-net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  ruvector_data:
  falkordb_data:
```

### Step 3.2: Create Nexus Router Configuration

Create `infra/nexus-config.json`:

```json
{
  "version": "1.0.0",
  "router": {
    "port": 6000,
    "logLevel": "debug",
    "requestTimeout": 30000
  },
  "services": [
    {
      "name": "claude-flow-mcp",
      "type": "grpc",
      "address": "claude-flow-mcp:3001",
      "healthCheck": {
        "enabled": true,
        "interval": 30000,
        "timeout": 5000
      },
      "routes": [
        {
          "path": "/claude-flow/*",
          "methods": ["GET", "POST", "PUT", "DELETE"]
        }
      ]
    },
    {
      "name": "graphiti-mcp",
      "type": "grpc",
      "address": "graphiti-mcp:3002",
      "healthCheck": {
        "enabled": true,
        "interval": 30000,
        "timeout": 5000
      },
      "routes": [
        {
          "path": "/graphiti/*",
          "methods": ["GET", "POST"]
        }
      ]
    }
  ],
  "loadBalancing": {
    "strategy": "round-robin",
    "healthCheckInterval": 30000
  },
  "security": {
    "requireAuth": false,
    "corsEnabled": true,
    "allowedOrigins": ["localhost:*", "127.0.0.1:*"]
  }
}
```

### Step 3.3: Create Claude Flow MCP Dockerfile

Create `infra/docker/Dockerfile.claude-flow-mcp`:

```dockerfile
FROM oven/bun:latest as builder

WORKDIR /app

# Copy package files
COPY bun.lock package.json ./

# Install dependencies
RUN bun install --production --frozen-lockfile

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN bun build src/mcp/server.ts --target=node --outdir=dist

# Runtime stage
FROM oven/bun:latest

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Run Claude Flow MCP
EXPOSE 3001
CMD ["bun", "dist/mcp/server.js"]
```

---

## ⚙️ Phase 4: Claude Flow V3 Configuration

### Step 4.1: Initialize Claude Flow CLI

```bash
# Initialize with development profile
bun run claude-flow init --development

# This creates .claude-flow/config.json
```

### Step 4.2: Create .claude-flow/config.json

```json
{
  "version": "3.0.0",
  "environment": "development",
  "project": {
    "name": "project-nyra",
    "description": "AI-Powered Mortgage Automation",
    "type": "microservices"
  },
  "mcp": {
    "nexusRouter": {
      "host": "localhost",
      "port": 6000,
      "transport": "http"
    },
    "servers": [
      {
        "name": "claude-flow",
        "address": "localhost:3001",
        "type": "internal"
      },
      {
        "name": "graphiti",
        "address": "localhost:3002",
        "type": "internal"
      }
    ]
  },
  "swarm": {
    "topology": "mesh",
    "maxAgents": 8,
    "strategy": "balanced",
    "coordinator": {
      "type": "peer",
      "enableLogging": true
    }
  },
  "memory": {
    "backend": "hybrid",
    "primary": "ruvector",
    "secondary": ["graphiti", "falkordb", "redis"],
    "providers": {
      "ruvector": {
        "host": "localhost",
        "port": 7070,
        "dimension": 1536,
        "maxElements": 100000,
        "hnsw": {
          "efConstruction": 200,
          "ef": 100,
          "seed": 0
        },
        "persistence": {
          "backend": "postgresql",
          "connectionString": "postgresql://ruvector:dev-password@localhost:5432/ruvector"
        }
      },
      "redis": {
        "host": "localhost",
        "port": 6379,
        "db": 0,
        "ttl": 3600
      },
      "graphiti": {
        "host": "localhost",
        "port": 3002,
        "type": "falkordb"
      },
      "falkordb": {
        "host": "localhost",
        "port": 6380,
        "database": "default"
      }
    }
  },
  "providers": {
    "llm": {
      "default": "anthropic",
      "models": {
        "anthropic": {
          "model": "claude-opus-4.5-20251101",
          "apiKey": "${ANTHROPIC_API_KEY}"
        }
      }
    },
    "embedding": {
      "default": "local",
      "models": {
        "local": {
          "model": "sentence-transformers/all-MiniLM-L6-v2"
        }
      }
    }
  },
  "logging": {
    "level": "debug",
    "format": "pretty",
    "transports": ["console"]
  },
  "development": {
    "hotReload": true,
    "debugMode": true,
    "sourceMapSupport": true
  }
}
```

### Step 4.3: Create .claude-flow/providers.json

Configuration for all available providers:

```json
{
  "providers": {
    "llm": {
      "anthropic": {
        "enabled": true,
        "apiKey": "${ANTHROPIC_API_KEY}",
        "models": ["claude-opus-4.5-20251101", "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"]
      },
      "openrouter": {
        "enabled": false,
        "apiKey": "${OPENROUTER_API_KEY}",
        "baseUrl": "https://openrouter.ai/api/v1"
      },
      "local": {
        "enabled": false,
        "baseUrl": "http://localhost:11434"
      }
    },
    "memory": {
      "ruvector": {
        "enabled": true,
        "host": "localhost",
        "port": 7070,
        "dimension": 1536
      },
      "agentdb": {
        "enabled": false,
        "compatible": ["ruvector"],
        "host": "localhost",
        "port": 9000
      },
      "graphiti": {
        "enabled": true,
        "host": "localhost",
        "port": 3002
      },
      "redis": {
        "enabled": true,
        "host": "localhost",
        "port": 6379
      },
      "falkordb": {
        "enabled": true,
        "host": "localhost",
        "port": 6380
      },
      "postgres": {
        "enabled": true,
        "connectionString": "postgresql://ruvector:dev-password@localhost:5432/ruvector"
      }
    },
    "embedding": {
      "local": {
        "enabled": true,
        "model": "sentence-transformers/all-MiniLM-L6-v2"
      },
      "openai": {
        "enabled": false,
        "apiKey": "${OPENAI_API_KEY}",
        "model": "text-embedding-3-small"
      }
    },
    "search": {
      "ruvector": {
        "enabled": true,
        "host": "localhost",
        "port": 7070
      },
      "falkordb": {
        "enabled": true,
        "host": "localhost",
        "port": 6380,
        "language": "cypher"
      }
    }
  }
}
```

---

## 🔌 Phase 5: Verify & Test Setup

### Step 5.1: Create Verification Script

Create `verify.ts`:

```typescript
import { $ } from "bun";

async function verify() {
  console.log("🔍 Verifying Claude Flow Setup...\n");

  const checks = [
    { name: "Bun version", cmd: "bun --version" },
    { name: "Node version", cmd: "node --version" },
    { name: "Docker running", cmd: "docker ps -q > /dev/null && echo ok" },
    { name: "Docker Compose", cmd: "docker compose version" },
    { name: "Dependencies", cmd: "test -f bun.lock && echo ok" },
    { name: "Claude Flow CLI", cmd: "bun run claude-flow --version" },
    { name: ".env.local", cmd: "test -f .env.local && echo ok" },
    { name: "Docker services", cmd: "docker compose -f docker-compose.dev.yml ps" },
  ];

  for (const check of checks) {
    try {
      console.log(`⏳ ${check.name}...`);
      const result = await $`${check.cmd}`.text();
      console.log(`✅ ${check.name}: ${result.trim()}\n`);
    } catch (e) {
      console.log(`❌ ${check.name}: FAILED\n`);
    }
  }

  // Test local -> Docker connectivity
  console.log("🔌 Testing connectivity...\n");

  try {
    const nexusHealth = await fetch("http://localhost:6000/health")
      .then(r => r.ok ? "✅" : "❌")
      .catch(() => "❌");
    console.log(`Nexus Router: ${nexusHealth}`);

    const ruvectorHealth = await fetch("http://localhost:7070/health")
      .then(r => r.ok ? "✅" : "❌")
      .catch(() => "❌");
    console.log(`RuVector: ${ruvectorHealth}`);

    const redisCheck = await $`redis-cli -h localhost ping`.text()
      .then(() => "✅")
      .catch(() => "❌");
    console.log(`Redis: ${redisCheck}`);
  } catch (e) {
    console.log("⚠️ Some connectivity checks failed (services may not be running yet)");
  }

  console.log("\n✨ Verification complete!");
}

verify().catch(console.error);
```

Run it:

```bash
bun run verify
```

### Step 5.2: Create Health Check Script

Create `health-check.ts`:

```typescript
async function healthCheck() {
  const services = [
    { name: "Nexus Router", url: "http://localhost:6000/health" },
    { name: "Claude Flow MCP", url: "http://localhost:3001/health" },
    { name: "Graphiti MCP", url: "http://localhost:3002/health" },
    { name: "RuVector", url: "http://localhost:7070/health" },
    { name: "PostgreSQL", url: "http://localhost:5432" },
    { name: "Redis", url: "http://localhost:6379" },
  ];

  console.log("📊 Service Health Check\n");

  for (const service of services) {
    try {
      const response = await fetch(service.url, { signal: AbortSignal.timeout(2000) });
      console.log(`✅ ${service.name}: ${response.status}`);
    } catch (e) {
      console.log(`❌ ${service.name}: DOWN`);
    }
  }
}

healthCheck().catch(console.error);
```

---

## 🚀 Phase 6: Quick Start Workflow

### First Time Setup (One Command)

```bash
# This does everything
bun run setup

# Equivalent to:
# bun install
# docker compose -f docker-compose.dev.yml up -d
# bun run claude-flow init --development
```

### Daily Development

```bash
# Terminal 1: Start services (runs in background)
bun run docker:up

# Terminal 2: Develop locally
bun run dev

# Optional: Monitor Docker
bun run docker:logs

# When done
bun run docker:down
```

### Common Commands

```bash
# Initialize swarm
bun run claude-flow:swarm:init

# Initialize memory
bun run claude-flow:memory:init

# Search memory
bun run claude-flow:memory:search --query "your query"

# Check status
bun run claude-flow:status

# List MCP servers
bun run claude-flow:mcp:list

# Start daemon (if not auto-starting)
bun run claude-flow:daemon:start
```

---

## 📁 Directory Structure After Setup

```
project-nyra/
├── .env.local                           (git-ignored, local only)
├── .env.example                         (template, committed)
├── bun.lock                             (committed)
├── package.json                         (Bun configuration)
│
├── .claude-flow/
│   ├── config.json                      (Claude Flow V3 config)
│   ├── providers.json                   (Provider configurations)
│   └── .claude-flow.lock               (CLI lock file)
│
├── src/
│   ├── index.ts                         (Local development entry)
│   └── mcp/
│       └── server.ts                    (Claude Flow MCP server)
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.claude-flow-mcp
│   │   └── Dockerfile.nexus-router
│   ├── nexus-config.json               (Router configuration)
│   └── postgres/
│       └── init.sql                     (Database initialization)
│
├── docker-compose.dev.yml              (Development services)
├── docker-compose.override.yml         (Local overrides, optional)
│
├── .swarm/                              (Runtime data, git-ignored)
│   ├── memory/                          (RuVector indices)
│   ├── logs/                            (Application logs)
│   └── cache/                           (Temporary cache)
│
├── verify.ts                            (Setup verification)
└── health-check.ts                      (Health checks)
```

---

## ✅ Verification Checklist

After running `bun run setup`, verify:

```bash
# ✓ Bun works
bun --version

# ✓ Dependencies installed
bun pm ls | grep claude-flow

# ✓ Docker running
docker ps

# ✓ Services healthy
bun run health

# ✓ Claude Flow CLI works
bun run claude-flow status

# ✓ Nexus Router accessible
curl localhost:6000/health

# ✓ RuVector accessible
curl localhost:7070/health

# ✓ Can search memory (after init)
bun run claude-flow:memory:search --query "test"
```

---

## 🔧 Troubleshooting

### Docker containers not starting

```bash
# Check logs
docker compose -f docker-compose.dev.yml logs

# Rebuild services
docker compose -f docker-compose.dev.yml up --build -d

# Start fresh
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

### Claude Flow CLI not finding services

```bash
# Verify localhost:6000 is accessible
curl http://localhost:6000/health

# Check .env.local has correct settings
cat .env.local | grep NEXUS

# Restart Claude Flow daemon
bun run claude-flow:daemon:stop
bun run claude-flow:daemon:start
```

### Memory not persisting

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.dev.yml logs postgres

# Verify RuVector connection
psql -h localhost -U ruvector -d ruvector -c "SELECT 1;"

# Check volumes
docker volume ls | grep ruvector
```

### Port conflicts

If ports are already in use, modify `docker-compose.dev.yml`:

```yaml
nexus-router:
  ports:
    - "6001:6000"  # Change 6000 to 6001

ruvector:
  ports:
    - "7071:7070"  # Change 7070 to 7071
```

Then update `.env.local` to match.

---

## 🎯 Next Steps

1. **Start coding**: `bun run dev`
2. **Run tests**: `bun run test`
3. **Initialize agents**: `bun run claude-flow:swarm:init`
4. **Check memory**: `bun run claude-flow:memory:init`
5. **Deploy**: Use same Docker Compose for production

---

## 📚 Additional Resources

- **Architecture**: See `ARCHITECTURE_DESIGN.md` for detailed system design
- **Claude Flow CLI**: `bun run claude-flow --help`
- **Docker Compose**: `docker compose --help`
- **Bun Documentation**: https://bun.sh/docs
- **RuVector Docs**: https://github.com/ruvector/ruvector
- **FalkorDB Docs**: https://www.falkordb.com/docs
