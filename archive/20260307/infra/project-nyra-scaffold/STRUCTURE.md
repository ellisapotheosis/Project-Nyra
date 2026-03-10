# Project Nyra Repository Structure

```
project-nyra/
├── Makefile                          # Single source of truth for all operations
├── .env.example                      # Environment template (copy to .env)
├── .env                              # ⚠️  DO NOT COMMIT (secrets)
│
├── infra/                            # Infrastructure & DevOps
│   ├── docker-compose.oracle.yml     # Oracle Cloud stack (System of Record)
│   ├── docker-compose.orchestrator.yml # Orchestrator stack (Minisforum)
│   ├── docker-compose.workers.yml    # Worker stacks (GPU PCs, multi-profile)
│   ├── config/
│   │   ├── nexus.toml               # Nexus Router config (MCP aggregation)
│   │   ├── litellm-config.yaml      # LiteLLM model routing
│   │   └── gitea-runner-config.yaml # Gitea CI/CD runner
│   ├── scripts/
│   │   ├── bootstrap.sh             # One-click setup
│   │   ├── health-check.sh          # System diagnostics
│   │   └── init-postgres.sql        # Database initialization
│   └── volumes/                      # Persistent data (git-ignored)
│
├── services/                         # Microservices (can be deployed independently)
│   ├── quote-engine/                # Mortgage pricing API
│   │   ├── src/
│   │   │   ├── server.ts           # Express API
│   │   │   └── utils/
│   │   │       └── mortgageMath.ts # Core calculations
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── nexus-router/                # Grafbase Nexus (MCP aggregator)
│   │   └── Dockerfile
│   └── gitea-webhook-agent/         # GitHub/Gitea webhook processor
│       └── agent.py
│
├── apps/                            # Application agents (Claude-Flow, OpenClaw, etc.)
│   ├── claude-flow/                 # Dev orchestrator
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── claude_flow/             # Source code
│   ├── openclaw/                    # Mortgage assistant agent
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── openclaw/                # Source code
│   └── archon-os/                   # Knowledge base + planning
│       ├── requirements.txt
│       ├── Dockerfile
│       └── archon/                  # Source code
│
├── src/                             # Shared source code
│   ├── agents/                      # Agent implementations
│   ├── schemas/                     # Data models (Pydantic, TypeScript)
│   ├── utils/                       # Utilities
│   ├── types/                       # TypeScript interfaces
│   └── constants.ts                 # Shared constants
│
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md              # System design & diagrams
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── CONTRIBUTING.md              # Dev guidelines
│
├── README.md                        # Project overview
├── LICENSE
└── .gitignore
```

## Key Files & Their Purpose

### Root Level

| File | Purpose |
|------|---------|
| **Makefile** | Single command entry point. Use `make help` to see all operations. |
| **.env.example** | Template for environment variables. Copy to `.env` and fill in values. |
| **.env** | Actual secrets (never commit). Git-ignored. |

### infra/ - Infrastructure as Code

| File | Purpose |
|------|---------|
| **docker-compose.oracle.yml** | Oracle Cloud plane (Postgres, TwentyCRM, Activepieces, Mem0, Gitea) |
| **docker-compose.orchestrator.yml** | Orchestrator plane (Nexus, LiteLLM, Claude-Flow, OpenClaw, Archon) |
| **docker-compose.workers.yml** | Worker planes (vLLM/Ollama on GPU PCs, multi-profile support) |
| **config/nexus.toml** | Nexus Router: MCP server registration + fuzzy tool selection |
| **config/litellm-config.yaml** | LiteLLM: Model routing, rate limiting, cost control |
| **scripts/bootstrap.sh** | Interactive setup: creates directories, validates env, deploys stack |
| **scripts/health-check.sh** | Comprehensive health diagnostics |
| **scripts/init-postgres.sql** | Postgres: creates databases, extensions, users |
| **volumes/** | Persistent data (Docker volumes, git-ignored) |

### services/ - Microservices

| Directory | Purpose |
|-----------|---------|
| **quote-engine/** | Express + TypeScript mortgage pricing API. Callable from OpenClaw via Nexus. |
| **nexus-router/** | Grafbase Nexus compiled Docker image. Single MCP entry point. |
| **gitea-webhook-agent/** | Flask webhook receiver for Gitea CI/CD events. |

### apps/ - Agent Applications

| Directory | Purpose |
|-----------|---------|
| **claude-flow/** | Development orchestrator. Repo management, code automation, PR creation. |
| **openclaw/** | Borrower-facing mortgage assistant. Integrates Mem0 + Quote Engine. |
| **archon-os/** | Knowledge base + planning engine for Claude-Flow. |

### src/ - Shared Code

| Directory | Purpose |
|-----------|---------|
| **agents/** | Agent implementations (if shared across apps). |
| **schemas/** | Data models: Pydantic (Python), Zod (TypeScript). |
| **utils/** | Utilities: math, formatting, validation. |
| **types/** | TypeScript interfaces for Quote Engine, APIs, etc. |

## Deployment Topology

```
┌─────────────────────────────────────────────────────┐
│  Oracle Cloud (Always-On, 24/7)                     │
│  ├─ Postgres (TwentyCRM system of record)           │
│  ├─ TwentyCRM (CRM core)                            │
│  ├─ Activepieces (workflow automation)              │
│  ├─ Quote Engine (mortgage API)                     │
│  ├─ Mem0 (borrower memory)                          │
│  └─ Gitea (source control)                          │
└─────────────────────────────────────────────────────┘
           ↓ (Tailscale VPN)
┌─────────────────────────────────────────────────────┐
│  Orchestrator (Minisforum)                          │
│  ├─ Nexus Router (port 6000: MCP aggregator)        │
│  ├─ LiteLLM (port 4000: model routing)              │
│  ├─ Claude-Flow (port 8080: dev agent)              │
│  ├─ OpenClaw (port 9000: mortgage agent)            │
│  └─ Archon OS (port 4001: knowledge base)           │
└─────────────────────────────────────────────────────┘
           ↓ (Tailscale mesh)
┌─────────────────────────────────────────────────────┐
│  GPU Workers (Distributed Inference)                │
│  ├─ Area-51 RTX 5090: vLLM (heavy reasoning)        │
│  ├─ RTX 3090Ti: vLLM (code generation)              │
│  └─ m15r7 RTX 3060: Ollama (fast utility)           │
└─────────────────────────────────────────────────────┘
```

## How to Use This Structure

### 1. Bootstrap from Scratch

```bash
# Copy template to .env and fill in values
cp .env.example .env
# Edit .env with your secrets

# Run bootstrap
bash infra/scripts/bootstrap.sh

# Or use Make directly
make init
make bootstrap
```

### 2. Deploy Individual Stacks

```bash
# Oracle only (cloud)
make oracle-up

# Orchestrator only (local development)
make orchestrator-up

# All GPU workers
make workers-up

# Full deployment
make up
```

### 3. Monitor & Debug

```bash
# Health checks
make health

# View logs
make logs

# Container status
make status

# Manual diagnostics
bash infra/scripts/health-check.sh
```

### 4. Develop a Service

```bash
# Quote Engine example
cd services/quote-engine
npm install
npm run dev    # TypeScript watch mode

# Changes are live-reloaded in Docker
# docker-compose exec quote-engine npm run build
```

### 5. Access Services

| Service | URL | Auth |
|---------|-----|------|
| TwentyCRM | https://crm.ratehunter.net | Cloudflared tunnel |
| Activepieces | https://workflows.ratehunter.net | Cloudflared tunnel |
| Nexus Router | http://localhost:6000 | Bearer token in .env |
| LiteLLM | http://localhost:4000 | API key in .env |
| Claude-Flow | http://localhost:8080 | Bearer token in .env |
| OpenClaw | http://localhost:9000 | Bearer token in .env |

## Environment Variables

See `.env.example` for the complete list. Key sections:

- **Oracle Configuration**: Database passwords, TwentyCRM secrets
- **Orchestrator Configuration**: Port numbers, API keys
- **Worker Configuration**: Model names, VRAM settings
- **Tailscale**: Mesh VPN auth
- **Anthropic API**: Claude access
- **Infisical**: Secrets vault integration

## Makefile Quick Reference

```bash
make help              # Show all commands
make init              # Setup directory structure
make bootstrap         # Init + Deploy everything
make oracle-up         # Start Oracle only
make orchestrator-up   # Start Orchestrator only
make workers-up        # Start all workers
make logs              # Tail all logs
make status            # Show running containers
make health            # Comprehensive diagnostics
make down              # Stop everything
make clean             # Remove all containers + volumes
```

## Adding a New Service

1. Create directory: `services/my-service/`
2. Add `Dockerfile`, `package.json` or `requirements.txt`
3. Update docker-compose files to reference it
4. Update Makefile if needed
5. Test: `docker-compose -f infra/docker-compose.orchestrator.yml up`

## Git Strategy

```bash
# Always committed
- Makefile
- docker-compose.*.yml
- *.example files
- src/ (code)
- docs/ (docs)

# NEVER committed (add to .gitignore)
- .env (secrets)
- infra/volumes/ (data)
- *.log files
- node_modules/, venv/
- dist/, build/, .cache/
```

---

**Questions?** See `/docs` for detailed guides.
