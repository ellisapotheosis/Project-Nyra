# Project Nyra - Deployment Guide

**Version**: 2.0.0
**Last Updated**: 2026-01-21
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Strategies](#deployment-strategies)
4. [Service Deployment](#service-deployment)
5. [Health Verification](#health-verification)
6. [Monitoring & Observability](#monitoring--observability)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting Deployment](#troubleshooting-deployment)

---

## Deployment Overview

Project Nyra uses a distributed 4-PC architecture with orchestrated deployment across multiple services and infrastructure layers.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                      │
│  RateHunter (3100) | Nyra Admin (3101)                 │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                   │
│  Quote Engine (8001) | Campaign Engine (8002)          │
│  Nyra Orchestrator (8010) | Mem0 REST API (4321)       │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  ORCHESTRATION LAYER                    │
│  Nexus Router (6000) | LiteLLM (4000)                  │
│  Claude Flow MCP (6100) | Archon OS MCP (6200)         │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  DATA & MEMORY LAYER                    │
│  Letta (8283) | Mem0 (4321) | Neo4j (7474)            │
│  PostgreSQL | Redis | FalkorDB | AgentDB               │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  WORKFLOW & CRM LAYER                   │
│  n8n (5678) | Dify (3001) | TwentyCRM (3000)           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  OBSERVABILITY LAYER                    │
│  Prometheus (9090) | Grafana (3005) | Loki (3100)      │
└─────────────────────────────────────────────────────────┘
```

### Deployment Timeline

| Phase | Services | Duration | PCs Involved |
|-------|----------|----------|--------------|
| **Phase 1** | Infrastructure | 15 min | All |
| **Phase 2** | Orchestrator | 15 min | PC1 |
| **Phase 3** | Workers | 20 min | PC2, PC3, PC4 |
| **Phase 4** | Business Logic | 10 min | PC1 |
| **Phase 5** | Verification | 10 min | All |

**Total Deployment Time**: ~70 minutes (first time)
**Subsequent Deployments**: ~15 minutes

---

## Pre-Deployment Checklist

### Infrastructure Readiness

- [ ] All 4 PCs powered on and accessible
- [ ] Network connectivity verified between all PCs
- [ ] Static IPs assigned or Tailscale mesh connected
- [ ] Docker Desktop/Engine running on all PCs
- [ ] Git repository cloned on all PCs
- [ ] Sufficient disk space (50GB free per PC)
- [ ] GPU drivers installed (PC2, PC3, PC4)

### Configuration Readiness

- [ ] `.env` file configured on each PC
- [ ] API keys set (ANTHROPIC_API_KEY required)
- [ ] Database passwords generated
- [ ] Security secrets generated
- [ ] PC identity configured correctly (PC_NAME, PC_ROLE)
- [ ] Configuration validated (`npx @claude-flow/cli@latest config validate`)

### Service Dependencies

- [ ] PostgreSQL images pulled
- [ ] Redis images pulled
- [ ] Application images built or pulled
- [ ] Ollama models downloaded (PC3)
- [ ] Docker volumes created

### Security Checklist

- [ ] Firewall rules configured
- [ ] Strong passwords set for all databases
- [ ] JWT secrets generated
- [ ] Encryption keys generated
- [ ] Infisical configured (production only)
- [ ] SSL/TLS certificates ready (production only)

---

## Deployment Strategies

### Strategy 1: Sequential Deployment (Recommended for First-Time)

Deploy services in order, verifying each layer before proceeding.

**Advantages**:
- Easier to debug
- Clear failure points
- Better understanding of dependencies

**Steps**:
1. Deploy orchestrator (PC1)
2. Verify orchestrator health
3. Deploy worker 2 (PC2)
4. Deploy worker 3 (PC3)
5. Deploy worker 4 (PC4)
6. Verify all services
7. Deploy applications

### Strategy 2: Parallel Deployment (Faster, Experienced Users)

Deploy all services simultaneously across all PCs.

**Advantages**:
- Faster deployment (~15 minutes)
- Ideal for updates/redeployments

**Steps**:
1. Run deployment script on all PCs simultaneously
2. Monitor logs in parallel
3. Verify all services together

### Strategy 3: Blue-Green Deployment (Zero Downtime)

Maintain two identical production environments.

**Advantages**:
- Zero downtime
- Easy rollback
- Safe production updates

**Requirements**:
- 2x infrastructure (8 PCs total)
- Load balancer
- Automated deployment pipeline

### Strategy 4: Rolling Deployment (Gradual Updates)

Update services one at a time while maintaining availability.

**Advantages**:
- Minimal downtime
- Gradual risk mitigation
- Easy to pause/rollback

**Steps**:
1. Update worker 4 (monitoring)
2. Update worker 3 (GPU inference)
3. Update worker 2 (CRM/workflows)
4. Update orchestrator (last)

---

## Service Deployment

### Phase 1: Infrastructure Deployment (All PCs)

#### Step 1.1: Network Verification

```bash
# Run on each PC to verify network
./scripts/deployment/verify-network.sh

# Or manually test
ping -c 4 10.0.0.1
ping -c 4 10.0.0.2
ping -c 4 10.0.0.3
ping -c 4 10.0.0.4
```

#### Step 1.2: Pull Docker Images

```bash
# Run on each PC
cd infra/docker

# PC1 (Orchestrator)
docker compose -f docker-compose.orchestrator.yml pull

# PC2 (Worker)
docker compose -f docker-compose.worker.yml --profile worker-2 pull

# PC3 (Worker)
docker compose -f docker-compose.worker.yml --profile worker-3 pull

# PC4 (Worker)
docker compose -f docker-compose.worker.yml --profile worker-4 pull
```

#### Step 1.3: Create Docker Networks

```bash
# Run on each PC
docker network create nyra-network
docker network create monitoring-network
docker network create database-network
```

#### Step 1.4: Create Docker Volumes

```bash
# Run on each PC
docker volume create nyra-postgres-data
docker volume create nyra-redis-data
docker volume create nyra-mem0-data
docker volume create nyra-letta-data
```

---

### Phase 2: Orchestrator Deployment (PC1)

#### Step 2.1: Deploy Core Services

```bash
cd infra/docker

# Start orchestrator services
docker compose -f docker-compose.orchestrator.yml up -d \
  postgres redis nexus-router

# Wait for database initialization (30 seconds)
sleep 30

# Verify core services
docker compose -f docker-compose.orchestrator.yml ps
curl http://localhost:6000/health
```

#### Step 2.2: Deploy Memory Systems

```bash
# Start memory services
docker compose -f docker-compose.orchestrator.yml up -d \
  letta mem0 agentdb ruvector

# Wait for memory systems (30 seconds)
sleep 30

# Verify memory services
curl http://localhost:8283/health  # Letta
curl http://localhost:4321/health  # Mem0
```

#### Step 2.3: Deploy Claude Flow & Archon OS

```bash
# Initialize Claude Flow
npx @claude-flow/cli@latest init --preset orchestrator
npx @claude-flow/cli@latest daemon start

# Initialize swarm
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical-mesh \
  --max-agents 35 \
  --strategy specialized

# Verify Claude Flow
npx @claude-flow/cli@latest status
```

#### Step 2.4: Deploy Secrets Manager (Production)

```bash
# Start Infisical
docker compose -f docker-compose.orchestrator.yml up -d infisical

# Initialize Infisical
# 1. Open http://localhost:8080
# 2. Create admin account
# 3. Create project "Project Nyra"
# 4. Add secrets from .env
```

---

### Phase 3: Worker Deployment (PC2, PC3, PC4)

#### Step 3.1: Deploy Worker 2 Services (PC2)

```bash
cd infra/docker

# Start Worker 2 services
docker compose -f docker-compose.worker.yml --profile worker-2 up -d

# Wait for services (60 seconds)
sleep 60

# Verify services
curl http://localhost:3000  # TwentyCRM
curl http://localhost:5678  # n8n
curl http://localhost:3001  # Dify

# Initialize Claude Flow worker
npx @claude-flow/cli@latest init --preset worker
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest swarm join --coordinator http://10.0.0.1:7000
```

#### Step 3.2: Deploy Worker 3 Services (PC3)

```bash
cd infra/docker

# Start Worker 3 services
docker compose -f docker-compose.worker.yml --profile worker-3 up -d

# Wait for Ollama to start (30 seconds)
sleep 30

# Pull Ollama models (15-20 minutes, one-time only)
docker exec ollama ollama pull llama3.1:8b
docker exec ollama ollama pull mistral:7b
docker exec ollama ollama pull codellama:13b
docker exec ollama ollama pull deepseek-r1:latest

# Verify models
docker exec ollama ollama list

# Test inference
docker exec ollama ollama run llama3.1:8b "What is 2+2?"

# Initialize Claude Flow worker
npx @claude-flow/cli@latest init --preset worker
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest swarm join --coordinator http://10.0.0.1:7000
```

#### Step 3.3: Deploy Worker 4 Services (PC4)

```bash
cd infra/docker

# Start Worker 4 services (monitoring)
docker compose -f docker-compose.worker.yml --profile worker-4 up -d

# Wait for services (30 seconds)
sleep 30

# Verify monitoring stack
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3005/api/health  # Grafana
curl http://localhost:3100/ready  # Loki

# Configure Grafana
# 1. Open http://localhost:3005
# 2. Login (admin/admin)
# 3. Import dashboards from configs/grafana/dashboards/
```

---

### Phase 4: Business Logic Deployment (PC1)

#### Step 4.1: Deploy Quote Engine

```bash
cd services/quote-engine

# Build image
docker build -t nyra/quote-engine:latest .

# Run service
docker run -d \
  --name quote-engine \
  --network nyra-network \
  -p 8001:8001 \
  --env-file ../../.env \
  nyra/quote-engine:latest

# Verify
curl http://localhost:8001/health
curl http://localhost:8001/docs  # API documentation
```

#### Step 4.2: Deploy Campaign Engine

```bash
cd services/campaign-engine

# Build image
docker build -t nyra/campaign-engine:latest .

# Run service
docker run -d \
  --name campaign-engine \
  --network nyra-network \
  -p 8002:8002 \
  --env-file ../../.env \
  nyra/campaign-engine:latest

# Verify
curl http://localhost:8002/health
```

#### Step 4.3: Deploy Nyra Orchestrator

```bash
cd services/orchestrator

# Build image
docker build -t nyra/orchestrator:latest .

# Run service
docker run -d \
  --name nyra-orchestrator \
  --network nyra-network \
  -p 8010:8010 \
  --env-file ../../.env \
  nyra/orchestrator:latest

# Verify
curl http://localhost:8010/health
```

---

### Phase 5: Application Deployment

#### Step 5.1: Deploy RateHunter Landing Page

```bash
cd apps/landing/ratehunter-landing

# Install dependencies
pnpm install

# Build for production
pnpm build

# Deploy to Cloudflare Pages (automated via GitHub Actions)
# OR run locally
pnpm preview --port 3100

# Verify
curl http://localhost:3100
```

#### Step 5.2: Deploy Nyra Admin Dashboard

```bash
cd apps/nyra-admin

# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start --port 3101

# Verify
curl http://localhost:3101
```

---

## Health Verification

### Automated Health Check Script

```bash
#!/bin/bash
# Save as scripts/deployment/health-check-all.sh

set -e

echo "=========================================="
echo "Project Nyra - Deployment Health Check"
echo "=========================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}

    if curl -sf --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name - HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}❌ $name - UNHEALTHY${NC}"
        return 1
    fi
}

# Track failures
FAILED=0

echo ""
echo "=== PC1 - Orchestrator Services ==="
check_service "Nexus Router" "http://localhost:6000/health" || ((FAILED++))
check_service "Letta" "http://localhost:8283/health" || ((FAILED++))
check_service "Mem0" "http://localhost:4321/health" || ((FAILED++))
check_service "AgentDB" "http://localhost:8080/health" || ((FAILED++))
check_service "Quote Engine" "http://localhost:8001/health" || ((FAILED++))
check_service "Campaign Engine" "http://localhost:8002/health" || ((FAILED++))
check_service "Orchestrator" "http://localhost:8010/health" || ((FAILED++))

echo ""
echo "=== PC2 - Worker 2 Services ==="
check_service "TwentyCRM" "http://10.0.0.2:3000" || ((FAILED++))
check_service "n8n" "http://10.0.0.2:5678" || ((FAILED++))
check_service "Dify" "http://10.0.0.2:3001" || ((FAILED++))

echo ""
echo "=== PC3 - Worker 3 Services ==="
check_service "Ollama" "http://10.0.0.3:11434" || ((FAILED++))
check_service "Neo4j" "http://10.0.0.3:7474" || ((FAILED++))

echo ""
echo "=== PC4 - Worker 4 Services ==="
check_service "Prometheus" "http://10.0.0.4:9090/-/healthy" || ((FAILED++))
check_service "Grafana" "http://10.0.0.4:3005/api/health" || ((FAILED++))
check_service "Loki" "http://10.0.0.4:3100/ready" || ((FAILED++))

echo ""
echo "=== Claude Flow Status ==="
if npx @claude-flow/cli@latest status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Claude Flow - OPERATIONAL${NC}"
else
    echo -e "${RED}❌ Claude Flow - NOT OPERATIONAL${NC}"
    ((FAILED++))
fi

echo ""
echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All services healthy! ✅${NC}"
    exit 0
else
    echo -e "${RED}$FAILED service(s) unhealthy ❌${NC}"
    exit 1
fi
```

Make executable and run:
```bash
chmod +x scripts/deployment/health-check-all.sh
./scripts/deployment/health-check-all.sh
```

### Manual Health Checks

```bash
# Check all Docker containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check Claude Flow swarm status
npx @claude-flow/cli@latest swarm status

# Test end-to-end API flow
curl -X POST http://localhost:8001/quote \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 300000,
    "property_value": 400000,
    "credit_score": 740,
    "loan_type": "conventional",
    "loan_term": 30,
    "down_payment": 100000
  }'
```

---

## Monitoring & Observability

### Grafana Dashboards

**Access**: http://10.0.0.4:3005
**Default Login**: admin/admin (change on first login)

**Available Dashboards**:

1. **System Overview**
   - Import: `configs/grafana/dashboards/system-overview.json`
   - Metrics: CPU, memory, disk, network across all PCs

2. **Service Health**
   - Import: `configs/grafana/dashboards/service-health.json`
   - Metrics: Request rates, latency, errors, uptime

3. **LLM Usage**
   - Import: `configs/grafana/dashboards/llm-usage.json`
   - Metrics: Token counts, costs, model distribution, routing

4. **Business Metrics**
   - Import: `configs/grafana/dashboards/business-metrics.json`
   - Metrics: Leads, quotes, conversions, revenue

5. **GPU Monitoring**
   - Import: `configs/grafana/dashboards/gpu-monitoring.json`
   - Metrics: GPU utilization, memory, temperature, power

### Prometheus Queries

**Access**: http://10.0.0.4:9090

**Useful Queries**:

```promql
# Request rate per service
rate(http_requests_total[5m])

# Error rate (5xx errors)
rate(http_requests_total{status=~"5.."}[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Container memory usage
container_memory_usage_bytes{name=~"nyra-.*"}

# LLM token usage by model
sum(rate(llm_tokens_total[1h])) by (model)

# Claude Flow swarm agents
claude_flow_swarm_agents_active

# GPU utilization
nvidia_gpu_utilization_percent
```

### Log Aggregation with Loki

**Access**: http://10.0.0.4:3005 (Grafana → Explore → Loki)

**LogQL Queries**:

```logql
# All errors in quote-engine
{service="quote-engine"} |= "error"

# 500 errors across all services
{service=~".*engine.*"} | json | status="500"

# Search for specific lead
{service="orchestrator"} |= "lead" | json | email="test@example.com"

# High-latency requests
{service=~".*"} | json | duration > 5000
```

---

## Backup & Recovery

### Automated Backup Strategy

#### Daily Database Backups

```bash
#!/bin/bash
# Save as scripts/backup/backup-databases.sh

BACKUP_DIR="/backups/databases"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup all PostgreSQL databases
docker exec postgres-main pg_dumpall -U postgres > $BACKUP_DIR/postgres-all-$DATE.sql
docker exec letta_postgres pg_dump -U letta letta > $BACKUP_DIR/letta-$DATE.sql
docker exec twenty_postgres pg_dump -U twentycrm twentycrm > $BACKUP_DIR/twenty-$DATE.sql
docker exec n8n_postgres pg_dump -U n8n n8n > $BACKUP_DIR/n8n-$DATE.sql
docker exec dify_postgres pg_dump -U dify dify > $BACKUP_DIR/dify-$DATE.sql

# Backup Redis
docker exec redis redis-cli --rdb /data/dump.rdb
docker cp redis:/data/dump.rdb $BACKUP_DIR/redis-$DATE.rdb

# Backup Neo4j
docker exec neo4j neo4j-admin dump --to=/backups/neo4j-$DATE.dump

# Compress backups
tar czf $BACKUP_DIR/backup-$DATE.tar.gz $BACKUP_DIR/*-$DATE.*

# Delete old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup-$DATE.tar.gz"
```

#### Schedule Backups

```bash
# Add to cron (Linux/macOS)
crontab -e

# Daily at 2 AM
0 2 * * * /path/to/scripts/backup/backup-databases.sh

# Windows Task Scheduler
# Create task to run backup script daily at 2 AM
```

### Recovery Procedures

#### Database Recovery

```bash
#!/bin/bash
# Restore from backup

BACKUP_FILE=$1

# Extract backup
tar xzf $BACKUP_FILE

# Restore PostgreSQL
docker exec -i postgres-main psql -U postgres < postgres-all-*.sql
docker exec -i letta_postgres psql -U letta letta < letta-*.sql
docker exec -i twenty_postgres psql -U twentycrm twentycrm < twenty-*.sql
docker exec -i n8n_postgres psql -U n8n n8n < n8n-*.sql
docker exec -i dify_postgres psql -U dify dify < dify-*.sql

# Restore Redis
docker cp redis-*.rdb redis:/data/dump.rdb
docker exec redis redis-cli shutdown save

# Restart services
docker compose restart
```

#### Configuration Recovery

```bash
# Backup configurations
tar czf config-backup-$(date +%Y%m%d).tar.gz \
  .env \
  configs/ \
  claude-flow.config.json \
  infra/docker/*.yml

# Restore configurations
tar xzf config-backup-20260121.tar.gz
```

#### Disaster Recovery Plan

1. **Minor Issues** (service crash)
   - Restart affected service: `docker compose restart [service]`
   - Check logs: `docker logs [container]`
   - Verify health: `curl http://localhost:[port]/health`

2. **Major Issues** (PC failure)
   - Redirect traffic to backup PC
   - Restore from latest backup
   - Verify all services healthy
   - Resume normal operations

3. **Complete Failure** (all PCs down)
   - Restore infrastructure from cloud backups
   - Deploy from latest known-good configuration
   - Restore databases from backups
   - Verify data integrity
   - Gradually restore services

---

## Troubleshooting Deployment

### Common Deployment Issues

#### Issue: Docker container won't start

**Symptoms**:
- Container status: `Exited (1)`
- Service unavailable

**Diagnosis**:
```bash
# Check logs
docker logs [container-name] --tail=100

# Check container details
docker inspect [container-name]

# Check port conflicts
lsof -i :[port]
netstat -an | grep [port]
```

**Solutions**:
```bash
# Remove and recreate container
docker rm -f [container-name]
docker compose up -d [service-name]

# Check disk space
df -h

# Check memory
free -h  # Linux
vm_stat  # macOS
```

#### Issue: Network connectivity between services

**Symptoms**:
- Services can't communicate
- DNS resolution failures
- Connection timeouts

**Diagnosis**:
```bash
# Check networks
docker network ls
docker network inspect nyra-network

# Test connectivity
docker exec [container] ping [other-container]
docker exec [container] nslookup [service-name]
```

**Solutions**:
```bash
# Recreate network
docker network rm nyra-network
docker network create nyra-network

# Reconnect containers
docker network connect nyra-network [container]
```

#### Issue: Database connection failures

**Symptoms**:
- `Connection refused`
- `Authentication failed`
- Timeout errors

**Diagnosis**:
```bash
# Check database is running
docker ps | grep postgres

# Check database logs
docker logs postgres-main

# Test connection
docker exec postgres-main pg_isready -U postgres
```

**Solutions**:
```bash
# Verify credentials
cat .env | grep POSTGRES_PASSWORD

# Restart database
docker compose restart postgres-main

# Reset database (CAUTION: destroys data)
docker compose down postgres-main
docker volume rm nyra-postgres-data
docker compose up -d postgres-main
```

#### Issue: GPU not detected by Ollama

**Symptoms**:
- Slow inference
- `nvidia-smi` not found in container

**Diagnosis**:
```bash
# Check host GPU
nvidia-smi

# Check container GPU access
docker exec ollama nvidia-smi
```

**Solutions**:
```bash
# Verify NVIDIA Container Toolkit
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

# Add GPU to container (if not configured)
docker run --gpus all ...

# Restart Docker daemon (Linux)
sudo systemctl restart docker
```

### Rollback Procedures

#### Quick Rollback (Last Working Version)

```bash
# Stop current deployment
docker compose down

# Restore previous configuration
cp .env.backup .env
cp claude-flow.config.json.backup claude-flow.config.json

# Restore previous images
docker tag nyra/quote-engine:previous nyra/quote-engine:latest
docker tag nyra/campaign-engine:previous nyra/campaign-engine:latest

# Redeploy
docker compose up -d

# Verify health
./scripts/deployment/health-check-all.sh
```

#### Full Rollback (Specific Version)

```bash
# Checkout previous version
git checkout v1.0.0

# Restore configuration
git restore .env.example
cp .env.example .env
# Edit .env with production values

# Rebuild and deploy
docker compose build
docker compose up -d

# Verify health
./scripts/deployment/health-check-all.sh
```

---

## Production Best Practices

### Pre-Deployment Testing

1. **Staging Environment**
   - Test on staging before production
   - Use production-like data
   - Run full integration tests

2. **Load Testing**
   ```bash
   # Test Quote Engine
   ab -n 1000 -c 10 http://localhost:8001/health

   # Test LLM Gateway
   wrk -t 4 -c 100 -d 30s http://localhost:6000/health
   ```

3. **Security Scanning**
   ```bash
   # Scan Docker images
   docker scan nyra/quote-engine:latest

   # Scan for vulnerabilities
   npm audit
   pnpm audit
   ```

### Deployment Checklist

- [ ] All tests passing
- [ ] Configuration reviewed
- [ ] Secrets rotated
- [ ] Backup completed
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Rollback plan ready
- [ ] Documentation updated
- [ ] Team notified
- [ ] Health checks passing

### Post-Deployment Monitoring

**First Hour**:
- Monitor error rates every 5 minutes
- Watch resource usage (CPU, memory, GPU)
- Check service health endpoints
- Review logs for errors

**First Day**:
- Monitor business metrics
- Check for anomalies
- Verify backup completion
- Review alert thresholds

**First Week**:
- Analyze performance trends
- Optimize based on real usage
- Gather user feedback
- Plan next improvements

---

## Related Documentation

- [Setup Guide](SETUP-GUIDE.md)
- [Configuration Guide](CONFIGURATION.md)
- [API Reference](API-REFERENCE.md)

---

**Deployment Guide Version**: 2.0.0
**Last Updated**: 2026-01-21
**Maintainer**: Project Nyra Team
