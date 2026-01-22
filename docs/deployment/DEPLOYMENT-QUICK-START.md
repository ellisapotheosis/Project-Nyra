# Project Nyra - Quick Start Guide

**Last Updated**: 2026-01-09 19:15 UTC

## 🚀 Start Everything in 3 Commands

### Prerequisites
- Docker and Docker Compose installed
- Infisical CLI installed: `npm install -g @infisical/cli`
- PowerShell (Windows) or Bash (Linux/Mac)

### Option 1: With Infisical (Recommended)

```powershell
# 1. Configure Infisical credentials (one-time setup)
cd infra/infisical
.\setup-infisical.ps1

# 2. Start all services
cd ../docker
.\start-all.ps1 -Environment dev

# 3. Verify services are running
curl http://localhost:8000/health
curl http://localhost:8000/mcp/tools/search?q=git
```

### Option 2: Without Infisical (Manual)

```bash
# 1. Create environment file
cp infra/docker/.env.example infra/docker/.env.orchestration

# 2. Edit and fill in your secrets
nano infra/docker/.env.orchestration

# 3. Start services
cd infra/docker
docker compose -f docker-compose.orchestration.yml up -d

# 4. Verify
curl http://localhost:8000/health
```

## 📊 Service Ports

After starting, services will be available on:

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Nexus Router** | 8000 | http://localhost:8000 | LLM routing + MCP proxy |
| Nexus Router MCP | 4001 | http://localhost:4001 | MCP protocol endpoint |
| Claude Flow | 9000 | http://localhost:9000 | Multi-agent orchestration |
| Archon OS | 9001 | http://localhost:9001 | Agent operating system |
| Letta | 8283, 8284 | http://localhost:8283 | Agent memory system |
| PostgreSQL | 5432 | localhost:5432 | Primary database |
| Redis | 6379 | localhost:6379 | Cache and queues |
| FalkorDB | 6380 | localhost:6380 | Knowledge graphs |
| Qdrant | 6333 | localhost:6333 | Vector database |

## 🔍 Quick Tests

### Test Nexus Router
```bash
# Health check
curl http://localhost:8000/health

# List available models
curl http://localhost:8000/v1/models

# List MCP servers
curl http://localhost:8000/mcp/servers

# Fuzzy search tools (NEW!)
curl "http://localhost:8000/mcp/tools/search?q=database&limit=5"

# List all tools
curl http://localhost:8000/mcp/tools
```

### Test LLM Completion
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-70b",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Test MCP Tool Call
```bash
curl -X POST http://localhost:8000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "git_status",
    "params": {
      "repo_path": "/workspace"
    }
  }'
```

## 🐛 Troubleshooting

### Services won't start?
```bash
# Check Docker
docker ps
docker compose -f infra/docker/docker-compose.orchestration.yml ps

# Check logs
docker compose -f infra/docker/docker-compose.orchestration.yml logs -f

# Specific service logs
docker logs nyra-nexus-router -f
docker logs nyra-postgres -f
docker logs nyra-redis -f
```

### Port conflicts?
```bash
# Check what's using a port
netstat -ano | findstr :8000

# Stop services
docker compose -f infra/docker/docker-compose.orchestration.yml down

# Restart
docker compose -f infra/docker/docker-compose.orchestration.yml up -d
```

### Nexus Router not finding tools?
```bash
# Check MCP server connectivity
curl http://localhost:9000/health
curl http://localhost:9001/health

# Restart Nexus Router to trigger tool sync
docker restart nyra-nexus-router

# Check logs
docker logs nyra-nexus-router -f
```

## 🎯 Next Steps

### Development
1. **Build RateHunter Landing**: `apps/ratehunter-landing/`
2. **Build Mortgage Assistant**: `apps/mortgage-assistant/`
3. **Set up Letta Integration**: `services/letta-integration/`
4. **Configure n8n Workflows**: `services/n8n-workflows/`

### Monitoring
```bash
# Check all service health
./scripts/health-check.sh

# Monitor resource usage
docker stats

# View all logs
docker compose -f infra/docker/docker-compose.orchestration.yml logs -f --tail=100
```

### Deployment
1. Set environment to `prod` in Infisical
2. Run: `.\start-all.ps1 -Environment prod`
3. Set up SSL/TLS with Let's Encrypt
4. Configure domain routing (ratehunter.net)

## 📚 Additional Resources

- **Full Deployment Status**: `docs/deployment/DEPLOYMENT-STATUS.md`
- **Phase 3 Guide**: `docs/guides/PHASE-3-QUICKSTART-INFISICAL.md`
- **Architecture Docs**: `docs/guides/PHASE-2-3-COMPLETION-SUMMARY.md`

## 🆘 Getting Help

### Common Issues

**Q: "No active swarm found" when spawning agents?**
A: The ruv-swarm MCP server needs to be restarted. Run:
```bash
docker restart nyra-claude-flow
```

**Q: Fuzzy search returns empty results?**
A: Tools are cached for 5 minutes. Wait for sync or restart Nexus Router:
```bash
docker restart nyra-nexus-router
```

**Q: Can't connect to local GPU workers?**
A: Check Tailscale connectivity and ensure worker URLs are correct in environment variables.

**Q: Redis connection errors?**
A: Check port 6379 isn't in use by another process. FalkorDB now uses port 6380.

## ✅ Success Criteria

You're ready when you can:
- [x] `curl http://localhost:8000/health` returns `200 OK`
- [x] `curl http://localhost:8000/mcp/servers` lists MCP servers
- [x] `curl http://localhost:8000/mcp/tools/search?q=test` returns fuzzy search results
- [x] All Docker containers show as "healthy" in `docker ps`
- [x] Claude Flow at http://localhost:9000 responds
- [x] PostgreSQL accepts connections on port 5432

---

**Happy Deploying!** 🎉

For questions or issues, see: `docs/deployment/DEPLOYMENT-STATUS.md`
