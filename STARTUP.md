# 🚀 Project Nyra - Complete Startup Guide

**Last Updated**: 2026-01-18
**Version**: 1.0.0
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Quick Start (5 Minutes)](#-quick-start-5-minutes)
2. [Prerequisites](#-prerequisites)
3. [Docker Infrastructure Startup](#-docker-infrastructure-startup)
4. [MCP Servers Startup](#-mcp-servers-startup)
5. [Redis Setup](#-redis-setup)
6. [Nexus Router Startup](#-nexus-router-startup)
7. [Development Environment](#-development-environment)
8. [Applications Startup](#-applications-startup)
9. [Health Monitoring](#-health-monitoring)
10. [Troubleshooting](#-troubleshooting)
11. [Advanced Topics](#-advanced-topics)

---

## 🎯 Quick Start (5 Minutes)

**For the impatient - get everything running now:**

```powershell
# Step 1: Verify system is ready (30 seconds)
.\verify-ready.ps1

# Step 2: Start all Docker services (60 seconds)
.\start-with-redis.ps1

# Step 3: Verify everything is healthy (30 seconds)
.\check-health.ps1

# Step 4: Open Health Dashboard
start health-dashboard.html

# Step 5: Access Nexus Dashboard
start http://localhost:3005
```

**That's it!** All services are now running. Skip to [Health Monitoring](#-health-monitoring) to verify everything is working.

---

## 📦 Prerequisites

### Required Software

| Software | Minimum Version | Required | Purpose |
|----------|----------------|----------|---------|
| **Docker Desktop** | 24.0+ | ✅ Yes | Container runtime |
| **Node.js** | 20.0+ | ✅ Yes | JavaScript runtime |
| **pnpm** | 10.0+ | ✅ Yes | Package manager |
| **Git** | 2.40+ | ✅ Yes | Version control |
| **PowerShell** | 7.0+ | ⚠️ Recommended | Scripts |
| **WSL2** | Latest | ⚠️ Recommended | Linux containers |

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 8GB | 16GB |
| **Disk Space** | 20GB free | 50GB free |
| **CPU** | 4 cores | 8 cores |
| **GPU** | Optional | NVIDIA RTX (for workers) |

### Quick System Check

```powershell
# Check all prerequisites
node --version    # Should show v20+
pnpm --version    # Should show 10+
docker --version  # Should show 24+
git --version     # Should show 2.40+

# Verify Docker is running
docker ps
```

---

## 🐳 Docker Infrastructure Startup

### Option 1: Automated Start (Recommended)

```powershell
# Start everything with one command
.\start-with-redis.ps1
```

**What this starts:**
- ✅ Redis (port 6379) - 3 databases for isolation
- ✅ PostgreSQL (port 5432) - Primary database
- ✅ FalkorDB (port 6380) - Graph database
- ✅ Qdrant (port 6333) - Vector database
- ✅ Nexus Router (port 8000) - LLM gateway
- ✅ Claude Flow (port 9000) - Multi-agent orchestration
- ✅ Archon OS (port 9001) - AI operating system
- ✅ Letta (port 8283) - Agent memory

### Option 2: Manual Start

```powershell
# Navigate to Docker directory
cd infra\docker

# Start orchestration stack
docker-compose -f docker-compose.orchestration.yml up -d

# View logs (optional)
docker-compose -f docker-compose.orchestration.yml logs -f
```

### Option 3: Start Individual Stacks

```powershell
# Development stack (databases only)
pnpm docker:up

# Full orchestration stack
pnpm start:orchestrator

# Monitoring stack (Prometheus, Grafana)
cd infra\docker
docker-compose -f docker-compose.monitoring.yml up -d

# Observability stack (Loki, Tempo)
docker-compose -f docker-compose.observability.yml up -d
```

### Verify Docker Services

```powershell
# Check all containers are running
docker ps

# Expected output: 8+ containers with status "Up"
# - nyra-redis
# - nyra-postgres
# - nyra-falkordb
# - nyra-qdrant
# - nyra-nexus-router
# - nyra-claude-flow
# - nyra-archon-os
# - nyra-letta

# Test specific service
curl http://localhost:8000/health  # Nexus Router
curl http://localhost:9000/health  # Claude Flow
```

---

## 🔌 MCP Servers Startup

### What are MCP Servers?

**MCP (Model Context Protocol)** servers provide tools and capabilities to AI agents. Project Nyra uses 4 MCP servers built into Nexus Router.

### Current MCP Server Configuration

✅ **Nexus Router MCP Proxy** (Built-in, no separate startup needed)
- **Port**: 8000 (integrated)
- **Features**: Fuzzy tool search, health monitoring, load balancing

✅ **Registered MCP Servers** (4 servers):
1. **Claude Flow MCP** - Multi-agent swarm coordination
2. **Archon OS MCP** - System integration
3. **Infisical MCP** - Secret management
4. **Bitwarden MCP** - Credential management

### Start MCP Servers

```bash
# 1. Claude Flow MCP (Manual start - usually auto-started)
npx @claude-flow/cli@latest mcp start

# 2. Nexus Router (includes MCP proxy)
# Already started with docker-compose above

# 3. Verify MCP health
curl http://localhost:8000/mcp/health

# 4. List available MCP tools
curl http://localhost:8000/mcp/tools
```

### MCP Server Ports

| Service | Port | Status | Purpose |
|---------|------|--------|---------|
| Nexus Router MCP | 8000 | Auto-started | Built-in proxy |
| Claude Flow MCP | 3100 | Auto-started | Orchestration |
| Archon OS MCP | 3200 | Auto-started | System integration |
| Infisical MCP | 3300 | Manual | Secrets (optional) |
| Bitwarden MCP | 3400 | Manual | Passwords (optional) |

**Note**: Most MCP servers auto-start with docker-compose. Manual start is only needed for optional services.

---

## 🔴 Redis Setup

### Redis Database Isolation

Project Nyra uses **one Redis container** with **3 separate databases** to prevent data conflicts:

| Database | Service | Purpose | Port |
|----------|---------|---------|------|
| **DB 0** | Nexus Router | Cache, metrics, rate limits | 6379 |
| **DB 1** | Claude Flow | Sessions, memory, patterns | 6379 |
| **DB 2** | Archon OS | Task coordination | 6379 |

### Redis Environment Variables

Already configured in `infra/docker/.env`:

```bash
REDIS_PASSWORD=cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s
REDIS_HOST=redis
REDIS_PORT=6379

# Database isolation URLs
NEXUS_REDIS_URL=redis://:cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s@redis:6379/0
CLAUDE_FLOW_REDIS_URL=redis://:cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s@redis:6379/1
ARCHON_REDIS_URL=redis://:cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s@redis:6379/2
```

### Test Redis Connection

```powershell
# Test main Redis connection
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping
# Expected: PONG

# Test database isolation
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s -n 0 ping  # DB 0
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s -n 1 ping  # DB 1
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s -n 2 ping  # DB 2
```

### Redis Management

```powershell
# View Redis info
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s info

# Monitor Redis activity
docker exec -it nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s monitor

# Check memory usage
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s info memory
```

**Detailed Redis Guide**: See `services/nexus-router/REDIS-SETUP.md`

---

## 🌐 Nexus Router Startup

### What is Nexus Router?

**Nexus Router** is the unified LLM gateway that:
- Routes requests to 4 AI providers (Anthropic, OpenAI, Google, OpenRouter)
- Manages 15 MCP servers
- Handles 3 GPU workers via Tailscale
- Provides intelligent cost-optimized routing
- Includes built-in fuzzy tool search

### Start Nexus Router

**Option 1: Via Docker (Recommended)**
```powershell
# Already started with docker-compose
# Verify it's running:
docker ps | findstr nexus-router
curl http://localhost:8000/health
```

**Option 2: Development Mode**
```bash
# For local development
cd services/nexus-router
pnpm install
pnpm dev
```

### Nexus Router Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/health` | Health check | `curl http://localhost:8000/health` |
| `/llm/v1/*` | Unified LLM API | `curl http://localhost:8000/llm/v1/models` |
| `/mcp/*` | MCP tools | `curl http://localhost:8000/mcp/tools` |
| `/metrics` | Prometheus metrics | `curl http://localhost:8000/metrics` |
| `/ws/metrics` | WebSocket metrics | `ws://localhost:8000/ws/metrics` |

### Nexus Router Configuration

**Full configuration**: See `infra/nexus/nexus-complete.toml`

**Key features configured:**
- ✅ 4 AI providers (Anthropic, OpenAI, Google Gemini, OpenRouter)
- ✅ 15 MCP servers (Filesystem, GitHub, Git, Graphiti, etc.)
- ✅ 3 GPU workers (RTX 5090, 3090, 3060 via Tailscale)
- ✅ Redis caching (1-hour TTL, deduplication)
- ✅ Multi-level rate limiting (global, per-IP, per-server, per-tool)
- ✅ OAuth2 security (JWT/JWKS)
- ✅ Full observability (Prometheus, OpenTelemetry, WebSocket)

### Test Nexus Router

```bash
# Test health
curl http://localhost:8000/health

# List available models
curl http://localhost:8000/llm/v1/models

# Test chat completion (requires API key)
curl http://localhost:8000/llm/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"Hello!"}]}'

# Search MCP tools
curl http://localhost:8000/mcp/search?q=file
```

---

## 💻 Development Environment

### Monorepo Structure

```
Project-Nyra/
├── apps/                    # 6 frontend applications
├── services/                # 14 backend microservices
├── packages/                # Shared packages
├── infra/                   # Infrastructure (Docker, K8s)
├── orchestration/           # Claude Flow, Archon OS
├── bootstrap/               # Bootstrap installer
└── docs/                    # Documentation
```

### Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Specific workspace
pnpm --filter @nyra/auth-service install

# Add dependency to workspace
pnpm --filter @nyra/nexus-router add express
```

### Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Start Development Environment

```bash
# Start all infrastructure (databases, Redis, etc.)
pnpm start:infra

# Start all backend services
pnpm start:services

# Start all frontend apps
pnpm start:apps

# Or start everything at once
pnpm start:all
```

### Common Development Commands

```bash
# Run all apps and services in dev mode
pnpm dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint all workspaces
pnpm lint

# Clean all build artifacts
pnpm clean
```

---

## 🎨 Applications Startup

### Available Applications (6 Apps)

| App | Port | Purpose | Startup Command |
|-----|------|---------|-----------------|
| **Nexus Dashboard** | 3005 | Nexus Router management UI | `pnpm --filter @nyra/nexus-dashboard dev` |
| **RateHunter Landing** | 3000 | Public mortgage landing page | `pnpm --filter ratehunter-landing dev` |
| **Nyra Admin** | 3101 | Admin dashboard | `pnpm --filter @nyra/nyra-admin dev` |
| **Mortgage Assistant** | 3002 | Loan officer dashboard | `pnpm --filter @nyra/mortgage-assistant dev` |
| **RateHunter App** | 3100 | Rate comparison tool | `pnpm --filter @nyra/ratehunter dev` |
| **Web App** | 3003 | Main web application | `pnpm --filter @nyra/webapp dev` |

### Start Individual Apps

```bash
# Nexus Dashboard (Most important - Nexus Router UI)
cd apps/nexus-dashboard
pnpm install
pnpm dev
# Opens at: http://localhost:3005

# RateHunter Landing
cd apps/ratehunter-landing
pnpm install
pnpm dev
# Opens at: http://localhost:3000

# Nyra Admin
cd apps/nyra-admin
pnpm install
pnpm dev
# Opens at: http://localhost:3101
```

### Start All Apps at Once

```bash
# From project root
pnpm start:apps

# Or using Turbo (parallel)
pnpm dev --filter='./apps/*'
```

### Production Build

```bash
# Build specific app
pnpm --filter @nyra/nexus-dashboard build

# Start production server
pnpm --filter @nyra/nexus-dashboard start

# Build all apps
pnpm build --filter='./apps/*'
```

### App-Specific Notes

**Nexus Dashboard**:
- Connects to Nexus Router on port 8000
- Real-time updates via WebSocket
- 12 management features (providers, models, routing, MCP servers, etc.)
- Uses Next.js 15, Tailwind v4 (OKLCH), shadcn/ui

**RateHunter Landing**:
- Public-facing marketing site
- Static export for Cloudflare Pages
- Uses Next.js 14, Tailwind CSS

---

## 📊 Health Monitoring

### Health Dashboard (Real-time Visual Monitoring)

```powershell
# Open the health dashboard in your browser
start health-dashboard.html
```

**Dashboard Features**:
- ✅ Real-time status of all 13 services
- ✅ Color-coded health indicators (green/red/orange)
- ✅ Service details (ports, URLs, version)
- ✅ Auto-refresh every 10 seconds
- ✅ Click service cards for more details

### Automated Health Check Script

```powershell
# Run comprehensive health check
.\check-health.ps1
```

**What it checks:**
1. ✅ All 8 Docker containers running and healthy
2. ✅ Service endpoints responding (Nexus Router, Dashboard, Claude Flow, etc.)
3. ✅ Redis connection (all 3 databases)
4. ✅ PostgreSQL connection
5. ✅ No critical errors in logs
6. 📊 Resource usage statistics

### Manual Health Checks

```bash
# Check Docker containers
docker ps

# Test specific services
curl http://localhost:8000/health  # Nexus Router
curl http://localhost:3005         # Nexus Dashboard
curl http://localhost:9000/health  # Claude Flow
curl http://localhost:9001/health  # Archon OS

# Check Redis
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping

# Check PostgreSQL
docker exec nyra-postgres pg_isready -U nyra

# View logs
docker logs nyra-nexus-router -f
docker logs nyra-redis --tail 50
```

### Monitoring Stack (Optional)

```powershell
# Start Grafana + Prometheus monitoring
cd infra\docker
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
start http://localhost:3005
# Default credentials: admin/admin

# Access Prometheus
start http://localhost:9090
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Docker Desktop Not Running

**Error**: `failed to connect to the docker API`

**Solution**:
```powershell
# 1. Start Docker Desktop from Windows Start Menu
# 2. Wait for whale icon to stop animating (30-60 seconds)
# 3. Verify Docker is running
docker ps
```

**Full guide**: See `DOCKER-TROUBLESHOOTING.md`

#### Issue 2: Port Already in Use

**Error**: `bind: address already in use`

**Solution**:
```powershell
# Find what's using the port (example: port 8000)
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or stop all Docker containers
docker stop $(docker ps -q)
```

#### Issue 3: Container Unhealthy

**Error**: Container shows "unhealthy" in `docker ps`

**Solution**:
```powershell
# Check container logs
docker logs nyra-nexus-router

# Restart the service
docker-compose -f infra/docker/docker-compose.orchestration.yml restart nexus-router

# Full reset
docker-compose -f infra/docker/docker-compose.orchestration.yml down -v
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
```

#### Issue 4: Redis Connection Failed

**Error**: Services can't connect to Redis

**Solution**:
```powershell
# Verify Redis is running
docker ps | findstr redis

# Test Redis directly
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping

# Check Redis logs
docker logs nyra-redis

# Verify environment variables
cat infra\docker\.env | findstr REDIS
```

#### Issue 5: pnpm Install Fails

**Error**: Dependency installation errors

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# If still fails, update pnpm
npm install -g pnpm@latest
```

#### Issue 6: MCP Server Not Responding

**Error**: MCP tools not available

**Solution**:
```bash
# Check MCP health
curl http://localhost:8000/mcp/health

# View Nexus Router logs
docker logs nyra-nexus-router

# Restart Nexus Router
docker restart nyra-nexus-router
```

### Getting Help

**Documentation Resources**:
- `DOCKER-TROUBLESHOOTING.md` - Docker-specific issues
- `services/nexus-router/REDIS-SETUP.md` - Redis configuration
- `docs/deployment/MCP-SERVER-SETUP.md` - MCP server details
- `START-HERE.md` - Quick startup guide
- `QUICK-START-WORKFLOW.md` - 3-step startup process

**Health Check Tools**:
- `verify-ready.ps1` - Pre-start verification
- `check-health.ps1` - Post-start health check
- `health-dashboard.html` - Visual monitoring

---

## 🚀 Advanced Topics

### Multi-Agent Swarm Orchestration

```bash
# Initialize a swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8

# Spawn an agent
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# Check swarm status
npx @claude-flow/cli@latest swarm status

# Shutdown swarm
npx @claude-flow/cli@latest swarm shutdown --graceful
```

### Memory System

```bash
# Initialize memory database
npx @claude-flow/cli@latest memory init --force --verbose

# Store a pattern
npx @claude-flow/cli@latest memory store \
  --key "auth-pattern" \
  --value "JWT with refresh tokens" \
  --namespace patterns

# Search memory
npx @claude-flow/cli@latest memory search --query "authentication"

# List all entries
npx @claude-flow/cli@latest memory list --namespace patterns
```

### Background Workers (12 Workers)

```bash
# List all workers
npx @claude-flow/cli@latest hooks worker list

# Dispatch a worker
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit

# Check worker status
npx @claude-flow/cli@latest hooks worker status
```

### Security Scanning

```bash
# Run full security scan
npx @claude-flow/cli@latest security scan --depth full

# Audit security
npx @claude-flow/cli@latest security audit

# Check for vulnerabilities
pnpm audit
```

### Performance Benchmarking

```bash
# Run all benchmarks
npx @claude-flow/cli@latest performance benchmark --suite all

# Profile specific component
npx @claude-flow/cli@latest performance profile --target nexus-router
```

### Backup and Restore

```bash
# Backup everything
pnpm backup

# Backup database only
pnpm backup:db

# Restore from backup
pnpm restore
```

### Deployment

```bash
# Deploy orchestrator
pnpm deploy:orchestrator

# Deploy worker
pnpm deploy:worker

# Deploy all
pnpm deploy:all

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy:production
```

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Verify system
.\verify-ready.ps1

# Start everything
.\start-with-redis.ps1

# Check health
.\check-health.ps1

# Open health dashboard
start health-dashboard.html

# Open Nexus Dashboard
start http://localhost:3005
```

### Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Nexus Router | http://localhost:8000 | LLM gateway |
| Nexus Dashboard | http://localhost:3005 | Management UI |
| Claude Flow | http://localhost:9000 | Orchestration |
| Archon OS | http://localhost:9001 | AI OS |
| Grafana | http://localhost:3005 | Monitoring |
| Prometheus | http://localhost:9090 | Metrics |
| n8n | http://localhost:5678 | Workflows |

### Port Allocation

| Port | Service | Protocol |
|------|---------|----------|
| 3000 | TwentyCRM | HTTP |
| 3001 | Dify | HTTP |
| 3005 | Nexus Dashboard/Grafana | HTTP |
| 3100 | RateHunter/Loki | HTTP |
| 5432 | PostgreSQL | TCP |
| 5678 | n8n | HTTP |
| 6000 | Nexus Router Core | HTTP |
| 6333 | Qdrant | HTTP |
| 6379 | Redis | TCP |
| 6380 | FalkorDB | TCP |
| 8000 | Nexus Router API | HTTP |
| 8283 | Letta | HTTP |
| 9000 | Claude Flow | HTTP |
| 9001 | Archon OS | HTTP |
| 9090 | Prometheus | HTTP |

**Complete port reference**: See `docs/PORT-ALLOCATION-STANDARD.md`

---

## 📚 Additional Documentation

### Core Documentation
- `README.md` - Project overview
- `CLAUDE.md` - Claude Code configuration
- `START-HERE.md` - Quick startup guide
- `QUICK-START-WORKFLOW.md` - 3-step process

### Configuration
- `infra/nexus/nexus-complete.toml` - Nexus Router config
- `infra/docker/.env` - Environment variables
- `.env.template` - Environment template
- `INFISICAL-ENV-VARIABLES.md` - Infisical setup

### Troubleshooting
- `DOCKER-TROUBLESHOOTING.md` - Docker issues
- `services/nexus-router/REDIS-SETUP.md` - Redis setup
- `docs/deployment/MCP-SERVER-SETUP.md` - MCP servers

### Bootstrap
- `bootstrap/README.md` - Bootstrap system
- `BOOTSTRAP-FIXES-SUMMARY.md` - Bootstrap fixes
- `bootstrap/scripts/00-PRE-FLIGHT-CHECK.ps1` - Pre-flight check
- `bootstrap/scripts/ROLLBACK.ps1` - Rollback script

---

## ✅ Success Checklist

After startup, you should have:

- [ ] Docker Desktop running
- [ ] 8+ Docker containers running (`docker ps`)
- [ ] Nexus Router responding at http://localhost:8000
- [ ] Nexus Dashboard accessible at http://localhost:3005
- [ ] Redis returning PONG on all 3 databases
- [ ] PostgreSQL accepting connections
- [ ] Health dashboard shows all services green
- [ ] No critical errors in logs

---

## 🎓 Learning Resources

- **Nexus Router**: Feature-maxed with unified LLM API
- **Redis**: 3-database isolation (DB 0: Nexus, DB 1: Claude Flow, DB 2: Archon)
- **MCP**: Model Context Protocol for tool integration
- **GPU Workers**: 3 workers via Tailscale
- **Swarm**: Multi-agent orchestration
- **Memory**: AgentDB with HNSW indexing

---

**Last Updated**: 2026-01-18
**Total Services**: 8 containers + 15 MCP servers + 6 applications
**Configuration**: Production-ready, feature-maxed
**Support**: See troubleshooting section or documentation index

🎉 **You're ready to build amazing AI applications with Project Nyra!**
