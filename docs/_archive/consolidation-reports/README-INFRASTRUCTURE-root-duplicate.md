# Project-Nyra Infrastructure Documentation

This directory contains comprehensive infrastructure documentation for Project-Nyra's multi-service architecture.

## 📚 Documentation Structure

### 1. **INFRASTRUCTURE-HEALTH-SUMMARY.md** (START HERE)
Quick executive summary with:
- Health scorecard (75% ready)
- Critical blockers (4 items)
- High priority issues (8 items)
- What's working well
- Quick action items (this week)

**Best for**: Quick assessment, executive briefings, status updates

### 2. **INFRASTRUCTURE-ANALYSIS.md** (DETAILED REFERENCE)
Comprehensive technical analysis with:
- 12 major sections covering all infrastructure components
- Docker configuration details
- Database architecture (PostgreSQL, Redis, FalkorDB, Qdrant)
- Observability setup (Prometheus, Loki, Grafana, Alertmanager)
- Environment configuration with 570-line master config
- Service dependencies and port mapping
- Data persistence strategy
- Security assessment
- Deployment commands and examples
- Quick start checklist

**Best for**: Implementation, troubleshooting, architecture decisions

### 3. **DEPLOYMENT-READINESS-CHECKLIST.md** (ACTION PLAN)
Phase-based deployment plan with:
- 12 pre-deployment fixes with priority levels
- Phase 1-4 timeline and tasks
- Success criteria for each phase
- Pre-launch validation checklist
- Estimated timeline (3-4 weeks)
- Quick fix script
- Support escalation procedures
- Progress tracking dashboard

**Best for**: Implementation planning, team coordination, progress tracking

---

## 🎯 Key Findings Summary

### Overall Status: 75% Ready for Deployment

**What's Working**:
- ✓ Docker architecture properly structured
- ✓ Service configuration complete (13+ services)
- ✓ Database design comprehensive
- ✓ Excellent documentation
- ✓ Security framework defined
- ✓ Network setup designed

**Critical Issues (Must Fix)**:
1. Prometheus scrape config is EMPTY (no metrics collection)
2. Production secrets exposed in .env.master
3. Missing production .env file
4. Database migrations not run
5. Alerting rules not configured
6. Backup strategy missing
7. LiteLLM using SQLite instead of PostgreSQL
8. Health checks not validated

### Recommended Reading Order

**For Deployment**:
1. Start with INFRASTRUCTURE-HEALTH-SUMMARY.md (15 min read)
2. Review critical fixes in DEPLOYMENT-READINESS-CHECKLIST.md (30 min read)
3. Deep dive into INFRASTRUCTURE-ANALYSIS.md sections as needed

**For Operations**:
1. Read INFRASTRUCTURE-HEALTH-SUMMARY.md for context
2. Review "Service Dependencies & Port Mapping" in INFRASTRUCTURE-ANALYSIS.md
3. Keep DEPLOYMENT-READINESS-CHECKLIST.md handy for troubleshooting

**For Architecture Decisions**:
1. Review full INFRASTRUCTURE-ANALYSIS.md
2. Check section 2 (Database Architecture)
3. Review section 3 (Observability Configuration)
4. Check security assessment in section 8

---

## 🚀 Quick Start (After Fixes)

```bash
# 1. Fix Prometheus (30 min)
# See: DEPLOYMENT-READINESS-CHECKLIST.md - Critical Issue #1

# 2. Create .env (45 min)
cp infra/.env.example .env
# Edit .env with actual values

# 3. Run migrations (15 min)
npm run db:generate
npm run db:migrate

# 4. Start services (5 min)
docker-compose -f infra/docker-compose.dev-minimal.yml up -d

# 5. Verify startup (10 min)
docker-compose ps
curl http://localhost:3000    # Grafana
curl http://localhost:4000    # LiteLLM
curl http://localhost:9090    # Prometheus
```

---

## 📊 Infrastructure Components

### Memory Systems (Multi-Tier)
- **RuVector**: Distributed vector search (3 GPU workers)
- **Letta**: Agent memory (OS-like for AI agents)
- **Graphiti/FalkorDB**: Temporal knowledge graphs
- **Mem0**: User personalization layer
- **OpenMemory**: Cross-app MCP integration

### AI Platforms
- **Nexus**: API gateway (port 7000)
- **LiteLLM**: Model proxy (port 4000)
- **Dify**: No-code AI platform (port 3001)
- **n8n**: Workflow automation (port 5678)
- **Activepieces**: MIT-licensed workflows

### Databases
- **PostgreSQL**: Primary RDBMS (port 5432)
- **Redis**: Caching + sessions (port 6379)
- **FalkorDB**: Graph database (port 6379 Redis-compatible)
- **Qdrant**: Vector database (port 6333)

### Observability
- **Prometheus**: Metrics collection (port 9090) - NEEDS FIX
- **Loki**: Log aggregation (port 3100)
- **Grafana**: Visualization (port 3000)
- **Alertmanager**: Alert routing (port 9093)
- **Node Exporter**: System metrics (port 9100)
- **cAdvisor**: Container metrics (port 8080)

### MCP Servers
- **Filesystem**: File operations (port 8111)
- **GitHub**: Repository management (port 8112)
- **DockerHub**: Image management (port 8113)
- **Mem0**: User memory (port 8081)

---

## 🔧 Common Tasks

### Start Services
```bash
# Full development stack
docker-compose -f infra/docker-compose.dev.yml up -d

# Minimal stack (recommended for start)
docker-compose -f infra/docker-compose.dev-minimal.yml up -d

# With observability
docker-compose -f infra/docker-compose.dev.yml \
                -f infra/docker-compose.observability.yml up -d
```

### Check Service Health
```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs -f litellm
docker-compose logs -f postgres
docker-compose logs -f grafana

# Health endpoints
curl http://localhost:4000/health          # LiteLLM
curl http://localhost:3000/api/health      # Grafana
curl http://localhost:9090/-/healthy       # Prometheus
curl http://localhost:5678/healthz         # n8n
```

### Database Management
```bash
# Initialize databases
npm run db:generate
npm run db:migrate

# Interactive database tool
npm run db:studio

# Backup PostgreSQL
docker exec $(docker ps -q -f name=postgres) \
  pg_dump -U nyra nyra_production > backup.sql

# Access PostgreSQL directly
docker exec -it nyra-postgres psql -U nyra -d nyra_production
```

### Troubleshooting
```bash
# View all logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart postgres

# Stop and remove everything
docker-compose down -v

# Check container resource usage
docker stats

# Inspect container network
docker network ls
docker network inspect [network_name]
```

---

## 📋 Document Map

```
docs/
├── README-INFRASTRUCTURE.md (THIS FILE)
├── INFRASTRUCTURE-ANALYSIS.md (Detailed technical analysis)
├── INFRASTRUCTURE-HEALTH-SUMMARY.md (Quick status check)
├── DEPLOYMENT-READINESS-CHECKLIST.md (Implementation plan)
├── ARCHITECTURE.md (System architecture)
├── CLAUDE_FLOW_PLAYBOOK.md (Claude-Flow operations)
└── runbooks/ (Operational procedures)
    ├── postgres-recovery.md
    ├── redis-failover.md
    ├── service-restart.md
    └── backup-restore.md
```

---

## 🔐 Security Considerations

### ⚠️ IMMEDIATE ACTION REQUIRED
The `.env.master` file contains real API keys and must be:
1. Removed from git history: `git filter-branch --tree-filter 'rm -f .env.master'`
2. All exposed keys rotated immediately
3. Replaced with Infisical/Vault integration

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- For production: use Infisical or similar vault
- For development: create local `.env` from example

### API Key Rotation
Update these keys in production:
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY`
- `GITHUB_TOKEN`
- `LITELLM_MASTER_KEY`
- `TWILIO_ACCOUNT_SID`
- `SENDGRID_API_KEY`
- All database passwords

---

## 📈 Performance & Capacity

### Current Capacity
- Services: 13+ containerized + MCP servers
- Concurrent Users: 100+ (with load balancing)
- Database Connections: 20 (configurable)
- Storage: Scalable (current: ~500MB PostgreSQL)

### Resource Allocation
- CPU: ~4-6 cores at full load (headroom: 35-50%)
- Memory: ~16-20GB at full load (headroom: 30-50%)
- Disk: ~100-150GB at full load (headroom: 70-80%)
- Network: ~100-200 Mbps at full load (headroom: 80-90%)

### SLO Targets (After Fixes)
- Availability: 99.9% (> 43 min uptime/month)
- Error Rate: < 0.1% (1 error per 1000 requests)
- P99 Latency: < 500ms
- Recovery Time: < 30 minutes

---

## 🚨 Emergency Procedures

### Service Down
1. Check logs: `docker-compose logs [service]`
2. Check port conflicts: `lsof -i :[port]`
3. Restart: `docker-compose restart [service]`
4. If problem persists: full reset with `docker-compose down && docker-compose up -d`

### Database Connection Error
1. Verify PostgreSQL running: `docker-compose ps postgres`
2. Check connection string in `.env`
3. Verify database exists: `npm run db:studio`
4. Run migrations if needed: `npm run db:migrate`

### Out of Disk Space
1. Stop services: `docker-compose down`
2. Clean up volumes: `docker system prune -a`
3. Check backups removed
4. Restart: `docker-compose up -d`

### Memory Pressure
1. Check resource usage: `docker stats`
2. Reduce logging level: `LOG_LEVEL=warn`
3. Lower cache sizes in `.env`
4. Scale down to minimal compose file

---

## 📞 Support & Escalation

**For Deployment Questions**:
- See DEPLOYMENT-READINESS-CHECKLIST.md

**For Technical Details**:
- See INFRASTRUCTURE-ANALYSIS.md sections 1-8

**For Architecture Questions**:
- See ARCHITECTURE.md

**For Operational Issues**:
- See docs/runbooks/ directory

**For Urgent Issues**:
- Check logs: `docker-compose logs -f`
- Escalate to Infrastructure Team
- Reference document sections in escalation

---

## ✅ Pre-Launch Checklist

Before deploying to production:
- [ ] Read INFRASTRUCTURE-HEALTH-SUMMARY.md
- [ ] Complete all "Critical Blockers" in DEPLOYMENT-READINESS-CHECKLIST.md
- [ ] Complete all "High Priority" fixes
- [ ] Run through "Pre-Launch Validation Checklist"
- [ ] Test all services starting
- [ ] Verify health check endpoints
- [ ] Confirm monitoring/alerting working
- [ ] Document your environment setup
- [ ] Assign on-call rotation
- [ ] Train team on operations

---

## 📝 Documentation Standards

When updating infrastructure:
1. Update relevant section in INFRASTRUCTURE-ANALYSIS.md
2. Update Health Scorecard in INFRASTRUCTURE-HEALTH-SUMMARY.md
3. Add deployment steps to DEPLOYMENT-READINESS-CHECKLIST.md
4. Create runbook in docs/runbooks/ if needed
5. Update this README with navigation

---

## 🔄 Review Schedule

- **Weekly**: Review INFRASTRUCTURE-HEALTH-SUMMARY.md
- **Monthly**: Update INFRASTRUCTURE-ANALYSIS.md with current status
- **Before Major Changes**: Review DEPLOYMENT-READINESS-CHECKLIST.md
- **After Incidents**: Update relevant runbook

---

**Last Updated**: January 7, 2026
**Infrastructure Readiness**: 75%
**Next Review**: After Phase 1 completion
**Questions?** See the detailed documents above or escalate to Infrastructure Team
