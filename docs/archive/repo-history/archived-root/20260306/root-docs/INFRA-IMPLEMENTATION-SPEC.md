# Project Nyra - Infrastructure Implementation Specification

> **INFRA ARCHITECT Implementation Guide**
> Creating the ONE CANONICAL Docker Compose Stack

**Document Version**: 1.0
**Phase**: 1 - Consolidation
**Timeline**: 1 week
**Status**: READY FOR IMPLEMENTATION

---

## EXECUTIVE SUMMARY

This document provides the **exact implementation steps** to create the consolidated `docker-compose.yml` that will serve as the single canonical infrastructure definition for Project Nyra.

**Key Deliverables**:
1. New consolidated `docker-compose.yml` (v2.0)
2. Unified `.env` files for all machine types
3. Complete override files for worker machines
4. Comprehensive environment variable documentation
5. Validation and testing procedures

---

## PHASE 1: CONSOLIDATION (Week 1)

### Step 1.1: Backup Current Configuration

```bash
# Create backup directory
mkdir -p /infra-backup-$(date +%Y%m%d-%H%M%S)
cd /infra

# Backup current compose file
cp docker-compose.yml ../infra-backup-$(date +%Y%m%d-%H%M%S)/

# Backup all configs
cp -r configs ../infra-backup-$(date +%Y%m%d-%H%M%S)/

# Backup environment files
cp env/.env* ../infra-backup-$(date +%Y%m%d-%H%M%S)/

# Backup docker volumes (if space available)
docker volume ls -q | xargs -I{} docker run --rm -v {}:/vol \
  -v $(pwd)/../infra-backup-$(date +%Y%m%d-%H%M%S)/volumes:/backup \
  busybox tar czf /backup/{}.tar.gz /vol
```

**Validation**:
```bash
ls -lah ../infra-backup-*/
# Should show docker-compose.yml, configs/, env/, volumes/
```

---

### Step 1.2: Create Consolidated docker-compose.yml (v2.0)

**File Location**: `/infra/docker-compose.yml`

**Content Structure**:
```yaml
version: '3.8'

name: nyra

# ============================================================================
# GLOBAL DEFAULTS & ANCHORS
# ============================================================================

x-logging: &default_logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# ============================================================================
# NETWORKS
# ============================================================================

networks:
  nyra:
    name: nyra
    driver: bridge
    ipam:
      config:
        - subnet: ${DOCKER_SUBNET:-172.20.0.0/16}

# ============================================================================
# VOLUMES (ALL SERVICES)
# ============================================================================

volumes:
  postgres_data: {}
  redis_data: {}
  mongo_data: {}
  grafana_data: {}
  prometheus_data: {}
  loki_data: {}
  n8n_data: {}
  activepieces_data: {}
  ruvector_data: {}
  zep_data: {}          # NEW: Added for Zep episodic memory
  falkordb_data: {}     # NEW: Added for graph database

# ============================================================================
# SERVICES (ORGANIZED BY PROFILE)
# ============================================================================

services:

  # ---------------------------------------------------------------------------
  # CORE SERVICES (profile: core)
  # Purpose: Minimum viable infrastructure - data layer only
  # Startup time: ~60s
  # ---------------------------------------------------------------------------

  postgres:
    image: postgres:16-alpine
    container_name: nyra-postgres
    profiles: ["core"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    profiles: ["core"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  mongo:
    image: mongo:7
    container_name: nyra-mongo
    profiles: ["core"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  # ---------------------------------------------------------------------------
  # SECRETS MANAGEMENT (profile: secrets)
  # Purpose: Add secret management capability
  # Requires: core
  # ---------------------------------------------------------------------------

  infisical:
    image: infisical/infisical:latest
    container_name: nyra-infisical
    profiles: ["secrets"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  # ---------------------------------------------------------------------------
  # WORKFLOW AUTOMATION (profile: workflow)
  # Purpose: Add workflow and automation capability
  # Requires: core
  # ---------------------------------------------------------------------------

  n8n:
    image: n8nio/n8n:latest
    container_name: nyra-n8n
    profiles: ["workflow"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  activepieces:
    image: activepieces/activepieces:latest
    container_name: nyra-activepieces
    profiles: ["workflow"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  # ---------------------------------------------------------------------------
  # OBSERVABILITY STACK (profile: observability)
  # Purpose: Add monitoring and logging capability
  # Requires: core
  # ---------------------------------------------------------------------------

  prometheus:
    image: prom/prometheus:latest
    container_name: nyra-prometheus
    profiles: ["observability"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  loki:
    image: grafana/loki:latest
    container_name: nyra-loki
    profiles: ["observability"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  grafana:
    image: grafana/grafana:latest
    container_name: nyra-grafana
    profiles: ["observability"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: nyra-cadvisor
    profiles: ["observability"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  # ---------------------------------------------------------------------------
  # EDGE & REMOTE ACCESS (profile: edge)
  # Purpose: Add remote access capability
  # Requires: none
  # ---------------------------------------------------------------------------

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: nyra-cloudflared
    profiles: ["edge"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  # ---------------------------------------------------------------------------
  # VECTOR SEARCH & MEMORY (profile: vector)
  # Purpose: Add vector database and episodic memory
  # Requires: none (optional)
  # NEW SERVICES ADDED
  # ---------------------------------------------------------------------------

  ruvector-postgres:
    image: ruvnet/ruvector-postgres:latest
    container_name: ruvector-postgres
    profiles: ["vector"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  ruvector-pgadmin:
    image: dpage/pgadmin4:latest
    container_name: ruvector-pgadmin
    profiles: ["vector", "gui"]
    # ... [KEEP EXISTING CONFIG - no changes needed]

  # === NEW SERVICE 1: Zep (Episodic Memory) ===
  zep:
    image: ghcr.io/getzep/zep:latest
    container_name: nyra-zep
    profiles: ["vector"]
    depends_on:
      postgres:
        condition: service_healthy
      falkordb:
        condition: service_healthy
    environment:
      ZEP_SERVER_PORT: "8000"
      ZEP_POSTGRES_HOST: "postgres"
      ZEP_POSTGRES_PORT: "5432"
      ZEP_POSTGRES_DB: ${POSTGRES_DB:-nyra}
      ZEP_POSTGRES_USER: ${POSTGRES_USER:-nyra}
      ZEP_POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      ZEP_GRAPH_DATABASE: "falkordb"
      ZEP_GRAPH_DATABASE_HOST: "falkordb"
      ZEP_GRAPH_DATABASE_PORT: "6379"
      ZEP_LOG_LEVEL: "info"
    ports:
      - "${ZEP_PORT:-8000}:8000"
    volumes:
      - zep_data:/var/lib/zep
    networks: [nyra]
    restart: unless-stopped
    logging: *default_logging
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 10s
      timeout: 5s
      retries: 20

  # === NEW SERVICE 2: FalkorDB (Graph Database) ===
  falkordb:
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb
    profiles: ["vector"]
    environment:
      # FalkorDB default settings
      FALKORDB_TIMEOUT: "0"
      FALKORDB_NOTIFY_KEYSPACE_EVENTS: "Ex"
    ports:
      - "${FALKORDB_PORT:-6381}:6379"
    volumes:
      - falkordb_data:/data
    networks: [nyra]
    restart: unless-stopped
    logging: *default_logging
    healthcheck:
      test: ["CMD", "redis-cli", "PING"]
      interval: 10s
      timeout: 5s
      retries: 20

  # === NEW SERVICE 3: Letta (Agent Memory) ===
  letta:
    image: letta/letta:latest
    container_name: nyra-letta
    profiles: ["vector", "workflow"]
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      # Letta Server Configuration
      LETTA_PORT: "8090"
      LETTA_POSTGRES_HOST: "postgres"
      LETTA_POSTGRES_PORT: "5432"
      LETTA_POSTGRES_DB: ${POSTGRES_DB:-nyra}
      LETTA_POSTGRES_USER: ${POSTGRES_USER:-nyra}
      LETTA_POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

      # Redis configuration
      LETTA_REDIS_HOST: "redis"
      LETTA_REDIS_PORT: "6379"
      LETTA_REDIS_PASSWORD: ${REDIS_PASSWORD}

      # LLM Configuration
      LETTA_OPENAI_API_KEY: ${OPENAI_API_KEY:-}
      LETTA_ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}

      # Server settings
      LETTA_DEBUG: "false"
      LETTA_LOG_LEVEL: "info"
    ports:
      - "${LETTA_PORT:-8090}:8090"
    networks: [nyra]
    restart: unless-stopped
    logging: *default_logging
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8090/health"]
      interval: 10s
      timeout: 5s
      retries: 20

  # ---------------------------------------------------------------------------
  # ADMIN INTERFACES (profile: gui)
  # Purpose: Optional web-based administration tools
  # Note: ruvector-pgadmin already included in vector profile
  # ---------------------------------------------------------------------------
  # (No additional services - pgadmin already included in vector profile)
```

**Key Changes**:
1. ✅ All existing services preserved (postgres, redis, mongo, infisical, n8n, activepieces, prometheus, loki, grafana, cadvisor, cloudflared, ruvector-postgres, ruvector-pgadmin)
2. ✅ THREE new services added:
   - **Zep**: Episodic memory with graph support
   - **FalkorDB**: Graph database for relationships
   - **Letta**: Agent memory management
3. ✅ New volumes added for Zep and FalkorDB
4. ✅ Proper profile assignments for all services
5. ✅ Health checks added for new services
6. ✅ Dependencies correctly specified

---

### Step 1.3: Create Comprehensive .env Template

**File Location**: `/infra/env/.env.example`

**Content**:
```bash
# ============================================================================
# PROJECT NYRA - DOCKER COMPOSE ENVIRONMENT VARIABLES
# ============================================================================
# Copy to .env.orchestrator or .env.worker-* before deploying
# All variables marked with ? are REQUIRED
# All other variables have defaults and are OPTIONAL
# ============================================================================

# ---------------------------------------------------------------------------
# CORE DATABASE CONFIGURATION
# ---------------------------------------------------------------------------

# PostgreSQL - Main transactional database
POSTGRES_DB=nyra                           # Database name
POSTGRES_USER=nyra                         # Database user
POSTGRES_PASSWORD=?changeme123456789       # REQUIRED: Change this!
POSTGRES_PORT=5432                         # External port
POSTGRES_MAX_CONNECTIONS=200               # Max connections

# Redis - Cache and session store
REDIS_PASSWORD=?changeme123456789          # REQUIRED: Change this!
REDIS_PORT=6379                            # External port
REDIS_MAX_MEMORY=2gb                       # Memory limit (dev: 1gb, prod: 4gb)

# MongoDB - Document storage for Infisical
MONGO_ROOT_USER=admin                      # Root username
MONGO_ROOT_PASSWORD=?changeme123456789     # REQUIRED: Change this!
MONGO_PORT=27017                           # External port

# ---------------------------------------------------------------------------
# SECRETS MANAGEMENT (Infisical)
# ---------------------------------------------------------------------------

INFISICAL_PORT=8080                        # External port
INFISICAL_ENV=development                  # development or production
INFISICAL_SITE_URL=http://localhost:8080   # Public-facing URL
INFISICAL_ENCRYPTION_KEY=?generate-secret-key-32-chars    # REQUIRED
INFISICAL_JWT_SECRET=?generate-jwt-secret-64-chars        # REQUIRED

# ---------------------------------------------------------------------------
# WORKFLOW AUTOMATION
# ---------------------------------------------------------------------------

# n8n - Workflow orchestration
N8N_HOST=localhost                         # Bind address
N8N_PROTOCOL=http                          # http or https
N8N_PORT=5678                              # External port
WEBHOOK_URL=http://localhost:5678/         # Webhook base URL
N8N_ENCRYPTION_KEY=?generate-encryption-key-32-chars      # REQUIRED
N8N_WORKERS=4                              # Number of worker threads

# Activepieces - Integration platform
ACTIVEPIECES_PORT=8082                     # External port
ACTIVEPIECES_JWT_SECRET=?generate-jwt-secret-64-chars     # REQUIRED
ACTIVEPIECES_ENCRYPTION_KEY=?generate-encryption-key      # REQUIRED

# ---------------------------------------------------------------------------
# OBSERVABILITY (Prometheus / Grafana / Loki)
# ---------------------------------------------------------------------------

PROMETHEUS_PORT=9090                       # External port
GRAFANA_PORT=3003                          # External port (internal 3000)
GRAFANA_ADMIN_PASSWORD=?changeme123456     # REQUIRED: Change this!
LOKI_PORT=3100                             # External port
CADVISOR_PORT=8081                         # External port

# ---------------------------------------------------------------------------
# VECTOR DATABASE & MEMORY
# ---------------------------------------------------------------------------

# RuVector - Vector similarity search
RUVECTOR_POSTGRES_USER=claude              # Database user
RUVECTOR_POSTGRES_PASSWORD=?changeme123456 # REQUIRED: Change this!
RUVECTOR_POSTGRES_DB=claude_flow           # Database name
RUVECTOR_POSTGRES_PORT=5436                # External port

# RuVector PgAdmin - Database administration
RUVECTOR_PGADMIN_EMAIL=admin@claude-flow.local  # Admin email
RUVECTOR_PGADMIN_PASSWORD=?changeme123         # Admin password
RUVECTOR_PGADMIN_PORT=5050                     # External port

# Zep - Episodic memory service
ZEP_PORT=8000                              # External port
ZEP_LOG_LEVEL=info                         # Log level: debug, info, warn, error

# FalkorDB - Graph database
FALKORDB_PORT=6381                         # External port (internal 6379)

# Letta - Agent memory management
LETTA_PORT=8090                            # External port
LETTA_DEBUG=false                          # Debug mode
LETTA_LOG_LEVEL=info                       # Log level

# ---------------------------------------------------------------------------
# EDGE & REMOTE ACCESS
# ---------------------------------------------------------------------------

# Cloudflare Tunnel tokens (machine-specific)
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=?your-tunnel-token-here
CLOUDFLARE_TUNNEL_TOKEN_WORKER_3060=?your-tunnel-token-here
CLOUDFLARE_TUNNEL_TOKEN_WORKER_3090=?your-tunnel-token-here
CLOUDFLARE_TUNNEL_TOKEN_WORKER_5090=?your-tunnel-token-here

# ---------------------------------------------------------------------------
# LLM PROVIDER CREDENTIALS (For Letta & Services)
# ---------------------------------------------------------------------------

# Anthropic Claude
ANTHROPIC_API_KEY=?sk-ant-...your-key-here

# OpenAI
OPENAI_API_KEY=?sk-...your-key-here

# OpenRouter
OPENROUTER_API_KEY=?your-key-here

# Google Gemini
GOOGLE_API_KEY=?your-key-here

# ---------------------------------------------------------------------------
# INFRASTRUCTURE CONFIGURATION
# ---------------------------------------------------------------------------

# Docker network subnet
DOCKER_SUBNET=172.20.0.0/16               # Docker bridge subnet

# Timezone for all services
TIMEZONE=America/New_York                 # Services timezone

# Machine configuration (for worker machines)
MACHINE_NAME=orchestrator                 # Machine identifier
MACHINE_ROLE=coordinator                  # coordinator, compute
MACHINE_GPU=none                          # none, rtx3060, rtx3090ti, rtx5090
MACHINE_VRAM=0                            # GPU VRAM in GB (0 if no GPU)

# ---------------------------------------------------------------------------
# FEATURE FLAGS
# ---------------------------------------------------------------------------

ENABLE_WORKFLOWS=true                     # Enable n8n + Activepieces
ENABLE_OBSERVABILITY=true                 # Enable monitoring stack
ENABLE_VECTOR_DB=true                     # Enable vector search
ENABLE_MEMORY_SYSTEMS=true                # Enable Zep + Letta
ENABLE_EDGE_ACCESS=true                   # Enable Cloudflare Tunnel

# ---------------------------------------------------------------------------
# ADVANCED CONFIGURATION
# ---------------------------------------------------------------------------

# Observability sampling
PROMETHEUS_SCRAPE_INTERVAL=15s
PROMETHEUS_EVALUATION_INTERVAL=15s
PROMETHEUS_RETENTION_DAYS=15

# Loki retention
LOKI_RETENTION_DAYS=30

# Database pool settings
POSTGRES_POOL_SIZE=20
POSTGRES_POOL_MAX=40
REDIS_DB=0                                # Redis database number (0-15)
```

**Validation**:
```bash
# Check syntax
grep "^[^#]*=" /infra/env/.env.example | wc -l
# Should show 60+ variables

# Check for REQUIRED markers
grep "?" /infra/env/.env.example | wc -l
# Should show 15+ required variables
```

---

### Step 1.4: Create Machine-Specific .env Files

#### .env.orchestrator
```bash
# Copy from .env.example and customize
cp /infra/env/.env.example /infra/env/.env.orchestrator

# Edit and fill in required values:
cat /infra/env/.env.orchestrator

# Key changes for orchestrator:
MACHINE_NAME=orchestrator-mini
MACHINE_ROLE=coordinator
POSTGRES_MAX_CONNECTIONS=200
REDIS_MAX_MEMORY=4gb
N8N_WORKERS=4
# ... fill in all REQUIRED passwords and tokens
```

#### .env.worker-rtx3060, .env.worker-rtx3090ti, .env.worker-rtx5090
```bash
# These already exist - update with new variables:

# For worker-rtx3060
MACHINE_NAME=worker-rtx3060
MACHINE_ROLE=compute
MACHINE_GPU=rtx3060
MACHINE_VRAM=12
POSTGRES_MAX_CONNECTIONS=50
REDIS_MAX_MEMORY=1gb

# For worker-rtx3090ti
MACHINE_NAME=worker-rtx3090ti
MACHINE_ROLE=compute
MACHINE_GPU=rtx3090ti
MACHINE_VRAM=24
POSTGRES_MAX_CONNECTIONS=75
REDIS_MAX_MEMORY=2gb

# For worker-rtx5090
MACHINE_NAME=worker-rtx5090
MACHINE_ROLE=compute
MACHINE_GPU=rtx5090
MACHINE_VRAM=48
POSTGRES_MAX_CONNECTIONS=100
REDIS_MAX_MEMORY=3gb
```

---

### Step 1.5: Update Docker Compose Override Files

#### Create docker-compose.orchestrator.override.yml

```yaml
version: '3.8'

# Orchestrator-specific overrides
# Use: docker-compose -f docker-compose.yml -f docker-compose.orchestrator.override.yml up

services:
  postgres:
    # Increase connection limits for orchestrator
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=4GB"

  redis:
    environment:
      REDIS_MAX_MEMORY: "4gb"

  grafana:
    # Ensure it starts on main port
    ports:
      - "3003:3000"

  # Add resource limits for orchestrator
  prometheus:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  loki:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

#### Update docker-compose.worker-rtx5090.override.yml

```yaml
version: '3.8'

# RTX 5090 worker-specific overrides
services:
  # Workers don't run full observability stack
  postgres:
    # Reduced connection limits for worker
    command:
      - "postgres"
      - "-c"
      - "max_connections=100"

  redis:
    environment:
      REDIS_MAX_MEMORY: "3gb"

  # Add GPU configuration for Ollama (when implemented)
  # ollama-service:
  #   deploy:
  #     resources:
  #       reservations:
  #         devices:
  #           - driver: nvidia
  #             count: 1
  #             capabilities: [gpu]
```

---

### Step 1.6: Add Validation Script

**File Location**: `/infra/validate-compose.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Validating Docker Compose Configuration..."

# 1. Check compose file syntax
echo "   ✓ Checking compose file syntax..."
docker compose config --quiet

# 2. Validate all required environment variables
echo "   ✓ Checking required environment variables..."
REQUIRED_VARS=(
  "POSTGRES_PASSWORD"
  "REDIS_PASSWORD"
  "MONGO_ROOT_PASSWORD"
  "INFISICAL_ENCRYPTION_KEY"
  "INFISICAL_JWT_SECRET"
  "N8N_ENCRYPTION_KEY"
  "ACTIVEPIECES_JWT_SECRET"
  "ACTIVEPIECES_ENCRYPTION_KEY"
  "GRAFANA_ADMIN_PASSWORD"
  "RUVECTOR_POSTGRES_PASSWORD"
)

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "     ❌ Missing required: $var"
    ((MISSING++))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo "   ❌ $MISSING required variables missing!"
  exit 1
fi

# 3. Check for port conflicts
echo "   ✓ Checking port assignments..."
PORTS=(3003 5050 5432 5436 5678 6379 8080 8081 8082 9090 27017 3100 6381 8000 8090)
for port in "${PORTS[@]}"; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "     ⚠ Warning: Port $port already in use"
  fi
done

# 4. Verify all services have health checks (where appropriate)
echo "   ✓ Checking health check configurations..."
SERVICES_WITH_HEALTHCHECK=$(grep -c "healthcheck:" docker-compose.yml || true)
echo "     Found $SERVICES_WITH_HEALTHCHECK services with health checks"

# 5. Verify all volumes are defined
echo "   ✓ Checking volume definitions..."
DOCKER_VOLUMES=$(grep "volumes:" docker-compose.yml -A 20 | grep ":" | wc -l)
echo "     Found $DOCKER_VOLUMES volumes defined"

# 6. Test dry-run
echo "   ✓ Testing dry-run..."
docker compose up --dry-run > /dev/null 2>&1

echo "✅ All validations passed!"
```

**Usage**:
```bash
chmod +x /infra/validate-compose.sh
/infra/validate-compose.sh
```

---

### Step 1.7: Testing Strategy

#### Test 1: Compose File Validation
```bash
docker compose config --quiet
echo "✓ Compose file is valid"
```

#### Test 2: Individual Profile Tests
```bash
# Test core profile
docker compose --profile core up -d
docker compose exec postgres pg_isready
docker compose exec redis redis-cli ping
sleep 10
docker compose down

# Test workflow profile
docker compose --profile core --profile workflow up -d
sleep 30
curl http://localhost:5678/  # n8n
curl http://localhost:8082/  # activepieces
docker compose down

# Test vector profile
docker compose --profile vector up -d
sleep 30
docker compose exec ruvector-postgres pg_isready
curl http://localhost:8000/healthz  # Zep
curl http://localhost:8090/health  # Letta
docker compose down

# Test observability profile
docker compose --profile core --profile observability up -d
sleep 30
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3003/api/health # Grafana
docker compose down
```

#### Test 3: Full Stack Test
```bash
# Start full stack
docker compose \
  --profile core \
  --profile secrets \
  --profile workflow \
  --profile observability \
  --profile vector \
  --profile edge \
  up -d

# Wait for startup
sleep 60

# Health check all services
docker compose ps --filter "status=running"

# Check logs for errors
docker compose logs --tail 20 | grep -i error

# Verify network connectivity
docker compose exec n8n curl http://postgres:5432
docker compose exec zep curl http://falkordb:6379

# Stop stack
docker compose down
```

---

## VALIDATION CHECKLIST

Before proceeding to deployment:

### Code Review
- [ ] All existing services preserved with no modifications
- [ ] New services (Zep, FalkorDB, Letta) properly formatted
- [ ] All environment variables have defaults or are marked REQUIRED
- [ ] All dependencies correctly specified
- [ ] All health checks are present and functional
- [ ] No syntax errors in docker-compose.yml

### Configuration Review
- [ ] .env.example has all variables documented
- [ ] .env.orchestrator filled with production-ready values
- [ ] .env.worker-* files properly configured
- [ ] All REQUIRED variables explained
- [ ] All sensitive values properly secured

### Documentation Review
- [ ] Service descriptions complete
- [ ] Port mappings documented
- [ ] Profile combinations explained
- [ ] Troubleshooting guide included
- [ ] Backup procedures documented

### Testing Review
- [ ] Validation script passes
- [ ] All profile combinations tested
- [ ] Service-to-service communication verified
- [ ] Health checks working
- [ ] No port conflicts
- [ ] Data persistence verified

---

## ROLLBACK PROCEDURE

If consolidation fails at any point:

```bash
# 1. Stop current compose
docker compose --profile '*' down -v

# 2. Restore from backup
BACKUP_DATE=$(ls -t ../infra-backup-* | head -1)
cp -r $BACKUP_DATE/docker-compose.yml /infra/
cp -r $BACKUP_DATE/configs /infra/
cp -r $BACKUP_DATE/env /infra/

# 3. Restore volumes
cd ../infra-backup-*/volumes
for vol in *.tar.gz; do
  docker volume create ${vol%.tar.gz}
  docker run --rm -v ${vol%.tar.gz}:/vol \
    -v $(pwd):/backup \
    busybox tar xzf /backup/$vol -C /vol
done

# 4. Restart old stack
cd /infra
docker compose up -d
```

---

## NEXT STEPS (After Phase 1)

1. **Phase 2**: Create deployment automation scripts
2. **Phase 3**: Migrate production environment
3. **Phase 4**: Archive old configurations
4. **Phase 5**: Update all deployment documentation
5. **Phase 6**: Train team on new consolidated stack

---

**Status**: ✅ READY FOR IMPLEMENTATION

**Estimated Effort**: 4-6 hours for experienced Docker administrator

**Risk Level**: LOW (with proper backups and rollback procedure)

**Approval Gate**: Run validation script and confirm all tests pass before deploying to production.

---

*Implementation Guide by Agent 1: INFRA ARCHITECT*
*For questions, see INFRA-CONSOLIDATION-PLAN.md*
