# Docker Compose Configuration Fixes - Quick Start

**Date**: 2026-01-26
**Status**: ✅ **READY TO DEPLOY**

---

## 🎯 TL;DR

**Problem**: Docker containers failing to start due to missing configs, secrets, and port conflicts.

**Solution**:

1. Run `./docs/FIX_DOCKER_COMPOSE.sh` (fixes everything automatically)
2. Add API keys to `.env` manually
3. Start services with `docker compose up -d`

---

## ⚡ Quick Fix (30 seconds)

```bash
# Step 1: Run automated fix
cd /home/ellisapotheosis/projects/project-nyra
./docs/FIX_DOCKER_COMPOSE.sh

# Step 2: Add your API keys
nano .env
# Add: ANTHROPIC_API_KEY=sk-ant-...
# Add: GOOGLE_API_KEY=...

# Step 3: Start services
cd infra/docker-compose
docker compose up -d

# Step 4: Check status
docker compose ps
```

---

## 📋 What Was Fixed

### ✅ Configuration Files Created

All missing config files for:

- **Nexus Router** (LLM gateway)
- **LiteLLM** (AI proxy)
- **Observability** (Prometheus, Grafana, Loki, Alertmanager)

**Files Created**: 9 config files in `/infra/configs/`

### ✅ Port Conflicts Resolved

**FalkorDB port changed**: 6380 → 6381 (no longer conflicts with Redis)

### ✅ Secrets Generation Script

**Script**: `/scripts/generate-secrets.sh`

- Generates 256-bit secure secrets for all services
- Automatically updates `.env` file

### ✅ Database Init Script

**Script**: `/scripts/postgres-init/01-create-databases.sh`

- Auto-creates 6 databases (letta, twenty, dify, n8n, litellm, activepieces)
- Enables pgvector extension for AI/ML

---

## 📂 Files Created

```
infra/
├── configs/
│   ├── nexus/
│   │   └── nexus.toml                     ✅ Created
│   ├── litellm/
│   │   └── config.yaml                    ✅ Created
│   └── observability/
│       ├── prometheus.yml                 ✅ Created
│       ├── prometheus-alerts.yml          ✅ Created
│       ├── alertmanager.yml               ✅ Created
│       ├── loki-config.yml                ✅ Created
│       ├── promtail-config.yml            ✅ Created
│       └── grafana-datasources.yml        ✅ Created
│
scripts/
├── generate-secrets.sh                    ✅ Created
└── postgres-init/
    └── 01-create-databases.sh             ⚠️ Needs permission fix

docs/
├── DOCKER_COMPOSE_FIXES.md                📖 Full analysis
├── DOCKER_FIX_SUMMARY.md                  📖 Quick reference
├── DOCKER_COMPOSE_ISSUES_RESOLVED.md      📖 Resolution details
└── FIX_DOCKER_COMPOSE.sh                  🔧 Automated fix script
```

---

## 🚀 Service Startup Order

```bash
# 1. Base Services (PostgreSQL, Redis)
docker compose -f docker-compose.base.yml up -d

# 2. Database Services (FalkorDB, Qdrant)
docker compose -f docker-compose.databases.yml up -d

# 3. AI Services (Nexus, LiteLLM, Letta, Mem0)
docker compose -f docker-compose.ai.yml up -d

# 4. CRM & Workflow (TwentyCRM, n8n, Dify, Activepieces)
docker compose -f docker-compose.crm.yml up -d
docker compose -f docker-compose.workflow.yml up -d

# 5. Observability (Prometheus, Grafana, Loki)
docker compose -f docker-compose.observability.yml up -d

# 6. Business Services (Quote Engine, Campaign Engine)
docker compose -f docker-compose.business.yml up -d

# OR: Start everything at once
docker compose up -d
```

---

## 🔍 Health Check Commands

```bash
# Check all services
docker compose ps

# View logs
docker compose logs -f

# Test PostgreSQL
docker compose exec postgres psql -U postgres -c '\l'

# Test Redis
docker compose exec redis redis-cli ping

# Check specific service health
docker compose logs postgres
docker compose logs redis
docker compose logs nexus
docker compose logs litellm
```

---

## 🌐 Service URLs

After starting services, access them at:

| Service        | URL                   | Default Credentials |
| -------------- | --------------------- | ------------------- |
| **Grafana**    | http://localhost:3005 | admin / [from .env] |
| **Prometheus** | http://localhost:9090 | -                   |
| **TwentyCRM**  | http://localhost:3000 | -                   |
| **n8n**        | http://localhost:5678 | admin / [from .env] |
| **Dify Web**   | http://localhost:3001 | -                   |
| **LiteLLM**    | http://localhost:4000 | -                   |
| **Letta**      | http://localhost:8283 | -                   |

---

## ⚠️ Important Notes

### Manual Step Required

**You MUST add API keys to `.env`**:

```bash
ANTHROPIC_API_KEY=sk-ant-...  # Get from https://console.anthropic.com
GOOGLE_API_KEY=...            # Get from https://aistudio.google.com/apikey
```

### Permission Issue

The postgres-init directory is owned by root. The fix script handles this with `sudo`.

If you encounter permission errors, run:

```bash
sudo chown -R ellisapotheosis:ellisapotheosis /home/ellisapotheosis/projects/project-nyra/scripts/postgres-init
```

### Port Configuration

Updated ports to avoid conflicts:

- **Redis**: 6380
- **FalkorDB**: 6381 (changed from 6380)
- **Grafana**: 3005 (changed from 3000 to avoid TwentyCRM)

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check configuration syntax
docker compose config

# View detailed logs
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]
```

### Missing Environment Variables

```bash
# Regenerate secrets
./scripts/generate-secrets.sh

# Validate .env file
grep -E "^(POSTGRES|REDIS|ANTHROPIC|GOOGLE)" .env
```

### Port Already In Use

```bash
# Check what's using the port
sudo lsof -i :6380
sudo lsof -i :5432

# Kill the process or change port in .env
```

---

## 📚 Documentation

| Document                            | Purpose                                        |
| ----------------------------------- | ---------------------------------------------- |
| `DOCKER_COMPOSE_FIXES.md`           | Full issue analysis with detailed explanations |
| `DOCKER_FIX_SUMMARY.md`             | Quick summary of changes                       |
| `DOCKER_COMPOSE_ISSUES_RESOLVED.md` | Resolution status and configuration details    |
| `README_DOCKER_FIXES.md`            | This file - Quick start guide                  |
| `FIX_DOCKER_COMPOSE.sh`             | Automated fix script                           |

---

## ✅ Validation Checklist

Before starting services, ensure:

- [ ] Fix script has been run (`./docs/FIX_DOCKER_COMPOSE.sh`)
- [ ] API keys added to `.env` (ANTHROPIC_API_KEY, GOOGLE_API_KEY)
- [ ] All secrets generated (check `.env` for populated values)
- [ ] PostgreSQL init script created and executable
- [ ] Docker Compose validates without errors (`docker compose config`)
- [ ] No port conflicts (Redis 6380, FalkorDB 6381)

---

## 🎯 Success Indicators

You know it's working when:

✅ `docker compose ps` shows all services as "healthy" or "running"
✅ No error messages in `docker compose logs`
✅ Can access Grafana at http://localhost:3005
✅ PostgreSQL has all 6 databases created (`\l` in psql)
✅ Nexus Router routes to all AI providers

---

## 🔐 Security Notes

- All secrets use 256-bit random generation
- No hardcoded credentials in compose files
- `.env` is in `.gitignore` (never committed)
- API keys are stored only in `.env`
- For production, consider using Infisical for secret management

---

**Status**: Ready to deploy!
**Estimated Setup Time**: 5-10 minutes
**Next Step**: Run `./docs/FIX_DOCKER_COMPOSE.sh`
