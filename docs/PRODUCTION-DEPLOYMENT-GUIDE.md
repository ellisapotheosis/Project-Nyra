# Project Nyra - Production Deployment Guide

**Version**: 1.0.0
**Last Updated**: January 11, 2026
**Status**: Production Ready (70% Complete)

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Service Deployment](#service-deployment)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring](#monitoring)
8. [Backup & Recovery](#backup--recovery)

---

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / macOS / Windows WSL2
- **Docker**: 24.0.0+
- **Docker Compose**: 2.20.0+
- **RAM**: 16GB minimum (32GB recommended)
- **Disk**: 50GB available space
- **CPU**: 4 cores minimum (8+ recommended)

### Required API Keys
1. **Anthropic API Key** - Claude models (`sk-ant-api-xxxxx`)
2. **OpenRouter API Key** - Multi-model access (`sk-or-xxxxx`)
3. **Google Gemini API Key** - Cost-effective inference
4. **Twilio Credentials** - SMS/call automation (Account SID + Auth Token)
5. **GitHub Token** - CI/CD integration (optional)

### Software Dependencies
```bash
# Verify Docker installation
docker --version  # Should be 24.0.0+
docker-compose --version  # Should be 2.20.0+

# Verify network connectivity
ping -c 3 api.anthropic.com
ping -c 3 openrouter.ai
```

---

## Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or vim/code/etc.
```

### 2. Configure Environment

Edit `.env` and fill in all required values:

```bash
# REQUIRED - LLM API Keys
ANTHROPIC_API_KEY=sk-ant-api-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
GOOGLE_GEMINI_API_KEY=xxxxx

# REQUIRED - Twilio (for campaigns)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx

# REQUIRED - Database Passwords (change defaults!)
LETTA_POSTGRES_PASSWORD=strong_password_here
TWENTY_POSTGRES_PASSWORD=strong_password_here
DIFY_POSTGRES_PASSWORD=strong_password_here
NEO4J_PASSWORD=strong_password_here

# REQUIRED - Application Secrets
DIFY_SECRET_KEY=$(openssl rand -hex 32)
N8N_PASSWORD=strong_password_here
GRAFANA_PASSWORD=strong_password_here
```

### 3. Start Services

```bash
# Make scripts executable
chmod +x scripts/dev/start-dev.sh
chmod +x scripts/dev/stop-all.sh

# Start all services
./scripts/dev/start-dev.sh
```

This will start services in the correct order:
1. Infrastructure (Nexus, LiteLLM, databases)
2. Memory systems (Letta, Mem0, Neo4j)
3. Business services (Quote Engine, Campaign Engine, Orchestrator)
4. Workflow automation (n8n, Dify)
5. Observability (Prometheus, Grafana, Loki)

### 4. Verify Deployment

```bash
# Check all containers are running
docker-compose -f infra/docker/docker-compose.yml ps

# Check health endpoints
curl http://localhost:8001/health  # Quote Engine
curl http://localhost:8002/health  # Campaign Engine
curl http://localhost:8010/health  # Orchestrator
curl http://localhost:4321/health  # Mem0
```

---

## Environment Configuration

### Configuration Files

#### `.env` - Main Environment File
```bash
# API Keys
ANTHROPIC_API_KEY=           # Claude models
OPENROUTER_API_KEY=          # Multi-provider access
GOOGLE_GEMINI_API_KEY=       # Cost-effective inference

# Twilio (SMS/Calls)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Database Passwords
LETTA_POSTGRES_PASSWORD=
TWENTY_POSTGRES_PASSWORD=
DIFY_POSTGRES_PASSWORD=
NEO4J_PASSWORD=

# Application Secrets
DIFY_SECRET_KEY=             # Generate with: openssl rand -hex 32
N8N_PASSWORD=
GRAFANA_PASSWORD=
```

#### `configs/nexus/nexus.toml` - LLM Gateway
```toml
[server]
host = "0.0.0.0"
port = 6000

[llm]
default_provider = "anthropic"
fallback_provider = "openrouter"

[[providers]]
name = "anthropic"
type = "anthropic"
api_key_env = "ANTHROPIC_API_KEY"
models = ["claude-3-5-sonnet-20241022", "claude-sonnet-4-20250514"]
rate_limit = 50
```

#### `configs/litellm/config.yaml` - Model Routing
```yaml
router_settings:
  routing_strategy: cost-based
  model_group_alias:
    cheap: ["gemini-flash", "deepseek-r1"]
    balanced: ["llama-70b"]
    premium: ["claude-3-5-sonnet", "claude-sonnet-4"]
```

---

## Service Deployment

### Service Architecture

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
│  Claude Flow MCP | Archon OS MCP                       │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  DATA & MEMORY LAYER                    │
│  Letta (8283) | Mem0 (4321) | Neo4j (7474)            │
│  PostgreSQL | Redis | FalkorDB                         │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  WORKFLOW & CRM LAYER                   │
│  n8n (5678) | Dify (3001) | Twenty CRM (3000)          │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  OBSERVABILITY LAYER                    │
│  Prometheus (9090) | Grafana (3005) | Loki (3100)      │
└─────────────────────────────────────────────────────────┘
```

### Service Details

#### 1. Nexus Router (Port 6000)
**Purpose**: Unified LLM and MCP gateway
**Dependencies**: None
**Health Check**: `http://localhost:6000/health`
**Configuration**: `configs/nexus/nexus.toml`

**Features**:
- Multi-provider LLM routing (Anthropic, OpenRouter, Gemini)
- Cost-based routing strategy
- MCP proxy aggregation
- Rate limiting per provider

#### 2. Quote Engine (Port 8001)
**Purpose**: Mortgage quote calculations
**Dependencies**: Nexus Router
**Health Check**: `http://localhost:8001/health`
**API Docs**: `http://localhost:8001/docs`

**Endpoints**:
- `POST /quote` - Generate mortgage quote
- `GET /health` - Health check

#### 3. Campaign Engine (Port 8002)
**Purpose**: Drip campaign orchestration
**Dependencies**: Nexus Router, n8n
**Health Check**: `http://localhost:8002/health`

**Endpoints**:
- `POST /campaigns` - Create campaign
- `GET /campaigns` - List campaigns
- `POST /campaigns/{id}/start` - Start campaign

#### 4. Nyra Orchestrator (Port 8010)
**Purpose**: Workflow coordination and compliance
**Dependencies**: All services
**Health Check**: `http://localhost:8010/health`

**Endpoints**:
- `POST /leads` - Process lead
- `POST /compliance/check` - Run compliance checks

#### 5. Mem0 REST API (Port 4321)
**Purpose**: Memory management
**Dependencies**: Nexus Router
**Health Check**: `http://localhost:4321/health`

**Endpoints**:
- `POST /memories` - Create memory
- `GET /memories/{user_id}` - Get user memories

---

## Verification

### Automated Health Checks

```bash
#!/bin/bash
# health-check-all.sh

services=(
    "http://localhost:6000/health|Nexus Router"
    "http://localhost:4000/health|LiteLLM"
    "http://localhost:8001/health|Quote Engine"
    "http://localhost:8002/health|Campaign Engine"
    "http://localhost:8010/health|Orchestrator"
    "http://localhost:4321/health|Mem0"
    "http://localhost:8283|Letta"
    "http://localhost:3000|Twenty CRM"
    "http://localhost:5678|n8n"
    "http://localhost:3001|Dify"
    "http://localhost:9090|Prometheus"
    "http://localhost:3005|Grafana"
)

for service in "${services[@]}"; do
    IFS='|' read -r url name <<< "$service"
    if curl -sf "$url" > /dev/null; then
        echo "✅ $name - HEALTHY"
    else
        echo "❌ $name - UNHEALTHY"
    fi
done
```

### Manual Verification

```bash
# 1. Check Quote Engine
curl -X POST http://localhost:8001/quote \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 300000,
    "property_value": 400000,
    "credit_score": 740,
    "loan_type": "conventional",
    "loan_term": 30,
    "down_payment": 100000,
    "property_state": "CA",
    "property_zip": "90210",
    "borrower_email": "test@example.com"
  }'

# 2. Check Campaign Engine
curl -X GET http://localhost:8002/campaigns

# 3. Check Orchestrator
curl -X GET http://localhost:8010/health

# 4. Check Grafana dashboards
open http://localhost:3005  # Default: admin/admin
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Docker Containers Failing to Start
```bash
# Check container logs
docker-compose -f infra/docker/docker-compose.yml logs [service_name]

# Common causes:
# - Port already in use
# - Missing environment variables
# - Insufficient resources

# Solution: Stop conflicting services
lsof -i :6000  # Check if port 6000 is used
kill -9 [PID]  # Kill process using port
```

#### Issue 2: Services Unhealthy
```bash
# Check health status
docker-compose -f infra/docker/docker-compose.yml ps

# Restart unhealthy service
docker-compose -f infra/docker/docker-compose.yml restart [service_name]

# View service logs
docker-compose -f infra/docker/docker-compose.yml logs -f [service_name]
```

#### Issue 3: Database Connection Failures
```bash
# Check PostgreSQL is running
docker-compose -f infra/docker/docker-compose.yml exec letta_postgres pg_isready

# Check password matches .env
docker-compose -f infra/docker/docker-compose.yml exec letta_postgres \
  psql -U letta -d letta -c "SELECT 1"
```

#### Issue 4: API Key Issues
```bash
# Verify API keys are set
docker-compose -f infra/docker/docker-compose.yml exec nexus env | grep API_KEY

# Test Anthropic API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

---

## Monitoring

### Grafana Dashboards

Access Grafana at: `http://localhost:3005`
Default credentials: `admin` / `admin` (change on first login)

#### Available Dashboards:
1. **System Overview** - CPU, memory, disk, network
2. **Application Metrics** - Request rates, latency, errors
3. **Business Metrics** - Leads, quotes, conversions
4. **Database Performance** - Query times, connections
5. **LLM Usage** - Token counts, costs, model distribution

### Prometheus Queries

Access Prometheus at: `http://localhost:9090`

**Useful Queries**:
```promql
# Request rate per service
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Response time P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Container memory usage
container_memory_usage_bytes{name=~"nyra-.*"}

# LLM token usage
sum(rate(llm_tokens_total[1h])) by (model)
```

### Log Aggregation

Access Loki logs through Grafana:
1. Go to Explore → Select Loki datasource
2. Use LogQL queries:
```logql
{service="quote-engine"} |= "error"
{service=~".*engine.*"} | json | status="500"
{service="orchestrator"} |= "lead" | json | email="*"
```

---

## Backup & Recovery

### Database Backups

```bash
# Backup all PostgreSQL databases
docker-compose -f infra/docker/docker-compose.yml exec letta_postgres \
  pg_dump -U letta letta > backups/letta_$(date +%Y%m%d).sql

docker-compose -f infra/docker/docker-compose.yml exec twenty_postgres \
  pg_dump -U twenty twenty > backups/twenty_$(date +%Y%m%d).sql

docker-compose -f infra/docker/docker-compose.yml exec dify_postgres \
  pg_dump -U dify dify > backups/dify_$(date +%Y%m%d).sql
```

### Volume Backups

```bash
# Backup Docker volumes
docker run --rm \
  -v nyra_mem0_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/mem0_data_$(date +%Y%m%d).tar.gz /data
```

### Configuration Backups

```bash
# Backup configurations
tar czf backups/configs_$(date +%Y%m%d).tar.gz \
  configs/ \
  .env \
  infra/docker/docker-compose.yml
```

---

## Next Steps

After successful deployment:

1. **Configure n8n Workflows**
   - Access n8n at http://localhost:5678
   - Import workflow templates from `data/n8n/`
   - Configure webhook URLs

2. **Set Up Dify Chat UI**
   - Access Dify at http://localhost:3001
   - Create borrower assistant agent
   - Configure knowledge base

3. **Configure Twenty CRM**
   - Access CRM at http://localhost:3000
   - Set up lead pipeline
   - Configure custom fields

4. **Deploy Frontend Applications**
   - RateHunter: Public mortgage rate comparison
   - Nyra Admin: Internal operations dashboard

5. **Production Hardening**
   - Enable SSL/TLS
   - Configure firewall rules
   - Set up automated backups
   - Enable security scanning

---

## Support

For issues or questions:
- **Documentation**: `docs/` directory
- **API Docs**: http://localhost:8001/docs (for each service)
- **Logs**: `docker-compose logs -f [service]`
- **Health Checks**: `/health` endpoint on each service

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: January 11, 2026
**System Status**: Production Ready (70% Complete)
