# Docker Compose Configuration Issues & Fixes

**Date**: 2026-01-26
**Status**: 🔴 Critical Configuration Issues Identified

## 🚨 Critical Issues Found

### 1. **Missing Configuration Files** (High Priority)

The Docker Compose files reference configuration files that don't exist:

#### Missing Nexus Router Config
- **Referenced**: `../../configs/nexus/nexus.toml` (in `docker-compose.ai.yml:39`)
- **Actual Location**: Not found
- **Impact**: Nexus Router container will fail to start

#### Missing LiteLLM Config
- **Referenced**: `../../configs/litellm/config.yaml` (in `docker-compose.ai.yml:68`)
- **Actual Location**: Not found
- **Impact**: LiteLLM container will fail to start

#### Missing Observability Configs
- **Referenced in `docker-compose.observability.yml`**:
  - `../../configs/observability/prometheus.yml` (line 46)
  - `../../configs/observability/prometheus-alerts.yml` (line 47)
  - `../../configs/observability/alertmanager.yml` (line 78)
  - `../../configs/observability/loki-config.yml` (line 107)
  - `../../configs/observability/promtail-config.yml` (line 136)
  - `../../configs/observability/grafana-datasources.yml` (line 168)
  - `../../configs/observability/dashboards/` (line 169)
- **Impact**: Entire observability stack will fail to start

#### Missing Postgres Init Scripts
- **Referenced**: `../../scripts/postgres-init` (in `docker-compose.base.yml:48`)
- **Actual Location**: Directory exists but is empty
- **Impact**: Multiple databases won't be auto-created (letta, twenty, dify, n8n, litellm, activepieces)

### 2. **Missing Environment Variables** (High Priority)

Required environment variables are not set in `.env` file:

```bash
# Critical missing secrets (required for container startup)
POSTGRES_PASSWORD=                    # PostgreSQL won't start without this
REDIS_PASSWORD=                       # Redis authentication will fail
FALKORDB_PASSWORD=                    # FalkorDB authentication will fail

# LLM API Keys (services will fail to connect to AI providers)
ANTHROPIC_API_KEY=                    # Claude API calls will fail
GOOGLE_API_KEY=                       # Gemini API calls will fail

# Service Secrets (services will start with insecure defaults)
NEXUS_JWT_SECRET=                     # Security vulnerability
NEXUS_ADMIN_TOKEN=                    # Security vulnerability
LITELLM_MASTER_KEY=                   # Security vulnerability
N8N_BASIC_AUTH_PASSWORD=              # N8N will be insecure
N8N_ENCRYPTION_KEY=                   # Data encryption disabled
DIFY_SECRET_KEY=                      # Dify security compromised
DIFY_ENCRYPTION_KEY=                  # Data encryption disabled
TWENTY_ACCESS_TOKEN_SECRET=           # CRM security compromised
TWENTY_LOGIN_TOKEN_SECRET=            # CRM security compromised
TWENTY_REFRESH_TOKEN_SECRET=          # CRM security compromised
TWENTY_FILE_TOKEN_SECRET=             # CRM security compromised
LETTA_API_KEY=                        # Letta API authentication disabled
LETTA_SERVER_PASSWORD=                # Letta security compromised
ACTIVEPIECES_API_KEY=                 # Activepieces security compromised
AP_ENCRYPTION_KEY=                    # Data encryption disabled
AP_JWT_SECRET=                        # Security vulnerability
GRAFANA_ADMIN_PASSWORD=               # Grafana uses default password
```

### 3. **Missing Service Dockerfiles** (Medium Priority)

Build contexts reference Dockerfiles that may not exist:

- `../../infra/docker/build/services/mem0-rest/Dockerfile`
- `../../infra/docker/build/services/quote-engine/Dockerfile`
- `../../infra/docker/build/services/campaign-engine/Dockerfile`
- `../../infra/docker/build/services/quote-api/Dockerfile`
- `../../infra/docker/build/services/nyra-orchestrator/Dockerfile`

### 4. **Port Conflicts** (Medium Priority)

Potential port conflicts detected:

| Service | Port | Conflict Risk |
|---------|------|---------------|
| TwentyCRM | 3000 | Conflicts with Grafana default (changed to 3005) |
| Grafana | 3005 | Moved from 3000 to avoid conflict |
| Redis | 6380 | Non-standard port (avoiding FalkorDB 6379) |
| FalkorDB | 6380 | Uses same port as Redis! ⚠️ |

### 5. **Missing Data Directories** (Low Priority)

Referenced but potentially missing:

- `../../data/campaigns` (in `docker-compose.business.yml:71`)

### 6. **Obsolete Docker Compose Version Syntax** (Low Priority)

All compose files use `version: '3.8'` which is now obsolete and generates warnings:

```
level=warning msg="the attribute `version` is obsolete"
```

---

## ✅ Recommended Fixes

### Fix 1: Create Missing Configuration Files

#### 1a. Create Nexus Router Config

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/nexus/nexus.toml`

```toml
# Nexus Router Configuration
# Unified LLM Gateway for Project Nyra

[server]
host = "0.0.0.0"
port = 3000

[providers]
# Anthropic (Claude)
[providers.anthropic]
type = "anthropic"
api_key_env = "ANTHROPIC_API_KEY"
models = ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"]

# OpenRouter (fallback)
[providers.openrouter]
type = "openai_compatible"
api_key_env = "OPENROUTER_API_KEY"
base_url = "https://openrouter.ai/api/v1"
models = ["anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5"]

# Google (Gemini)
[providers.google]
type = "google"
api_key_env = "GOOGLE_API_KEY"
models = ["gemini-1.5-pro", "gemini-1.5-flash"]

# LiteLLM Proxy (local)
[providers.litellm]
type = "openai_compatible"
base_url = "http://litellm:4000"
models = ["*"]

[routing]
strategy = "least_latency"
fallback_enabled = true
retry_attempts = 3
timeout_seconds = 120

[logging]
level = "info"
format = "json"
```

#### 1b. Create LiteLLM Config

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/litellm/config.yaml`

```yaml
model_list:
  # Anthropic Models
  - model_name: claude-3-5-sonnet-20241022
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-3-opus-20240229
    litellm_params:
      model: anthropic/claude-3-opus-20240229
      api_key: os.environ/ANTHROPIC_API_KEY

  # OpenRouter Models
  - model_name: deepseek-r1
    litellm_params:
      model: openrouter/deepseek/deepseek-r1
      api_key: os.environ/OPENROUTER_API_KEY
      api_base: https://openrouter.ai/api/v1

  # Google Models
  - model_name: gemini-1.5-pro
    litellm_params:
      model: google/gemini-1.5-pro
      api_key: os.environ/GOOGLE_API_KEY

litellm_settings:
  drop_params: true
  set_verbose: false
  success_callback: ["prometheus"]
  failure_callback: ["prometheus"]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL
```

#### 1c. Create Observability Configs

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/observability/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'nyra-production'
    replica: 'prometheus-1'

rule_files:
  - /etc/prometheus/alerts/alerts.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # cAdvisor (container metrics)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  # LiteLLM
  - job_name: 'litellm'
    static_configs:
      - targets: ['litellm:4000']
```

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/observability/prometheus-alerts.yml`

```yaml
groups:
  - name: service_health
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 5 minutes."

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 90% for more than 5 minutes."

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes."
```

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/observability/alertmanager.yml`

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: critical

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://localhost:5001/webhook'
        send_resolved: true

  - name: 'critical'
    webhook_configs:
      - url: 'http://localhost:5001/webhook/critical'
        send_resolved: true
```

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/observability/loki-config.yml`

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://alertmanager:9093

limits_config:
  retention_period: 30d
  ingestion_rate_mb: 10
  ingestion_burst_size_mb: 20
```

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/observability/promtail-config.yml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log

  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'logstream'
```

**File**: `/home/ellisapotheosis/projects/project-nyra/infra/configs/observability/grafana-datasources.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true

  - name: PostgreSQL
    type: postgres
    url: postgres:5432
    database: nyra_db
    user: $POSTGRES_USER
    secureJsonData:
      password: $POSTGRES_PASSWORD
    jsonData:
      sslmode: disable
      maxOpenConns: 10
      maxIdleConns: 10
      connMaxLifetime: 14400
    editable: true
```

#### 1d. Create Postgres Init Script

**File**: `/home/ellisapotheosis/projects/project-nyra/scripts/postgres-init/01-create-databases.sh`

```bash
#!/bin/bash
set -e

# Create multiple databases for different services
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Create databases
    CREATE DATABASE letta;
    CREATE DATABASE twenty;
    CREATE DATABASE dify;
    CREATE DATABASE n8n;
    CREATE DATABASE litellm;
    CREATE DATABASE activepieces;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE letta TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE twenty TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE dify TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE n8n TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE litellm TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE activepieces TO $POSTGRES_USER;

    -- Enable extensions
    \\c letta
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    \\c twenty
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \\c dify
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \\c nyra_db
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOSQL

echo "✅ All databases created successfully!"
```

### Fix 2: Generate Secure Environment Variables

Create a script to generate all required secrets:

**File**: `/home/ellisapotheosis/projects/project-nyra/scripts/generate-secrets.sh`

```bash
#!/bin/bash
# Generate secure secrets for Project Nyra

set -e

ENV_FILE="/home/ellisapotheosis/projects/project-nyra/.env"

echo "🔐 Generating secure secrets for Project Nyra..."

# Check if .env exists, if not copy from .env.example
if [ ! -f "$ENV_FILE" ]; then
    cp "${ENV_FILE}.example" "$ENV_FILE"
    echo "✅ Created .env from .env.example"
fi

# Generate secrets
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
FALKORDB_PASSWORD=$(openssl rand -hex 32)
NEXUS_JWT_SECRET=$(openssl rand -hex 32)
NEXUS_ADMIN_TOKEN=$(openssl rand -hex 32)
LITELLM_MASTER_KEY="sk-$(openssl rand -hex 32)"
N8N_BASIC_AUTH_PASSWORD=$(openssl rand -base64 16)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
DIFY_SECRET_KEY=$(openssl rand -hex 32)
DIFY_ENCRYPTION_KEY=$(openssl rand -hex 32)
TWENTY_ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
TWENTY_LOGIN_TOKEN_SECRET=$(openssl rand -hex 32)
TWENTY_REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
TWENTY_FILE_TOKEN_SECRET=$(openssl rand -hex 32)
LETTA_API_KEY=$(openssl rand -hex 32)
LETTA_SERVER_PASSWORD=$(openssl rand -base64 16)
ACTIVEPIECES_API_KEY=$(openssl rand -hex 32)
AP_ENCRYPTION_KEY=$(openssl rand -hex 32)
AP_JWT_SECRET=$(openssl rand -hex 32)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)

# Update .env file (using sed for in-place replacement)
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" "$ENV_FILE"
sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${REDIS_PASSWORD}|" "$ENV_FILE"
sed -i "s|^FALKORDB_PASSWORD=.*|FALKORDB_PASSWORD=${FALKORDB_PASSWORD}|" "$ENV_FILE"
sed -i "s|^NEXUS_JWT_SECRET=.*|NEXUS_JWT_SECRET=${NEXUS_JWT_SECRET}|" "$ENV_FILE"
sed -i "s|^NEXUS_ADMIN_TOKEN=.*|NEXUS_ADMIN_TOKEN=${NEXUS_ADMIN_TOKEN}|" "$ENV_FILE"
sed -i "s|^LITELLM_MASTER_KEY=.*|LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}|" "$ENV_FILE"
sed -i "s|^N8N_BASIC_AUTH_PASSWORD=.*|N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}|" "$ENV_FILE"
sed -i "s|^N8N_ENCRYPTION_KEY=.*|N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}|" "$ENV_FILE"
sed -i "s|^DIFY_SECRET_KEY=.*|DIFY_SECRET_KEY=${DIFY_SECRET_KEY}|" "$ENV_FILE"
sed -i "s|^DIFY_ENCRYPTION_KEY=.*|DIFY_ENCRYPTION_KEY=${DIFY_ENCRYPTION_KEY}|" "$ENV_FILE"
sed -i "s|^TWENTY_ACCESS_TOKEN_SECRET=.*|TWENTY_ACCESS_TOKEN_SECRET=${TWENTY_ACCESS_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^TWENTY_LOGIN_TOKEN_SECRET=.*|TWENTY_LOGIN_TOKEN_SECRET=${TWENTY_LOGIN_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^TWENTY_REFRESH_TOKEN_SECRET=.*|TWENTY_REFRESH_TOKEN_SECRET=${TWENTY_REFRESH_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^TWENTY_FILE_TOKEN_SECRET=.*|TWENTY_FILE_TOKEN_SECRET=${TWENTY_FILE_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^LETTA_API_KEY=.*|LETTA_API_KEY=${LETTA_API_KEY}|" "$ENV_FILE"
sed -i "s|^LETTA_SERVER_PASSWORD=.*|LETTA_SERVER_PASSWORD=${LETTA_SERVER_PASSWORD}|" "$ENV_FILE"
sed -i "s|^ACTIVEPIECES_API_KEY=.*|ACTIVEPIECES_API_KEY=${ACTIVEPIECES_API_KEY}|" "$ENV_FILE"
sed -i "s|^AP_ENCRYPTION_KEY=.*|AP_ENCRYPTION_KEY=${AP_ENCRYPTION_KEY}|" "$ENV_FILE"
sed -i "s|^AP_JWT_SECRET=.*|AP_JWT_SECRET=${AP_JWT_SECRET}|" "$ENV_FILE"
sed -i "s|^GRAFANA_ADMIN_PASSWORD=.*|GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}|" "$ENV_FILE"

echo "✅ All secrets generated and saved to .env"
echo ""
echo "⚠️  IMPORTANT: You still need to manually add:"
echo "   - ANTHROPIC_API_KEY (get from https://console.anthropic.com)"
echo "   - GOOGLE_API_KEY (get from https://aistudio.google.com/apikey)"
echo "   - OPENROUTER_API_KEY (optional, get from https://openrouter.ai)"
echo ""
echo "📋 Generated secrets:"
echo "   PostgreSQL Password: ${POSTGRES_PASSWORD:0:16}..."
echo "   Redis Password: ${REDIS_PASSWORD:0:16}..."
echo "   Grafana Admin Password: ${GRAFANA_ADMIN_PASSWORD}"
```

### Fix 3: Fix Port Conflict (FalkorDB vs Redis)

**Edit**: `/home/ellisapotheosis/projects/project-nyra/infra/docker-compose/docker-compose.databases.yml`

Change FalkorDB port from 6380 to 6381:

```yaml
falkordb:
  # ... existing config ...
  ports:
    - "${FALKORDB_PORT:-6381}:6379"  # Changed from 6380 to 6381
```

### Fix 4: Remove Obsolete Version Declarations

Remove `version: '3.8'` from all Docker Compose files (it's now ignored by Docker Compose v2+).

---

## 📋 Execution Plan

### Phase 1: Create Missing Configs (Priority 1)
1. ✅ Create `/infra/configs/` directory structure
2. ✅ Create Nexus Router config
3. ✅ Create LiteLLM config
4. ✅ Create all Observability configs
5. ✅ Create Postgres init script with execute permissions
6. ✅ Create Grafana dashboards directory

### Phase 2: Generate Secrets (Priority 1)
1. ✅ Create `generate-secrets.sh` script
2. ✅ Run script to populate `.env` with secure values
3. ⚠️ Manually add API keys (ANTHROPIC, GOOGLE, OPENROUTER)

### Phase 3: Fix Port Conflicts (Priority 2)
1. ✅ Change FalkorDB port to 6381
2. ✅ Update `.env.example` with new port

### Phase 4: Create Missing Dockerfiles (Priority 2)
1. Create Dockerfile for `mem0-rest`
2. Create Dockerfile for `quote-engine`
3. Create Dockerfile for `campaign-engine`
4. Create Dockerfile for `quote-api`
5. Create Dockerfile for `nyra-orchestrator`

### Phase 5: Test Services (Priority 3)
1. Test base services: `docker compose -f docker-compose.base.yml up -d`
2. Test databases: `docker compose -f docker-compose.databases.yml up -d`
3. Test AI stack: `docker compose -f docker-compose.ai.yml up -d`
4. Test full stack: `docker compose up -d`

---

## 🧪 Validation Commands

```bash
# Validate syntax
cd /home/ellisapotheosis/projects/project-nyra/infra/docker-compose
docker compose config --quiet

# Check for missing environment variables
docker compose config | grep -i "warning"

# Test individual stacks
docker compose -f docker-compose.base.yml up -d
docker compose -f docker-compose.base.yml ps

# Check logs for errors
docker compose logs postgres redis
docker compose logs nexus litellm letta

# Health check all services
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

---

## 📊 Status Summary

| Component | Status | Priority | Estimated Fix Time |
|-----------|--------|----------|-------------------|
| Config Files | 🔴 Missing | P1 | 30 minutes |
| Environment Variables | 🔴 Missing | P1 | 10 minutes |
| Port Conflicts | 🟡 Conflict | P2 | 5 minutes |
| Dockerfiles | 🟡 Missing | P2 | 2 hours |
| Version Syntax | 🟢 Warning only | P3 | 5 minutes |

**Total Estimated Fix Time**: ~3 hours

---

## 🎯 Next Steps

1. **Run the script to create all configs**: Execute provided file creation commands
2. **Generate secrets**: Run `./scripts/generate-secrets.sh`
3. **Add API keys manually**: Edit `.env` and add ANTHROPIC_API_KEY, GOOGLE_API_KEY
4. **Fix port conflict**: Edit `docker-compose.databases.yml`
5. **Test base services**: Start PostgreSQL and Redis first
6. **Gradually bring up services**: Test each stack independently before full deployment
