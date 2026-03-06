# Claude Flow V3 Alpha Production Container

Production-ready Docker container for Claude Flow using `@claude-flow/cli@alpha` (latest alpha version).

## Features

- **Node.js 22 Alpine** - Minimal, secure base image
- **@claude-flow/cli@alpha** - Latest alpha features and improvements
- **Infisical Integration** - Automatic secret injection from Infisical
- **Nexus Router Integration** - Routes LLM requests through Nexus on port 6000
- **Multi-stage Build** - Optimized for production deployment
- **Health Checks** - Using `claude-flow status` command
- **Persistent Volumes** - Separate volumes for data, logs, memory, sessions, cache
- **Non-root User** - Runs as `claude-flow:nodejs` (UID 1001:GID 1001)
- **Signal Handling** - Uses `tini` for proper process management
- **Auto-initialization** - Runs `claude-flow init --docker` on startup

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Claude Flow Alpha Container                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  @claude-flow/cli@alpha MCP Server (Port 3000)      │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │  Nexus Router Integration (Port 6000)               │   │
│  │  - Anthropic Claude                                  │   │
│  │  - OpenAI GPT                                        │   │
│  │  - Google Gemini                                     │   │
│  │  - OpenRouter (DeepSeek-R1)                         │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │  Memory System Integration                           │   │
│  │  - AgentDB (HNSW vector search)                     │   │
│  │  - RuVector (optimization)                          │   │
│  │  - Mem0 (universal memory)                          │   │
│  │  - Letta (conversational memory)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Persistent Volumes:                                        │
│  /app/data, /app/logs, /app/.claude-flow,                  │
│  /app/cache, /app/sessions, /app/memory                    │
└─────────────────────────────────────────────────────────────┘
```

## Build

### Using Docker

```bash
# Build from project root
docker build -f infra/docker/build/claude-flow.Dockerfile -t claude-flow:alpha .

# Build with build args
docker build \
  -f infra/docker/build/claude-flow.Dockerfile \
  --build-arg VERSION=3.0.0-alpha.110 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  -t claude-flow:alpha .
```

### Using Docker Compose

```bash
# Build and start the service
docker-compose -f infra/docker/apps/docker-compose.apps.yml up -d claude-flow-alpha

# Rebuild after changes
docker-compose -f infra/docker/apps/docker-compose.apps.yml build claude-flow-alpha
docker-compose -f infra/docker/apps/docker-compose.apps.yml up -d claude-flow-alpha

# View logs
docker-compose -f infra/docker/apps/docker-compose.apps.yml logs -f claude-flow-alpha
```

## Configuration

### Required Environment Variables

#### Infisical (Secrets Management)
```bash
INFISICAL_TOKEN=st.xxx.xxx.xxx              # Infisical service token
INFISICAL_ENV=production                     # Environment (dev/staging/production)
INFISICAL_PATH=/nyra/claude-flow            # Infisical secret path
```

#### API Keys (Direct or from Infisical)
```bash
ANTHROPIC_API_KEY=sk-ant-xxx                # Anthropic Claude API key
OPENAI_API_KEY=sk-xxx                       # OpenAI API key
GOOGLE_API_KEY=xxx                          # Google Gemini API key
OPENROUTER_API_KEY=sk-or-xxx               # OpenRouter API key
```

#### Optional Configuration
```bash
LOG_LEVEL=info                              # Logging level (debug/info/warn/error)
BUILD_DATE=2026-01-22T00:00:00Z            # Build timestamp
GIT_COMMIT=abc1234                          # Git commit hash
```

### Volumes

The container uses 6 persistent volumes:

| Volume | Path | Purpose |
|--------|------|---------|
| `claude-flow-alpha-data` | `/app/data` | Agent data, databases, persistent state |
| `claude-flow-alpha-logs` | `/app/logs` | Application logs (JSON format) |
| `claude-flow-alpha-claude-flow` | `/app/.claude-flow` | Claude Flow internal configuration |
| `claude-flow-alpha-cache` | `/app/cache` | Temporary cache, embeddings |
| `claude-flow-alpha-sessions` | `/app/sessions` | Session state, conversation history |
| `claude-flow-alpha-memory` | `/app/memory` | Memory system data (HNSW indices, vectors) |

### Networks

The service connects to 3 networks:

- **nyra-apps** - Application-level services (Twenty, n8n, Dify)
- **nyra-mcp** - MCP servers (Nexus, Letta, Mem0, AgentDB, RuVector)
- **nyra-core** - Core infrastructure (PostgreSQL, Redis, Qdrant)

## Usage

### Starting the Container

```bash
# With Infisical (recommended for production)
docker run -d \
  --name claude-flow-alpha \
  -p 3000:3000 \
  -e INFISICAL_TOKEN=st.xxx.xxx.xxx \
  -e INFISICAL_ENV=production \
  -v claude-flow-data:/app/data \
  -v claude-flow-logs:/app/logs \
  -v claude-flow-cf:/app/.claude-flow \
  --network nyra-mcp \
  claude-flow:alpha

# Without Infisical (development)
docker run -d \
  --name claude-flow-alpha \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  -e OPENAI_API_KEY=sk-xxx \
  -v claude-flow-data:/app/data \
  -v claude-flow-logs:/app/logs \
  --network nyra-mcp \
  claude-flow:alpha
```

### Health Checks

```bash
# Check container health
docker ps --filter name=claude-flow-alpha --format "table {{.Names}}\t{{.Status}}"

# Check using Claude Flow status
docker exec nyra-claude-flow-alpha npx @claude-flow/cli@latest status

# Check MCP server endpoint
curl http://localhost:3000/health
```

### Accessing Logs

```bash
# View container logs
docker logs -f nyra-claude-flow-alpha

# View Claude Flow application logs
docker exec nyra-claude-flow-alpha cat /app/logs/claude-flow.log

# Stream application logs
docker exec nyra-claude-flow-alpha tail -f /app/logs/claude-flow.log
```

### Debugging

```bash
# Access shell in running container
docker exec -it nyra-claude-flow-alpha sh

# Check Claude Flow CLI version
docker exec nyra-claude-flow-alpha npx @claude-flow/cli@latest --version

# View configuration
docker exec nyra-claude-flow-alpha cat /app/claude-flow.config.json

# List installed packages
docker exec nyra-claude-flow-alpha npm list -g --depth=0
```

## Integration with Nyra Services

### Nexus Router (LLM Gateway)

The container automatically routes all LLM requests through Nexus Router on port 6000:

```javascript
// In claude-flow.config.json
{
  "providers": {
    "default": "anthropic",
    "fallback": ["openai", "google", "ollama"],
    "loadBalancing": {
      "enabled": true,
      "strategy": "cost-based"
    }
  }
}
```

Environment variable sets the endpoint:
```bash
NEXUS_ROUTER_URL=http://nexus-router:6000
```

### Memory System Integration

Connects to all Nyra memory services:

| Service | URL | Purpose |
|---------|-----|---------|
| AgentDB | `http://agentdb:8080` | HNSW vector search (150x faster) |
| RuVector | `http://ruvector:8888` | Memory optimization |
| Mem0 | `http://mem0:4321` | Universal memory layer |
| Letta | `http://letta:8283` | Conversational memory |

### TwentyCRM Integration

Access CRM data through service discovery:
```bash
TWENTY_BASE_URL=http://twenty:3000
```

### n8n Workflow Integration

Trigger workflows programmatically:
```bash
N8N_BASE_URL=http://n8n:5678
```

## Monitoring

### Prometheus Metrics

Metrics exposed on port 9090 (if enabled):
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'claude-flow'
    static_configs:
      - targets: ['claude-flow-alpha:9090']
```

### Grafana Dashboard

Import the Claude Flow dashboard from `infra/monitoring/grafana/dashboards/claude-flow.json`.

### Log Aggregation

Logs are in JSON format and can be ingested by Loki:

```yaml
# promtail.yml
scrape_configs:
  - job_name: claude-flow
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: 'nyra-claude-flow-alpha'
        action: keep
```

## Security

### Non-root User

The container runs as user `claude-flow` (UID 1001):
```dockerfile
USER claude-flow
```

### Secret Injection

Secrets are injected at runtime using Infisical:
```bash
infisical run --token=$INFISICAL_TOKEN -- npx @claude-flow/cli@latest mcp start
```

Never hardcode secrets in the image or docker-compose.yml.

### Network Isolation

The service only connects to required networks and has no direct internet access (except through Nexus Router).

## Troubleshooting

### Container fails to start

1. Check Infisical token is valid:
```bash
docker run --rm -e INFISICAL_TOKEN=$INFISICAL_TOKEN infisical/cli secrets
```

2. Check Nexus Router is running:
```bash
docker ps --filter name=nexus-router
curl http://localhost:6000/health
```

3. Check logs for errors:
```bash
docker logs nyra-claude-flow-alpha
```

### MCP server not responding

1. Check health status:
```bash
docker exec nyra-claude-flow-alpha npx @claude-flow/cli@latest status
```

2. Restart the service:
```bash
docker-compose -f infra/docker/apps/docker-compose.apps.yml restart claude-flow-alpha
```

3. Check port binding:
```bash
docker port nyra-claude-flow-alpha
netstat -tuln | grep 3000
```

### Memory issues

1. Check container resource usage:
```bash
docker stats nyra-claude-flow-alpha
```

2. Check volume sizes:
```bash
docker system df -v | grep claude-flow
```

3. Clear cache:
```bash
docker exec nyra-claude-flow-alpha rm -rf /app/cache/*
```

## Maintenance

### Updating to Latest Alpha

```bash
# Pull latest version
docker pull ghcr.io/ruvnet/claude-flow:alpha

# Or rebuild from source
docker-compose -f infra/docker/apps/docker-compose.apps.yml build --no-cache claude-flow-alpha
docker-compose -f infra/docker/apps/docker-compose.apps.yml up -d claude-flow-alpha
```

### Backup Volumes

```bash
# Backup all Claude Flow volumes
docker run --rm \
  -v claude-flow-alpha-data:/data \
  -v claude-flow-alpha-logs:/logs \
  -v claude-flow-alpha-memory:/memory \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/claude-flow-backup-$(date +%Y%m%d-%H%M%S).tar.gz /data /logs /memory
```

### Restore from Backup

```bash
# Restore volumes from backup
docker run --rm \
  -v claude-flow-alpha-data:/data \
  -v claude-flow-alpha-logs:/logs \
  -v claude-flow-alpha-memory:/memory \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/claude-flow-backup-20260122-120000.tar.gz
```

## Performance Tuning

### Resource Limits

Adjust in docker-compose.apps.yml:

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

### Memory Configuration

Optimize in claude-flow.config.json:

```json
{
  "memory": {
    "maxEntries": 100000,
    "hnsw": {
      "m": 32,
      "ef": 400
    },
    "quantization": {
      "enabled": true,
      "bits": 8
    }
  }
}
```

## Support

For issues or questions:
- Claude Flow GitHub: https://github.com/ruvnet/claude-flow
- Project Nyra Documentation: `ToDo/whitepaper-workflow/`
- Container Logs: `docker logs nyra-claude-flow-alpha`

## License

MIT License - See LICENSE file in project root
