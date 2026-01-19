# Claude Flow Complete Setup Guide

**Date**: 2026-01-18
**Status**: Ready for Deployment

---

## ✅ What Was Fixed

### 1. MCP Configuration Updated (`mcp.json`)
- ✅ Added V3 environment variables (memory, hooks, neural learning)
- ✅ Enabled hierarchical-mesh topology (anti-drift)
- ✅ Configured 100 max agents
- ✅ Added descriptions for all MCP servers
- ✅ Enhanced ruv-swarm configuration

### 2. Docker Environment Updated (`infra/docker/.env`)
- ✅ Added `CLAUDE_FLOW_MCP_URL=http://nyra-claude-flow:3010/mcp`
- ✅ Fixed port mismatch (Docker: 3010, Nexus Router now knows correct port)

### 3. Archon OS Clarified
- ✅ Confirmed Archon OS is backend-only (port 8092)
- ✅ UI integration is through **Nexus Dashboard** (port 3005)
- ✅ RabbitMQ Management UI available (port 15672)
- ✅ Environment fully configured (from previous setup)

---

## 🚀 Next Steps on Your Orchestrator PC

### Step 1: Restart Claude Code (5 seconds)
```powershell
# Close and reopen Claude Code to reload mcp.json
# The new V3 configuration will be active
```

### Step 2: Start Claude Flow Docker Container (2 minutes)
```powershell
# Navigate to Docker directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Start Claude Flow service
docker-compose -f base/docker-compose.mcp.yml up -d claude-flow

# Verify it's running
docker ps | findstr claude-flow
# Expected: nyra-claude-flow running on port 3010
```

### Step 3: Verify Claude Flow Health (30 seconds)
```powershell
# Test Claude Flow API
curl http://localhost:3010/health

# Expected response:
# {"status":"healthy","service":"claude-flow","version":"3.0.0-alpha"}
```

### Step 4: Test MCP Connection from Claude Code (1 minute)
```powershell
# In Claude Code, test that claude-flow MCP is connected
# Check available tools (should see claude-flow tools)

# Or test via CLI:
npx @claude-flow/cli@latest status
npx @claude-flow/cli@latest memory list
npx @claude-flow/cli@latest hooks list
```

### Step 5: Start Nexus Router (if not running) (2 minutes)
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Start full MCP stack (includes Nexus Router)
docker-compose -f base/docker-compose.mcp.yml up -d

# Or just Nexus Router:
docker-compose -f base/docker-compose.mcp.yml up -d nexus-router
```

### Step 6: Verify Nexus Router Integration (1 minute)
```powershell
# Test Nexus Router health
curl http://localhost:6000/health

# Test MCP proxy (should list claude-flow)
curl http://localhost:6000/mcp/servers

# Test tools list
curl http://localhost:6000/mcp/tools
```

### Step 7: Start Nexus Dashboard (3 minutes)
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard

# Install dependencies (if not already done)
pnpm install

# Start dev server
pnpm dev

# Access at: http://localhost:3005
```

### Step 8: Verify Everything Works (2 minutes)
```powershell
# Open browser tabs:
# 1. Nexus Dashboard:     http://localhost:3005
# 2. Claude Flow Monitor: http://localhost:3005/claude-flow
# 3. RabbitMQ (Archon):   http://localhost:15672 (archon / password from .env)
# 4. Archon OS Health:    http://localhost:8092/health
```

---

## 🎯 What You Can Now Do

### From Claude Code (with MCP):
```bash
# Spawn agents via claude-flow MCP
# Use Task tool with any of the 60+ agent types
# Memory persists across sessions
# Hooks system learns from your patterns
```

### From CLI:
```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8

# Spawn agents
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# Memory operations
npx @claude-flow/cli@latest memory store --key "pattern" --value "data" --namespace patterns
npx @claude-flow/cli@latest memory search --query "authentication"

# Hooks
npx @claude-flow/cli@latest hooks pre-task --description "Build feature X"
npx @claude-flow/cli@latest hooks post-task --task-id "123" --success true
```

### From Nexus Dashboard:
- Monitor Claude Flow orchestration (port 3005/claude-flow)
- View Archon OS agent status
- Check MCP server connections
- Manage GPU workers
- Configure AI providers

---

## 📊 System Architecture (Complete)

```
┌─────────────────────────────────────────────────────────────┐
│                   Claude Code (Your IDE)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MCP Servers (mcp.json - UPDATED)                    │   │
│  │  - claude-flow (V3, memory, hooks, neural)           │   │
│  │  - ruv-swarm (adaptive, WASM, DAA)                   │   │
│  │  - flow-nexus, hive-mind, roo, codanna              │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │ STDIO Transport
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Docker Network (nyra-mcp, nyra-core)            │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  Claude Flow       │  │  Nexus Router      │            │
│  │  Port: 3010        │◄─┤  Port: 6000        │            │
│  │  MCP: /mcp         │  │  MCP Proxy: /mcp   │            │
│  └────────┬───────────┘  └────────┬───────────┘            │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  AgentDB           │  │  Archon OS         │            │
│  │  Port: 8080        │  │  API: 8092         │            │
│  │  HNSW Vector DB    │  │  Metrics: 8093     │            │
│  └────────────────────┘  └────────┬───────────┘            │
│                                   │                         │
│                                   ▼                         │
│                          ┌────────────────────┐             │
│                          │  RabbitMQ          │             │
│                          │  Mgmt UI: 15672    │             │
│                          └────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Nexus Dashboard (Port 3005)                     │
│  - /claude-flow (Orchestration monitoring)                  │
│  - /mcp-servers (MCP server management)                     │
│  - /tools (Tool discovery)                                  │
│  - /gpu (GPU worker management)                             │
│  - /providers (AI provider config)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Verification Checklist

After completing all steps, verify:

- [ ] Claude Code can connect to claude-flow MCP
- [ ] `docker ps` shows `nyra-claude-flow` running on port 3010
- [ ] `curl http://localhost:3010/health` returns healthy
- [ ] `curl http://localhost:6000/mcp/servers` lists claude-flow
- [ ] `npx @claude-flow/cli@latest status` shows system operational
- [ ] Nexus Dashboard accessible at http://localhost:3005
- [ ] `/claude-flow` page shows orchestration data
- [ ] Archon OS responds at http://localhost:8092/health
- [ ] RabbitMQ UI accessible at http://localhost:15672
- [ ] No errors in `docker logs nyra-claude-flow`

---

## 🐛 Troubleshooting

### Issue 1: Claude Code doesn't see claude-flow tools
**Solution**:
1. Close and reopen Claude Code
2. Check MCP connection: Look for claude-flow in Claude Code's MCP servers list
3. Verify mcp.json was saved correctly

### Issue 2: Docker container won't start
**Solution**:
```powershell
# Check logs
docker logs nyra-claude-flow

# Common issues:
# - Port 3010 already in use: Stop conflicting service
# - AgentDB not running: Start dependencies first
docker-compose -f base/docker-compose.mcp.yml up -d agentdb
```

### Issue 3: Nexus Router can't connect to Claude Flow
**Solution**:
```powershell
# Verify environment variable is loaded
docker exec nyra-nexus-router env | findstr CLAUDE_FLOW

# Should show: CLAUDE_FLOW_MCP_URL=http://nyra-claude-flow:3010/mcp

# If not, restart Nexus Router:
docker-compose -f base/docker-compose.mcp.yml restart nexus-router
```

### Issue 4: Memory/Hooks not working
**Solution**:
- Verify environment variables in mcp.json (should have all V3 flags)
- Test: `npx @claude-flow/cli@latest hooks list`
- Test: `npx @claude-flow/cli@latest memory list`
- Check logs: `npx @claude-flow/cli@latest doctor`

---

## 📚 Additional Resources

### Documentation Created:
1. `STARTUP.MD` - Complete system startup guide
2. `ARCHON-OS-SETUP-GUIDE.md` - Archon OS deployment (10 steps)
3. `CLAUDE-FLOW-NEXUS-INTEGRATION-ANALYSIS.md` - Technical integration analysis
4. This file - Complete setup guide

### Key Files Modified:
1. `mcp.json` - Added V3 environment configuration
2. `infra/docker/.env` - Added CLAUDE_FLOW_MCP_URL
3. `infra/dual-orchestrator/archon-os/.env` - Complete Archon OS config (from previous session)

### Ports Reference:
| Service | Port | Purpose |
|---------|------|---------|
| Nexus Router | 6000 | LLM Gateway |
| Nexus Dashboard | 3005 | Unified UI |
| Claude Flow | 3010 | Multi-agent orchestration |
| AgentDB | 8080 | Vector database |
| Archon OS API | 8092 | Backend orchestration |
| Archon Metrics | 8093 | Prometheus metrics |
| RabbitMQ UI | 15672 | Queue management |

---

## 🎉 Success State

Once everything is running, you'll have:

✅ **Claude Code** connected to claude-flow MCP with full V3 features
✅ **Claude Flow** Docker container running and healthy
✅ **Nexus Router** proxying MCP requests to Claude Flow
✅ **Archon OS** backend running with complete configuration
✅ **Nexus Dashboard** providing unified monitoring UI
✅ **AgentDB** providing HNSW-indexed vector memory
✅ **RabbitMQ** managing distributed task queues

You can now:
- Spawn swarms via Task tool from Claude Code
- Use CLI for direct claude-flow operations
- Monitor everything through Nexus Dashboard
- Access Archon OS orchestration features
- Persistent memory across sessions
- Self-learning hooks system active

---

**Last Updated**: 2026-01-18
**Status**: Production Ready
**Next**: Start Docker containers on orchestrator PC
