# Open-WebUI Deployment Plan for Project Nyra

**Status**: ✅ Infrastructure Ready - Deployment Pending
**Version**: 1.0.0
**Created**: 2026-01-13
**Last Updated**: 2026-01-13
**Owner**: Project Nyra Infrastructure Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Quick-Start Deployment](#quick-start-deployment)
4. [Architecture Overview](#architecture-overview)
5. [Port Allocation](#port-allocation)
6. [Configuration Details](#configuration-details)
7. [Deployment Procedures](#deployment-procedures)
8. [Testing & Validation](#testing--validation)
9. [4-PC Integration](#4-pc-integration)
10. [Monitoring & Observability](#monitoring--observability)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Future Enhancements](#future-enhancements)
13. [Security Considerations](#security-considerations)
14. [Appendix](#appendix)

---

## Executive Summary

### Overview

Open-WebUI is **already configured** in Project Nyra's infrastructure with complete Docker Compose setup, Infisical secret management, and Nexus Router integration. The service is ready for immediate deployment on PC1 (Orchestrator).

### Key Findings

✅ **Ready for Deployment:**
- Docker Compose configuration exists at `infra/docker/docker-compose.ui.yml`
- PowerShell startup script with Infisical integration at `infra/docker/start-ui.ps1`
- Nexus Router integration configured (port 8000)
- Health checks implemented
- Volume management configured

📋 **Planning Phase:**
- Comprehensive Nexus Router plugin design exists at `docs/integrations/OPEN-WEBUI-INTEGRATION.md`
- Plugin development is future work (12-week roadmap)
- GPU monitoring, MCP management, cost tracking features planned

⚠️ **Deployment Blockers:**
- Need to verify Nexus Router is running and healthy
- Need to validate PostgreSQL database connection
- Need to test Infisical secret injection
- Need to confirm port 3333 is available

### Quick Deployment Summary

```powershell
# Navigate to infra directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Start Open-WebUI with Infisical secrets
.\start-ui.ps1

# Access Open-WebUI
# http://localhost:3333
```

---

## Current State Analysis

### Existing Infrastructure

#### 1. Docker Compose Configuration

**File**: `infra/docker/docker-compose.ui.yml` (90 lines)

**Services Configured:**
- **open-webui**: Primary development interface
  - Image: `ghcr.io/open-webui/open-webui:main`
  - Container: `nyra-open-webui`
  - Port: 3333 → 8080 (internal)
  - Network: `nyra-network` (external)
  - Volume: `open_webui_data`
  - Health check: `/health` endpoint every 30s

- **lobechat**: Alternative interface (optional)
  - Image: `lobehub/lobe-chat:latest`
  - Container: `nyra-lobechat`
  - Port: 3334 → 3210 (internal)
  - Network: `nyra-network`
  - Volume: `lobechat_data`
  - Health check: `/api/health` endpoint every 30s

**Key Configuration:**
```yaml
environment:
  # OpenAI-compatible endpoint → Nexus Router
  OPENAI_API_BASE_URL: http://nexus-router:${NEXUS_ROUTER_PORT}/v1
  OPENAI_API_KEY: ${ANTHROPIC_API_KEY}

  # Database connection
  DATABASE_URL: ${DATABASE_URL}

  # Authentication
  WEBUI_SECRET_KEY: ${SESSION_SECRET}

  # Features
  ENABLE_SIGNUP: "false"
  ENABLE_RAG: "true"
  ENABLE_IMAGE_GENERATION: "false"
```

#### 2. Startup Script

**File**: `infra/docker/start-ui.ps1` (60 lines)

**Features:**
- Infisical secret injection from shared path
- Environment parameter (dev/staging/prod)
- Start/stop/logs commands
- Success/failure validation
- User-friendly output with color-coded messages

**Usage:**
```powershell
# Start services
.\start-ui.ps1

# Stop services
.\start-ui.ps1 -Down

# Follow logs
.\start-ui.ps1 -Logs

# Use staging environment
.\start-ui.ps1 -Environment staging
```

#### 3. Integration Documentation

**File**: `docs/integrations/OPEN-WEBUI-INTEGRATION.md` (2885 lines)

**Contents:**
- Complete Nexus Router plugin design
- API endpoint specifications
- React component implementations
- WebSocket real-time updates
- 12-week implementation roadmap
- Testing strategy
- Monitoring configuration

**Status**: Planning phase - implementation not started

### Dependencies

#### Required Services (Must be Running):

1. **PostgreSQL** (port 5432)
   - Required for: Open-WebUI data storage
   - Connection: `DATABASE_URL` environment variable
   - Health: Must be accepting connections

2. **Nexus Router** (port 8000)
   - Required for: LLM request routing
   - Endpoint: `http://nexus-router:8000/v1`
   - Health: `/health` endpoint must return 200

3. **Infisical** (configured)
   - Required for: Secret management
   - Project ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
   - Path: `/shared`
   - Environment: `dev` (default)

4. **Docker Network** (`nyra-network`)
   - Required for: Service communication
   - Type: External network
   - Must exist before deployment

#### Optional Services:

1. **Redis** (port 6379)
   - Purpose: Caching, session storage
   - Impact: Performance optimization
   - Fallback: Works without Redis (degraded performance)

### Environment Variables Required

From Infisical `/shared` path:

```bash
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/openwebui

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Ports
NEXUS_ROUTER_PORT=8000
OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334

# Authentication
SESSION_SECRET=<random-secure-key>
LOBECHAT_ACCESS_CODE=<optional-access-code>
```

### Current Gaps

1. **No deployment validation** - Needs first deployment test
2. **Port availability unknown** - Need to verify 3333, 3334 are free
3. **Database schema** - Need to verify PostgreSQL has `openwebui` database
4. **Nexus Router readiness** - Need to confirm Nexus is running
5. **Plugin implementation** - Future work (12-week timeline)

---

## Quick-Start Deployment

### Prerequisites Checklist

Before deploying Open-WebUI, verify:

- [ ] Docker Desktop is running
- [ ] Infisical CLI is installed and authenticated
- [ ] PostgreSQL is running on PC1
- [ ] Nexus Router is running on PC1
- [ ] `nyra-network` Docker network exists
- [ ] Ports 3333 and 3334 are available
- [ ] Secrets are configured in Infisical

### Verification Commands

```powershell
# 1. Check Docker
docker info

# 2. Check Infisical authentication
infisical --version
infisical user

# 3. Check PostgreSQL
docker ps --filter "name=nyra-postgres"

# 4. Check Nexus Router
docker ps --filter "name=nyra-nexus-router"
curl http://localhost:8000/health

# 5. Check Docker network
docker network ls | grep nyra-network

# 6. Check port availability
netstat -an | findstr "3333 3334"
```

### Step-by-Step Deployment

#### Step 1: Navigate to Infrastructure Directory

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
```

#### Step 2: Verify Prerequisites

Run the bootstrap doctor script to check system health:

```powershell
# Run comprehensive health check
C:\Dev\Projects\Repos\Project-Nyra\bootstrap-kit-pc1\scripts\doctor.ps1

# Check specific services
docker-compose -f docker-compose.dev.yml ps postgres nexus-router
```

#### Step 3: Start Open-WebUI

```powershell
# Start with Infisical secret injection
.\start-ui.ps1

# Expected output:
# 🎨 Project Nyra - UI Services
# ======================================================================
# 🔐 Injecting secrets from Infisical...
# 🚀 Starting UI services...
# ✅ UI services started successfully!
# 📊 Services:
#    • Open-WebUI:    http://localhost:3333
#    • LobeChat:      http://localhost:3334
```

#### Step 4: Verify Deployment

```powershell
# Check container status
docker ps --filter "name=nyra-open-webui"
docker ps --filter "name=nyra-lobechat"

# Check health
docker inspect nyra-open-webui | jq '.[0].State.Health'

# View logs
docker logs nyra-open-webui --tail 50
docker logs nyra-lobechat --tail 50
```

#### Step 5: Access Open-WebUI

1. **Open browser**: Navigate to `http://localhost:3333`
2. **First-time setup**: Create admin account (since `ENABLE_SIGNUP=false`, only first user becomes admin)
3. **Configure models**: OpenAI endpoint should auto-populate with Nexus Router
4. **Test chat**: Send a test message to verify Nexus Router integration

#### Step 6: Verify Nexus Router Integration

```powershell
# Monitor Nexus Router logs during Open-WebUI usage
docker logs nyra-nexus-router -f

# Expected: See incoming requests from Open-WebUI
# Format: POST /v1/chat/completions from open-webui
```

### Troubleshooting Quick Deployment

#### Issue: Container fails to start

**Symptoms:**
```
Error response from daemon: network nyra-network not found
```

**Solution:**
```powershell
# Create the network
docker network create nyra-network

# Retry deployment
.\start-ui.ps1
```

#### Issue: Port already in use

**Symptoms:**
```
Error: bind: address already in use
```

**Solution:**
```powershell
# Find process using port 3333
netstat -ano | findstr ":3333"

# Kill the process (use PID from netstat)
taskkill /PID <PID> /F

# Or change port in .env
$env:OPEN_WEBUI_PORT="3335"
.\start-ui.ps1
```

#### Issue: Database connection failed

**Symptoms:**
```
ERROR: could not connect to server: Connection refused
```

**Solution:**
```powershell
# Start PostgreSQL
cd C:\Dev\Projects\Repos\Project-Nyra\infra
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for PostgreSQL to be ready
Start-Sleep -Seconds 10

# Retry Open-WebUI
.\start-ui.ps1
```

#### Issue: Infisical authentication failed

**Symptoms:**
```
Error: Not authenticated with Infisical
```

**Solution:**
```powershell
# Login to Infisical
infisical login

# Verify project access
infisical projects

# Retry deployment
.\start-ui.ps1
```

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        PC1 - Orchestrator                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              User Interface Layer                    │  │
│  │                                                      │  │
│  │  ┌──────────────────┐  ┌──────────────────┐        │  │
│  │  │   Open-WebUI     │  │    LobeChat      │        │  │
│  │  │   Port: 3333     │  │   Port: 3334     │        │  │
│  │  │   (Primary UI)   │  │   (Alternative)  │        │  │
│  │  └────────┬─────────┘  └────────┬─────────┘        │  │
│  │           │                     │                   │  │
│  └───────────┼─────────────────────┼───────────────────┘  │
│              │                     │                       │
│  ┌───────────┴─────────────────────┴───────────────────┐  │
│  │           Nexus Router (Port 8000)                  │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  LLM Request Routing & Cost Optimization     │  │  │
│  │  │  - Local GPU workers (PC2, PC3, PC4)        │  │  │
│  │  │  - Cloud API fallback                       │  │  │
│  │  │  - 90%+ cost savings                        │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────┬───────────────────────────────┘  │
│                        │                                   │
│  ┌─────────────────────┴───────────────────────────────┐  │
│  │              Data Layer                             │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  PostgreSQL  │  │    Redis     │                │  │
│  │  │  Port: 5432  │  │  Port: 6379  │                │  │
│  │  │  (Metadata)  │  │  (Cache)     │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          Secrets Management (Infisical)             │  │
│  │  - API Keys (Anthropic, OpenRouter)                │  │
│  │  - Database credentials                            │  │
│  │  - Session secrets                                 │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌────────┐
    │  PC2   │          │  PC3   │          │  PC4   │
    │ Worker │          │ Worker │          │ Worker │
    │RTX 5090│          │RTX 3090│          │RTX 3060│
    └────────┘          └────────┘          └────────┘
```

### Component Interaction Flow

#### 1. User Chat Request Flow

```
User Browser
    │
    ├─> HTTP POST /v1/chat/completions
    │   Host: localhost:3333 (Open-WebUI)
    │
Open-WebUI Container
    │
    ├─> Forward to Nexus Router
    │   POST http://nexus-router:8000/v1/chat/completions
    │   Headers: Authorization: Bearer ${ANTHROPIC_API_KEY}
    │
Nexus Router
    │
    ├─> Routing Decision
    │   • Check local GPU availability (PC2/PC3/PC4)
    │   • Apply cost optimization strategy
    │   • Select optimal worker or cloud fallback
    │
    ├─> Execute Request
    │   Option A: Local GPU (90% cost savings)
    │   Option B: Cloud API (Anthropic/OpenRouter)
    │
    └─> Return Response
        • Stream tokens back through chain
        • Log metrics (cost, latency, worker)
        • Update routing statistics
```

#### 2. Initial Setup Flow

```
User runs: .\start-ui.ps1
    │
    ├─> Infisical Secret Injection
    │   • Read from project: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
    │   • Path: /shared
    │   • Environment: dev
    │
    ├─> Docker Compose Up
    │   • Pull images (if needed)
    │   • Create containers
    │   • Attach to nyra-network
    │   • Mount volumes
    │   • Start health checks
    │
    ├─> Health Check Polling
    │   • Wait for /health to return 200
    │   • Retry every 30s
    │   • Max 3 retries
    │
    └─> Ready for Requests
        • Open-WebUI: http://localhost:3333
        • LobeChat: http://localhost:3334
```

#### 3. Database Initialization Flow

```
First Start
    │
    ├─> Open-WebUI checks DATABASE_URL
    │   postgresql://postgres:PASSWORD@postgres:5432/openwebui
    │
    ├─> Run Migrations
    │   • Create tables: users, chats, messages, settings
    │   • Create indexes
    │   • Seed default data
    │
    └─> Ready for User Registration
        • First user becomes admin
        • ENABLE_SIGNUP=false prevents additional signups
```

### Network Architecture

#### Docker Network: `nyra-network`

**Type**: Bridge network (external)
**Subnet**: Auto-assigned by Docker
**DNS**: Automatic service discovery via container names

**Services on Network:**
- `nyra-open-webui` (port 8080 internal)
- `nyra-lobechat` (port 3210 internal)
- `nyra-nexus-router` (port 8000 internal)
- `nyra-postgres` (port 5432 internal)
- `nyra-redis` (port 6379 internal)

**Service Discovery Examples:**
```bash
# From Open-WebUI container:
curl http://nexus-router:8000/health  # ✓ Works
curl http://postgres:5432              # ✓ Works

# From host machine:
curl http://localhost:3333/health      # ✓ Works (port mapping)
curl http://nexus-router:8000/health   # ✗ Fails (not on same network)
```

### Data Flow

#### Persistent Data

1. **Open-WebUI Volume** (`open_webui_data`)
   - Path: `/app/backend/data`
   - Contents: Uploaded files, user avatars, cached data
   - Backup: Important for user data retention

2. **LobeChat Volume** (`lobechat_data`)
   - Path: `/app/.next`
   - Contents: Next.js build cache, user preferences
   - Backup: Optional (can rebuild)

3. **PostgreSQL Data**
   - Managed by: `docker-compose.dev.yml` (not UI stack)
   - Contents: All structured data (users, chats, messages)
   - Backup: **Critical** - implement regular backups

#### Temporary Data

1. **Redis Cache**
   - Managed by: `docker-compose.dev.yml` (not UI stack)
   - Contents: Session data, API response cache
   - TTL: Configurable (default 1 hour)
   - Backup: Not needed (transient)

---

## Port Allocation

### Open-WebUI Service Ports

| Service | Host Port | Container Port | Protocol | Purpose |
|---------|-----------|----------------|----------|---------|
| Open-WebUI | 3333 | 8080 | HTTP | Primary web interface |
| LobeChat | 3334 | 3210 | HTTP | Alternative interface |

### Dependency Service Ports (from other stacks)

| Service | Host Port | Container Port | Protocol | Purpose |
|---------|-----------|----------------|----------|---------|
| Nexus Router | 8000 | 8000 | HTTP | LLM routing API |
| PostgreSQL | 5432 | 5432 | TCP | Database |
| Redis | 6379 | 6379 | TCP | Cache/sessions |

### Port Configuration

Ports are configured via environment variables in Infisical:

```bash
# UI Stack Ports
OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334

# Dependency Ports (reference only, not controlled by UI stack)
NEXUS_ROUTER_PORT=8000
```

### Port Conflict Resolution

If ports 3333 or 3334 are already in use:

**Option 1: Change UI ports (recommended)**
```powershell
# Update in Infisical
# /shared → OPEN_WEBUI_PORT=3335
# /shared → LOBECHAT_PORT=3336

# Redeploy
.\start-ui.ps1
```

**Option 2: Kill conflicting process**
```powershell
# Find process
netstat -ano | findstr ":3333"

# Kill process
taskkill /PID <PID> /F

# Redeploy
.\start-ui.ps1
```

**Option 3: Temporary override**
```powershell
# Set environment variable for this session only
$env:OPEN_WEBUI_PORT="3335"

# Start with override
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" `
  --env="dev" --path="/shared" -- `
  docker compose -f docker-compose.ui.yml up -d
```

---

## Configuration Details

### Open-WebUI Configuration

#### Environment Variables

**Database Configuration:**
```yaml
DATABASE_URL: ${DATABASE_URL}
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# Example: postgresql://postgres:password123@postgres:5432/openwebui
```

**API Configuration:**
```yaml
# OpenAI-compatible endpoint (Nexus Router)
OPENAI_API_BASE_URL: http://nexus-router:${NEXUS_ROUTER_PORT}/v1
OPENAI_API_KEY: ${ANTHROPIC_API_KEY}  # Used for authentication

# Direct integrations (bypass Nexus Router)
ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
```

**Authentication Configuration:**
```yaml
WEBUI_SECRET_KEY: ${SESSION_SECRET}
# Purpose: JWT token signing, session encryption
# Requirements: Minimum 32 characters, cryptographically random
# Generation: openssl rand -hex 32
```

**Feature Flags:**
```yaml
ENABLE_SIGNUP: "false"
# Impact: Only first user can register (becomes admin)
# Reason: Security - prevent unauthorized access

ENABLE_RAG: "true"
# Impact: Enables document upload and semantic search
# Requirements: Vector database (optional, uses SQLite if not configured)

ENABLE_IMAGE_GENERATION: "false"
# Impact: Disables image generation features
# Reason: Not required for mortgage workflow
```

#### Volume Mounts

```yaml
volumes:
  - open_webui_data:/app/backend/data
```

**Volume Contents:**
- `/app/backend/data/uploads/` - User-uploaded documents
- `/app/backend/data/cache/` - Temporary cache files
- `/app/backend/data/vector_db/` - Vector embeddings (if RAG enabled)

**Backup Strategy:**
```powershell
# Backup volume
docker run --rm -v open_webui_data:/data -v ${PWD}:/backup alpine tar czf /backup/open_webui_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v open_webui_data:/data -v ${PWD}:/backup alpine tar xzf /backup/open_webui_backup.tar.gz -C /data
```

#### Health Check Configuration

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Health Check Behavior:**
- **Interval**: Check every 30 seconds
- **Timeout**: Wait max 10 seconds for response
- **Retries**: Mark unhealthy after 3 failed checks
- **Start Period**: Grace period of 40s during container startup

**Health States:**
- `starting` - Within start_period, checks don't count towards retries
- `healthy` - Last check succeeded
- `unhealthy` - Failed 3 consecutive checks

### LobeChat Configuration

#### Environment Variables

**Database Configuration:**
```yaml
DATABASE_URL: ${DATABASE_URL}
# Same PostgreSQL instance as Open-WebUI
# Different table prefix to avoid conflicts
```

**API Configuration:**
```yaml
OPENAI_API_KEY: ${ANTHROPIC_API_KEY}
OPENAI_PROXY_URL: http://nexus-router:${NEXUS_ROUTER_PORT}/v1
# Uses Nexus Router for all LLM requests
```

**Access Control:**
```yaml
ACCESS_CODE: ${LOBECHAT_ACCESS_CODE:-}
# Optional: Set to require access code
# Leave empty to disable access control
```

**Feature Configuration:**
```yaml
ENABLE_OAUTH_SSO: "false"
# OAuth disabled for now
# Future: Can integrate with Auth0, Okta, etc.

NEXT_PUBLIC_BASE_PATH: ""
# Base path for Next.js routing
# Empty = serve from root (/)
```

#### Volume Mounts

```yaml
volumes:
  - lobechat_data:/app/.next
```

**Volume Contents:**
- `/app/.next/cache/` - Next.js build cache
- `/app/.next/static/` - Static assets

**Note**: LobeChat stores most data in PostgreSQL, volume is primarily for Next.js build cache.

### Infisical Configuration

**Project Configuration:**
```powershell
INFISICAL_PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
INFISICAL_PATH="/shared"
INFISICAL_ENV="dev"  # Can be: dev, staging, prod
```

**Required Secrets in Infisical:**

Path: `/shared` in environment `dev`:

```bash
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/openwebui

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...

# Ports
NEXUS_ROUTER_PORT=8000
OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334

# Authentication
SESSION_SECRET=<64-character-hex-string>
LOBECHAT_ACCESS_CODE=<optional-access-code>
```

**Secret Validation:**
```powershell
# View all secrets
infisical secrets --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared"

# Get specific secret
infisical secrets get DATABASE_URL --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared"
```

### Docker Network Configuration

**Network Creation:**
```powershell
docker network create nyra-network
```

**Network Inspection:**
```powershell
docker network inspect nyra-network
```

**Expected Output:**
```json
{
  "Name": "nyra-network",
  "Driver": "bridge",
  "Scope": "local",
  "Internal": false,
  "Attachable": false,
  "Containers": {
    "nyra-open-webui": {...},
    "nyra-lobechat": {...},
    "nyra-nexus-router": {...},
    "nyra-postgres": {...}
  }
}
```

---

## Deployment Procedures

### Standard Deployment (Development)

#### Pre-Deployment Checklist

- [ ] Docker Desktop running
- [ ] Infisical CLI authenticated
- [ ] PostgreSQL running and healthy
- [ ] Nexus Router running and healthy
- [ ] `nyra-network` Docker network exists
- [ ] Ports 3333, 3334 available
- [ ] Secrets configured in Infisical `/shared/dev`

#### Deployment Commands

```powershell
# Navigate to infra directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Deploy UI stack
.\start-ui.ps1

# Verify deployment
docker ps --filter "name=nyra-open-webui"
docker logs nyra-open-webui --tail 100

# Test Open-WebUI
Start-Process "http://localhost:3333"
```

#### Post-Deployment Validation

```powershell
# Run health checks
docker inspect nyra-open-webui --format='{{json .State.Health}}' | jq

# Test API endpoints
curl http://localhost:3333/health

# Test Nexus Router integration
# (Send a chat message in Open-WebUI and monitor logs)
docker logs nyra-nexus-router -f
```

### Production Deployment

#### Differences from Development

1. **Environment**: Use `prod` instead of `dev`
   ```powershell
   .\start-ui.ps1 -Environment prod
   ```

2. **Secrets**: Different Infisical path
   - Dev: `/shared/dev`
   - Prod: `/shared/prod`

3. **Database**: Separate production database
   ```bash
   DATABASE_URL=postgresql://postgres:PROD_PASSWORD@postgres:5432/openwebui_prod
   ```

4. **Monitoring**: Enable Prometheus/Grafana monitoring

5. **Backups**: Automated daily backups

#### Production Pre-Deployment Checklist

- [ ] Production secrets configured in Infisical `/shared/prod`
- [ ] Production database created and migrated
- [ ] SSL/TLS certificates configured (if using HTTPS)
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Disaster recovery plan documented

### Rolling Update Procedure

For zero-downtime updates:

```powershell
# 1. Pull new image
docker pull ghcr.io/open-webui/open-webui:main

# 2. Create backup
docker exec nyra-postgres pg_dump -U postgres openwebui > backup.sql

# 3. Stop old container (briefly unavailable)
docker stop nyra-open-webui

# 4. Start new container
.\start-ui.ps1

# 5. Verify health
docker inspect nyra-open-webui --format='{{.State.Health.Status}}'

# 6. Rollback if needed
docker start <old-container-id>
```

### Rollback Procedure

If deployment fails:

```powershell
# 1. Stop new containers
docker-compose -f docker-compose.ui.yml down

# 2. Restore database backup (if schema changed)
docker exec -i nyra-postgres psql -U postgres openwebui < backup.sql

# 3. Start old containers
docker start <old-container-id>

# 4. Investigate failure
docker logs nyra-open-webui --tail 200 > logs.txt
```

---

## Testing & Validation

### Health Check Tests

#### Container Health

```powershell
# Check container is running
docker ps --filter "name=nyra-open-webui" --format "{{.Status}}"

# Check health status
docker inspect nyra-open-webui --format='{{.State.Health.Status}}'

# Expected: "healthy"

# View health check logs
docker inspect nyra-open-webui --format='{{json .State.Health}}' | jq
```

#### Endpoint Health

```powershell
# Open-WebUI health endpoint
curl http://localhost:3333/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "version": "0.1.0"
# }

# LobeChat health endpoint
curl http://localhost:3334/api/health

# Expected response:
# {
#   "status": "ok"
# }
```

### Integration Tests

#### Nexus Router Integration

**Test 1: OpenAI API Compatibility**

```powershell
# Send test request through Open-WebUI
$headers = @{
    "Authorization" = "Bearer ${ANTHROPIC_API_KEY}"
    "Content-Type" = "application/json"
}

$body = @{
    model = "claude-3-5-sonnet-20241022"
    messages = @(
        @{
            role = "user"
            content = "Hello, this is a test message."
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3333/v1/chat/completions" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

**Expected**: Successful response with streamed tokens.

**Test 2: Nexus Router Logs**

```powershell
# Monitor Nexus Router during test
docker logs nyra-nexus-router -f

# Expected log entries:
# [2026-01-13T12:00:00.000Z] INFO: Incoming request from open-webui
# [2026-01-13T12:00:00.100Z] INFO: Routing to local worker PC2 (cost savings: 92%)
# [2026-01-13T12:00:03.500Z] INFO: Request completed (3.5s, 450 tokens)
```

#### Database Integration

**Test 1: PostgreSQL Connection**

```powershell
# Execute query from Open-WebUI container
docker exec nyra-open-webui sh -c "curl http://postgres:5432"

# Expected: Connection accepted (or timeout if connection pooling)
```

**Test 2: Data Persistence**

```powershell
# 1. Create a chat in Open-WebUI (via browser)
# 2. Stop container
docker stop nyra-open-webui

# 3. Start container
.\start-ui.ps1

# 4. Verify chat still exists (via browser)
# Expected: Chat history retained
```

### Load Testing

#### Concurrent Users Test

Use Apache Bench or k6 for load testing:

```powershell
# Install k6 (if not installed)
choco install k6

# Create test script
@"
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
};

export default function () {
  let response = http.get('http://localhost:3333/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
"@ | Out-File -FilePath load-test.js

# Run load test
k6 run load-test.js
```

**Expected Results:**
- Success rate: > 99%
- P95 latency: < 500ms
- No container crashes

#### Stress Test

```powershell
# Gradually increase load to find breaking point
k6 run --vus 50 --duration 5m load-test.js

# Monitor resource usage during test
docker stats nyra-open-webui nyra-nexus-router
```

### Functional Testing Checklist

#### UI Functionality

- [ ] Open-WebUI loads at http://localhost:3333
- [ ] First user registration works
- [ ] Login works
- [ ] Chat interface loads
- [ ] Send message works
- [ ] Response streams correctly
- [ ] Chat history persists
- [ ] Settings page accessible
- [ ] Model selection works
- [ ] File upload works (if RAG enabled)
- [ ] Logout works

#### LobeChat Functionality

- [ ] LobeChat loads at http://localhost:3334
- [ ] Access code prompt (if configured)
- [ ] Chat interface loads
- [ ] Send message works
- [ ] Response streams correctly
- [ ] Settings work

#### Nexus Router Integration

- [ ] Requests route to local GPU when available
- [ ] Requests fall back to cloud when GPU unavailable
- [ ] Cost savings logged correctly
- [ ] Latency metrics recorded
- [ ] Worker health affects routing decisions

---

## 4-PC Integration

### PC1 (Orchestrator) - Open-WebUI Host

**Role**: Hosts Open-WebUI and LobeChat interfaces

**Services Running:**
- Open-WebUI (port 3333)
- LobeChat (port 3334)
- Nexus Router (port 8000)
- PostgreSQL (port 5432)
- Redis (port 6379)
- Grafana (port 3000)
- Prometheus (port 9090)

**Configuration:**
```yaml
# docker-compose.ui.yml (on PC1)
services:
  open-webui:
    container_name: nyra-open-webui
    ports:
      - "3333:8080"
    environment:
      OPENAI_API_BASE_URL: http://nexus-router:8000/v1
    networks:
      - nyra-network
```

**Access:**
- From PC1: `http://localhost:3333`
- From PC2/PC3/PC4: `http://192.168.1.10:3333` (use PC1's LAN IP)
- From external network: Configure port forwarding or VPN

### PC2, PC3, PC4 (GPU Workers)

**Role**: Provide GPU compute for LLM inference

**Services Running:**
- vLLM worker (port 8001)
- Ollama worker (port 11434)
- GPU monitoring agent

**Configuration:**
```yaml
# Nexus Router configuration (on PC1) knows about workers
workers:
  - id: pc2-rtx5090
    url: http://192.168.1.11:8001
    gpu: RTX 5090
    vram: 48GB
  - id: pc3-rtx3090
    url: http://192.168.1.12:8001
    gpu: RTX 3090
    vram: 24GB
  - id: pc4-rtx3060
    url: http://192.168.1.13:8001
    gpu: RTX 3060
    vram: 12GB
```

**Request Flow:**
```
User → Open-WebUI (PC1:3333)
    → Nexus Router (PC1:8000)
        → PC2 vLLM (192.168.1.11:8001) [if RTX 5090 available]
        → PC3 vLLM (192.168.1.12:8001) [if PC2 busy]
        → PC4 vLLM (192.168.1.13:8001) [if PC2/PC3 busy]
        → Cloud API (fallback)
```

### Network Configuration

#### LAN Topology

```
Router (192.168.1.1)
    │
    ├─ PC1 (192.168.1.10) - Orchestrator
    │   • Open-WebUI: 3333
    │   • Nexus Router: 8000
    │   • PostgreSQL: 5432
    │
    ├─ PC2 (192.168.1.11) - GPU Worker 1
    │   • vLLM: 8001
    │   • RTX 5090
    │
    ├─ PC3 (192.168.1.12) - GPU Worker 2
    │   • vLLM: 8001
    │   • RTX 3090
    │
    └─ PC4 (192.168.1.13) - GPU Worker 3
        • vLLM: 8001
        • RTX 3060
```

#### Firewall Rules

**PC1 (Orchestrator) - Inbound Rules:**
```powershell
# Allow Open-WebUI access from LAN
New-NetFirewallRule -DisplayName "Open-WebUI" `
    -Direction Inbound `
    -LocalPort 3333 `
    -Protocol TCP `
    -Action Allow `
    -RemoteAddress 192.168.1.0/24

# Allow LobeChat access from LAN
New-NetFirewallRule -DisplayName "LobeChat" `
    -Direction Inbound `
    -LocalPort 3334 `
    -Protocol TCP `
    -Action Allow `
    -RemoteAddress 192.168.1.0/24
```

**PC2, PC3, PC4 (Workers) - Inbound Rules:**
```powershell
# Allow Nexus Router to connect to vLLM
New-NetFirewallRule -DisplayName "vLLM Worker" `
    -Direction Inbound `
    -LocalPort 8001 `
    -Protocol TCP `
    -Action Allow `
    -RemoteAddress 192.168.1.10/32  # Only from PC1
```

### Distributed Deployment Script

Create `deploy-4pc.ps1`:

```powershell
#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Deploy Project Nyra across 4-PC architecture
.DESCRIPTION
    Orchestrates deployment of services across PC1-PC4
.EXAMPLE
    .\deploy-4pc.ps1
#>

param(
    [switch]$Down
)

$ErrorActionPreference = "Stop"

# PC Configuration
$PC1_IP = "192.168.1.10"  # Orchestrator
$PC2_IP = "192.168.1.11"  # RTX 5090 Worker
$PC3_IP = "192.168.1.12"  # RTX 3090 Worker
$PC4_IP = "192.168.1.13"  # RTX 3060 Worker

Write-Host "🚀 Project Nyra - 4-PC Distributed Deployment" -ForegroundColor Cyan
Write-Host "=" * 70

if ($Down) {
    Write-Host "`n🛑 Shutting down all services..." -ForegroundColor Yellow

    # Stop UI on PC1
    Write-Host "  [PC1] Stopping Open-WebUI..." -ForegroundColor Gray
    ssh administrator@$PC1_IP "cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker && .\start-ui.ps1 -Down"

    # Stop workers (parallel)
    Write-Host "  [PC2/PC3/PC4] Stopping GPU workers..." -ForegroundColor Gray
    @($PC2_IP, $PC3_IP, $PC4_IP) | ForEach-Object -Parallel {
        ssh administrator@$_ "docker stop vllm-worker"
    }

    Write-Host "`n✅ All services stopped" -ForegroundColor Green
    exit 0
}

Write-Host "`n📡 Starting deployment sequence..." -ForegroundColor Yellow

# Step 1: Deploy PostgreSQL on PC1
Write-Host "`n[1/5] Deploying PostgreSQL on PC1..." -ForegroundColor Cyan
ssh administrator@$PC1_IP "cd C:\Dev\Projects\Repos\Project-Nyra\infra && docker-compose -f docker-compose.dev.yml up -d postgres"
Start-Sleep -Seconds 10

# Step 2: Deploy Nexus Router on PC1
Write-Host "`n[2/5] Deploying Nexus Router on PC1..." -ForegroundColor Cyan
ssh administrator@$PC1_IP "cd C:\Dev\Projects\Repos\Project-Nyra\infra && docker-compose -f docker-compose.dev.yml up -d nexus-router"
Start-Sleep -Seconds 15

# Step 3: Deploy GPU workers on PC2, PC3, PC4 (parallel)
Write-Host "`n[3/5] Deploying GPU workers on PC2, PC3, PC4..." -ForegroundColor Cyan
@($PC2_IP, $PC3_IP, $PC4_IP) | ForEach-Object -Parallel {
    $pc = $_
    Write-Host "  [$pc] Starting vLLM worker..." -ForegroundColor Gray
    ssh administrator@$pc "cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap-kit-pc$($pc.Split('.')[-1]-9)\scripts && .\up.ps1"
}

# Step 4: Verify worker health
Write-Host "`n[4/5] Verifying worker health..." -ForegroundColor Cyan
@($PC2_IP, $PC3_IP, $PC4_IP) | ForEach-Object {
    $pc = $_
    $response = Invoke-RestMethod -Uri "http://${pc}:8001/health" -ErrorAction SilentlyContinue
    if ($response.status -eq "ok") {
        Write-Host "  [$pc] ✓ Healthy" -ForegroundColor Green
    } else {
        Write-Host "  [$pc] ✗ Unhealthy" -ForegroundColor Red
    }
}

# Step 5: Deploy Open-WebUI on PC1
Write-Host "`n[5/5] Deploying Open-WebUI on PC1..." -ForegroundColor Cyan
ssh administrator@$PC1_IP "cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker && .\start-ui.ps1"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n📊 Access Points:" -ForegroundColor Cyan
Write-Host "   • Open-WebUI:    http://${PC1_IP}:3333" -ForegroundColor White
Write-Host "   • LobeChat:      http://${PC1_IP}:3334" -ForegroundColor White
Write-Host "   • Nexus Router:  http://${PC1_IP}:8000" -ForegroundColor White
Write-Host "   • Grafana:       http://${PC1_IP}:3000" -ForegroundColor White
```

---

## Monitoring & Observability

### Metrics Collection

#### Prometheus Configuration

Add Open-WebUI metrics to Prometheus:

**File**: `infra/monitoring/prometheus/prometheus.yml`

```yaml
scrape_configs:
  # Open-WebUI metrics
  - job_name: 'open-webui'
    static_configs:
      - targets: ['nyra-open-webui:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s
```

#### Available Metrics

**Open-WebUI Metrics:**
```
# HTTP Requests
openwebui_http_requests_total{method, path, status}
openwebui_http_request_duration_seconds{method, path}

# Chat Metrics
openwebui_chat_messages_total{model}
openwebui_chat_response_time_seconds{model}
openwebui_chat_tokens_total{model, type="input|output"}

# User Metrics
openwebui_active_users
openwebui_registered_users_total

# Database Metrics
openwebui_db_connections{state="active|idle"}
openwebui_db_query_duration_seconds
```

**Nexus Router Metrics:**
```
# Routing Metrics
nexus_routing_requests_total{worker, status}
nexus_routing_latency_seconds{worker}
nexus_routing_cost_savings_total

# Worker Metrics
nexus_worker_health{worker_id, gpu_model}
nexus_worker_requests_total{worker_id}
nexus_worker_gpu_utilization{worker_id}
```

### Grafana Dashboards

#### Open-WebUI Dashboard

Create dashboard at `infra/monitoring/grafana/dashboards/open-webui.json`:

```json
{
  "dashboard": {
    "title": "Open-WebUI Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(openwebui_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(openwebui_http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "openwebui_active_users"
          }
        ]
      },
      {
        "title": "Chat Messages by Model",
        "targets": [
          {
            "expr": "sum by (model) (rate(openwebui_chat_messages_total[5m]))"
          }
        ]
      }
    ]
  }
}
```

#### Nexus Router Dashboard

```json
{
  "dashboard": {
    "title": "Nexus Router - Cost Optimization",
    "panels": [
      {
        "title": "Cost Savings (Cumulative)",
        "targets": [
          {
            "expr": "nexus_routing_cost_savings_total"
          }
        ]
      },
      {
        "title": "Request Distribution (Local vs Cloud)",
        "targets": [
          {
            "expr": "sum by (destination) (rate(nexus_routing_requests_total[5m]))"
          }
        ]
      },
      {
        "title": "Worker GPU Utilization",
        "targets": [
          {
            "expr": "nexus_worker_gpu_utilization"
          }
        ]
      }
    ]
  }
}
```

### Logging Configuration

#### Centralized Logging with Loki

**File**: `infra/docker/docker-compose.logging.yml`

```yaml
version: '3.8'

networks:
  nyra-network:
    external: true

services:
  loki:
    image: grafana/loki:latest
    container_name: nyra-loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
    networks:
      - nyra-network

  promtail:
    image: grafana/promtail:latest
    container_name: nyra-promtail
    restart: unless-stopped
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml:ro
    networks:
      - nyra-network

volumes:
  loki_data:
    driver: local
```

**Promtail Config**: `infra/docker/promtail-config.yml`

```yaml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
        filters:
          - name: label
            values: ["com.docker.compose.project=nyra"]
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'stream'
```

#### Log Queries

**View Open-WebUI logs in Grafana:**
```
{container="nyra-open-webui"} |= "error"
```

**View chat completions:**
```
{container="nyra-open-webui"} |= "/v1/chat/completions"
```

**View Nexus Router routing decisions:**
```
{container="nyra-nexus-router"} |= "Routing to"
```

### Alerting

#### Alertmanager Configuration

**File**: `infra/monitoring/alertmanager/alertmanager.yml`

```yaml
route:
  receiver: 'email'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10m
  repeat_interval: 12h

receivers:
  - name: 'email'
    email_configs:
      - to: 'ops@project-nyra.com'
        from: 'alertmanager@project-nyra.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertmanager@project-nyra.com'
        auth_password: '${SMTP_PASSWORD}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

#### Alert Rules

**File**: `infra/monitoring/prometheus/alerts/open-webui.yml`

```yaml
groups:
  - name: open-webui
    interval: 30s
    rules:
      # Service Down
      - alert: OpenWebUIDown
        expr: up{job="open-webui"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Open-WebUI is down"
          description: "Open-WebUI has been down for more than 2 minutes"

      # High Error Rate
      - alert: OpenWebUIHighErrorRate
        expr: rate(openwebui_http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Open-WebUI high error rate"
          description: "Error rate is {{ $value }}% over 5 minutes"

      # High Response Time
      - alert: OpenWebUISlowResponses
        expr: histogram_quantile(0.95, rate(openwebui_http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Open-WebUI slow responses"
          description: "P95 response time is {{ $value }}s"

      # Database Connection Issues
      - alert: OpenWebUIDBConnectionLow
        expr: openwebui_db_connections{state="active"} < 1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Open-WebUI database connection issues"
          description: "No active database connections for 2 minutes"
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: Container Fails to Start

**Symptoms:**
```
Error response from daemon: driver failed programming external connectivity
```

**Diagnosis:**
```powershell
# Check if port is in use
netstat -ano | findstr ":3333"

# Check Docker logs
docker logs nyra-open-webui
```

**Solutions:**

1. **Port Conflict**: Change port in environment
   ```powershell
   $env:OPEN_WEBUI_PORT="3335"
   .\start-ui.ps1
   ```

2. **Network Issue**: Recreate network
   ```powershell
   docker network rm nyra-network
   docker network create nyra-network
   .\start-ui.ps1
   ```

3. **Volume Permission**: Reset volume
   ```powershell
   docker volume rm open_webui_data
   .\start-ui.ps1
   ```

#### Issue 2: Database Connection Failed

**Symptoms:**
```
ERROR: could not connect to server: Connection refused
```

**Diagnosis:**
```powershell
# Check PostgreSQL status
docker ps --filter "name=nyra-postgres"

# Check PostgreSQL logs
docker logs nyra-postgres

# Test connection
docker exec nyra-postgres pg_isready -U postgres
```

**Solutions:**

1. **PostgreSQL Not Running**: Start PostgreSQL
   ```powershell
   cd C:\Dev\Projects\Repos\Project-Nyra\infra
   docker-compose -f docker-compose.dev.yml up -d postgres
   ```

2. **Wrong Database URL**: Verify Infisical secret
   ```powershell
   infisical secrets get DATABASE_URL --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared"
   ```

3. **Database Doesn't Exist**: Create database
   ```powershell
   docker exec -it nyra-postgres psql -U postgres -c "CREATE DATABASE openwebui;"
   ```

#### Issue 3: Nexus Router Not Responding

**Symptoms:**
```
Open-WebUI shows "Failed to connect to OpenAI API"
```

**Diagnosis:**
```powershell
# Check Nexus Router status
docker ps --filter "name=nyra-nexus-router"

# Test Nexus Router health
curl http://localhost:8000/health

# Check Nexus Router logs
docker logs nyra-nexus-router
```

**Solutions:**

1. **Nexus Router Not Running**: Start Nexus Router
   ```powershell
   cd C:\Dev\Projects\Repos\Project-Nyra\infra
   docker-compose -f docker-compose.dev.yml up -d nexus-router
   ```

2. **Wrong Port**: Verify configuration
   ```powershell
   # Check Open-WebUI environment
   docker inspect nyra-open-webui --format='{{range .Config.Env}}{{println .}}{{end}}' | findstr OPENAI
   ```

3. **API Key Invalid**: Update Infisical secret
   ```powershell
   infisical secrets set ANTHROPIC_API_KEY --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared"
   ```

#### Issue 4: Infisical Authentication Failed

**Symptoms:**
```
Error: Not authenticated with Infisical
```

**Diagnosis:**
```powershell
# Check Infisical authentication
infisical user

# Check project access
infisical projects
```

**Solutions:**

1. **Not Logged In**: Login to Infisical
   ```powershell
   infisical login
   ```

2. **Token Expired**: Re-login
   ```powershell
   infisical logout
   infisical login
   ```

3. **No Project Access**: Contact admin to grant access
   ```
   Project ID: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
   Environment: dev
   Path: /shared
   ```

#### Issue 5: UI Loads but Chat Doesn't Work

**Symptoms:**
- Open-WebUI loads successfully
- Sending messages fails or times out
- No response from LLM

**Diagnosis:**
```powershell
# Check Nexus Router connectivity from Open-WebUI
docker exec nyra-open-webui curl http://nexus-router:8000/health

# Monitor Nexus Router logs during chat attempt
docker logs nyra-nexus-router -f

# Check for errors in Open-WebUI logs
docker logs nyra-open-webui | Select-String "error"
```

**Solutions:**

1. **Nexus Router Unreachable**: Verify network
   ```powershell
   docker network inspect nyra-network | jq '.[0].Containers'
   ```

2. **Invalid API Key**: Update key in Infisical
   ```powershell
   infisical secrets set ANTHROPIC_API_KEY="sk-ant-api03-..." --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared"

   # Restart Open-WebUI
   .\start-ui.ps1 -Down
   .\start-ui.ps1
   ```

3. **GPU Workers Unavailable**: Check workers
   ```powershell
   # From PC1, test PC2 worker
   curl http://192.168.1.11:8001/health
   ```

#### Issue 6: Slow Performance

**Symptoms:**
- Open-WebUI responds slowly
- Chat messages take long to send
- High latency

**Diagnosis:**
```powershell
# Check resource usage
docker stats nyra-open-webui nyra-nexus-router

# Check database connections
docker exec nyra-open-webui sh -c "echo 'SELECT count(*) FROM pg_stat_activity;' | psql $DATABASE_URL"

# Check Redis availability
docker ps --filter "name=nyra-redis"
```

**Solutions:**

1. **High CPU/Memory**: Increase container resources
   ```yaml
   # In docker-compose.ui.yml
   services:
     open-webui:
       deploy:
         resources:
           limits:
             cpus: '2.0'
             memory: 4G
           reservations:
             cpus: '1.0'
             memory: 2G
   ```

2. **Database Slow**: Tune PostgreSQL
   ```powershell
   # Increase shared_buffers, work_mem
   docker exec -it nyra-postgres psql -U postgres -c "ALTER SYSTEM SET shared_buffers = '256MB';"
   docker restart nyra-postgres
   ```

3. **No Redis Caching**: Start Redis
   ```powershell
   cd C:\Dev\Projects\Repos\Project-Nyra\infra
   docker-compose -f docker-compose.dev.yml up -d redis
   ```

### Diagnostic Commands

#### Container Inspection

```powershell
# Full container details
docker inspect nyra-open-webui | jq

# Environment variables
docker inspect nyra-open-webui --format='{{range .Config.Env}}{{println .}}{{end}}'

# Volume mounts
docker inspect nyra-open-webui --format='{{json .Mounts}}' | jq

# Network settings
docker inspect nyra-open-webui --format='{{json .NetworkSettings.Networks}}' | jq

# Health check
docker inspect nyra-open-webui --format='{{json .State.Health}}' | jq
```

#### Log Analysis

```powershell
# View last 100 lines
docker logs nyra-open-webui --tail 100

# Follow logs in real-time
docker logs nyra-open-webui -f

# Filter for errors
docker logs nyra-open-webui | Select-String "error|ERROR"

# Export logs to file
docker logs nyra-open-webui > open-webui-logs.txt
```

#### Network Debugging

```powershell
# Test connectivity from Open-WebUI to Nexus Router
docker exec nyra-open-webui curl -v http://nexus-router:8000/health

# Test connectivity from Open-WebUI to PostgreSQL
docker exec nyra-open-webui nc -zv postgres 5432

# View network connections
docker exec nyra-open-webui netstat -tupn
```

#### Database Debugging

```powershell
# Connect to PostgreSQL
docker exec -it nyra-postgres psql -U postgres -d openwebui

# List tables
\dt

# View user count
SELECT COUNT(*) FROM users;

# View recent chats
SELECT id, title, created_at FROM chats ORDER BY created_at DESC LIMIT 10;

# Check database size
SELECT pg_size_pretty(pg_database_size('openwebui'));
```

### Recovery Procedures

#### Full Reset

If all else fails, perform a full reset:

```powershell
# 1. Stop all services
.\start-ui.ps1 -Down

# 2. Remove containers
docker rm -f nyra-open-webui nyra-lobechat

# 3. Remove volumes (WARNING: Deletes data!)
docker volume rm open_webui_data lobechat_data

# 4. Remove network
docker network rm nyra-network

# 5. Recreate network
docker network create nyra-network

# 6. Restart PostgreSQL
cd C:\Dev\Projects\Repos\Project-Nyra\infra
docker-compose -f docker-compose.dev.yml up -d postgres

# 7. Wait for PostgreSQL
Start-Sleep -Seconds 15

# 8. Redeploy Open-WebUI
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-ui.ps1
```

#### Backup and Restore

**Create Backup:**
```powershell
# Backup PostgreSQL database
docker exec nyra-postgres pg_dump -U postgres openwebui > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Backup Open-WebUI volume
docker run --rm -v open_webui_data:/data -v ${PWD}:/backup alpine tar czf /backup/open_webui_data_$(Get-Date -Format "yyyyMMdd_HHmmss").tar.gz -C /data .
```

**Restore from Backup:**
```powershell
# Restore PostgreSQL database
Get-Content backup_20260113_120000.sql | docker exec -i nyra-postgres psql -U postgres openwebui

# Restore Open-WebUI volume
docker run --rm -v open_webui_data:/data -v ${PWD}:/backup alpine tar xzf /backup/open_webui_data_20260113_120000.tar.gz -C /data
```

---

## Future Enhancements

### Phase 1: Nexus Router Plugin (12 weeks)

**Status**: Comprehensive design exists at `docs/integrations/OPEN-WEBUI-INTEGRATION.md`

**Timeline**: Outlined in integration document

**Key Features:**
- GPU worker monitoring dashboard
- MCP server management interface
- Cost tracking and savings visualization
- Fuzzy search for tools/models/prompts
- Real-time updates via WebSocket
- Routing configuration UI

**Benefits:**
- Unified management interface
- Real-time cost visibility (90%+ savings)
- GPU utilization monitoring
- MCP tool discovery
- Enhanced developer experience

**Implementation Plan**: See OPEN-WEBUI-INTEGRATION.md Section "Implementation Roadmap"

### Phase 2: Advanced Features

#### 1. Multi-Tenant Support

**Goal**: Support multiple teams/projects with isolation

**Features:**
- Workspace isolation
- Per-tenant API keys
- Usage quotas
- Cost allocation

**Implementation:**
```yaml
services:
  open-webui:
    environment:
      MULTI_TENANT_ENABLED: "true"
      DEFAULT_WORKSPACE: "default"
      WORKSPACE_ISOLATION: "strict"
```

#### 2. Advanced RAG Features

**Goal**: Enhanced document retrieval and semantic search

**Features:**
- Multiple vector stores (Qdrant, Weaviate, Pinecone)
- Hybrid search (keyword + semantic)
- Re-ranking algorithms
- Citation tracking

**Configuration:**
```yaml
services:
  open-webui:
    environment:
      ENABLE_RAG: "true"
      VECTOR_STORE: "qdrant"
      VECTOR_STORE_URL: "http://qdrant:6333"
      RAG_EMBEDDING_MODEL: "all-MiniLM-L6-v2"
```

#### 3. Agent Workflows

**Goal**: Multi-step agent workflows with tool use

**Features:**
- Sequential and parallel workflows
- Conditional branching
- Tool/function calling
- Workflow templates

**Example Workflow:**
```yaml
workflows:
  mortgage_analysis:
    steps:
      - name: extract_document_data
        tool: document_parser
        input: $user_upload

      - name: calculate_affordability
        tool: mortgage_calculator
        input: $extract_document_data.income

      - name: generate_recommendations
        model: claude-3-5-sonnet-20241022
        input: $calculate_affordability.results
```

#### 4. Enhanced Security

**Features:**
- OAuth 2.0 / OIDC integration
- Role-based access control (RBAC)
- Audit logging
- Sensitive data masking

**Configuration:**
```yaml
services:
  open-webui:
    environment:
      ENABLE_OAUTH_SSO: "true"
      OAUTH_PROVIDER: "auth0"
      OAUTH_CLIENT_ID: ${OAUTH_CLIENT_ID}
      OAUTH_CLIENT_SECRET: ${OAUTH_CLIENT_SECRET}
      ENABLE_AUDIT_LOG: "true"
      ENABLE_DATA_MASKING: "true"
```

### Phase 3: Production Hardening

#### 1. High Availability

**Features:**
- Multi-replica deployment
- Load balancing
- Automatic failover
- Database replication

**Configuration:**
```yaml
services:
  open-webui:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
```

#### 2. Disaster Recovery

**Features:**
- Automated backups
- Point-in-time recovery
- Cross-region replication
- Backup verification

**Backup Schedule:**
```yaml
# Automated backup with cron
0 2 * * * docker exec nyra-postgres pg_dump -U postgres openwebui | gzip > /backups/openwebui_$(date +\%Y\%m\%d).sql.gz
```

#### 3. Performance Optimization

**Features:**
- CDN for static assets
- Response caching
- Database query optimization
- Connection pooling

**Configuration:**
```yaml
services:
  open-webui:
    environment:
      ENABLE_CDN: "true"
      CDN_URL: "https://cdn.project-nyra.com"
      CACHE_ENABLED: "true"
      CACHE_TTL: "3600"
      DB_POOL_SIZE: "20"
      DB_POOL_TIMEOUT: "30"
```

---

## Security Considerations

### Authentication & Authorization

#### Current Implementation

**Authentication Method**: Username/password with JWT tokens

**Session Management**:
- Session secret: `SESSION_SECRET` from Infisical
- Token expiration: 24 hours (default)
- Refresh tokens: Supported

**Authorization**:
- First user becomes admin automatically
- Additional signups disabled (`ENABLE_SIGNUP=false`)
- Admin can manage users via UI

#### Security Best Practices

1. **Use Strong Session Secrets**
   ```powershell
   # Generate secure session secret
   [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

   # Update in Infisical
   infisical secrets set SESSION_SECRET="<generated-secret>" --projectId="..." --env="dev" --path="/shared"
   ```

2. **Enable HTTPS in Production**
   ```yaml
   # Use reverse proxy (Traefik, nginx)
   services:
     traefik:
       image: traefik:v2.10
       ports:
         - "443:443"
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
         - ./certs:/certs
       command:
         - --providers.docker=true
         - --entrypoints.websecure.address=:443
         - --certificatesresolvers.letsencrypt.acme.tlschallenge=true

     open-webui:
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.openwebui.rule=Host(`chat.project-nyra.com`)"
         - "traefik.http.routers.openwebui.tls.certresolver=letsencrypt"
   ```

3. **Implement Rate Limiting**
   ```yaml
   services:
     open-webui:
       environment:
         RATE_LIMIT_ENABLED: "true"
         RATE_LIMIT_REQUESTS_PER_MINUTE: "60"
   ```

### API Key Security

#### Current Implementation

**API Keys**:
- Anthropic API key: Used for authentication with Nexus Router
- OpenRouter API key: For cloud fallback
- Stored in Infisical (encrypted at rest)

**Best Practices**:

1. **Rotate Keys Regularly**
   ```powershell
   # Generate new Anthropic API key
   # https://console.anthropic.com/settings/keys

   # Update in Infisical
   infisical secrets set ANTHROPIC_API_KEY="sk-ant-api03-..." --projectId="..." --env="dev" --path="/shared"

   # Restart Open-WebUI
   .\start-ui.ps1 -Down
   .\start-ui.ps1
   ```

2. **Principle of Least Privilege**
   - Use separate API keys for dev/staging/prod
   - Limit key permissions to required services only
   - Monitor API key usage

3. **Never Commit Keys to Git**
   ```gitignore
   # .gitignore
   .env
   .env.*
   *.key
   *.pem
   ```

### Network Security

#### Current Implementation

**Docker Network**: `nyra-network` (bridge)
- Services isolated from host network
- Internal service communication via container names
- Port mapping for external access

**Firewall Rules**: Must be configured manually (see 4-PC Integration section)

#### Security Hardening

1. **Enable Docker Network Encryption**
   ```yaml
   networks:
     nyra-network:
       driver: overlay
       driver_opts:
         encrypted: "true"
   ```

2. **Use VPN for Remote Access**
   - Configure WireGuard or OpenVPN
   - Access Open-WebUI through VPN tunnel
   - Avoid exposing ports directly to internet

3. **Implement IP Whitelisting**
   ```powershell
   # Allow only specific IPs
   New-NetFirewallRule -DisplayName "Open-WebUI Whitelist" `
       -Direction Inbound `
       -LocalPort 3333 `
       -Protocol TCP `
       -Action Allow `
       -RemoteAddress 192.168.1.0/24, 10.0.0.0/8
   ```

### Data Security

#### Encryption at Rest

**PostgreSQL**:
- Enable transparent data encryption (TDE)
- Encrypt volume with LUKS (Linux) or BitLocker (Windows)

**Docker Volumes**:
```powershell
# Enable BitLocker on Windows
Enable-BitLocker -MountPoint "D:\" -EncryptionMethod AES256 -UsedSpaceOnly
```

#### Encryption in Transit

**HTTPS Configuration**:
```yaml
# Use Let's Encrypt for free SSL certificates
services:
  traefik:
    image: traefik:v2.10
    command:
      - --certificatesresolvers.letsencrypt.acme.email=admin@project-nyra.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
    volumes:
      - letsencrypt_data:/letsencrypt
```

#### Sensitive Data Handling

**Chat History**:
- Encrypted in PostgreSQL
- Access controlled by user authentication
- Automatic deletion after retention period

**Uploaded Documents**:
- Scanned for malware
- Encrypted at rest
- Access logs maintained

**API Keys**:
- Never stored in plain text
- Loaded from Infisical at runtime
- Not persisted in container

### Audit Logging

#### Enable Audit Logs

```yaml
services:
  open-webui:
    environment:
      ENABLE_AUDIT_LOG: "true"
      AUDIT_LOG_LEVEL: "info"
      AUDIT_LOG_PATH: "/var/log/openwebui/audit.log"
    volumes:
      - ./logs:/var/log/openwebui
```

#### Audit Log Format

```json
{
  "timestamp": "2026-01-13T12:00:00.000Z",
  "user_id": "user_abc123",
  "action": "chat.message.send",
  "resource": "chat_xyz789",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "status": "success"
}
```

#### Log Retention

```powershell
# Rotate logs weekly, keep 4 weeks
# /etc/logrotate.d/openwebui
/var/log/openwebui/*.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
```

### Security Checklist

Before deploying to production:

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong session secrets configured (64+ characters)
- [ ] API keys rotated and stored securely
- [ ] Firewall rules configured (whitelist only)
- [ ] VPN required for remote access
- [ ] Database encryption enabled
- [ ] Audit logging enabled
- [ ] Regular security updates scheduled
- [ ] Backup and recovery tested
- [ ] Incident response plan documented
- [ ] Security scanning automated (Trivy, Clair)
- [ ] Secrets never committed to Git
- [ ] Rate limiting enabled
- [ ] IP whitelisting configured
- [ ] User access reviews scheduled

---

## Appendix

### A. File Locations

**Docker Compose Files:**
- UI Stack: `infra/docker/docker-compose.ui.yml`
- Dev Stack: `infra/docker-compose.dev.yml`
- Logging Stack: `infra/docker/docker-compose.logging.yml`

**Scripts:**
- Start UI: `infra/docker/start-ui.ps1`
- PC1 Doctor: `bootstrap-kit-pc1/scripts/doctor.ps1`
- PC1 Up: `bootstrap-kit-pc1/scripts/up.ps1`
- PC1 Down: `bootstrap-kit-pc1/scripts/down.ps1`
- PC1 Inspect: `bootstrap-kit-pc1/scripts/inspect.ps1`

**Documentation:**
- Integration Plan: `docs/integrations/OPEN-WEBUI-INTEGRATION.md`
- This Document: `OPEN-WEBUI-DEPLOYMENT-PLAN.md`

**Configuration:**
- Prometheus Config: `infra/monitoring/prometheus/prometheus.yml`
- Grafana Dashboards: `infra/monitoring/grafana/dashboards/`
- Alertmanager Config: `infra/monitoring/alertmanager/alertmanager.yml`

### B. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic Claude API key |
| `OPENROUTER_API_KEY` | No | - | OpenRouter API key (fallback) |
| `SESSION_SECRET` | Yes | - | JWT signing secret (64+ chars) |
| `NEXUS_ROUTER_PORT` | No | 8000 | Nexus Router port |
| `OPEN_WEBUI_PORT` | No | 3333 | Open-WebUI host port |
| `LOBECHAT_PORT` | No | 3334 | LobeChat host port |
| `LOBECHAT_ACCESS_CODE` | No | - | LobeChat access code |

### C. Port Reference

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| 3333 | Open-WebUI | HTTP | Primary web interface |
| 3334 | LobeChat | HTTP | Alternative interface |
| 8000 | Nexus Router | HTTP | LLM routing API |
| 5432 | PostgreSQL | TCP | Database |
| 6379 | Redis | TCP | Cache/sessions |
| 3000 | Grafana | HTTP | Monitoring dashboards |
| 9090 | Prometheus | HTTP | Metrics collection |
| 3100 | Loki | HTTP | Log aggregation |

### D. Docker Commands Reference

**Container Management:**
```powershell
# Start services
.\start-ui.ps1

# Stop services
.\start-ui.ps1 -Down

# View logs
.\start-ui.ps1 -Logs

# Restart service
docker restart nyra-open-webui

# Remove service
docker rm -f nyra-open-webui
```

**Volume Management:**
```powershell
# List volumes
docker volume ls | findstr open_webui

# Inspect volume
docker volume inspect open_webui_data

# Backup volume
docker run --rm -v open_webui_data:/data -v ${PWD}:/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm -v open_webui_data:/data -v ${PWD}:/backup alpine tar xzf /backup/backup.tar.gz -C /data

# Remove volume
docker volume rm open_webui_data
```

**Network Management:**
```powershell
# List networks
docker network ls

# Inspect network
docker network inspect nyra-network

# Create network
docker network create nyra-network

# Remove network
docker network rm nyra-network
```

### E. Infisical CLI Reference

**Authentication:**
```powershell
# Login
infisical login

# Logout
infisical logout

# Check current user
infisical user
```

**Secret Management:**
```powershell
# List secrets
infisical secrets --projectId="..." --env="dev" --path="/shared"

# Get specific secret
infisical secrets get DATABASE_URL --projectId="..." --env="dev" --path="/shared"

# Set secret
infisical secrets set KEY="value" --projectId="..." --env="dev" --path="/shared"

# Delete secret
infisical secrets delete KEY --projectId="..." --env="dev" --path="/shared"
```

**Running Commands with Secrets:**
```powershell
# Inject secrets into command
infisical run --projectId="..." --env="dev" --path="/shared" -- docker-compose up -d
```

### F. Health Check Endpoints

**Open-WebUI:**
```
GET http://localhost:3333/health

Response:
{
  "status": "ok",
  "database": "connected",
  "version": "0.1.0"
}
```

**LobeChat:**
```
GET http://localhost:3334/api/health

Response:
{
  "status": "ok"
}
```

**Nexus Router:**
```
GET http://localhost:8000/health

Response:
{
  "status": "healthy",
  "workers": {
    "pc2": "healthy",
    "pc3": "healthy",
    "pc4": "degraded"
  },
  "mcp_servers": {
    "gemini": "online",
    "serena": "online"
  }
}
```

### G. Support Contacts

**Project Nyra Team:**
- Email: ops@project-nyra.com
- Slack: #project-nyra-infrastructure

**External Support:**
- Open-WebUI: https://github.com/open-webui/open-webui/issues
- LobeChat: https://github.com/lobehub/lobe-chat/issues
- Infisical: https://infisical.com/docs

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-13 | Infrastructure Team | Initial deployment plan created |

---

**End of Document**
