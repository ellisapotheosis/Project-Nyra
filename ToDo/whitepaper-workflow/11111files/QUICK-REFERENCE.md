# PROJECT NYRA - QUICK REFERENCE CARD

---

## 🚀 QUICK START COMMANDS

### Start Development Environment
```bash
# Full stack (all Docker services)
cd C:\Dev\Projects\Repos\Project-Nyra
./start-dev-environment.sh

# Or manually:
docker-compose -f infra/docker/docker-compose.yml up -d
docker-compose -f infra/docker/docker-compose.mcp.yml up -d
docker-compose -f infra/docker/docker-compose.ui.yml up -d
```

### Start Local Orchestrators (Development)
```bash
# Terminal 1 - Claude Flow
cd orchestration/claude-flow && pnpm dev

# Terminal 2 - Archon OS
cd orchestration/archon-os && npm run dev
```

### Stop Everything
```bash
docker-compose -f infra/docker/docker-compose.yml down
docker-compose -f infra/docker/docker-compose.mcp.yml down
docker-compose -f infra/docker/docker-compose.ui.yml down
```

---

## 🔍 SERVICE URLS

| Service | URL | Purpose |
|---------|-----|---------|
| **Orchestration** |
| Claude Flow | http://localhost:9000 | Workflow orchestrator |
| Archon OS | http://localhost:9001 | Agent OS |
| Nexus Router | http://localhost:8000 | LLM routing |
| **Memory Systems** |
| Letta | http://localhost:8283 | Conversation memory |
| Graphiti | http://localhost:6379 | Temporal graph |
| RuVector | http://localhost:7000 | Vector search |
| Mem0 | http://localhost:8081 | Personalization |
| OpenMemory | http://localhost:8080 | Shared knowledge |
| Qdrant | http://localhost:6333 | Vector cache |
| **MCP Tools** |
| Serena | http://localhost:8086 | Codebase analysis |
| Gemini Assistant | http://localhost:8085 | AI assistant |
| **Development UIs** |
| Open-WebUI | http://localhost:3333 | Main dev interface |
| LobeChat | http://localhost:3334 | Alt dev interface |
| **Infrastructure** |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue |
| Neo4j Browser | http://localhost:7474 | Graph DB UI |

---

## 🏥 HEALTH CHECKS

### Quick Health Check (All Services)
```bash
curl http://localhost:9000/health  # Claude Flow
curl http://localhost:9001/health  # Archon OS
curl http://localhost:8000/health  # Nexus Router
curl http://localhost:8283/health  # Letta
curl http://localhost:8085/health  # Gemini
curl http://localhost:8086/health  # Serena
```

### Comprehensive Health Script
```bash
#!/bin/bash
services=(
  "9000:Claude Flow"
  "9001:Archon OS"
  "8000:Nexus Router"
  "8283:Letta"
  "8085:Gemini"
  "8086:Serena"
  "8081:Mem0"
  "8080:OpenMemory"
  "7000:RuVector"
)

for service in "${services[@]}"; do
  IFS=':' read -r port name <<< "$service"
  if curl -s -f "http://localhost:$port/health" >/dev/null 2>&1; then
    echo "✓ $name"
  else
    echo "✗ $name (port $port)"
  fi
done
```

### Docker Container Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 📊 MONITORING

### Check Nexus Router Metrics
```bash
curl http://localhost:8000/metrics
```

**Response:**
```json
{
  "total_requests": "1234",
  "gpu_requests": "1111",
  "cloud_requests": "123",
  "failed_requests": "0",
  "gpu_percentage": 90
}
```

### Check Container Logs
```bash
# Real-time logs
docker logs -f nyra-nexus-router

# Last 100 lines
docker logs --tail 100 nyra-mcp-letta

# All containers
docker-compose -f infra/docker/docker-compose.mcp.yml logs -f
```

---

## 🔧 COMMON TASKS

### Restart a Single Service
```bash
docker restart nyra-nexus-router
docker restart nyra-mcp-letta
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose -f infra/docker/docker-compose.mcp.yml build gemini-assistant
docker-compose -f infra/docker/docker-compose.mcp.yml up -d gemini-assistant

# Rebuild all
docker-compose -f infra/docker/docker-compose.mcp.yml build
docker-compose -f infra/docker/docker-compose.mcp.yml up -d
```

### Update Environment Variables
```bash
# 1. Edit .env file
nano .env

# 2. Restart affected services
docker-compose -f infra/docker/docker-compose.yml restart
```

### Clear Redis Cache
```bash
docker exec -it nyra-redis redis-cli FLUSHALL
```

### Reset PostgreSQL Database
```bash
docker exec -it nyra-postgresql psql -U nyra -c "DROP DATABASE nyra; CREATE DATABASE nyra;"
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use
```bash
# Find what's using port 8000
lsof -i :8000
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs
docker logs nyra-nexus-router

# Remove and recreate
docker rm -f nyra-nexus-router
docker-compose -f infra/docker/docker-compose.yml up -d
```

### GPU Worker Not Responding
```bash
# Check if GPU worker is running
curl http://localhost:11434/health

# Check GPU utilization
nvidia-smi

# Restart GPU worker
# (depends on your GPU worker setup - Ollama, vLLM, etc.)
```

### Memory System Not Storing Data
```bash
# Check if service is healthy
curl http://localhost:8283/health  # Letta

# Check database connection
docker exec -it nyra-postgresql psql -U nyra -c "SELECT 1;"

# Check Redis connection
docker exec -it nyra-redis redis-cli PING
```

---

## 📝 USEFUL SNIPPETS

### Test LLM Routing
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

### Query Letta Memory
```bash
curl http://localhost:8283/memory/borrower/123
```

### Store Preference in Mem0
```bash
curl -X POST http://localhost:8081/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "borrower_id": "123",
    "preferences": {
      "communication_channel": "sms",
      "best_time": "18:00-20:00"
    }
  }'
```

### Search Similar Loans (RuVector)
```bash
curl -X POST http://localhost:7000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "VA loan $500k active duty",
    "top_k": 5
  }'
```

---

## 🔐 SECURITY CHECKLIST

### Before Going to Production

- [ ] Change default passwords in .env
- [ ] Rotate API keys every 90 days
- [ ] Enable authentication on Open-WebUI
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Set up backup automation
- [ ] Implement rate limiting
- [ ] Enable CORS restrictions
- [ ] Review and minimize permissions

---

## 📦 BACKUP & RESTORE

### Backup Everything
```bash
# Create backup directory
mkdir -p backups/$(date +%Y-%m-%d)

# Backup PostgreSQL
docker exec nyra-postgresql pg_dump -U nyra nyra > backups/$(date +%Y-%m-%d)/postgres.sql

# Backup Neo4j
docker exec nyra-neo4j neo4j-admin database dump neo4j --to-stdout > backups/$(date +%Y-%m-%d)/neo4j.dump

# Backup Redis
docker exec nyra-redis redis-cli SAVE
docker cp nyra-redis:/data/dump.rdb backups/$(date +%Y-%m-%d)/redis.rdb

# Backup .env
cp .env backups/$(date +%Y-%m-%d)/env.backup
```

### Restore from Backup
```bash
# Restore PostgreSQL
docker exec -i nyra-postgresql psql -U nyra nyra < backups/2025-01-10/postgres.sql

# Restore Neo4j
docker exec -i nyra-neo4j neo4j-admin database load neo4j --from-stdin < backups/2025-01-10/neo4j.dump

# Restore Redis
docker cp backups/2025-01-10/redis.rdb nyra-redis:/data/dump.rdb
docker restart nyra-redis
```

---

## 🎯 PERFORMANCE OPTIMIZATION

### Monitor Resource Usage
```bash
# Docker stats
docker stats

# Specific container
docker stats nyra-nexus-router

# Check memory usage
free -h  # Linux
```

### Scale Services
```bash
# Scale up (3 replicas)
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d --scale claude-flow=3

# Scale down
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d --scale claude-flow=1
```

---

## 📱 QUICK CONTACT INFO

### API Keys Sources
- **Gemini:** https://makersuite.google.com/app/apikey
- **Anthropic:** https://console.anthropic.com/
- **OpenRouter:** https://openrouter.ai/keys

### Documentation Locations
- **Architecture:** `bootstrap/nyra-complete-bootstrap/00-MASTER-ARCHITECTURE.md`
- **Setup:** `bootstrap/nyra-complete-bootstrap/01-MASTER-SETUP-PROMPT.md`
- **Quick Start:** `bootstrap/nyra-complete-bootstrap/02-ULTRA-FAST-START.md`

---

## 🏁 CHEAT SHEET

```bash
# The absolute essentials you'll use daily

# Start everything
./start-dev-environment.sh

# Check if everything is running
docker ps | grep nyra

# Quick health check
curl http://localhost:8000/health && echo "✓ System healthy"

# View logs
docker-compose -f infra/docker/docker-compose.mcp.yml logs -f

# Restart a service
docker restart nyra-[service-name]

# Stop everything
docker-compose -f infra/docker/docker-compose.yml down
```

---

**Pro Tip:** Bookmark this file for quick reference during development!

**Questions?** Check `README.md` in the same folder for detailed explanations.
