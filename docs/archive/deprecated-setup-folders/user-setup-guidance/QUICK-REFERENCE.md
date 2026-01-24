# Quick Reference Card - Post-Consolidation Setup

**For**: Project Nyra Manual Setup Tasks
**See Full Guide**: [POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md)

---

## 🚀 Quick Start (30 minutes)

### 1. Install Required Tools (5 min)

```bash
# Infisical CLI
npm install -g @infisical/cli

# Bitwarden CLI (optional)
npm install -g @bitwarden/cli
```

### 2. Authentication (10 min)

```bash
# Infisical
infisical login --interactive
cd C:\Dev\Projects\Repos\Project-Nyra
infisical init

# Docker Hub
docker login
```

### 3. Environment Setup (10 min)

```bash
# Copy template
cp .env.example .env

# Generate secrets (save these!)
for i in {1..16}; do openssl rand -hex 32; done

# Edit .env with your secrets
nano .env  # or use your preferred editor
```

### 4. Start Services (5 min)

```bash
# Start all services
docker-compose -f docker-compose.infisical.yml up -d

# Check health
./scripts/health-check.sh
```

---

## 🔑 Required API Keys

| Service | Get From | Required? |
|---------|----------|-----------|
| Anthropic | https://console.anthropic.com/settings/keys | ✅ Yes |
| Google AI | https://aistudio.google.com/apikey | ⚠️ Optional |
| Infisical | https://app.infisical.com | ✅ Yes |
| Cloudflare | https://dash.cloudflare.com | ⚠️ Optional |

---

## 🗄️ Database Quick Commands

### PostgreSQL
```bash
# Connect
docker exec -it nyra-postgres psql -U postgres

# Create databases
CREATE DATABASE dify;
CREATE DATABASE twenty;
CREATE DATABASE letta;
CREATE DATABASE n8n;
CREATE DATABASE nyra;

# Exit
\q
```

### Redis
```bash
# Test connection
docker exec -it nyra-redis redis-cli -a "$REDIS_PASSWORD" PING
```

### Health Checks
```bash
# All services
docker-compose -f docker-compose.infisical.yml ps

# Specific service
docker-compose -f docker-compose.infisical.yml ps postgres
```

---

## ✅ Verification Commands

```bash
# 1. Check all containers
docker ps

# 2. Run health checks
./scripts/health-check.sh

# 3. Test API
curl http://localhost:8001/health  # Quote Engine
curl http://localhost:7000/health  # Nexus Router

# 4. Validate environment
./scripts/validate-env.sh

# 5. Integration test
npm run test:integration
```

---

## 🚨 Emergency Commands

### Restart Everything
```bash
docker-compose -f docker-compose.infisical.yml restart
```

### Stop Everything
```bash
docker-compose -f docker-compose.infisical.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.infisical.yml logs -f

# Specific service
docker logs -f nyra-postgres
```

### Reset (⚠️ Destructive)
```bash
# BACKUP FIRST!
./scripts/backup-all.sh

# Complete reset
docker-compose -f docker-compose.infisical.yml down -v
docker volume prune -f
```

---

## 🔧 Common Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Container won't start | `docker logs <container-name>` |
| Port already in use | `netstat -ano \| findstr :5432` (Windows) |
| Authentication failed | `infisical logout && infisical login --interactive` |
| Database connection refused | `docker-compose -f docker-compose.infisical.yml restart postgres` |
| Out of disk space | `docker system prune -a` |

---

## 📝 Essential Environment Variables

```bash
# REQUIRED (no defaults)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
POSTGRES_PASSWORD=<generated-secret>
REDIS_PASSWORD=<generated-secret>
NEXUS_JWT_SECRET=<generated-secret>
NEXUS_ADMIN_TOKEN=<generated-secret>

# Infisical (production)
INFISICAL_TOKEN=st.prod.xxxxx
INFISICAL_PROJECT_ID=65f4e2b8xxxxx

# PC Role
NYRA_PC_ID=orchestrator  # or worker-1, worker-2, worker-3
NYRA_ENVIRONMENT=development  # or staging, production
```

---

## 🎯 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Quote Engine | 8001 | http://localhost:8001 |
| Campaign Engine | 8002 | http://localhost:8002 |
| Nexus Router | 7000 | http://localhost:7000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6380 | localhost:6380 |
| FalkorDB | 6379 | localhost:6379 |
| ChromaDB | 8001 | http://localhost:8001 |
| Infisical MCP | 8006 | http://localhost:8006 |
| Claude Flow MCP | 8003 | http://localhost:8003 |
| MetaMCP Gateway | 8005 | http://localhost:8005 |

---

## 📚 Important File Locations

```
Project-Nyra/
├── .env                          ← Your secrets (DO NOT COMMIT)
├── .env.example                  ← Template
├── docker-compose.infisical.yml  ← Main orchestration
├── scripts/
│   ├── health-check.sh          ← Verify all services
│   ├── validate-env.sh          ← Check .env file
│   └── backup-all.sh            ← Create backups
├── docs/
│   └── user-setup-guidance/
│       └── POST-CONSOLIDATION-GUIDE.md  ← Full guide
└── config/
    ├── cloudflared/             ← Tunnel configs
    └── mcp/                     ← MCP server configs
```

---

## 🆘 Get Help

**Full Documentation**: [POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md)

**GitHub Issues**: https://github.com/mhenry3164/Project-Nyra/issues

**Before Asking**:
1. Run health check: `./scripts/health-check.sh`
2. Check logs: `docker-compose logs -f`
3. Search existing issues

---

## ✅ Setup Completion Checklist

Quick checklist - see full guide for details:

- [ ] Infisical authenticated
- [ ] .env file created with all secrets
- [ ] Anthropic API key configured
- [ ] Docker containers running
- [ ] Health checks passing
- [ ] Databases initialized
- [ ] API endpoints responding
- [ ] Backup created

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Complete

---

**Version**: 1.0.0
**Last Updated**: 2026-01-16
**Print this page for quick reference during setup!**
