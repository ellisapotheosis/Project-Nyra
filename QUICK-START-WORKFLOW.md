# 🚀 Quick Start Workflow

**3-Step Process to Get Project Nyra Running**

---

## Step 1: Pre-Flight Check ✈️

**Run the verification script to ensure your system is ready:**

```powershell
.\verify-ready.ps1
```

**What it checks:**
- ✅ Docker Desktop is running
- ✅ Docker Compose is available
- ✅ All required files exist
- ✅ Ports are available (8000, 9000, 9001, 6379, 5432, 6380, 6333, 3005)
- ✅ Sufficient disk space (10GB+)
- ✅ Sufficient RAM (8GB+)
- ✅ Critical environment variables are set

**If verification fails:**
- 🔴 **Docker not running**: Start Docker Desktop and wait for whale icon to stop animating
- 🔴 **Missing files**: Make sure you're in the project root directory
- 🔴 **Ports in use**: See `DOCKER-TROUBLESHOOTING.md` for port conflict solutions
- 🔴 **Environment variables**: Check `infra/docker/.env` exists and has required values

---

## Step 2: Start Services 🚀

**Once verification passes, start all services:**

```powershell
.\start-with-redis.ps1
```

**What it does:**
1. Checks Docker is running
2. Navigates to `infra/docker`
3. Starts 8 services via Docker Compose:
   - Redis (shared cache, 3 databases)
   - PostgreSQL (database)
   - FalkorDB (graph database)
   - Qdrant (vector database)
   - Nexus Router (unified LLM API)
   - Claude Flow (multi-agent orchestration)
   - Archon OS (AI operating system)
   - Letta (agent memory)
4. Verifies Redis connection
5. Shows service status and endpoints

**Expected output:**
```
🚀 Starting Project Nyra Orchestration Stack with Redis
Creating network "docker_nyra-network" ... done
Creating nyra-redis ... done
Creating nyra-postgres ... done
Creating nyra-falkordb ... done
Creating nyra-qdrant ... done
Creating nyra-nexus-router ... done
Creating nyra-claude-flow ... done
Creating nyra-archon-os ... done
Creating nyra-letta ... done

✅ Redis connection verified!
PONG

✅ All services started!
```

**Startup time**: 30-60 seconds for all services to become healthy

---

## Step 3: Health Check 🏥

**Verify everything is working correctly:**

```powershell
.\check-health.ps1
```

**What it checks:**
1. ✅ All 8 Docker containers are running and healthy
2. ✅ Service endpoints are responding (Nexus Router, Dashboard, Claude Flow, Archon OS, Qdrant)
3. ✅ Redis connection works (all 3 databases accessible)
4. ✅ PostgreSQL is accepting connections
5. ✅ No critical errors in logs
6. 📊 Resource usage statistics

**Expected output:**
```
✅ ALL SERVICES HEALTHY!

Project Nyra is running correctly.

Access your services:
  🌐 Nexus Router:    http://localhost:8000
  🎨 Nexus Dashboard: http://localhost:3005
  🤖 Claude Flow:     http://localhost:9000
  🧠 Archon OS:       http://localhost:9001
```

**If health check fails:**
- ⚠️ **"Not responding"**: Wait 30-60 seconds more, services may still be starting
- ⚠️ **"Unhealthy"**: Check logs: `docker logs nyra-[service-name]`
- ⚠️ **"Errors in logs"**: Review specific container logs for details

---

## 🎯 Success! What's Next?

### Explore the Nexus Dashboard
Open http://localhost:3005 to access the feature-complete dashboard with:
- Provider Management (4 AI providers configured)
- Model Catalog (view available models)
- Fuzzy Tool Search (search across 15 MCP servers)
- Routing Configuration (cost/latency/quality optimization)
- MCP Server Management
- GPU Worker Management (3 workers via Tailscale)
- Rate Limiting Controls
- OAuth2 & Security Settings
- Observability Dashboard

### Test the Unified LLM API
```powershell
# List available models
curl http://localhost:8000/llm/v1/models

# Send a chat completion request
curl http://localhost:8000/llm/v1/chat/completions `
  -H "Content-Type: application/json" `
  -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"Hello!"}]}'
```

### Explore MCP Tools
```powershell
# List all available tools from 15 MCP servers
curl http://localhost:8000/mcp/tools

# Use fuzzy search to find tools
curl http://localhost:8000/mcp/search?q=file
```

### View Metrics
```powershell
# Prometheus metrics
curl http://localhost:8000/metrics

# Or open in browser for Grafana-compatible format
start http://localhost:8000/metrics
```

---

## 🛑 Stop Services

**Gracefully stop all services:**

```powershell
cd infra\docker
docker-compose -f docker-compose.orchestration.yml down
```

**Stop and remove volumes (clean slate):**

```powershell
docker-compose -f docker-compose.orchestration.yml down -v
```

---

## 🔄 Restart Services

**If you need to restart:**

```powershell
# Stop services
cd infra\docker
docker-compose -f docker-compose.orchestration.yml down

# Start again
cd C:\Dev\Projects\Repos\Project-Nyra\
.\start-with-redis.ps1
```

**Restart a single service:**

```powershell
docker-compose -f infra/docker/docker-compose.orchestration.yml restart nexus-router
```

---

## 📊 Monitoring

**View real-time logs:**

```powershell
# All services
docker-compose -f infra/docker/docker-compose.orchestration.yml logs -f

# Specific service
docker logs nyra-nexus-router -f
```

**Check resource usage:**

```powershell
docker stats
```

**View container status:**

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Docker not running** | Start Docker Desktop, wait for whale icon |
| **Port already in use** | Find and kill process: `netstat -ano \| findstr :8000` |
| **Container unhealthy** | Check logs: `docker logs [container-name]` |
| **Redis connection failed** | Verify password in `infra/docker/.env` |
| **Service not responding** | Wait 60-90 seconds, services may still be starting |
| **Out of memory** | Increase Docker Desktop memory allocation |

### Full Troubleshooting Guides

- **Docker issues**: See `DOCKER-TROUBLESHOOTING.md`
- **Redis issues**: See `services/nexus-router/REDIS-SETUP.md`
- **Complete guide**: See `START-HERE.md`

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| `START-HERE.md` | Comprehensive startup guide |
| `QUICK-START-WORKFLOW.md` | This file - 3-step process |
| `verify-ready.ps1` | Pre-start verification script |
| `check-health.ps1` | Post-start health check script |
| `start-with-redis.ps1` | Automated startup script |
| `DOCKER-TROUBLESHOOTING.md` | Docker-specific issues |
| `REDIS-SETUP-COMPLETE.md` | Redis configuration summary |
| `INFISICAL-ENV-VARIABLES.md` | All 44 environment variables |
| `infra/nexus/nexus-complete.toml` | Feature-maxed Nexus config |

---

## ✅ Quick Workflow Summary

```
1. .\verify-ready.ps1       # Verify system is ready (30 seconds)
2. .\start-with-redis.ps1   # Start all services (60 seconds)
3. .\check-health.ps1       # Verify everything works (30 seconds)
4. Open http://localhost:3005  # Access Nexus Dashboard

Total time: ~2 minutes
```

---

## 🎓 Learn More

- **Nexus Router**: Feature-maxed with unified LLM API, fuzzy tool search, 15 MCP servers
- **Redis**: Database isolation (DB 0: Nexus, DB 1: Claude Flow, DB 2: Archon OS)
- **GPU Workers**: 3 workers via Tailscale (RTX 5090, 3090, 3060)
- **Routing**: Intelligent cost-optimized routing with local-first, cloud fallback
- **MCP Servers**: 15 integrated (Filesystem, GitHub, Git, Graphiti, Qdrant, and more)
- **Security**: OAuth2, JWT, rate limiting (4 levels), CORS
- **Observability**: Prometheus, OpenTelemetry, WebSocket metrics streaming

---

**Last Updated**: 2026-01-18
**Total Services**: 8 containers + 15 MCP servers
**Configuration**: Production-ready, feature-maxed

🎉 **You're ready to build amazing AI applications!**
