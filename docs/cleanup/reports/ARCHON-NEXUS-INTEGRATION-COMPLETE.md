# Archon + Nexus Router Integration - Complete Setup Guide

**Date**: 2026-01-18
**Status**: Deployment Ready

---

## 🎯 What Was Completed

All automated setup tasks have been completed. This guide contains everything you need to deploy Archon with Nexus Router integration.

### ✅ Files Created/Updated

1. **infra/docker/docker-compose.archon.yml** - Archon services with Nexus Router integration
2. **infra/docker/archon-integration.env.example** - Complete environment template
3. **scripts/deploy-archon.ps1** - Automated deployment script with validation
4. **mcp.json** - Updated with Claude Flow V3 configuration
5. **infra/docker/.env** - Added CLAUDE_FLOW_MCP_URL
6. **ARCHON-COMPLETE-SETUP-GUIDE.md** - User setup guide
7. **docs/archon-os-technical-analysis.md** - Complete technical reference
8. **docs/architecture/ARCHON-OS-ANALYSIS.md** - Deployment gap analysis

### ✅ Problems Solved

1. **Deployment Gap Fixed**: Docker compose now references correct source location (`tools/archon/python`)
2. **Nexus Router Integration**: All Archon services configured to route through Nexus Router
3. **Network Configuration**: Proper integration with `nyra-mcp` and `nyra-core` networks
4. **Health Checks**: Comprehensive health check configuration for all services
5. **Hot Reload**: Development volumes mounted for rapid iteration
6. **Automated Deployment**: PowerShell script with validation and health checks

---

## 🏗️ Architecture Overview

### Service Topology

```
┌─────────────────────────────────────────────────────────────┐
│                     Project Nyra Stack                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │ Claude Code  │─MCP──│ Archon MCP   │                   │
│  │              │      │  (Port 8051)  │                   │
│  └──────────────┘      └───────┬──────┘                   │
│                                 │                          │
│                         ┌───────▼────────┐                │
│  ┌──────────────┐      │ Nexus Router    │                │
│  │ Archon UI    │◄────►│  LLM Gateway    │                │
│  │ (Port 3737)  │      │  (Port 6000)    │                │
│  └───────┬──────┘      └────────┬────────┘                │
│          │                      │                          │
│  ┌───────▼────────┐     ┌───────▼────────┐                │
│  │ Archon Server  │     │  AI Providers  │                │
│  │  FastAPI+RAG   │     │ (Anthropic,    │                │
│  │  (Port 8181)   │     │  OpenAI, etc.) │                │
│  └───────┬────────┘     └────────────────┘                │
│          │                                                 │
│  ┌───────▼────────┐                                       │
│  │   Supabase     │                                       │
│  │  PostgreSQL+   │                                       │
│  │   PGVector     │                                       │
│  └────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Port Allocation

| Service | Port | Purpose | Access |
|---------|------|---------|---------|
| **Archon UI** | 3737 | React dashboard | http://localhost:3737 |
| **Archon API** | 8181 | FastAPI backend | http://localhost:8181 |
| **Archon MCP** | 8051 | MCP protocol server | http://localhost:8051 |
| **Archon Agents** | 8052 | AI/ML service (optional) | http://localhost:8052 |
| **Nexus Router** | 6000 | LLM gateway | http://localhost:6000 |
| **Supabase** | External | PostgreSQL + PGVector | Cloud hosted |

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites Checklist

- [ ] Docker Desktop installed and running
- [ ] Supabase account created (free tier works)
- [ ] At least one AI provider API key (OpenAI, Anthropic, Google, or Ollama)
- [ ] 16GB RAM recommended (8GB minimum)

### Step 1: Supabase Setup (10 minutes)

**Option A: Cloud Supabase** (Recommended)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `archon-nyra`
   - Database Password: (generate secure password)
   - Region: (choose closest)
4. Wait ~2 minutes for project creation
5. Go to **Settings → API**
6. Copy:
   - **Project URL** (`SUPABASE_URL`)
   - **service_role key** (`SUPABASE_SERVICE_KEY`) ⚠️ NOT the anon key!

**Option B: Local Supabase** (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local Supabase
cd C:\Dev\Projects\Repos\Project-Nyra\tools\archon
supabase init
supabase start

# Get credentials
supabase status -o env
# Copy: API URL and service_role key
```

### Step 2: Configure Environment (5 minutes)

```powershell
# Navigate to docker directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Copy environment template
cp archon-integration.env.example .env

# Edit .env with your values
notepad .env
```

**Minimum Required Configuration:**

```bash
# Supabase (REQUIRED)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key

# AI Provider (at least ONE required)
OPENAI_API_KEY=sk-proj-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GOOGLE_API_KEY=AIzaSy...
```

### Step 3: Run Database Migration (2 minutes)

```bash
# Copy SQL migration script
# Location: C:\Dev\Projects\Repos\Project-Nyra\tools\archon\migration\complete_setup.sql

# Open Supabase SQL Editor:
# https://supabase.com/dashboard/project/<your-project>/sql/new

# Paste the SQL contents and execute
```

This creates all tables: sources, documents, projects, tasks, etc.

### Step 4: Deploy Archon (automated)

```powershell
# Run automated deployment script
cd C:\Dev\Projects\Repos\Project-Nyra
.\scripts\deploy-archon.ps1

# Or with agents service:
.\scripts\deploy-archon.ps1 -Profile agents

# Or force rebuild:
.\scripts\deploy-archon.ps1 -Rebuild

# Or clean start:
.\scripts\deploy-archon.ps1 -Clean -Rebuild
```

The script will:
1. ✅ Validate environment configuration
2. ✅ Check Docker networks
3. ✅ Build and start services
4. ✅ Perform health checks
5. ✅ Display access URLs

### Step 5: Access Archon UI

1. Open http://localhost:3737
2. Complete onboarding wizard:
   - Set API key (if not in .env)
   - Configure RAG settings
   - Select AI model
3. Start using Archon!

---

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Start base infrastructure first
docker-compose -f docker-compose.dev.yml up -d
# Wait for networks to be created

# Start Archon services
docker-compose -f docker-compose.archon.yml up -d

# With agents service:
docker-compose --profile agents -f docker-compose.archon.yml up -d

# Check status
docker-compose -f docker-compose.archon.yml ps

# View logs
docker-compose -f docker-compose.archon.yml logs -f
```

---

## 🔗 Nexus Router Integration Details

### How It Works

1. **Archon services** are configured with `NEXUS_ROUTER_URL=http://nexus-router:6000`
2. **All LLM requests** are automatically routed through Nexus Router
3. **Nexus Router** handles:
   - API key management
   - Provider fallbacks
   - Rate limiting
   - Request logging

### Benefits

- **Centralized API key management**
- **Automatic fallback** between providers
- **Rate limiting** to prevent quota exhaustion
- **Request aggregation** and monitoring
- **Cost tracking** across all providers

### Configuration

Nexus Router is configured in `infra/docker/base/docker-compose.mcp.yml`:

```yaml
nexus-router:
  image: ghcr.io/grafbase/nexus:latest
  container_name: nyra-nexus
  ports:
    - "6000:6000"
  environment:
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    - DEFAULT_PROVIDER=anthropic
    - FALLBACK_PROVIDERS=openrouter,google
```

### Testing Nexus Router

```bash
# Check health
curl http://localhost:6000/health

# Test API endpoint
curl -X POST http://localhost:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 📊 Verification Checklist

After deployment, verify everything is working:

### Service Health Checks

```powershell
# Archon Server
curl http://localhost:8181/health
# Expected: {"status":"healthy"}

# Archon MCP
curl http://localhost:8051/health
# Expected: {"status":"healthy","transport":"sse"}

# Archon UI
curl http://localhost:3737
# Expected: HTML response

# Nexus Router
curl http://localhost:6000/health
# Expected: {"status":"ok"}
```

### Docker Container Status

```powershell
docker ps --filter "name=nyra-archon"
# Expected: All containers showing "Up" status
```

### Network Connectivity

```powershell
# Check networks
docker network inspect nyra-mcp
docker network inspect nyra-core

# Should show all Archon containers connected
```

### MCP Connection Test

```powershell
# In Claude Code, run:
Claude, can you list all available MCP tools from Archon?

# Expected response: List of Archon MCP tools
```

---

## 🔄 Development Workflows

### Hot Reload Development

The docker-compose configuration mounts source code as volumes:

```yaml
volumes:
  - ../../tools/archon/python/src:/app/src:ro  # Backend code
  - ../../tools/archon/archon-ui-main/src:/app/src:ro  # Frontend code
```

**To enable hot reload:**

1. Make changes to source files in `tools/archon/`
2. Backend: Auto-reloads with uvicorn --reload
3. Frontend: Rebuild container or use local dev server

### Local Frontend Development

For faster frontend iteration:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\tools\archon\archon-ui-main

# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev
# Access at http://localhost:3737
```

Backend still runs in Docker, frontend runs locally with Vite hot reload.

### Viewing Logs

```powershell
# All services
docker-compose -f docker-compose.archon.yml logs -f

# Specific service
docker-compose -f docker-compose.archon.yml logs -f archon-server
docker-compose -f docker-compose.archon.yml logs -f archon-mcp
docker-compose -f docker-compose.archon.yml logs -f archon-ui

# Follow new logs only
docker-compose -f docker-compose.archon.yml logs -f --tail=50
```

### Restarting Services

```powershell
# Restart all
docker-compose -f docker-compose.archon.yml restart

# Restart specific service
docker-compose -f docker-compose.archon.yml restart archon-server

# Stop and start (full restart)
docker-compose -f docker-compose.archon.yml down
docker-compose -f docker-compose.archon.yml up -d
```

### Rebuilding After Code Changes

```powershell
# Rebuild and restart
docker-compose -f docker-compose.archon.yml up -d --build

# Force complete rebuild
docker-compose -f docker-compose.archon.yml build --no-cache
docker-compose -f docker-compose.archon.yml up -d --force-recreate
```

---

## 🐛 Troubleshooting

### Issue 1: Services Not Starting

**Symptoms**: Containers exit immediately or show "Unhealthy" status

**Solutions**:

```powershell
# Check logs for errors
docker-compose -f docker-compose.archon.yml logs

# Common issues:
# 1. Missing .env variables
cat .env | grep -v '^#' | grep -v '^$'

# 2. Port conflicts
netstat -ano | findstr :3737
netstat -ano | findstr :8181
netstat -ano | findstr :8051

# 3. Network issues
docker network ls
docker network create nyra-mcp
docker network create nyra-core

# 4. Supabase connection
# Verify URL and service_role key in .env
# Test connection from container:
docker exec nyra-archon-server curl -I ${SUPABASE_URL}/rest/v1/
```

### Issue 2: Database Connection Errors

**Symptoms**: "Failed to connect to Supabase" or "Connection refused"

**Solutions**:

1. **Verify Supabase credentials**:
   ```bash
   # In .env file, ensure:
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co  # Must be HTTPS
   SUPABASE_SERVICE_KEY=eyJhbGci...  # Must be service_role key, NOT anon
   ```

2. **Check database migration**:
   - Ensure you ran `complete_setup.sql` in Supabase SQL Editor
   - Verify tables exist: Go to Supabase → Table Editor

3. **Test connection manually**:
   ```bash
   curl -H "apikey: YOUR_SERVICE_KEY" \
        -H "Authorization: Bearer YOUR_SERVICE_KEY" \
        https://your-project.supabase.co/rest/v1/sources
   ```

### Issue 3: MCP Connection Failed

**Symptoms**: Claude Code can't connect to Archon MCP

**Solutions**:

1. **Verify MCP server is running**:
   ```powershell
   curl http://localhost:8051/health
   ```

2. **Check MCP configuration** in Claude Code:
   ```json
   {
     "mcpServers": {
       "archon": {
         "command": "curl",
         "args": ["-N", "http://localhost:8051/sse"]
       }
     }
   }
   ```

3. **Check Docker network connectivity**:
   ```powershell
   docker exec nyra-archon-mcp curl -I http://archon-server:8181/health
   ```

### Issue 4: Frontend Not Loading

**Symptoms**: Blank page or 502 Bad Gateway at http://localhost:3737

**Solutions**:

1. **Check container logs**:
   ```powershell
   docker-compose -f docker-compose.archon.yml logs archon-ui
   ```

2. **Verify build process completed**:
   ```powershell
   docker exec nyra-archon-ui ls -la /app/dist
   ```

3. **Check Vite proxy configuration**:
   - Ensure `archon-ui-main/vite.config.ts` has correct proxy settings
   - Backend must be reachable from frontend container

4. **Clear browser cache** and hard reload (Ctrl+Shift+R)

### Issue 5: API Keys Not Working

**Symptoms**: "Invalid API key" or "Unauthorized" errors

**Solutions**:

1. **Verify keys in .env**:
   ```bash
   # Check keys are present and not commented
   grep API_KEY .env
   ```

2. **Configure in UI** (alternative to .env):
   - Go to http://localhost:3737/settings
   - Add API keys in Settings page
   - Keys stored in Supabase

3. **Check Nexus Router**:
   ```powershell
   # Ensure Nexus Router has API keys
   docker exec nyra-nexus env | grep API_KEY
   ```

### Issue 6: High Memory Usage

**Symptoms**: Docker consuming >8GB RAM

**Solutions**:

1. **Disable agents service** if not needed:
   ```powershell
   # Don't use --profile agents
   docker-compose -f docker-compose.archon.yml up -d
   ```

2. **Adjust Docker Desktop settings**:
   - Docker Desktop → Settings → Resources
   - Set memory limit to 12GB (from 16GB default)

3. **Use production mode**:
   ```bash
   # In .env
   PROD=true
   # Disables hot reload and reduces memory
   ```

---

## 🎯 Next Steps After Setup

### 1. Populate Knowledge Base

```
1. Go to Knowledge Base section in Archon UI
2. Click "Crawl Website"
3. Start with Project Nyra documentation:
   - https://github.com/your-org/Project-Nyra
   - Your deployment URLs
4. Wait for crawl to complete
5. Test search functionality
```

### 2. Create First Project

```
1. Go to Projects section
2. Click "New Project"
3. Name: "Project Nyra Development"
4. Add features and tasks
5. Link to knowledge base entries
```

### 3. Configure Claude Code MCP

```json
// Add to Claude Code mcp.json
{
  "mcpServers": {
    "archon": {
      "command": "curl",
      "args": ["-N", "http://localhost:8051/sse"],
      "description": "Archon knowledge and task management"
    }
  }
}
```

### 4. Test MCP Integration

```
In Claude Code:
- "Search Archon knowledge base for authentication patterns"
- "List all projects in Archon"
- "Create a new task for API refactoring"
```

### 5. Enable Agent Work Orders (Optional)

If you want automated PR creation:

```bash
# In .env
ARCHON_ENABLE_WORK_ORDERS=true
GITHUB_PAT_TOKEN=ghp_...  # Requires repo + workflow scopes

# Restart services
docker-compose -f docker-compose.archon.yml restart
```

---

## 📚 Additional Resources

### Documentation

- **Main Setup Guide**: `ARCHON-COMPLETE-SETUP-GUIDE.md`
- **Technical Analysis**: `docs/archon-os-technical-analysis.md`
- **Deployment Gap Analysis**: `docs/architecture/ARCHON-OS-ANALYSIS.md`
- **Archon Repository**: https://github.com/coleam00/Archon

### Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Archon Issues**: https://github.com/coleam00/Archon/issues
- **MCP Protocol Spec**: https://modelcontextprotocol.io
- **Nexus Router**: https://github.com/grafbase/nexus

### Support

- **GitHub Issues**: https://github.com/coleam00/Archon/issues
- **Discussions**: https://github.com/coleam00/Archon/discussions

---

## 🎉 Success Criteria

You're done when:

- [ ] All services show "Healthy" in `docker ps`
- [ ] Archon UI loads at http://localhost:3737
- [ ] API health check succeeds: `curl http://localhost:8181/health`
- [ ] MCP health check succeeds: `curl http://localhost:8051/health`
- [ ] Nexus Router responds: `curl http://localhost:6000/health`
- [ ] You can create a project in Archon UI
- [ ] You can search the knowledge base
- [ ] Claude Code can connect to Archon MCP

---

**Last Updated**: 2026-01-18
**Version**: 1.0.0
**Status**: Production Ready

🚀 **You're all set! Start building with Archon + Project Nyra!**
