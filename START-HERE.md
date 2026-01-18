# 🚀 Project Nyra - Start Here

**Status**: ✅ All configuration complete. Ready to start services.

## Prerequisites Checklist

Before starting services, verify:

- [ ] **Docker Desktop is running** (whale icon in system tray, not animated)
- [ ] **Docker responds** to commands: `docker ps`
- [ ] **Ports available**: 8000, 9000, 9001, 6379, 5432, 6380
- [ ] **Disk space**: 10GB+ free
- [ ] **RAM**: 8GB+ available

---

## 🎯 Quick Start (5 Minutes)

### Option 1: Automated Start Script (Recommended)

```powershell
# Navigate to project root
cd C:\Dev\Projects\Repos\Project-Nyra\

# Run the automated start script
.\start-with-redis.ps1
```

This script will:
1. ✅ Check Docker is running
2. ✅ Start all services (Redis, PostgreSQL, FalkorDB, Qdrant, Nexus Router, Claude Flow, Archon OS, Letta)
3. ✅ Verify Redis connection
4. ✅ Show service status and endpoints
5. ✅ Provide helpful next steps

### Option 2: Manual Start

```powershell
# Navigate to infra/docker
cd infra\docker

# Start all services
docker-compose -f docker-compose.orchestration.yml up -d

# Check status
docker-compose -f docker-compose.orchestration.yml ps
```

---

## 🌐 Service Endpoints (After Startup)

Once services are running, access them at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Nexus Router** | http://localhost:8000 | Unified LLM API & MCP aggregation |
| **Nexus Dashboard** | http://localhost:3005 | Nexus Router web interface |
| **Claude Flow** | http://localhost:9000 | Multi-agent orchestration |
| **Archon OS** | http://localhost:9001 | AI operating system |
| **Redis** | localhost:6379 | Shared cache (3 databases) |
| **PostgreSQL** | localhost:5432 | Database |
| **FalkorDB** | localhost:6380 | Graph database |
| **Qdrant** | http://localhost:6333 | Vector database |
| **Letta** | http://localhost:8283 | Agent memory |

---

## 🔍 Verify Everything Works

```powershell
# 1. Check all containers are running
docker ps

# Should show 8+ containers:
# - nyra-redis
# - nyra-postgres
# - nyra-falkordb
# - nyra-qdrant
# - nyra-nexus-router
# - nyra-claude-flow
# - nyra-archon-os
# - nyra-letta

# 2. Test Redis connection
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping
# Expected: PONG

# 3. Test Nexus Router
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# 4. Check logs if issues
docker logs nyra-nexus-router
docker logs nyra-redis
```

---

## 🎨 Nexus Dashboard

The Nexus Dashboard is already complete with 12 features:

1. ✅ Provider Management (Add/Edit/Remove AI providers)
2. ✅ Model Catalog (View and manage available models)
3. ✅ Fuzzy Search Term Editor (Configure search thresholds)
4. ✅ Routing Configuration (Cost/latency/quality optimization)
5. ✅ MCP Server Management (15+ MCP servers)
6. ✅ Tool Discovery & Search (Fuzzy search across tools)
7. ✅ GPU Worker Management (3 GPU workers via Tailscale)
8. ✅ Rate Limiting Controls (4 levels: global, per-IP, per-server, per-tool)
9. ✅ OAuth2 & Security (JWT/JWKS configuration)
10. ✅ Request/Response Headers (Custom header management)
11. ✅ Configuration Management (Import/export TOML configs)
12. ✅ Observability Dashboard (Prometheus, OpenTelemetry, WebSocket metrics)

**Built with**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4 (OKLCH colors, dark mode)
- Shadcn/ui components
- React Hook Form + Zod validation
- TanStack Query for API state
- Recharts for visualizations

---

## 📦 What's Configured

### Redis (Database Isolation)
- **DB 0**: Nexus Router (cache, metrics, rate limits)
- **DB 1**: Claude Flow (sessions, memory, patterns)
- **DB 2**: Archon OS (task coordination)
- **Password**: `cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s`
- **Max Memory**: 4GB with LRU eviction

### Nexus Router Features
✅ **Unified LLM API** (OpenAI-compatible endpoint at `/llm/v1`)
✅ **4 AI Providers**: Anthropic, OpenAI, Google Gemini, OpenRouter
✅ **Fuzzy Tool Search** (built-in, threshold 0.6)
✅ **15 MCP Servers**: Filesystem, Desktop Commander, GitHub, Git, Graphiti, Qdrant, Context7, Exa, Supabase, TwentyCRM, Dify, Serena, Gemini Assistant, Composio, VS Code
✅ **3 GPU Workers** (Tailscale): RTX 5090 (48GB), RTX 3090 (24GB), RTX 3060 (12GB)
✅ **Intelligent Routing**: Cost-optimized, local-first with cloud fallback
✅ **Redis Caching**: 1-hour TTL, request deduplication
✅ **Multi-Level Rate Limiting**: Global, per-IP, per-server, per-tool
✅ **OAuth2 Security**: JWT/JWKS authentication
✅ **Full Observability**: Prometheus metrics, OpenTelemetry tracing, WebSocket streaming
✅ **CORS**: Configured for localhost:3005 and production domains
✅ **Health Checks**: MCP servers, LLM providers, Redis

### Environment Variables
All 44 environment variables are configured in:
- `infra/docker/.env` (for Docker Compose)
- Root `.env` (for local development)

See `INFISICAL-ENV-VARIABLES.md` for Infisical setup.

---

## 🐛 If Something Goes Wrong

### Issue: Docker Desktop Not Running
**Symptoms**: `failed to connect to the docker API`

**Solution**:
1. Find Docker Desktop in Windows Start Menu
2. Launch Docker Desktop
3. Wait 30-60 seconds for whale icon to stop animating
4. Run `docker ps` to verify
5. Try start script again

**Full guide**: See `DOCKER-TROUBLESHOOTING.md`

### Issue: Port Already in Use
**Symptoms**: `bind: address already in use`

**Solution**:
```powershell
# Find what's using the port (example: port 8000)
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Container Unhealthy
**Symptoms**: Container shows as "unhealthy" in `docker ps`

**Solution**:
```powershell
# Check logs
docker logs nyra-nexus-router

# Restart specific service
docker-compose -f infra/docker/docker-compose.orchestration.yml restart nexus-router
```

### Issue: Redis Connection Failed
**Symptoms**: Services can't connect to Redis

**Solution**:
```powershell
# Verify Redis is running
docker ps | findstr redis

# Test Redis directly
docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping

# Check Redis logs
docker logs nyra-redis
```

---

## 📚 Documentation Index

- **Redis Setup**: `services/nexus-router/REDIS-SETUP.md` (comprehensive)
- **Redis Quick Setup**: `services/nexus-router/QUICK-REDIS-SETUP.md` (5 minutes)
- **Nexus Config**: `infra/nexus/nexus-complete.toml` (feature-maxed TOML)
- **Docker Troubleshooting**: `DOCKER-TROUBLESHOOTING.md` (Windows-specific)
- **Infisical Setup**: `INFISICAL-ENV-VARIABLES.md` (44 variables)
- **Quick Infisical Copy-Paste**: `INFISICAL-QUICK-SETUP.txt` (plain text)
- **Complete Redis Setup**: `REDIS-SETUP-COMPLETE.md` (summary)

---

## 🎯 Next Steps (After Services Start)

1. **Access Nexus Dashboard**: http://localhost:3005
2. **Test Unified LLM API**:
   ```bash
   curl http://localhost:8000/llm/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"Hello!"}]}'
   ```
3. **Explore MCP Tools**:
   ```bash
   curl http://localhost:8000/mcp/tools
   ```
4. **View Metrics**: http://localhost:8000/metrics (Prometheus format)
5. **WebSocket Metrics**: ws://localhost:8000/ws/metrics

---

## 🚀 Advanced: Infisical Integration (Optional)

If you want to use Infisical for secret management:

```bash
# Login to Infisical
infisical login

# Pull secrets and start services
infisical run --env production --path /shared -- \
  docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
```

See `INFISICAL-ENV-VARIABLES.md` for the complete 44-variable setup guide.

---

## 🎓 Learning Resources

- **Nexus Router Docs**: https://grafbase.com/docs
- **Docker Desktop**: https://docs.docker.com/desktop/windows/
- **Redis**: https://redis.io/documentation
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Tailscale**: https://tailscale.com/kb/ (for GPU workers)

---

## ✅ Success Checklist

After startup, you should have:

- [ ] 8+ Docker containers running (`docker ps`)
- [ ] Nexus Router responding at http://localhost:8000
- [ ] Nexus Dashboard accessible at http://localhost:3005
- [ ] Redis returning PONG (`docker exec nyra-redis redis-cli -a [password] ping`)
- [ ] PostgreSQL accessible on port 5432
- [ ] All services showing "healthy" status

---

## 🆘 Need Help?

1. **Check logs**: `docker logs [container-name]`
2. **Review documentation**: See links above
3. **Docker issues**: See `DOCKER-TROUBLESHOOTING.md`
4. **Redis issues**: See `services/nexus-router/REDIS-SETUP.md`

---

**Last Updated**: 2026-01-18
**Configuration Version**: v1.0.0 (Production-ready)
**Total Services**: 8 containers + 15 MCP servers
**Total Features**: 12 dashboard features + unified LLM API + intelligent routing

**TL;DR**:
1. Start Docker Desktop
2. Run `.\start-with-redis.ps1`
3. Access http://localhost:3005
4. Enjoy your feature-maxed Nexus Router! 🎉
