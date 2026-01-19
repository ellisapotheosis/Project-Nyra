# Project Nyra - Containerization Quick Reference

**Quick Link**: See full architecture at `CONTAINERIZATION-ARCHITECTURE.md`

---

## 🚀 Quick Start

### Start Orchestrator (PC1)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
docker-compose up -d
```

### Start Worker (PC2-4)
```bash
# On each worker PC
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
docker-compose -f workers/docker-compose.worker-rtx<GPU>.yml up -d
```

---

## 📊 Service Inventory

### Infrastructure Layer (nyra-core)
- **PostgreSQL** (5432) - Primary database with pgvector
- **Redis** (6379) - Cache and message broker
- **Qdrant** (6333) - Vector database
- **FalkorDB** (6380) - Graph database (Redis-compatible)
- **Neo4j** (7474, 7687) - Advanced graph database

### MCP Server Layer (nyra-mcp)
- **Nexus Router** (6000) - LLM gateway & routing
- **LiteLLM** (4000) - Model proxy
- **Letta** (8283) - Conversation memory
- **Mem0** (4321) - Universal memory
- **Claude Flow** (3010) - Multi-agent orchestrator
- **AgentDB** (8080) - HNSW vector storage
- **RuVector** (8888) - Memory optimization
- **Infisical** (8082) - Secrets management

### Application Layer (nyra-apps)
- **TwentyCRM** (3000) - CRM system
- **n8n** (5678) - Workflow automation
- **Dify** (3002) - AI chat interface
- **OpenWebUI** (8080) - LLM chat UI
- **Nyra Orchestrator** (8010) - Coordination service

### Monitoring Layer (nyra-orchestrator)
- **Prometheus** (9090) - Metrics collection
- **Grafana** (3005) - Monitoring dashboards
- **Loki** (3100) - Log aggregation
- **Alertmanager** (9093) - Alert management
- **Cloudflared** - Tunnel proxy

### Worker Layer (per PC)
- **Ollama** (11434) - Local LLM inference
- **LiteLLM Proxy** (4001) - Worker gateway
- **Model Manager** (8081) - Model lifecycle
- **Perf Monitor** (9001) - GPU metrics

---

## 🌐 Network Architecture

```
nyra-core          172.20.0.0/16  (Infrastructure)
nyra-mcp           172.21.0.0/16  (MCP Servers)
nyra-apps          172.22.0.0/16  (Applications)
nyra-orchestrator  172.23.0.0/16  (Monitoring)
nyra-worker-3060   172.24.0.0/16  (Worker 1)
nyra-worker-5090   172.25.0.0/16  (Worker 2)
nyra-worker-3090ti 172.26.0.0/16  (Worker 3)
```

---

## 🔌 Key Endpoints

### Internal Access (Docker DNS)
```bash
http://nexus-router:6000       # LLM Gateway
http://postgres:5432            # Database
http://redis:6379               # Cache
http://twenty:3000              # CRM
http://letta:8283               # Memory
http://mem0:4321                # Memory
http://prometheus:9090          # Metrics
http://grafana:3005             # Dashboards
```

### External Access (Cloudflare Tunnels)
```bash
https://nyra.ratehunter.net      # Dify Chat
https://crm.ratehunter.net       # TwentyCRM
https://n8n.ratehunter.net       # Workflows
https://grafana.ratehunter.net   # Monitoring
https://ratehunter.net           # Public Site
```

### Worker Access (LAN)
```bash
http://192.168.1.101:4001        # Worker RTX 3060
http://192.168.1.102:4001        # Worker RTX 5090
http://192.168.1.103:4001        # Worker RTX 3090Ti
```

---

## 📁 Volume Storage

| Category | Size | Services |
|----------|------|----------|
| **Databases** | ~200GB | PostgreSQL, Neo4j, FalkorDB |
| **Memory Systems** | ~50GB | Letta, Mem0, AgentDB |
| **Vectors** | ~35GB | Qdrant, AgentDB |
| **Monitoring** | ~155GB | Prometheus (30d), Loki (30d) |
| **Models (per worker)** | ~50GB | Ollama cache |
| **Other** | ~90GB | Redis, configs, logs |
| **Total Orchestrator** | ~400GB | PC1 requirements |
| **Total per Worker** | ~60GB | PC2-4 requirements |
| **Cluster Total** | ~580GB | All 4 PCs |

---

## 🔧 Common Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart nexus-router

# View logs
docker-compose logs -f nexus-router
docker-compose logs --tail=100 --since=1h

# Update services
docker-compose pull
docker-compose up -d --force-recreate
```

### Health Checks
```bash
# Check all running containers
docker ps --filter "name=nyra"

# Check specific service health
docker inspect nyra-nexus | jq '.[].State.Health'

# Test connectivity
docker exec nyra-claude-flow curl http://nexus-router:6000/health
```

### Debugging
```bash
# View container logs
docker logs nyra-nexus-router

# Enter container shell
docker exec -it nyra-nexus-router sh

# Check network connectivity
docker exec nyra-nexus-router ping postgres

# Inspect network
docker network inspect nyra-core
```

### Resource Monitoring
```bash
# Real-time resource usage
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -af
```

---

## 🛡️ Security Notes

- **Internal Networks**: Most services are internal-only (no external exposure)
- **Secrets**: Managed via Infisical (production) or .env files (development)
- **Tunnels**: External access only via Cloudflare tunnels (TLS encrypted)
- **Authentication**: All public services require authentication
- **Firewall**: LAN-only access for workers, no direct internet exposure

---

## 🔥 Emergency Procedures

### Service Not Starting
```bash
# Check logs
docker logs nyra-<service-name>

# Check port conflicts
netstat -ano | findstr :<port>

# Verify configuration
docker-compose config

# Force recreate
docker-compose up -d --force-recreate <service-name>
```

### High Resource Usage
```bash
# Check resource consumption
docker stats

# Restart problematic service
docker-compose restart <service-name>

# Review resource limits
docker inspect nyra-<service-name> | jq '.[].HostConfig.Memory'
```

### Data Recovery
```bash
# Backup volumes
docker run --rm -v nyra-postgres-data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v nyra-postgres-data:/data -v ${PWD}:/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

### Complete Reset (DESTRUCTIVE)
```bash
# Stop all services
docker-compose down

# Remove all volumes (DATA LOSS!)
docker-compose down -v

# Clean system
docker system prune -af

# Start fresh
docker-compose up -d
```

---

## 📞 Support Resources

- **Full Architecture**: `docs/architecture/CONTAINERIZATION-ARCHITECTURE.md`
- **Port Standard**: `docs/PORT-ALLOCATION-STANDARD.md`
- **Environment Template**: `.env.template`
- **4-PC Architecture**: `docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`
- **Network Diagrams**: `docs/architecture/NEXUS-ARCHITECTURE-DIAGRAMS.md`

---

## 📝 Key Design Decisions

1. **Modular Composition**: Services separated by function (core/mcp/apps/orchestrator/workers)
2. **Network Isolation**: 7 separate networks for security and traffic segmentation
3. **Service Discovery**: DNS-based discovery within Docker networks
4. **Distributed Deployment**: Orchestrator-worker topology across 4 PCs
5. **Health Monitoring**: Comprehensive health checks on all services
6. **Secrets Management**: Infisical for production, .env for development
7. **External Access**: Cloudflare tunnels only (no direct port exposure)
8. **Resource Limits**: CPU and memory constraints to prevent resource exhaustion
9. **Persistent Storage**: Named volumes for data, bind mounts for configs
10. **Restart Policies**: `unless-stopped` for critical services

---

**Last Updated**: 2026-01-18
**Maintained By**: System Architecture Designer
