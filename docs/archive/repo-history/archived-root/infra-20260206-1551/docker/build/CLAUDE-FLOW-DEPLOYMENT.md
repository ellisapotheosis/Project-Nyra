# Claude Flow V3 Alpha - Production Deployment Summary

**Created**: 2026-01-22
**Status**: Production-Ready
**Version**: 3.0.0-alpha

## Overview

This deployment provides a production-ready Docker container for Claude Flow V3 using `@claude-flow/cli@alpha` with full integration into Project Nyra's infrastructure.

## Files Created

### 1. Dockerfile
**Location**: `infra/docker/build/claude-flow.Dockerfile`

**Features**:
- Multi-stage build (builder → production)
- Node.js 22 Alpine base
- @claude-flow/cli@alpha installation
- Infisical secret injection
- Non-root user (claude-flow:1001)
- Health checks via `claude-flow status`
- Auto-initialization with `--docker` flag
- Tini for signal handling

**Key Configuration**:
```dockerfile
# Exposes port 3000 for MCP server
EXPOSE 3000

# Health check every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3

# Connects to Nexus Router on port 6000
ENV NEXUS_ROUTER_URL=http://nexus-router:6000
```

### 2. Docker Compose Service
**Location**: `infra/docker/apps/docker-compose.apps.yml`

**Service Name**: `claude-flow-alpha`

**Configuration Highlights**:
- **Build Context**: Project root with Dockerfile path
- **Port**: 3000 (MCP server)
- **Networks**: nyra-apps, nyra-mcp, nyra-core
- **Volumes**: 6 persistent volumes for data, logs, memory, sessions, cache, .claude-flow
- **Dependencies**: Nexus Router (with health check condition)
- **Environment**: 40+ environment variables for full configuration

**Volumes**:
```yaml
claude-flow-alpha-data          # /app/data
claude-flow-alpha-logs          # /app/logs
claude-flow-alpha-claude-flow   # /app/.claude-flow
claude-flow-alpha-cache         # /app/cache
claude-flow-alpha-sessions      # /app/sessions
claude-flow-alpha-memory        # /app/memory
```

### 3. Documentation
**Location**: `infra/docker/build/claude-flow.README.md`

**Contents**:
- Architecture diagram
- Build instructions
- Configuration guide
- Usage examples
- Integration details
- Monitoring setup
- Troubleshooting guide
- Maintenance procedures

### 4. Environment Template
**Location**: `infra/docker/build/.env.claude-flow.example`

**Sections**:
- Infisical secrets management
- API keys (Anthropic, OpenAI, Google, OpenRouter)
- Claude Flow configuration
- Nexus Router integration
- Memory system URLs
- Feature flags
- Performance tuning
- Security settings
- Monitoring configuration

### 5. Management Script
**Location**: `infra/docker/build/claude-flow.sh`

**Commands**:
```bash
./claude-flow.sh build          # Build container
./claude-flow.sh start          # Start service
./claude-flow.sh logs           # View logs
./claude-flow.sh status         # Check status
./claude-flow.sh health         # Health checks
./claude-flow.sh backup         # Backup volumes
./claude-flow.sh restore <file> # Restore from backup
./claude-flow.sh update         # Update to latest
```

## Quick Start

### 1. Configure Environment

```bash
# Copy environment template
cp infra/docker/build/.env.claude-flow.example .env

# Edit with your values
nano .env  # or vim, code, etc.
```

**Required Variables**:
- `INFISICAL_TOKEN` - For secret injection (recommended)
- OR individual API keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.

### 2. Build Container

```bash
# Option A: Using management script (recommended)
./infra/docker/build/claude-flow.sh build

# Option B: Using docker-compose
docker-compose -f infra/docker/apps/docker-compose.apps.yml build claude-flow-alpha

# Option C: Using docker directly
docker build -f infra/docker/build/claude-flow.Dockerfile -t claude-flow:alpha .
```

### 3. Start Service

```bash
# Option A: Using management script
./infra/docker/build/claude-flow.sh start

# Option B: Using docker-compose
docker-compose -f infra/docker/apps/docker-compose.apps.yml up -d claude-flow-alpha

# Option C: Start all Nyra services (including claude-flow-alpha)
docker-compose -f infra/docker/docker-compose.yml up -d
```

### 4. Verify Deployment

```bash
# Check container status
docker ps --filter name=nyra-claude-flow-alpha

# Check health
docker exec nyra-claude-flow-alpha npx @claude-flow/cli@latest status

# Check MCP endpoint
curl http://localhost:3000/health

# View logs
docker logs -f nyra-claude-flow-alpha
```

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Nyra Infrastructure                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  TwentyCRM   │    │     n8n      │    │     Dify     │     │
│  │  (Port 3000) │    │  (Port 5678) │    │  (Port 3001) │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│         │                    │                    │              │
│         └────────────────────┴────────────────────┘              │
│                              │                                   │
│                 ┌────────────┴────────────┐                     │
│                 │  Claude Flow Alpha      │                     │
│                 │  (Port 3000 - MCP)      │                     │
│                 │  - Mesh topology        │                     │
│                 │  - 8 max agents         │                     │
│                 │  - Balanced strategy    │                     │
│                 └────────────┬────────────┘                     │
│                              │                                   │
│                 ┌────────────┴────────────┐                     │
│                 │   Nexus Router          │                     │
│                 │   (Port 6000)           │                     │
│                 │   - Claude/OpenAI/etc   │                     │
│                 └────────────┬────────────┘                     │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│  ┌──────┴───────┐    ┌──────┴───────┐    ┌──────┴───────┐    │
│  │   AgentDB    │    │   RuVector   │    │    Mem0      │    │
│  │  (Port 8080) │    │  (Port 8888) │    │  (Port 4321) │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Integrations

### 1. Nexus Router (Port 6000)
- Routes all LLM requests
- Load balancing across providers
- Cost-based routing strategy
- Local LLM fallback (Ollama)

**Environment Variable**:
```bash
NEXUS_ROUTER_URL=http://nexus-router:6000
```

### 2. Memory System
- **AgentDB**: HNSW vector search (150x faster)
- **RuVector**: Memory optimization
- **Mem0**: Universal memory layer
- **Letta**: Conversational memory

**Environment Variables**:
```bash
AGENTDB_URL=http://agentdb:8080
RUVECTOR_URL=http://ruvector:8888
MEM0_REST_URL=http://mem0:4321
LETTA_BASE_URL=http://letta:8283
```

### 3. Infisical Secrets
- Automatic secret injection at runtime
- No secrets in code or configs
- Per-environment configuration

**Environment Variables**:
```bash
INFISICAL_TOKEN=st.xxx.xxx.xxx
INFISICAL_ENV=production
INFISICAL_PATH=/nyra/claude-flow
```

### 4. TwentyCRM Integration
- Service discovery via Docker DNS
- Direct API access

**Environment Variable**:
```bash
TWENTY_BASE_URL=http://twenty:3000
```

## Configuration

### From claude-flow.config.json

The container automatically copies and uses `claude-flow.config.json` from the project root:

**Key Settings**:
```json
{
  "swarm": {
    "topology": "mesh",
    "maxAgents": 8,
    "strategy": "balanced"
  },
  "memory": {
    "backend": "hybrid",
    "hnsw": {
      "enabled": true,
      "m": 32,
      "ef": 400
    }
  },
  "mcp": {
    "port": 3000,
    "transport": "stdio"
  },
  "providers": {
    "default": "anthropic",
    "fallback": ["openai", "google", "ollama"]
  }
}
```

### Runtime Initialization

On startup, the container runs:
```bash
npx @claude-flow/cli@latest init --docker --yes
```

This initializes:
- Memory database with HNSW indexing
- Session persistence
- Neural pattern training
- Hooks system
- Background daemon

## Security Features

### 1. Non-root User
```dockerfile
USER claude-flow  # UID 1001, GID 1001
```

### 2. Secret Injection
Secrets are injected at runtime, never stored in image:
```bash
infisical run --token=$INFISICAL_TOKEN -- npx @claude-flow/cli@latest mcp start
```

### 3. Network Isolation
- Only connects to required networks
- No direct internet access (via Nexus Router only)
- Internal service discovery via Docker DNS

### 4. Input Validation
From config:
```json
{
  "security": {
    "mode": "strict",
    "inputValidation": true,
    "pathValidation": true,
    "commandValidation": true
  }
}
```

## Monitoring

### Health Checks
- **Docker health check**: Every 30s using `claude-flow status`
- **MCP endpoint**: `http://localhost:3000/health`
- **Start period**: 60s for initialization

### Prometheus Metrics
Exposed on port 9090 (if enabled):
```yaml
scrape_configs:
  - job_name: 'claude-flow-alpha'
    static_configs:
      - targets: ['claude-flow-alpha:9090']
```

### Logging
- **Format**: JSON
- **Location**: `/app/logs/claude-flow.log`
- **Level**: Configurable via `LOG_LEVEL` env var
- **Aggregation**: Loki-compatible

## Performance Tuning

### Resource Limits

Add to docker-compose.apps.yml service:
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 8G
    reservations:
      cpus: '2.0'
      memory: 4G
```

### Memory Optimization

Configured in claude-flow.config.json:
- HNSW indexing: 150x-12,500x faster search
- Quantization: 50-75% memory reduction
- Flash Attention: 2.49x-7.47x speedup

### Swarm Configuration

**Mesh Topology** (default):
- Peer-to-peer coordination
- Parallel execution
- 8 max agents
- Balanced strategy

## Backup & Recovery

### Automated Backups

```bash
# Create backup
./infra/docker/build/claude-flow.sh backup

# Backups stored in: backups/claude-flow-backup-<timestamp>.tar.gz
```

**Backup Contents**:
- `/app/data` - Agent data, databases
- `/app/logs` - Application logs
- `/app/memory` - Memory system data, HNSW indices

### Restore from Backup

```bash
./infra/docker/build/claude-flow.sh restore backups/claude-flow-backup-20260122-120000.tar.gz
```

### Manual Backup

```bash
docker run --rm \
  -v claude-flow-alpha-data:/data \
  -v claude-flow-alpha-logs:/logs \
  -v claude-flow-alpha-memory:/memory \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/manual-backup.tar.gz /data /logs /memory
```

## Troubleshooting

### Container won't start

1. Check Infisical token:
```bash
docker run --rm -e INFISICAL_TOKEN=$INFISICAL_TOKEN infisical/cli secrets
```

2. Check Nexus Router dependency:
```bash
docker ps --filter name=nexus-router
curl http://localhost:6000/health
```

3. View startup logs:
```bash
docker logs nyra-claude-flow-alpha
```

### MCP server not responding

1. Check health:
```bash
docker exec nyra-claude-flow-alpha npx @claude-flow/cli@latest status
```

2. Check port:
```bash
curl http://localhost:3000/health
netstat -tuln | grep 3000
```

3. Restart service:
```bash
./infra/docker/build/claude-flow.sh restart
```

### Memory issues

1. Check usage:
```bash
docker stats nyra-claude-flow-alpha
```

2. Clear cache:
```bash
docker exec nyra-claude-flow-alpha rm -rf /app/cache/*
```

3. Increase limits in docker-compose.apps.yml

## Maintenance

### Update to Latest Alpha

```bash
# Automated update (with backup)
./infra/docker/build/claude-flow.sh update

# Manual update
docker-compose -f infra/docker/apps/docker-compose.apps.yml build --no-cache claude-flow-alpha
docker-compose -f infra/docker/apps/docker-compose.apps.yml up -d claude-flow-alpha
```

### Clean Installation

```bash
# WARNING: Destroys all data
./infra/docker/build/claude-flow.sh clean
```

### View Configuration

```bash
# View parsed config
docker exec nyra-claude-flow-alpha cat /app/claude-flow.config.json | jq .

# View environment
docker exec nyra-claude-flow-alpha env | grep CLAUDE_FLOW
```

## Production Checklist

- [ ] Copy `.env.claude-flow.example` to `.env` and configure
- [ ] Set `INFISICAL_TOKEN` for secret management
- [ ] Configure `ANTHROPIC_API_KEY` and other provider keys
- [ ] Verify Nexus Router is running on port 6000
- [ ] Ensure core networks exist: nyra-core, nyra-mcp, nyra-apps
- [ ] Build container: `./claude-flow.sh build`
- [ ] Start service: `./claude-flow.sh start`
- [ ] Verify health: `./claude-flow.sh health`
- [ ] Check MCP endpoint: `curl http://localhost:3000/health`
- [ ] Set up Prometheus scraping (port 9090)
- [ ] Configure Grafana dashboards
- [ ] Set up Loki log aggregation
- [ ] Schedule automated backups
- [ ] Test restore procedure
- [ ] Document any custom configuration

## Support & Resources

- **Dockerfile**: `infra/docker/build/claude-flow.Dockerfile`
- **Compose File**: `infra/docker/apps/docker-compose.apps.yml`
- **Documentation**: `infra/docker/build/claude-flow.README.md`
- **Management Script**: `infra/docker/build/claude-flow.sh`
- **Environment Template**: `infra/docker/build/.env.claude-flow.example`

- **Claude Flow GitHub**: https://github.com/ruvnet/claude-flow
- **Project Nyra Docs**: `ToDo/whitepaper-workflow/`
- **CLAUDE.md**: Root project configuration

---

**Deployment Date**: 2026-01-22
**Maintained By**: Project Nyra Team
**Version**: 3.0.0-alpha
