# Claude Flow V3 Alpha - Complete Setup Guide for Project Nyra

## ✅ Completed Setup

### 1. Dependencies Installed
- ✓ `zod@4.3.5` - Added to workspace root and globally
- ✓ `claude-flow@alpha` (v3.0.0-alpha.71) - Globally installed
- ✓ Native build scripts approved (agentdb, agentic-flow, argon2, onnxruntime-node, sqlite3)

### 2. Configuration Files Updated
- ✓ `.claude/settings.json` - All hooks updated to use `claude-flow@alpha`
- ✓ `.mcp.json` - MCP server configured for v3
- ✓ `.claude/agent-registry.json` - Complete agent registry created

### 3. Project Nyra Specialized Agents Created
All 6 mortgage-specific agents have been created and configured:

#### `.claude/agents/custom/mortgage-architect.md`
- **Role**: System Architecture & Design
- **Focus**: Compliance-by-design, data flow, integration patterns
- **Capabilities**: TILA/RESPA workflows, secure PII handling, regulatory adherence
- **Priority**: CRITICAL (auto-loaded)

#### `.claude/agents/custom/compliance-sentinel.md`
- **Role**: Regulatory Compliance Validation
- **Focus**: TILA/RESPA, Fair Lending, State Regulations
- **Capabilities**: Disclosure generation, audit trail, compliance blocking
- **Priority**: CRITICAL (auto-loaded)

#### `.claude/agents/custom/fastapi-backend-engineer.md`
- **Role**: Python FastAPI Service Development
- **Focus**: Async patterns, Pydantic models, health checks
- **Services**: Quote Engine, Campaign Engine, Nyra Orchestrator, Mem0 REST API
- **Priority**: HIGH (auto-loaded)

#### `.claude/agents/custom/nextjs-frontend-engineer.md`
- **Role**: TypeScript React Next.js Development
- **Focus**: Server components, type safety, UX optimization
- **Applications**: RateHunter (port 3100), Nyra Admin (port 3101)
- **Priority**: HIGH (auto-loaded)

#### `.claude/agents/custom/devops-orchestrator.md`
- **Role**: Infrastructure & Deployment
- **Focus**: Docker orchestration, monitoring, 4-PC cluster management
- **Infrastructure**: 20+ services across 4-PC LAN cluster
- **Priority**: HIGH (auto-loaded)

#### `.claude/agents/custom/integration-specialist.md`
- **Role**: Third-Party API Integration
- **Focus**: API clients, webhooks, MCP servers, rate limiting
- **Integrations**: Twilio, SendGrid, freerateupdate.com, lendingtree.com
- **Priority**: HIGH (auto-loaded)

### 4. Production Containerization

#### `infra/claude-flow/Dockerfile`
- Node 20 Alpine base image
- Includes all system dependencies (git, python3, make, g++, bash, curl)
- pnpm@10.27.0 package manager
- claude-flow@alpha installed globally
- Zod dependency included
- Health checks configured
- Exposes ports 6100 (Claude Flow) and 6200 (Archon OS)

#### `infra/claude-flow/docker-compose.yml`
- Complete service definition for claude-flow container
- Environment variable configuration for V3 mode
- Integration endpoints for all Project Nyra services
- Volume mounts for data persistence and agent configs
- Health checks and dependencies properly configured
- Connected to nyra-network bridge

### 5. Initialization Scripts

#### `scripts/init-claude-flow.sh` (Bash)
7-step initialization process:
1. Check dependencies (Node.js, pnpm)
2. Install project dependencies
3. Install claude-flow@alpha
4. Initialize claude-flow with hierarchical-mesh topology
5. Load all 6 Project Nyra agents
6. Start claude-flow daemon
7. Verify installation

#### `scripts/init-claude-flow.ps1` (PowerShell)
Identical functionality for Windows PowerShell environments

## 🚀 Quick Start Commands

### Local Development

```bash
# Initialize claude-flow (first time only)
bash scripts/init-claude-flow.sh

# Or on Windows PowerShell
powershell scripts/init-claude-flow.ps1

# Check status
npx claude-flow@alpha status

# View agents
npx claude-flow@alpha agents list

# View tasks
npx claude-flow@alpha tasks list

# View memory stats
npx claude-flow@alpha memory stats

# Stop daemon
npx claude-flow@alpha daemon stop
```

### Production Docker

```bash
# Build and start claude-flow container
cd infra/claude-flow
docker-compose up -d

# Check logs
docker-compose logs -f claude-flow

# Check health
docker-compose ps

# Stop container
docker-compose down
```

## 📊 Configuration Details

### Swarm Orchestration
- **Topology**: Hierarchical-Mesh (dual orchestrator pattern)
- **Max Agents**: 15 concurrent
- **Coordination**: Claude Flow (planning) + Archon OS (execution)
- **Load Balancing**: Priority-based with auto-failover

### Memory Management
- **Backend**: Hybrid (Letta + Mem0)
- **Primary Store**: Letta (port 8283) for conversational memory
- **Secondary Store**: Mem0 (port 4321) for universal memory
- **HNSW Indexing**: Enabled (150x-12,500x faster search)
- **Caching**: Enabled
- **Retention**: 24h short-term, 30d long-term

### LLM Gateway Integration
- **Service**: Nexus Router (port 6000)
- **Providers**:
  - Anthropic Claude (complex reasoning, compliance)
  - OpenRouter (multiple model access)
  - Gemini 2.0 Flash (fast, cost-effective)

### Observability
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboards (port 3005)
- **Loki**: Log aggregation (port 3100)
- **Health Checks**: All services at `/health`
- **Metrics**: All services at `/metrics`

## 🔧 Troubleshooting

### Zod Package Error
If you see "Cannot find package 'zod'" errors:

```bash
# 1. Install zod globally
npm install -g zod

# 2. Install in claude-flow shared package
cd "C:\Users\edane\AppData\Local\Volta\tools\image\packages\@claude-flow\cli\node_modules\@claude-flow\cli\node_modules\@claude-flow\shared"
pnpm add zod

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall claude-flow@alpha
npm install -g claude-flow@alpha --force
```

### Infisical Integration
The setup uses Infisical for secrets management. Ensure:
- Infisical CLI is installed
- Project ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
- Environment variables are properly injected

### Port Conflicts
If services fail to start due to port conflicts:

```bash
# Check what's using a port
netstat -ano | findstr "6100"

# Or use the provided Docker commands
docker-compose ps
```

## 🏗️ Architecture Integration

### 4-PC Cluster Layout

**Orchestrator Mini PC**:
- Claude Flow V3 (port 6100)
- Archon OS (port 6200)
- Nexus Router (port 6000)
- Letta (port 8283)
- Mem0 (port 4321)

**GPU Worker 1**:
- Ollama (local models)
- Neo4j (graph database)
- FalkorDB

**GPU Worker 2**:
- TwentyCRM (port 3000)
- n8n (port 5678)
- Dify (port 3001)
- Redis

**GPU Worker 3**:
- Prometheus (port 9090)
- Grafana (port 3005)
- Loki (port 3100)

### Agent Interaction Hierarchy

```
Claude Flow (Primary Orchestrator - Planning)
    ↓
Planning Layer (SPARC: Specification → Pseudocode → Architecture → Refinement → Completion)
    ↓
Archon OS (Task Router - Execution)
    ↓
Execution Layer (Specialized Agents):
    ├─ mortgage_architect → compliance_sentinel (Architecture & Compliance)
    ├─ fastapi_backend_engineer (Backend Services)
    ├─ nextjs_frontend_engineer (Frontend Applications)
    ├─ devops_orchestrator (Infrastructure)
    └─ integration_specialist (Third-Party APIs)
```

## 📋 Verification Checklist

After initialization, verify:

- [ ] `npx claude-flow@alpha status` shows daemon running
- [ ] Agent count shows 6 auto-loaded agents
- [ ] Memory backend shows "hybrid" with Letta + Mem0
- [ ] Topology shows "hierarchical-mesh"
- [ ] Max agents shows 15
- [ ] No "zod" package errors
- [ ] MCP server can start (optional)
- [ ] Docker containers build successfully (for production)

## 📚 Additional Resources

- **Main Project Guide**: `CLAUDE.md`
- **Agent Registry**: `.claude/agent-registry.json`
- **Settings**: `.claude/settings.json`
- **MCP Configuration**: `.mcp.json`
- **Docker Setup**: `infra/claude-flow/docker-compose.yml`

## 🎯 Next Steps

1. **Run Initialization Script**: `bash scripts/init-claude-flow.sh`
2. **Verify Setup**: `npx claude-flow@alpha status`
3. **Test Agent Routing**: Create a test task and watch agent coordination
4. **Start Backend Services**: Begin building Quote Engine, Campaign Engine, etc.
5. **Deploy to Cluster**: Use Docker Compose for 4-PC deployment

## ⚠️ Important Notes

- **Compliance First**: All mortgage features MUST pass compliance_sentinel validation
- **Parallel Execution**: Always batch operations in single messages where possible
- **Locked Stack**: Do not replace Nexus, TwentyCRM, Letta, Mem0, n8n, or Dify
- **Security**: All PII encrypted, RBAC enforced, audit trails complete
- **Performance Targets**: Quote gen < 2s, API p95 < 500ms, 99.9% uptime

---

**Status**: ✅ Setup Complete | **Version**: claude-flow@3.0.0-alpha.71 | **Date**: 2026-01-13
