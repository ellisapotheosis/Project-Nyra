# 🚀 Archon OS Setup Guide

**Status**: Ready for Deployment
**Generated**: 2026-01-18
**Estimated Time**: 15 minutes

---

## 📋 What's Already Done

✅ **Environment Variables Configured** (`infra/dual-orchestrator/archon-os/.env`)
- All 60+ variables set
- Secure passwords generated (OpenSSL)
- Integration URLs configured
- AI API keys from main config

✅ **Docker Configuration Ready**
- docker-compose.yml configured
- Dockerfile ready (multi-stage build)
- Network configuration set
- Volume mounts prepared

✅ **Configuration Files Ready**
- archon-config.yml (comprehensive config)
- Agent templates prepared
- Entrypoint scripts ready

---

## 🎯 What You Need to Do on Orchestrator PC

### Prerequisites Check

```powershell
# Verify Docker is running
docker --version
docker ps

# Verify you're in the project directory
cd C:\Dev\Projects\Repos\Project-Nyra
```

---

## 🚀 Step-by-Step Setup

### Step 1: Create Docker Network (30 seconds)

```powershell
# Create the external network that Archon OS needs
docker network create orchestrator-network

# Verify it was created
docker network ls | findstr orchestrator
```

**Expected output**: You should see `orchestrator-network` in the list.

---

### Step 2: Verify Environment File (Already Done!)

```powershell
# Check the .env file exists
ls infra\dual-orchestrator\archon-os\.env

# View the first few lines (optional)
Get-Content infra\dual-orchestrator\archon-os\.env -Head 20
```

**What's configured**:
- ✅ Archon API Key (secure, 32+ chars)
- ✅ JWT Secret (secure, 48+ chars)
- ✅ PostgreSQL password (secure)
- ✅ RabbitMQ password (secure)
- ✅ AI provider keys (from main config)
- ✅ All integration URLs

---

### Step 3: Start Archon OS Services (2 minutes)

```powershell
# Navigate to Archon OS directory
cd infra\dual-orchestrator\archon-os

# Start all services in background
docker-compose up -d

# This will start 5 containers:
# 1. archon-postgres (PostgreSQL database)
# 2. archon-redis (Redis cache)
# 3. archon-rabbitmq (Message queue)
# 4. archon-os (Main orchestrator)
# 5. archon-worker (Celery background worker)
```

**Expected output**:
```
Creating network "archon-os_default" ... done
Creating archon-postgres ... done
Creating archon-redis ... done
Creating archon-rabbitmq ... done
Creating archon-os ... done
Creating archon-worker ... done
```

---

### Step 4: Verify Services Started (1 minute)

```powershell
# Check all containers are running
docker-compose ps

# You should see 5 containers with status "Up"
# - archon-os (ports 8092, 8093)
# - archon-postgres
# - archon-redis
# - archon-rabbitmq (port 15672)
# - archon-worker
```

---

### Step 5: Wait for Services to Initialize (2 minutes)

Archon OS needs time to:
1. Wait for PostgreSQL to be ready
2. Wait for Redis to be ready
3. Wait for RabbitMQ to be ready
4. Run database migrations
5. Start the FastAPI application

```powershell
# Watch the logs to see initialization progress
docker-compose logs -f archon-os

# Look for these messages:
# - "Waiting for PostgreSQL to be ready..."
# - "PostgreSQL is ready"
# - "Running database migrations..."
# - "Migrations completed"
# - "Starting Archon OS orchestrator..."
# - "Uvicorn running on http://0.0.0.0:8092"

# Press Ctrl+C to exit log view when you see "Uvicorn running"
```

---

### Step 6: Test Archon OS is Running (1 minute)

```powershell
# Test the health endpoint
curl http://localhost:8092/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "archon-os",
#   "version": "1.0.0",
#   "uptime_seconds": ...
# }

# Test the metrics endpoint
curl http://localhost:8093/metrics

# Should return Prometheus-format metrics
```

---

### Step 7: Access RabbitMQ Management UI (Optional)

```powershell
# Open RabbitMQ management interface
start http://localhost:15672

# Login credentials:
# Username: archon
# Password: FwjUook2c00SopbpEZfAT3Bt0KgiUeW64BB8VTXBDxY=
```

**What you'll see**:
- Queue overview
- Exchange configuration
- Connection status
- Message statistics

---

### Step 8: Integrate with Nexus Router (5 minutes)

Archon OS is now running, but Nexus Router needs to know about it.

```powershell
# Navigate back to project root
cd C:\..\..\..

# Add Archon OS URLs to Nexus Router environment
# Open the file: infra\docker\.env
notepad infra\docker\.env
```

**Add these lines** (if not already present):

```bash
# Archon OS Integration
ARCHON_BASE_URL=http://archon-os:8092
ARCHON_MCP_URL=http://archon-os:8092/mcp
ARCHON_METRICS_URL=http://archon-os:8093/metrics
ARCHON_ENABLED=true
```

**Then restart Nexus Router**:

```powershell
# Restart Nexus Router to pick up new config
docker restart nyra-nexus-router

# Wait 10 seconds for restart
Start-Sleep -Seconds 10

# Verify Nexus Router can reach Archon OS
docker logs nyra-nexus-router --tail 50 | findstr archon
```

---

### Step 9: Verify Integration (2 minutes)

```powershell
# Test that Nexus Router can communicate with Archon OS
curl http://localhost:8000/mcp/tools | ConvertFrom-Json | Select-Object -ExpandProperty tools | Where-Object { $_.name -like "*archon*" }

# Should see Archon OS tools like:
# - archon_spawn_agent
# - archon_assign_task
# - archon_get_swarm_status
# - etc.
```

---

### Step 10: Open Nexus Dashboard (1 minute)

```powershell
# Start Nexus Dashboard (if not already running)
cd apps\nexus-dashboard
pnpm dev

# Or if already running, just open it
start http://localhost:3005
```

**In Nexus Dashboard**:
1. Navigate to "MCP Servers" section
2. You should see "Archon OS" listed
3. Status should show "Connected" with green indicator
4. Click on "Archon OS" to see available tools

---

## 🎉 Success! What You Can Do Now

### Available Archon OS Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **API Health** | http://localhost:8092/health | Service health check |
| **API Docs** | http://localhost:8092/docs | Interactive API documentation |
| **Metrics** | http://localhost:8093/metrics | Prometheus metrics |
| **RabbitMQ UI** | http://localhost:15672 | Queue management |
| **MCP Tools** | http://localhost:8092/mcp | MCP tool listing |

### Test Archon OS Functionality

```powershell
# Spawn an agent
curl http://localhost:8092/api/agents/spawn -Method POST -Body '{"type":"coder","name":"test-agent"}' -ContentType "application/json"

# Get agent status
curl http://localhost:8092/api/agents

# Create a task
curl http://localhost:8092/api/tasks -Method POST -Body '{"description":"Test task","agent_id":"..."}' -ContentType "application/json"

# Get swarm status
curl http://localhost:8092/api/swarm/status
```

---

## 🔧 Troubleshooting

### Issue 1: "network orchestrator-network not found"

**Solution**:
```powershell
docker network create orchestrator-network
docker-compose up -d
```

### Issue 2: Container keeps restarting

**Check logs**:
```powershell
docker-compose logs archon-os
```

**Common causes**:
- PostgreSQL not ready (wait 30 seconds)
- Environment variable missing (check .env file)
- Port already in use (check with `netstat -ano | findstr :8092`)

### Issue 3: Can't connect to RabbitMQ

**Check RabbitMQ is running**:
```powershell
docker-compose logs archon-rabbitmq
```

**Verify port is open**:
```powershell
Test-NetConnection localhost -Port 15672
```

### Issue 4: Database migrations fail

**Manually run migrations**:
```powershell
docker-compose exec archon-os alembic upgrade head
```

### Issue 5: Nexus Router can't reach Archon OS

**Check network connectivity**:
```powershell
# From Nexus Router container
docker exec nyra-nexus-router ping archon-os

# From Archon OS container
docker exec archon-os ping nexus-router
```

**Solution**: Ensure both are on `orchestrator-network`:
```powershell
docker network connect orchestrator-network nyra-nexus-router
docker network connect orchestrator-network archon-os
```

---

## 📊 Service Health Monitoring

### Check All Container Health

```powershell
# View container status
docker-compose ps

# View resource usage
docker stats --no-stream

# Check logs for errors
docker-compose logs --tail=100 | findstr -i "error\|fatal\|critical"
```

### Monitor Archon OS Metrics

```powershell
# View real-time metrics
curl http://localhost:8093/metrics

# Or use Prometheus if configured
start http://localhost:9090
```

---

## 🗄️ Database Access (Advanced)

### Connect to Archon PostgreSQL

```powershell
# Access PostgreSQL CLI
docker-compose exec archon-postgres psql -U archon -d archon_os

# View tables
\dt

# View agents table
SELECT * FROM agents;

# View tasks table
SELECT * FROM tasks;

# Exit
\q
```

### Connect to Archon Redis

```powershell
# Access Redis CLI
docker-compose exec archon-redis redis-cli

# View all keys
KEYS *

# Get a value
GET archon:agent:123

# Exit
exit
```

---

## 🛑 Stopping Archon OS

```powershell
# Stop all services (keeps data)
cd infra\dual-orchestrator\archon-os
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers AND volumes (DESTRUCTIVE)
docker-compose down -v
```

---

## 🔄 Restarting After Changes

```powershell
# After changing .env file
docker-compose down
docker-compose up -d

# After changing code/config
docker-compose down
docker-compose build
docker-compose up -d

# Quick restart (no rebuild)
docker-compose restart
```

---

## 📝 Important Notes

### Security

1. **Passwords Generated**: All passwords are cryptographically secure (OpenSSL)
2. **.env is Git-Ignored**: The .env file is NOT committed to version control
3. **Rotate Keys**: Change passwords every 90 days in production
4. **Backup .env**: Keep a secure backup of the .env file

### Resource Usage

- **CPU**: 4 cores reserved, can use more
- **RAM**: 8GB total across all services
- **Disk**: ~2GB for Docker images, ~500MB for data volumes
- **Network**: Internal Docker network (no external exposure except API ports)

### Integration Points

- **Nexus Router**: http://localhost:8000 → communicates with Archon OS
- **Claude Flow**: http://localhost:9000 → shared memory coordination
- **Nexus Dashboard**: http://localhost:3005 → UI for monitoring
- **MCP Protocol**: Standardized tool interface

### Backup Strategy

```powershell
# Backup database
docker-compose exec archon-postgres pg_dump -U archon archon_os > archon_backup_$(Get-Date -Format 'yyyyMMdd').sql

# Backup volumes
docker run --rm -v archon-os_archon-data:/data -v ${PWD}:/backup alpine tar czf /backup/archon-data-backup.tar.gz /data

# Backup .env file
Copy-Item .env .env.backup.$(Get-Date -Format 'yyyyMMdd')
```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Docker network `orchestrator-network` exists
- [ ] 5 Archon OS containers running
- [ ] Health endpoint returns HTTP 200
- [ ] Metrics endpoint returns data
- [ ] RabbitMQ UI accessible
- [ ] Nexus Router can communicate with Archon OS
- [ ] MCP tools visible in Nexus Dashboard
- [ ] No error logs in containers
- [ ] Database migrations completed
- [ ] Claude Flow integration working

---

## 🆘 Need Help?

**Logs**:
```powershell
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs archon-os
```

**Health Checks**:
```powershell
# Check all services
.\check-health.ps1

# Open health dashboard
start health-dashboard.html
```

**Documentation**:
- Full architecture: `docs/architecture/ARCHON-OS-INTEGRATION-ANALYSIS.md`
- Gaps summary: `docs/architecture/ARCHON-OS-GAPS-SUMMARY.md`
- Main startup guide: `STARTUP.md`

---

**Last Updated**: 2026-01-18
**Configuration Version**: 1.0.0
**Status**: Production Ready

🎉 **Archon OS is now fully configured and ready to deploy!**
