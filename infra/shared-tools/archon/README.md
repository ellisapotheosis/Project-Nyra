# 🤖 ARCHON OS - LOCAL DEPLOYMENT

**Portable multi-agent orchestration system that can run on any of your 4 PCs**

---

## 🎯 What is Archon OS?

Archon OS is an **agent operating system** that provides:
- **Multi-agent orchestration** - Coordinate multiple AI agents
- **Task management** - Queue, prioritize, and execute tasks
- **Workflow automation** - Define multi-step agent workflows
- **Web UI** - Visual interface for managing agents
- **MCP Server** - Exposes agents as MCP tools
- **Knowledge base** - Shared memory across agents

---

## 📦 Components

This deployment includes **10 containers**:

### Supabase Stack (Local Backend)
1. **PostgreSQL** - Database (Port 5433)
2. **Kong** - API Gateway (Port 8001, 8444)
3. **GoTrue** - Authentication (Port 9999)
4. **Realtime** - Live updates (Port 4000)
5. **Storage** - File storage (Port 5001)
6. **PostgREST** - REST API (Port 3001)

### Archon OS Stack
7. **Archon Server** - Main backend (Port 8181)
8. **Archon MCP** - MCP server interface (Port 8051)
9. **Archon UI** - Web interface (Port 3737)
10. **Archon Worker** - Background job processor

---

## 🚀 QUICK START

### 1. Setup Environment
```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env and change:
# - POSTGRES_PASSWORD
# - JWT_SECRET (must be 32+ characters)
```

### 2. Start Archon OS
```powershell
# Start all containers
docker-compose up -d

# Watch logs
docker-compose logs -f

# Check health
docker-compose ps
```

### 3. Access Services
- **Archon UI**: http://localhost:3737
- **Archon Server API**: http://localhost:8181
- **Archon MCP Server**: http://localhost:8051
- **PostgreSQL**: localhost:5433

---

## 🔧 MANAGEMENT COMMANDS

### Start/Stop
```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Restart specific service
docker-compose restart archon-ui
```

### Logs
```powershell
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f archon-server

# Last 100 lines
docker-compose logs --tail=100 archon-ui
```

### Health Checks
```powershell
# Container status
docker-compose ps

# Check Archon Server health
curl http://localhost:8181/health

# Check MCP Server health
curl http://localhost:8051/health

# Check database
docker-compose exec postgres psql -U postgres -d archon_db -c "SELECT COUNT(*) FROM agents;"
```

---

## 📊 DATABASE ACCESS

### Via Docker
```powershell
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d archon_db

# List tables
\dt

# Query agents
SELECT * FROM agents;

# Exit
\q
```

### Via GUI Tool
- **Host**: localhost
- **Port**: 5433
- **Database**: archon_db
- **User**: postgres
- **Password**: (from .env)

---

## 🌐 WEB UI USAGE

### Access the UI
1. Open http://localhost:3737
2. **First time**: Sign up with any email (auto-confirmed in dev mode)
3. **Dashboard**: View agents, tasks, workflows

### Create an Agent
```javascript
// Via UI or API
{
  "name": "Research Agent",
  "description": "Gathers information from the web",
  "role": "researcher",
  "capabilities": ["web_search", "summarization"]
}
```

### Create a Task
```javascript
{
  "title": "Research Project Nyra competitors",
  "description": "Find similar mortgage automation platforms",
  "agent_id": "<agent-uuid>",
  "priority": 8
}
```

---

## 🔌 MCP SERVER INTEGRATION

### Connect to Nexus Router

Add to `/infra/configs/nexus/nexus.toml`:

```toml
[mcp.servers.archon]
url_env = "ARCHON_MCP_URL"
transport = "http"
enabled = true
health_check_endpoint = "/health"
retry_attempts = 3
timeout_seconds = 60
tags = ["orchestration", "agents", "os"]
description = "Agent operating system for task routing and execution"
```

Add to `.env`:
```bash
ARCHON_MCP_URL=http://localhost:8051
```

### Test MCP Connection
```powershell
# Check MCP tools available
curl http://localhost:8051/mcp/tools

# Test agent creation via MCP
curl -X POST http://localhost:8051/mcp/execute `
  -H "Content-Type: application/json" `
  -d '{"tool":"create_agent","params":{"name":"Test Agent"}}'
```

---

## 🔐 SECURITY NOTES

### ⚠️ Development Mode
- Auto-confirm email signups (no verification)
- Permissive CORS
- Default JWT secret (MUST change for production)
- No rate limiting

### 🔒 Production Checklist
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change `POSTGRES_PASSWORD`
- [ ] Configure SMTP for real email verification
- [ ] Enable proper CORS origins
- [ ] Add rate limiting
- [ ] Enable HTTPS with certificates
- [ ] Review RLS policies

---

## 🐛 TROUBLESHOOTING

### Issue: Containers won't start
```powershell
# Check for port conflicts
netstat -ano | findstr "3737 8181 8051 5433"

# Remove existing containers
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Issue: Database connection failed
```powershell
# Check postgres is healthy
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Wait for health check
timeout /t 30

# Test connection
docker-compose exec postgres pg_isready -U postgres
```

### Issue: UI shows "Cannot connect to server"
```powershell
# Verify archon-server is running
curl http://localhost:8181/health

# Check archon-server logs
docker-compose logs archon-server

# Restart UI
docker-compose restart archon-ui
```

### Issue: MCP server not responding
```powershell
# Check MCP health
curl http://localhost:8051/health

# View MCP logs
docker-compose logs archon-mcp

# Restart MCP
docker-compose restart archon-mcp
```

---

## 📈 MONITORING

### Prometheus Metrics
Add to your monitoring stack:
```yaml
- job_name: 'archon-server'
  static_configs:
    - targets: ['localhost:8181']
      
- job_name: 'archon-mcp'
  static_configs:
    - targets: ['localhost:8051']
```

### Health Check Endpoints
- Archon Server: `http://localhost:8181/health`
- Archon MCP: `http://localhost:8051/health`
- PostgreSQL: `pg_isready -h localhost -p 5433 -U postgres`

---

## 🗂️ DATA PERSISTENCE

### Volumes
- `archon-postgres-data` - Database data
- `archon-storage-data` - File uploads
- `archon-server-data` - Server state

### Backup
```powershell
# Backup database
docker-compose exec postgres pg_dump -U postgres archon_db > archon-backup-$(Get-Date -Format 'yyyyMMdd').sql

# Backup volumes
docker-compose down
docker run --rm -v archon-postgres-data:/data -v ${PWD}:/backup ubuntu tar czf /backup/archon-postgres-backup.tar.gz /data
```

### Restore
```powershell
# Restore database
Get-Content archon-backup-20260125.sql | docker-compose exec -T postgres psql -U postgres -d archon_db

# Restore volumes
docker run --rm -v archon-postgres-data:/data -v ${PWD}:/backup ubuntu tar xzf /backup/archon-postgres-backup.tar.gz -C /
```

---

## 🚚 PORTABILITY

### Run on Different PC
1. **Copy this folder** to target PC
2. **Install Docker Desktop** on target PC
3. **Start**: `docker-compose up -d`
4. **Access UI**: http://localhost:3737

### Database Sharing
- ⚠️ **Database is local** to each PC
- To share database across PCs:
  1. Setup PostgreSQL on orchestrator PC
  2. Update `DATABASE_URL` in all compose files to point to orchestrator
  3. Ensure Tailscale/networking configured

### Recommended Setup
- **Orchestrator PC**: Run full Archon stack with persistent DB
- **Worker PCs**: Run only `archon-ui` + `archon-mcp`, connect to orchestrator DB
- **Shared DB URL**: `postgres://postgres:password@orchestrator-tailscale-ip:5433/archon_db`

---

## 📚 RESOURCES

- **Archon OS Docs**: https://archon-os.github.io
- **Supabase Docs**: https://supabase.com/docs
- **MCP Protocol**: https://modelcontextprotocol.io

---

## 🆘 GETTING HELP

### Logs Location
```powershell
# All container logs
docker-compose logs > archon-logs.txt

# System info
docker-compose ps
docker version
docker-compose version
```

### Common Issues
1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Memory issues**: Increase Docker Desktop memory limit
3. **Slow startup**: Wait 2-3 minutes for all health checks

---

**Last Updated**: 2026-01-25  
**Version**: 1.0  
**Maintainer**: Project Nyra Team
