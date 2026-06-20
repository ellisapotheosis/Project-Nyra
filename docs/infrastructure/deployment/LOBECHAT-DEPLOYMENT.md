# LobeChat Deployment Guide

## Executive Summary

**Status**: ✅ Infrastructure Ready for Immediate Deployment

LobeChat is a modern AI chat interface built on Next.js that provides an alternative UI to Open-WebUI. It's fully configured in Project Nyra's infrastructure and deploys alongside Open-WebUI using the same startup script.

### Quick Deployment

```powershell
# Deploy both Open-WebUI and LobeChat
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-ui.ps1

# Access LobeChat
Start-Process "http://localhost:3334"
```

### Key Details

- **Port**: 3334 (host) → 3210 (container)
- **Container**: nyra-lobechat
- **Image**: lobehub/lobe-chat:latest
- **Integration**: Nexus Router via OpenAI-compatible API
- **Database**: Shared PostgreSQL with Open-WebUI
- **Status**: Optional alternative interface (can run standalone or with Open-WebUI)

---

## Current Infrastructure

### Docker Compose Configuration

LobeChat is configured in `infra/docker/docker-compose.ui.yml`:

```yaml
lobechat:
  image: lobehub/lobe-chat:latest
  container_name: nyra-lobechat
  restart: unless-stopped
  environment:
    # Database
    DATABASE_URL: ${DATABASE_URL}

    # OpenAI-compatible API (Nexus Router)
    OPENAI_API_KEY: ${ANTHROPIC_API_KEY}
    OPENAI_PROXY_URL: http://nexus-router:${NEXUS_ROUTER_PORT}/v1

    # Access Control
    ACCESS_CODE: ${LOBECHAT_ACCESS_CODE:-}
    ENABLE_OAUTH_SSO: "false"

    # Configuration
    NEXT_PUBLIC_BASE_PATH: ""
  volumes:
    - lobechat_data:/app/.next
  ports:
    - "${LOBECHAT_PORT}:3210"
  networks:
    - nyra-network
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3210/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Key Configuration Details

#### 1. **Nexus Router Integration**
```yaml
OPENAI_PROXY_URL: http://nexus-router:${NEXUS_ROUTER_PORT}/v1
OPENAI_API_KEY: ${ANTHROPIC_API_KEY}
```
- Routes all LLM requests through Nexus Router
- Provides 90%+ cost savings via intelligent routing
- Automatic failover across GPU workers (PC2, PC3, PC4)

#### 2. **Database Integration**
```yaml
DATABASE_URL: ${DATABASE_URL}
```
- Shares PostgreSQL database with Open-WebUI
- Stores chat history, user preferences, and sessions
- Persistent across container restarts

#### 3. **Access Control**
```yaml
ACCESS_CODE: ${LOBECHAT_ACCESS_CODE:-}
ENABLE_OAUTH_SSO: "false"
```
- Optional access code protection
- SSO disabled by default (can enable if needed)
- Controlled via Infisical secrets

#### 4. **Health Monitoring**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3210/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```
- Checks `/api/health` endpoint every 30 seconds
- Container marked unhealthy after 3 failed attempts
- Docker will restart container if health check fails

---

## Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                       PC1 - Orchestrator                       │
│                                                                │
│  User Browser                                                  │
│       ↓                                                        │
│  LobeChat (3334) ──→ Nexus Router (8000) ──→ GPU Workers     │
│       ↓                                             ↓          │
│  PostgreSQL (5432)                           PC2/PC3/PC4      │
└────────────────────────────────────────────────────────────────┘
```

### Component Interaction

```mermaid
sequenceDiagram
    participant User
    participant LobeChat
    participant NexusRouter
    participant PostgreSQL
    participant GPUWorker

    User->>LobeChat: Chat message
    LobeChat->>PostgreSQL: Save message
    LobeChat->>NexusRouter: LLM request (OpenAI format)
    NexusRouter->>GPUWorker: Route to optimal worker
    GPUWorker->>NexusRouter: Model response
    NexusRouter->>LobeChat: Response (OpenAI format)
    LobeChat->>PostgreSQL: Save response
    LobeChat->>User: Display response
```

### Network Architecture

```
Docker Network: nyra-network (bridge)
├── lobechat (nyra-lobechat)
│   └── Port: 3334:3210
├── nexus-router
│   └── Port: 8000:8000
├── postgres
│   └── Port: 5432:5432
└── redis
    └── Port: 6379:6379
```

---

## Deployment Procedures

### Standard Development Deployment

```powershell
# 1. Navigate to docker directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# 2. Verify prerequisites
docker network ls | Select-String "nyra-network"
docker ps | Select-String "postgres|nexus-router"

# 3. Deploy with Infisical secret injection
.\start-ui.ps1 -Environment dev

# 4. Verify deployment
docker ps | Select-String "lobechat"
docker logs nyra-lobechat --tail 20

# 5. Test health endpoint
curl http://localhost:3334/api/health

# 6. Access UI
Start-Process "http://localhost:3334"
```

### Deploy Only LobeChat (Without Open-WebUI)

If you want to run LobeChat standalone without Open-WebUI:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Deploy only LobeChat service
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" `
  --env="dev" --path="/shared" -- `
  docker compose -f docker-compose.ui.yml up -d lobechat

# Verify
docker ps | Select-String "lobechat"
```

### Production Deployment

```powershell
# 1. Deploy with production environment
.\start-ui.ps1 -Environment prod

# 2. Verify production configuration
docker exec nyra-lobechat env | Select-String "OPENAI"

# 3. Enable access code protection (optional)
# Set LOBECHAT_ACCESS_CODE in Infisical (prod environment)

# 4. Monitor logs
docker logs -f nyra-lobechat
```

### Stop LobeChat

```powershell
# Stop all UI services (LobeChat + Open-WebUI)
.\start-ui.ps1 -Down

# OR stop only LobeChat
docker stop nyra-lobechat
docker rm nyra-lobechat
```

---

## Configuration Details

### Required Environment Variables

These are injected by Infisical from project `8374cea9-e5e8-4050-bda4-b91f25ab30ef`:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://nyra:***@postgres:5432/nyra` |
| `ANTHROPIC_API_KEY` | Primary API key for LLM access | `sk-ant-***` |
| `NEXUS_ROUTER_PORT` | Nexus Router port | `8000` |
| `LOBECHAT_PORT` | Host port for LobeChat | `3334` |
| `LOBECHAT_ACCESS_CODE` | Optional access code | `nyra-secure-2024` |

### Optional Configuration

Additional environment variables that can be configured:

```yaml
# OAuth SSO (if enabled)
ENABLE_OAUTH_SSO: "true"
OAUTH_CLIENT_ID: ${OAUTH_CLIENT_ID}
OAUTH_CLIENT_SECRET: ${OAUTH_CLIENT_SECRET}

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_VERCEL: "true"
NEXT_PUBLIC_ANALYTICS_GOOGLE: ${GA_TRACKING_ID}

# Feature Flags
ENABLE_OAUTH: "true"
ENABLE_LANGFUSE: "false"
```

### Volume Configuration

```yaml
volumes:
  lobechat_data:
    driver: local
```

**Data Location**:
- **Docker Volume**: `lobechat_data`
- **Container Path**: `/app/.next`
- **Purpose**: Next.js build cache and runtime data
- **Backup**: Include in volume backup strategy

---

## Testing & Validation

### Health Check Tests

```powershell
# 1. Container health status
docker inspect nyra-lobechat --format='{{.State.Health.Status}}'
# Expected: "healthy"

# 2. HTTP health endpoint
curl http://localhost:3334/api/health
# Expected: 200 OK

# 3. Service logs (no errors)
docker logs nyra-lobechat --tail 50 | Select-String "error|fail"
# Expected: No critical errors
```

### Integration Tests

#### Test 1: Database Connection
```powershell
# Check database connectivity
docker exec nyra-lobechat wget -q -O - http://localhost:3210/api/health
# Expected: Includes database status
```

#### Test 2: Nexus Router Integration
```powershell
# Send test chat message
curl -X POST http://localhost:3334/api/chat `
  -H "Content-Type: application/json" `
  -d '{"messages": [{"role": "user", "content": "Hello, test message"}]}'

# Check Nexus Router logs for routing
docker logs nexus-router --tail 20
# Expected: Request routed to GPU worker
```

#### Test 3: Access Code (if enabled)
```powershell
# Without access code (should fail)
curl -I http://localhost:3334
# Expected: 401 Unauthorized or redirect to auth

# With access code (should succeed)
# Enter access code in UI
```

### Functional Testing

**UI Testing Checklist**:
- [ ] LobeChat UI loads at http://localhost:3334
- [ ] Can create new chat conversation
- [ ] Can send message and receive response
- [ ] Response comes from Nexus Router (check logs)
- [ ] Chat history persists after refresh
- [ ] Settings page accessible
- [ ] Model selection dropdown works
- [ ] File upload works (if enabled)
- [ ] Export chat history works

---

## Monitoring & Observability

### Prometheus Metrics

Add to `infra/monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'lobechat'
    static_configs:
      - targets: ['lobechat:3210']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

### Grafana Dashboard

**Key Metrics to Monitor**:
- Request rate (requests/sec)
- Response time (p50, p95, p99)
- Error rate (% of failed requests)
- Active connections
- Memory usage
- CPU usage
- Database connection pool status

**Sample Prometheus Queries**:
```promql
# Request rate
rate(http_requests_total{service="lobechat"}[5m])

# Average response time
rate(http_request_duration_seconds_sum{service="lobechat"}[5m])
/ rate(http_request_duration_seconds_count{service="lobechat"}[5m])

# Error rate
rate(http_requests_total{service="lobechat",status=~"5.."}[5m])
/ rate(http_requests_total{service="lobechat"}[5m])
```

### Loki Logging

Add to `infra/monitoring/promtail/config.yml`:

```yaml
scrape_configs:
  - job_name: lobechat
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
        filters:
          - name: name
            values: [nyra-lobechat]
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'stream'
```

### Alert Rules

Create `infra/monitoring/prometheus/alerts/lobechat-alerts.yml`:

```yaml
groups:
  - name: lobechat
    interval: 30s
    rules:
      - alert: LobeChatDown
        expr: up{job="lobechat"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "LobeChat service is down"
          description: "LobeChat has been down for more than 2 minutes"

      - alert: LobeChatHighErrorRate
        expr: rate(http_requests_total{service="lobechat",status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate in LobeChat"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: LobeChatSlowResponses
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="lobechat"}[5m])) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "LobeChat is responding slowly"
          description: "P95 response time is {{ $value }}s"
```

---

## Troubleshooting Guide

### Issue 1: Container Fails to Start

**Symptoms**:
```powershell
docker ps -a | Select-String "lobechat"
# Status: Exited (1)
```

**Diagnosis**:
```powershell
# Check container logs
docker logs nyra-lobechat

# Common errors:
# - "Database connection failed"
# - "Port already in use"
# - "Environment variable missing"
```

**Solutions**:

```powershell
# Solution 1: Port conflict (change port)
$env:LOBECHAT_PORT="3335"
.\start-ui.ps1

# Solution 2: Database not ready
docker ps | Select-String "postgres"
# Wait for postgres to be healthy, then restart

# Solution 3: Missing environment variable
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- docker compose -f docker-compose.ui.yml config
# Verify all required variables are set
```

### Issue 2: Cannot Connect to Nexus Router

**Symptoms**:
- Chat messages timeout
- Error: "Failed to fetch model response"

**Diagnosis**:
```powershell
# Check Nexus Router connectivity from LobeChat container
docker exec nyra-lobechat wget -q -O - http://nexus-router:8000/health

# Check Nexus Router logs
docker logs nexus-router --tail 50
```

**Solutions**:

```powershell
# Solution 1: Nexus Router not running
docker ps | Select-String "nexus-router"
# Start Nexus Router if needed

# Solution 2: Wrong port configuration
docker exec nyra-lobechat env | Select-String "OPENAI_PROXY_URL"
# Verify: http://nexus-router:8000/v1

# Solution 3: Network issue
docker network inspect nyra-network
# Verify both containers are on same network
```

### Issue 3: Database Connection Failed

**Symptoms**:
```
Error: connect ECONNREFUSED postgres:5432
```

**Diagnosis**:
```powershell
# Check PostgreSQL status
docker ps | Select-String "postgres"

# Test database connection
docker exec nyra-lobechat sh -c 'wget -q -O - postgres:5432'
```

**Solutions**:

```powershell
# Solution 1: PostgreSQL not running
docker start nyra-postgres

# Solution 2: Wrong DATABASE_URL
docker exec nyra-lobechat env | Select-String "DATABASE_URL"
# Verify format: postgresql://user:pass@postgres:5432/dbname

# Solution 3: Database doesn't exist
docker exec -it nyra-postgres psql -U nyra -c '\l'
# Create database if needed
```

### Issue 4: UI Loads but Chat Doesn't Work

**Symptoms**:
- UI loads successfully at http://localhost:3334
- Sending chat message shows loading spinner indefinitely
- No response received

**Diagnosis**:
```powershell
# Check browser console for errors
# F12 > Console tab

# Check LobeChat logs
docker logs -f nyra-lobechat

# Check Nexus Router logs
docker logs -f nexus-router

# Test API endpoint directly
curl -X POST http://localhost:3334/api/chat/completions `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"test"}],"model":"claude-sonnet"}'
```

**Solutions**:

```powershell
# Solution 1: API key issue
docker exec nyra-lobechat env | Select-String "OPENAI_API_KEY"
# Verify API key is set and valid

# Solution 2: Nexus Router routing issue
docker logs nexus-router | Select-String "error|fail"
# Check for routing errors

# Solution 3: GPU workers not available
# Check PC2, PC3, PC4 status in Nexus Router dashboard
curl http://localhost:8000/api/workers
```

### Issue 5: Access Code Not Working

**Symptoms**:
- Access code prompt doesn't appear
- Or: Access code rejected even when correct

**Diagnosis**:
```powershell
# Check if access code is set
docker exec nyra-lobechat env | Select-String "ACCESS_CODE"
```

**Solutions**:

```powershell
# Solution 1: Access code not configured
# Set in Infisical: /shared/LOBECHAT_ACCESS_CODE

# Solution 2: Browser cache issue
# Clear browser cache and cookies for localhost:3334

# Solution 3: Restart container
docker restart nyra-lobechat
```

### Issue 6: Health Check Failing

**Symptoms**:
```powershell
docker inspect nyra-lobechat --format='{{.State.Health.Status}}'
# Output: "unhealthy"
```

**Diagnosis**:
```powershell
# Check health check logs
docker inspect nyra-lobechat --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# Test health endpoint manually
curl http://localhost:3334/api/health
```

**Solutions**:

```powershell
# Solution 1: Container starting up (wait)
# Health checks may fail during initialization

# Solution 2: Port misconfiguration
docker port nyra-lobechat
# Verify: 3210/tcp -> 0.0.0.0:3334

# Solution 3: Restart container
docker restart nyra-lobechat
```

---

## Comparison: LobeChat vs Open-WebUI

### Feature Comparison

| Feature | LobeChat | Open-WebUI |
|---------|----------|------------|
| **UI Framework** | Next.js 14 | SvelteKit |
| **Performance** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good |
| **Mobile Support** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Plugin System** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **RAG Support** | ⭐⭐⭐ Basic | ⭐⭐⭐⭐⭐ Advanced |
| **Model Support** | OpenAI-compatible | OpenAI + Ollama |
| **Customization** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good |
| **Setup Complexity** | ⭐⭐⭐⭐⭐ Simple | ⭐⭐⭐ Moderate |
| **Resource Usage** | ⭐⭐⭐⭐⭐ Light | ⭐⭐⭐⭐ Moderate |

### When to Use LobeChat

✅ **Best For**:
- Clean, modern UI preference
- Mobile-first development
- Quick prototyping
- Lightweight deployments
- Next.js ecosystem integration

❌ **Not Ideal For**:
- Advanced RAG workflows
- Complex plugin development
- Ollama local model support
- Document processing pipelines

### When to Use Open-WebUI

✅ **Best For**:
- Advanced RAG and document processing
- Plugin ecosystem (future Nexus Router plugin)
- Ollama integration
- Complex workflow automation

❌ **Not Ideal For**:
- Mobile-heavy use cases
- Minimal resource deployments

### Recommendation

**For Project Nyra**:
- **Primary Interface**: **Open-WebUI** (for Nexus Router plugin development)
- **Secondary Interface**: **LobeChat** (for mobile and lightweight access)
- **Deployment**: Run both (minimal overhead with shared infrastructure)

---

## 4-PC Distributed Architecture

### PC Role Assignments

```
┌──────────────────┬─────────────────────────────────────────┐
│ PC               │ LobeChat Responsibilities               │
├──────────────────┼─────────────────────────────────────────┤
│ PC1 (Orchestrator)│ • Hosts LobeChat container             │
│                  │ • Port 3334 exposed to local network   │
│                  │ • PostgreSQL database                   │
│                  │ • Nexus Router coordination             │
├──────────────────┼─────────────────────────────────────────┤
│ PC2 (GPU Worker) │ • Processes LLM requests from LobeChat │
│                  │ • RTX 4090 for inference                │
│                  │ • Managed by Nexus Router               │
├──────────────────┼─────────────────────────────────────────┤
│ PC3 (GPU Worker) │ • Processes LLM requests from LobeChat │
│                  │ • RTX 4090 for inference                │
│                  │ • Managed by Nexus Router               │
├──────────────────┼─────────────────────────────────────────┤
│ PC4 (GPU Worker) │ • Processes LLM requests from LobeChat │
│                  │ • RTX 4090 for inference                │
│                  │ • Managed by Nexus Router               │
└──────────────────┴─────────────────────────────────────────┘
```

### Network Configuration

**PC1 Firewall Rules** (outbound):
```powershell
# Allow LobeChat to reach Nexus Router
New-NetFirewallRule -DisplayName "LobeChat to Nexus Router" `
  -Direction Outbound -LocalPort Any -RemotePort 8000 `
  -Protocol TCP -Action Allow

# Allow LobeChat to reach PostgreSQL
New-NetFirewallRule -DisplayName "LobeChat to PostgreSQL" `
  -Direction Outbound -LocalPort Any -RemotePort 5432 `
  -Protocol TCP -Action Allow
```

**PC1 Firewall Rules** (inbound - for remote access):
```powershell
# Allow remote access to LobeChat (optional)
New-NetFirewallRule -DisplayName "LobeChat Web UI" `
  -Direction Inbound -LocalPort 3334 `
  -Protocol TCP -Action Allow
```

### Deployment Script for PC1

Create `infra/docker/deploy-lobechat-pc1.ps1`:

```powershell
#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Deploy LobeChat on PC1 (Orchestrator)
.DESCRIPTION
    Deploys LobeChat container with proper networking for 4-PC architecture
#>

param(
    [Parameter()]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "🎨 Deploying LobeChat on PC1 (Orchestrator)" -ForegroundColor Cyan
Write-Host "=" * 70

# Verify prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

$prerequisites = @(
    @{Name="Docker"; Command="docker --version"},
    @{Name="PostgreSQL"; Command="docker ps | Select-String 'nyra-postgres'"},
    @{Name="Nexus Router"; Command="docker ps | Select-String 'nexus-router'"},
    @{Name="Docker Network"; Command="docker network ls | Select-String 'nyra-network'"}
)

foreach ($prereq in $prerequisites) {
    try {
        Invoke-Expression $prereq.Command | Out-Null
        Write-Host "  ✓ $($prereq.Name)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $($prereq.Name) - Not ready" -ForegroundColor Red
        exit 1
    }
}

# Deploy LobeChat
Write-Host "`n🚀 Deploying LobeChat..." -ForegroundColor Yellow

$COMPOSE_FILE = "docker-compose.ui.yml"
$INFISICAL_PROJECT_ID = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"

infisical run --projectId="$INFISICAL_PROJECT_ID" `
  --env="$Environment" --path="/shared" -- `
  docker compose -f $COMPOSE_FILE up -d lobechat

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ LobeChat deployed successfully!" -ForegroundColor Green

    # Wait for health check
    Write-Host "`n⏳ Waiting for health check..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    $health = docker inspect nyra-lobechat --format='{{.State.Health.Status}}'
    if ($health -eq "healthy") {
        Write-Host "  ✓ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Health check: $health" -ForegroundColor Yellow
    }

    Write-Host "`n📊 Access LobeChat:" -ForegroundColor Cyan
    Write-Host "   • Local:     http://localhost:3334" -ForegroundColor White
    Write-Host "   • Network:   http://$(hostname):3334" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to deploy LobeChat" -ForegroundColor Red
    docker logs nyra-lobechat --tail 50
    exit 1
}
```

---

## Security Considerations

### Authentication & Authorization

**Current Configuration**:
- Access code protection (optional via `LOBECHAT_ACCESS_CODE`)
- No OAuth SSO by default (can enable)
- No built-in user management

**Recommendations**:

```yaml
# Enable OAuth SSO for production
environment:
  ENABLE_OAUTH_SSO: "true"
  OAUTH_CLIENT_ID: ${OAUTH_CLIENT_ID}
  OAUTH_CLIENT_SECRET: ${OAUTH_CLIENT_SECRET}
  OAUTH_ISSUER: ${OAUTH_ISSUER}
```

### API Key Security

**Current Setup**:
- API keys stored in Infisical
- Injected at runtime (not in images)
- Not exposed in logs or environment dumps

**Best Practices**:
```powershell
# Never log API keys
docker exec nyra-lobechat env | Select-String "API_KEY"
# ❌ Don't do this in production logs

# Rotate API keys regularly
# Update in Infisical, then restart containers
docker restart nyra-lobechat
```

### Network Security

**Isolation**:
```yaml
networks:
  nyra-network:
    internal: true  # Prevents external access
```

**Firewall Rules**:
```powershell
# PC1: Only allow specific ports
New-NetFirewallRule -DisplayName "LobeChat HTTPS" `
  -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Block direct access to container port
New-NetFirewallRule -DisplayName "Block LobeChat Direct" `
  -Direction Inbound -LocalPort 3334 -Protocol TCP -Action Block
```

### Data Encryption

**In Transit**:
```nginx
# Use nginx reverse proxy with TLS
server {
    listen 443 ssl http2;
    server_name lobechat.nyra.local;

    ssl_certificate /etc/nginx/certs/lobechat.crt;
    ssl_certificate_key /etc/nginx/certs/lobechat.key;

    location / {
        proxy_pass http://localhost:3334;
    }
}
```

**At Rest**:
```yaml
# Encrypt PostgreSQL volume
volumes:
  lobechat_data:
    driver: local
    driver_opts:
      type: "none"
      o: "bind,encryption=aes-256-xts"
      device: "/encrypted/lobechat"
```

---

## Backup & Recovery

### Backup Procedures

```powershell
# 1. Backup PostgreSQL database
docker exec nyra-postgres pg_dump -U nyra nyra > "backups/lobechat-db-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"

# 2. Backup Docker volume
docker run --rm -v lobechat_data:/data -v ${PWD}/backups:/backup `
  alpine tar czf /backup/lobechat-volume-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz /data

# 3. Backup configuration
Copy-Item "infra/docker/docker-compose.ui.yml" "backups/docker-compose.ui-$(Get-Date -Format 'yyyyMMdd-HHmmss').yml"
```

### Recovery Procedures

```powershell
# 1. Stop current container
docker stop nyra-lobechat
docker rm nyra-lobechat

# 2. Restore PostgreSQL database
Get-Content "backups/lobechat-db-YYYYMMDD-HHMMSS.sql" | `
  docker exec -i nyra-postgres psql -U nyra nyra

# 3. Restore Docker volume
docker run --rm -v lobechat_data:/data -v ${PWD}/backups:/backup `
  alpine tar xzf /backup/lobechat-volume-YYYYMMDD-HHMMSS.tar.gz -C /

# 4. Redeploy container
.\start-ui.ps1
```

---

## Future Enhancements

### Phase 1: Basic Improvements (Weeks 1-4)

1. **Custom Branding**
   - Add Project Nyra logo
   - Custom color scheme
   - Branded login page

2. **Enhanced Monitoring**
   - Custom Grafana dashboard
   - Real-time performance metrics
   - User session analytics

3. **Access Control**
   - Implement OAuth SSO
   - User role management
   - API key management UI

### Phase 2: Advanced Features (Weeks 5-8)

1. **Plugin System**
   - Nexus Router status plugin
   - GPU worker monitor plugin
   - Cost tracking plugin

2. **Multi-User Support**
   - User registration/login
   - Per-user chat history
   - Shared conversations

3. **RAG Integration**
   - Document upload
   - Knowledge base search
   - Citation support

### Phase 3: Enterprise Features (Weeks 9-12)

1. **High Availability**
   - Multi-instance deployment
   - Load balancing
   - Session replication

2. **Advanced Analytics**
   - Usage reports
   - Cost analysis
   - Performance dashboards

3. **Integration APIs**
   - REST API for external access
   - Webhook support
   - Third-party integrations

---

## Appendix

### A. File Locations

```
Project-Nyra/
├── infra/docker/
│   ├── docker-compose.ui.yml      # LobeChat configuration
│   ├── start-ui.ps1                # Deployment script
│   └── deploy-lobechat-pc1.ps1    # PC1-specific deployment (to be created)
├── docs/integrations/
│   └── OPEN-WEBUI-INTEGRATION.md  # UI integration documentation
└── LOBECHAT-DEPLOYMENT.md         # This document
```

### B. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | - | API key for LLM access (Anthropic) |
| `OPENAI_PROXY_URL` | Yes | - | Nexus Router URL |
| `NEXUS_ROUTER_PORT` | Yes | 8000 | Nexus Router port |
| `LOBECHAT_PORT` | No | 3334 | Host port for LobeChat |
| `LOBECHAT_ACCESS_CODE` | No | - | Optional access code |
| `ENABLE_OAUTH_SSO` | No | false | Enable OAuth authentication |
| `NEXT_PUBLIC_BASE_PATH` | No | "" | Base path for reverse proxy |

### C. Port Reference

| Service | Container Port | Host Port | Protocol | Purpose |
|---------|---------------|-----------|----------|---------|
| LobeChat | 3210 | 3334 | HTTP | Web UI |
| LobeChat Health | 3210 | - | HTTP | Health check endpoint |
| PostgreSQL | 5432 | 5432 | TCP | Database |
| Nexus Router | 8000 | 8000 | HTTP | LLM routing |
| Redis | 6379 | 6379 | TCP | Caching |

### D. Docker Commands Reference

```powershell
# Container management
docker start nyra-lobechat
docker stop nyra-lobechat
docker restart nyra-lobechat
docker rm nyra-lobechat

# Logs
docker logs nyra-lobechat
docker logs -f nyra-lobechat                    # Follow logs
docker logs --tail 100 nyra-lobechat            # Last 100 lines
docker logs --since 1h nyra-lobechat            # Last hour

# Inspection
docker inspect nyra-lobechat                    # Full details
docker stats nyra-lobechat                      # Resource usage
docker port nyra-lobechat                       # Port mappings
docker exec nyra-lobechat env                   # Environment variables

# Health
docker inspect nyra-lobechat --format='{{.State.Health.Status}}'
docker inspect nyra-lobechat --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# Network
docker network inspect nyra-network
docker network connect nyra-network nyra-lobechat
docker network disconnect nyra-network nyra-lobechat

# Volume
docker volume inspect lobechat_data
docker volume ls
docker volume prune  # Remove unused volumes
```

### E. Useful URLs

- **LobeChat UI**: http://localhost:3334
- **Health Check**: http://localhost:3334/api/health
- **Nexus Router**: http://localhost:8000
- **PostgreSQL**: postgresql://localhost:5432/nyra
- **Grafana**: http://localhost:3000 (if monitoring enabled)
- **Prometheus**: http://localhost:9090 (if monitoring enabled)

### F. Support Resources

**Official Documentation**:
- LobeChat Docs: https://lobehub.com/docs
- Docker Compose: https://docs.docker.com/compose/
- Next.js: https://nextjs.org/docs

**Project Nyra Resources**:
- Main Documentation: `docs/README.md`
- Open-WebUI Deployment: `OPEN-WEBUI-DEPLOYMENT-PLAN.md`
- Docker Infrastructure: `infra/README.md`
- Nexus Router Integration: `docs/integrations/OPEN-WEBUI-INTEGRATION.md`

**Troubleshooting**:
- Check Docker logs: `docker logs nyra-lobechat`
- Check Nexus Router logs: `docker logs nexus-router`
- Check PostgreSQL logs: `docker logs nyra-postgres`
- Review this guide's Troubleshooting section

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial deployment guide created |

---

**Document Status**: ✅ Complete and Ready for Use
**Last Updated**: 2026-01-13
**Maintained By**: Project Nyra Team
**Related Documents**: OPEN-WEBUI-DEPLOYMENT-PLAN.md, docs/integrations/OPEN-WEBUI-INTEGRATION.md
