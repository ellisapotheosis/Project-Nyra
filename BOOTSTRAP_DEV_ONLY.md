# Claude Flow V3 Development Bootstrap (Dev-Only, Local)

> **Development Environment Setup**
> Separate from Production Infrastructure
> References Existing Infra Containers
> Local CLI + Provider Tools

---

## 🎯 Philosophy

**DO NOT MODIFY**: Production `package.json` or `infra/` containers

**DO**: Setup local development environment that:
- Uses existing `infra/` containers (Nexus Router, RuVector, PostgreSQL, Redis, etc.)
- Installs Claude Flow CLI locally (for development)
- Sets up Claude Flow Providers (local fork/clone or global install)
- Allows hot editing and debugging locally
- Connects to containerized services via Docker network

---

## ⚡ Quick Start (Dev Only)

```bash
# 1. Ensure infra containers are running
docker compose -f infra/docker-compose.yml up -d

# 2. Install Bun CLI for development
bun --version

# 3. Create dev-only setup
mkdir -p .dev
cd .dev

# 4. Setup local development environment
bun init --yes

# 5. Install Claude Flow CLI locally (global or dev)
bun add -g @claude-flow/cli@latest

# 6. Install providers locally
git clone https://github.com/anthropics/claude-flow-providers.git
cd claude-flow-providers && bun install && cd ..

# 7. Configure local development
cp ../.env.example .env.local
```

---

## 📦 Phase 1: Local-Only Development Structure

### Step 1.1: Create `.dev/` Directory (Git-Ignored)

```bash
# Create separate dev workspace
mkdir -p .dev/{bin,configs,scripts}

# Add to .gitignore
echo ".dev/" >> .gitignore
echo "node_modules/" >> .gitignore
echo "bun.lock" >> .gitignore
```

### Step 1.2: Dev Environment Configuration

Create `.dev/.env.local`:

```bash
# === DEVELOPMENT ONLY ===
ENVIRONMENT=development
DEBUG=claude-flow:*,providers:*

# === REFERENCE EXISTING INFRA ===
# These services already run in infra/docker-compose.yml
NEXUS_ROUTER_HOST=localhost
NEXUS_ROUTER_PORT=6000

RUVECTOR_HOST=localhost
RUVECTOR_PORT=7070

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=ruvector
POSTGRES_PASSWORD=dev-password
POSTGRES_DB=ruvector

REDIS_HOST=localhost
REDIS_PORT=6379

FALKORDB_HOST=localhost
FALKORDB_PORT=6380

GRAPHITI_HOST=localhost
GRAPHITI_PORT=3002

# === CLAUDE FLOW CLI ===
CLAUDE_FLOW_HOME=./.claude-flow
CLAUDE_FLOW_DATA_DIR=./.swarm

# === PROVIDERS ===
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=
GITHUB_TOKEN=

# === LOGGING ===
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Step 1.3: Create `.dev/package.json` (Dev-Only)

```json
{
  "name": "project-nyra-dev",
  "version": "0.0.1",
  "private": true,
  "description": "Development environment for Claude Flow V3",
  "type": "module",
  "bin": {
    "claude-flow-dev": "./bin/cli.js"
  },
  "scripts": {
    "install-cli": "bun add -g @claude-flow/cli@latest",
    "install-providers": "git clone https://github.com/anthropics/claude-flow-providers.git && cd claude-flow-providers && bun install",
    "setup": "bun run install-cli && bun run install-providers",

    "cf": "bun ./node_modules/@claude-flow/cli/bin/cli.js",
    "cf:init": "bun run cf init --development",
    "cf:status": "bun run cf status",
    "cf:swarm:init": "bun run cf swarm init --topology mesh --max-agents 8",
    "cf:memory:init": "bun run cf memory init --force",
    "cf:memory:search": "bun run cf memory search",
    "cf:providers:list": "bun run cf providers list",
    "cf:mcp:list": "bun run cf mcp list",
    "cf:daemon:start": "bun run cf daemon start",
    "cf:daemon:stop": "bun run cf daemon stop",

    "dev": "bun run --watch ../src/index.ts",
    "test": "vitest run",
    "lint": "eslint ../src --ext .ts,.tsx",

    "docker:ps": "docker compose -f ../infra/docker-compose.yml ps",
    "docker:logs": "docker compose -f ../infra/docker-compose.yml logs -f",
    "docker:up": "docker compose -f ../infra/docker-compose.yml up -d",
    "docker:down": "docker compose -f ../infra/docker-compose.yml down",

    "health": "bun run health-check.ts",
    "verify": "bun run verify-setup.ts"
  },
  "dependencies": {
    "dotenv": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "latest",
    "typescript": "latest",
    "vitest": "latest",
    "eslint": "latest"
  }
}
```

---

## 🔌 Phase 2: Claude Flow CLI Local Installation

### Step 2.1: Install CLI Globally (Recommended for Dev)

```bash
# Install Claude Flow CLI globally for easy access
bun add -g @claude-flow/cli@latest

# Verify installation
bun -g list @claude-flow/cli

# Check version
claude-flow --version

# Or use via bun
bun run cf --version
```

### Step 2.2: Configure Local CLI

Create `.dev/.claude-flow/config.json`:

```json
{
  "version": "3.0.0",
  "environment": "development",
  "project": {
    "name": "project-nyra",
    "type": "microservices"
  },
  "mcp": {
    "host": "localhost",
    "port": 6000,
    "nexusRouter": {
      "enabled": true,
      "host": "localhost",
      "port": 6000
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
  "memory": {
    "backend": "hybrid",
    "primary": "ruvector",
    "secondary": ["graphiti", "falkordb", "redis"],
    "providers": {
      "ruvector": {
        "host": "localhost",
        "port": 7070,
        "dimension": 1536
      },
      "redis": {
        "host": "localhost",
        "port": 6379
      }
    }
  },
  "logging": {
    "level": "debug",
    "format": "pretty"
  }
}
```

---

## 🔧 Phase 3: Claude Flow Providers Setup

### Step 3.1: Local Provider Installation (Fork Approach)

**Option A: Clone into `.dev/providers`**

```bash
# Clone providers repository
cd .dev
git clone https://github.com/anthropics/claude-flow-providers.git providers
cd providers

# Install dependencies (doesn't add to main repo)
bun install

# Link for local development
bun link

# Link in parent directory
cd ..
bun link claude-flow-providers

# Verify
bun list claude-flow-providers
```

**Option B: Install Globally**

```bash
# Global install (doesn't affect main package.json)
bun add -g @claude-flow/providers@latest

# Verify
bun -g list @claude-flow/providers
```

### Step 3.2: Configure Providers

Create `.dev/.claude-flow/providers.json`:

```json
{
  "providers": {
    "llm": {
      "anthropic": {
        "enabled": true,
        "apiKey": "${ANTHROPIC_API_KEY}",
        "models": [
          "claude-opus-4.5-20251101",
          "claude-sonnet-4-20250514",
          "claude-haiku-4-5-20251001"
        ]
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
        "dimension": 1536,
        "maxElements": 100000
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
        "port": 6380
      }
    }
  }
}
```

---

## 🚀 Phase 4: Connect to Existing Infra

### Step 4.1: Verify Infra Containers Running

```bash
# From project root
docker compose -f infra/docker-compose.yml ps

# Should see:
# - nexus-router (port 6000)
# - claude-flow-mcp (port 3001)
# - ruvector (port 7070)
# - postgres (port 5432)
# - redis (port 6379)
# - falkordb (port 6380)
# - graphiti (port 3002)
```

### Step 4.2: Local CLI Connection Test

From `.dev/`:

```bash
# Test Nexus Router connectivity
curl http://localhost:6000/health

# Test RuVector connectivity
curl http://localhost:7070/health

# Test Claude Flow CLI can reach services
bun run cf status

# List available MCP servers
bun run cf:mcp:list

# Search memory
bun run cf:memory:search --query "test"
```

### Step 4.3: Initialize Swarm & Memory

```bash
# Initialize mesh swarm (uses Nexus Router)
bun run cf:swarm:init

# Initialize memory system (connects to RuVector, etc.)
bun run cf:memory:init
```

---

## 📝 Phase 5: Development Workflow

### Daily Development Session

```bash
# Terminal 1: Check infra status
cd project-nyra
bun run docker:ps

# Ensure containers are running (if not)
bun run docker:up

# Terminal 2: Development work
cd .dev

# Load development environment
export $(cat .env.local | xargs)

# Initialize Claude Flow (first time only)
bun run cf:init

# Start your development
bun run dev

# Terminal 3: Monitor
cd project-nyra
bun run docker:logs
```

### Common Dev Commands

```bash
# From .dev/ directory

# Check status
bun run cf:status

# Search memory
bun run cf:memory:search --query "your query"

# Initialize swarm
bun run cf:swarm:init

# List providers
bun run cf:providers:list

# List MCP servers
bun run cf:mcp:list

# Check service health
bun run health

# Verify setup
bun run verify
```

---

## 📁 File Structure

```
project-nyra/
├── package.json                    (PRODUCTION - DO NOT MODIFY)
├── bun.lock                        (production lock)
│
├── .gitignore                      (includes .dev/)
│
├── .dev/                           (GIT-IGNORED - DEVELOPMENT ONLY)
│   ├── .env.local                 (local secrets, never commit)
│   ├── .claude-flow/
│   │   ├── config.json            (local CLI config)
│   │   └── providers.json         (local provider config)
│   ├── .swarm/                    (local runtime data)
│   ├── package.json               (dev dependencies only)
│   ├── bun.lock                   (dev lockfile, git-ignored)
│   ├── providers/                 (optional: local clone)
│   │   └── claude-flow-providers/ (cloned providers)
│   ├── bin/
│   │   └── cli.js                 (CLI entry point)
│   ├── scripts/
│   │   ├── verify-setup.ts
│   │   └── health-check.ts
│   └── configs/
│       └── nexus-router-dev.json  (optional: dev-specific config)
│
├── infra/                          (EXISTING - DO NOT MODIFY)
│   ├── docker-compose.yml
│   ├── claude-flow/                (prod container)
│   ├── nexus-router/               (existing)
│   ├── ruvector/                   (existing)
│   ├── postgres/                   (existing)
│   ├── redis/                      (existing)
│   ├── falkordb/                   (existing)
│   ├── graphiti/                   (existing)
│   ├── composio/                   (existing)
│   └── archon-os/                  (almost done)
│
└── src/                            (production source)
```

---

## 🔄 Workflow: Local Dev + Existing Infra

```
┌──────────────────────────────────────────────────────┐
│            LOCAL DEVELOPMENT (.dev/)                 │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ Claude Flow CLI (Bun)                          │ │
│  │ Providers (fork/global)                        │ │
│  │ TypeScript Development                         │ │
│  │ Hot reload enabled                             │ │
│  └──────────────┬─────────────────────────────────┘ │
│                 │                                     │
│                 ↓ localhost:6000                      │
└─────────────────┼──────────────────────────────────────┘
                  │
              Docker Network
                  │
   ┌──────────────┴──────────────┐
   │                             │
   ↓                             ↓
Nexus Router              Other Services
(6000)                    (prod containers)
   │                             │
   ├→ Claude Flow MCP (3001)    │
   ├→ Graphiti MCP (3002)       │
   └→ Routes to:                │
       - RuVector (7070)        │
       - Redis (6379)           │
       - PostgreSQL (5432)      │
       - FalkorDB (6380)        │
```

---

## ✅ Quick Verification

### Check Setup

```bash
# From .dev/
cat > verify-setup.ts << 'EOF'
console.log("🔍 Verifying Claude Flow Dev Setup\n");

// Check CLI
const cliVersion = await $`bun run cf --version`.text();
console.log(`✅ CLI version: ${cliVersion.trim()}`);

// Check connectivity
const nexus = await fetch("http://localhost:6000/health")
  .then(() => "✅")
  .catch(() => "❌");
console.log(`Nexus Router: ${nexus}`);

const ruvector = await fetch("http://localhost:7070/health")
  .then(() => "✅")
  .catch(() => "❌");
console.log(`RuVector: ${ruvector}`);

console.log("\n✨ Setup verification complete");
EOF

bun verify-setup.ts
```

### Troubleshooting

```bash
# Infra containers not running
docker compose -f ../infra/docker-compose.yml up -d

# CLI not found
bun add -g @claude-flow/cli@latest

# Providers not available
git clone https://github.com/anthropics/claude-flow-providers.git providers
cd providers && bun install && cd ..

# Memory connection issues
curl http://localhost:7070/health
redis-cli -h localhost ping
```

---

## 🎯 Key Principles

✅ **Separation of Concerns**
- Production code in repo root
- Development in `.dev/` (git-ignored)
- Infra containers unchanged

✅ **Local-First Development**
- CLI runs locally (Bun)
- Providers installed locally
- Hot reload & debugging supported

✅ **Existing Infrastructure**
- References production containers
- No duplication
- Scalable to production

✅ **Clean Git History**
- `.dev/` excluded from tracking
- No production pollution
- Easy to distribute to team

---

## 🚀 Getting Started Now

```bash
# 1. Ensure production infra is running
docker compose -f infra/docker-compose.yml up -d

# 2. Create dev workspace
mkdir -p .dev/.claude-flow .dev/.swarm
cd .dev

# 3. Install Claude Flow CLI
bun add -g @claude-flow/cli@latest

# 4. Clone providers (optional)
git clone https://github.com/anthropics/claude-flow-providers.git providers

# 5. Create .env.local from template
cat > .env.local << 'EOF'
ENVIRONMENT=development
NEXUS_ROUTER_HOST=localhost
NEXUS_ROUTER_PORT=6000
RUVECTOR_HOST=localhost
RUVECTOR_PORT=7070
ANTHROPIC_API_KEY=sk-ant-...
EOF

# 6. Test connectivity
curl http://localhost:6000/health
curl http://localhost:7070/health

# 7. Initialize Claude Flow
claude-flow init --development

# 8. Start developing!
```

Done! You now have a clean, production-safe development environment.
