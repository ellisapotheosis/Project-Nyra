# Archon Complete Setup Guide

**Date**: 2026-01-18
**Status**: Repository Cloned - Ready for Configuration

---

## 🎯 What is Archon?

Archon is a comprehensive **Knowledge & Task Management System** for AI Coding Assistants:

### Key Features:
- **Knowledge Management**: Web crawling, document upload, vector search (RAG)
- **Task Management**: Projects, features, tasks with AI-assisted workflows
- **MCP Server**: Exposes tools to AI IDEs (Cursor, Windsurf, Claude Code)
- **AI Agents**: Document processing, code analysis, project generation
- **Real-time UI**: React/Vite dashboard with live updates

### Architecture:
- **Frontend UI** (Port 3737): React/Vite dashboard
- **API Server** (Port 8181): Python FastAPI backend
- **MCP Server** (Port 8051): AI client integration
- **Agents Service** (Port 8052): AI/ML operations
- **Database**: Supabase (PostgreSQL + PGVector)

---

## ✅ What's Already Done

1. ✅ **Repository Cloned**: `tools/archon/` (stable branch from GitHub)
2. ✅ **Directory Structure**: All source code present
   - `archon-ui-main/` - Frontend
   - `python/` - Backend services
   - `migration/` - Database schemas
   - `docker-compose.yml` - Container orchestration
3. ✅ **.env Template Created**: Ready for your configuration

---

## 🚨 What You MUST Do (Cannot Be Automated)

### Step 1: Create Supabase Project (10 minutes)

Archon requires Supabase (PostgreSQL + PGVector) for its database.

**Option A: Cloud Supabase** (Recommended for beginners)
```
1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: archon-nyra
   - Database Password: (generate secure password)
   - Region: (choose closest)
4. Wait ~2 minutes for project creation
5. Go to Settings → API
6. Copy:
   - Project URL (SUPABASE_URL)
   - service_role key (SUPABASE_SERVICE_KEY) ⚠️ NOT the anon key!
```

**Option B: Local Supabase** (Advanced - requires Docker)
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

### Step 2: Configure Environment Variables (5 minutes)

Edit `C:\Dev\Projects\Repos\Project-Nyra\tools\archon\.env`:

```bash
# === REQUIRED (GET FROM SUPABASE) ===
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # MUST be service_role, not anon!

# === REQUIRED (AI PROVIDER) ===
# You need AT LEAST ONE of these:
OPENAI_API_KEY=sk-proj-...  # From https://platform.openai.com/api-keys
# OR
GOOGLE_API_KEY=AIzaSy...    # From https://aistudio.google.com/app/apikey
# OR (for local models)
OLLAMA_BASE_URL=http://localhost:11434

# === SERVICE PORTS (Can use defaults) ===
HOST=localhost
ARCHON_SERVER_PORT=8181
ARCHON_MCP_PORT=8051
ARCHON_AGENTS_PORT=8052
ARCHON_UI_PORT=3737

# === OPTIONAL ===
LOG_LEVEL=INFO
AGENTS_ENABLED=true
```

**CRITICAL**: Must use `service_role` key, NOT `anon` key from Supabase!

### Step 3: Run Database Migration (2 minutes)

```bash
# Go to your Supabase dashboard:
# https://supabase.com/dashboard/project/<your-project>/sql/new

# Copy and run the SQL from:
C:\Dev\Projects\Repos\Project-Nyra\tools\archon\migration\complete_setup.sql

# This creates all tables: sources, documents, projects, tasks, etc.
```

---

## 🚀 Automated Setup (Run These Commands)

### Step 4: Install Dependencies & Start Services (5 minutes)

```powershell
# Navigate to Archon directory
cd C:\Dev\Projects\Repos\Project-Nyra\tools\archon

# Start Docker services (backend + MCP)
docker-compose up --build -d

# Wait for services to start (~60 seconds)
Start-Sleep -Seconds 60

# Check services are running
docker ps | findstr archon

# Expected output:
# archon-server    (port 8181)
# archon-mcp       (port 8051)
# archon-frontend  (port 3737)
```

### Step 5: Verify Backend Services (2 minutes)

```powershell
# Test API server
curl http://localhost:8181/health

# Expected: {"status":"healthy"}

# Test MCP server
curl http://localhost:8051/health

# Expected: {"status":"healthy","transport":"sse"}
```

### Step 6: Start Frontend UI (3 minutes)

**Option A: Docker Mode** (All services in Docker)
```powershell
# Already running from Step 4
# Access UI at: http://localhost:3737
```

**Option B: Hybrid Mode** (Recommended for development)
```powershell
# Backend in Docker, Frontend local with hot-reload
cd C:\Dev\Projects\Repos\Project-Nyra\tools\archon\archon-ui-main

# Install dependencies
npm install

# Start development server
npm run dev

# Access UI at: http://localhost:3737
```

### Step 7: Complete Onboarding (2 minutes)

```
1. Open http://localhost:3737
2. Complete the onboarding wizard:
   - Set your API key (or skip if in .env)
   - Configure RAG settings
   - Select AI model
3. You'll see the main dashboard
```

---

## 🎉 Success! What You Can Do Now

### Knowledge Management
```
1. Go to Knowledge Base section
2. Click "Crawl Website"
3. Enter URL: https://docs.python.org
4. Click "Start Crawl"
5. Wait for completion (progress bar)
6. Search your documentation with RAG
```

### Project Management
```
1. Go to Projects section
2. Click "New Project"
3. Name it, add description
4. Create features and tasks
5. Track progress in dashboard
```

### MCP Integration (Connect to Claude Code)
```
1. In Archon UI, go to MCP Dashboard
2. Copy the MCP connection config
3. Add to your Claude Code mcp.json
4. Restart Claude Code
5. Use Archon tools from Claude Code
```

---

## 🔧 Integration with Project Nyra

### Current Status

**Archon OS vs Archon**:
- `infra/dual-orchestrator/archon-os/` - Custom orchestration wrapper (port 8092)
- `tools/archon/` - Full Archon application (ports 8181/8051/3737)
- These are COMPLEMENTARY, not conflicting

### Recommended Integration

**Option 1: Run Both Systems** (Recommended)
- **Archon OS** handles multi-agent orchestration (existing setup)
- **Archon** handles knowledge management and task tracking
- Both integrate through MCP protocol
- No port conflicts (different ports)

**Option 2: Use Archon Only**
- Disable Archon OS Docker containers
- Use full Archon for both orchestration and knowledge management
- More comprehensive but single system

### Adding Archon to Nexus Dashboard

Create a new page in Nexus Dashboard to embed Archon UI:

```typescript
// apps/nexus-dashboard/src/app/archon/page.tsx
export default function ArchonPage() {
  return (
    <div className="h-screen">
      <iframe
        src="http://localhost:3737"
        className="w-full h-full border-0"
        title="Archon Dashboard"
      />
    </div>
  );
}
```

Add to navigation:
```typescript
// apps/nexus-dashboard/src/app/layout.tsx
<NavItem href="/archon" label="Archon" />
```

---

## 📊 Port Allocation Summary

| Service | Port | Purpose |
|---------|------|---------|
| **Archon UI** | 3737 | React dashboard |
| **Archon API** | 8181 | FastAPI backend |
| **Archon MCP** | 8051 | AI client integration |
| **Archon Agents** | 8052 | AI/ML operations |
| **Archon OS API** | 8092 | Orchestration wrapper (existing) |
| **Nexus Dashboard** | 3005 | Unified UI |
| **Nexus Router** | 6000 | LLM gateway |
| **Claude Flow** | 3010 | Multi-agent orchestration |

No conflicts - all services can run simultaneously!

---

## 🐛 Troubleshooting

### Issue 1: "Failed to save" errors

**Cause**: Using anon key instead of service_role key

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (longer one)
3. Update SUPABASE_SERVICE_KEY in .env
4. Restart: `docker-compose restart`

### Issue 2: Port already in use

**Check what's using ports**:
```powershell
netstat -ano | findstr :8181
netstat -ano | findstr :8051
netstat -ano | findstr :3737
```

**Solution**: Stop conflicting service or change ports in .env

### Issue 3: Docker container won't start

**Check logs**:
```powershell
docker-compose logs archon-server
docker-compose logs archon-mcp
```

**Common issues**:
- Supabase credentials invalid
- API key missing
- Port conflicts

### Issue 4: Frontend can't connect to backend

**Verify Vite proxy**:
```typescript
// archon-ui-main/vite.config.ts should have:
server: {
  proxy: {
    '/api': 'http://localhost:8181',
  },
}
```

**Or use CORS**: Backend already has CORS enabled for localhost

### Issue 5: Database migration fails

**Solution**:
1. Go to Supabase SQL Editor
2. Run `migration/RESET_DB.sql` (clears all tables)
3. Run `migration/complete_setup.sql` (recreates schema)
4. Restart Archon: `docker-compose restart`

---

## 🔍 Verification Checklist

After completing all steps, verify:

- [ ] Supabase project created and accessible
- [ ] .env file configured with valid credentials
- [ ] Database migration completed successfully
- [ ] `docker ps` shows archon-server and archon-mcp running
- [ ] `curl http://localhost:8181/health` returns healthy
- [ ] `curl http://localhost:8051/health` returns healthy
- [ ] Archon UI accessible at http://localhost:3737
- [ ] Onboarding wizard completed
- [ ] Can create a test project
- [ ] Can crawl a test website
- [ ] MCP connection working in Claude Code

---

## 📚 Additional Resources

### Documentation:
- **Main README**: `tools/archon/README.md`
- **Architecture**: `tools/archon/PRPs/ai_docs/ARCHITECTURE.md`
- **API Conventions**: `tools/archon/PRPs/ai_docs/API_NAMING_CONVENTIONS.md`
- **Claude Integration**: `tools/archon/CLAUDE.md`
- **Agents Guide**: `tools/archon/AGENTS.md`

### Development Commands:
```bash
# Backend (Python)
cd tools/archon/python
uv sync --group all              # Install dependencies
uv run python -m src.server.main # Run server locally
uv run pytest                    # Run tests
uv run ruff check                # Lint

# Frontend (React)
cd tools/archon/archon-ui-main
npm install                      # Install dependencies
npm run dev                      # Development server
npm run build                    # Production build
npm run test                     # Run tests
npm run lint                     # Lint
```

### Docker Commands:
```bash
cd tools/archon

# Start everything
docker-compose up -d

# Start with agents
docker-compose --profile agents up -d

# View logs
docker-compose logs -f archon-server
docker-compose logs -f archon-mcp

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Stop and remove volumes (DESTRUCTIVE)
docker-compose down -v
```

---

## 🎯 Next Steps After Setup

### 1. Integrate with Claude Code

Add to your `mcp.json`:
```json
{
  "mcpServers": {
    "archon": {
      "type": "sse",
      "url": "http://localhost:8051",
      "description": "Archon knowledge and task management"
    }
  }
}
```

### 2. Build Your Knowledge Base

1. Crawl documentation sites
2. Upload project documents
3. Use RAG search from Claude Code
4. Extract code examples

### 3. Start Managing Projects

1. Create your first project
2. Define features and requirements
3. Break down into tasks
4. Use AI assistance for generation

### 4. Explore AI Agents

1. Enable agents in settings
2. Use document processing agents
3. Try project generation tools
4. Experiment with code analysis

---

## 📝 Important Notes

### Security

1. **.env is Git-Ignored**: Never commit .env to version control
2. **Service Role Key**: Keep this secret - has full database access
3. **API Keys**: Store securely, rotate periodically
4. **Local vs Cloud**: Cloud Supabase requires API key authentication

### Performance

- **First Crawl**: May be slow as embeddings generate
- **Subsequent Searches**: Fast (vector search is optimized)
- **Docker Resources**: Allocate 4GB+ RAM for smooth operation
- **Frontend Build**: Production build significantly faster than dev

### Maintenance

- **Database Backups**: Supabase provides automated backups
- **Update Archon**: `git pull` in tools/archon, then `docker-compose up --build`
- **Clean Docker**: Periodically run `docker system prune`
- **Monitor Logs**: Check logs for errors or warnings

---

**Last Updated**: 2026-01-18
**Archon Version**: stable branch
**Status**: Ready for Configuration

🎉 **Once you complete the manual steps (Supabase + .env), Archon will be fully operational!**
