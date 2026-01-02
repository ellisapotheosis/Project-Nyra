# Claude-Flow Orchestrator - Docker Infrastructure

Complete Docker infrastructure for Claude-Flow orchestrator with LiteLLM integration, MetaMCP support, and RabbitMQ messaging for inter-orchestrator communication with Archon OS.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Orchestrator Network                       │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │  Claude-Flow │◄────►│   LiteLLM    │◄────►│ Anthropic│ │
│  │ Orchestrator │      │   Gateway    │      │   API    │ │
│  └──────┬───────┘      └──────────────┘      └──────────┘ │
│         │                                                   │
│         ├────────────┐                                      │
│         │            │                                      │
│    ┌────▼─────┐ ┌───▼──────┐      ┌──────────────┐       │
│    │ RabbitMQ │ │  Redis   │      │   MetaMCP    │       │
│    │ Messages │ │  Memory  │      │   Gateway    │       │
│    └────┬─────┘ └──────────┘      └──────────────┘       │
│         │                                                   │
│         ▼                                                   │
│    ┌──────────────┐                                        │
│    │  Archon OS   │                                        │
│    │ Orchestrator │                                        │
│    └──────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Features

- **Multi-stage Docker build** for optimized image size
- **LiteLLM integration** for unified LLM access
- **MetaMCP support** for MCP server coordination
- **RabbitMQ messaging** for inter-orchestrator communication
- **Redis backend** for shared state and memory
- **Prometheus metrics** for monitoring
- **Health checks** for all services
- **Persistent volumes** for data, logs, and sessions
- **Automatic hooks** for pre/post task coordination
- **Graceful shutdown** with session export

## 🚀 Quick Start

### 1. Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Git

### 2. Clone and Configure

```bash
# Navigate to infrastructure directory
cd infrastructure/dual-orchestrator/claude-flow

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or your preferred editor
```

### 3. Required Environment Variables

**Minimum required:**
```bash
# LiteLLM API Key (get from LiteLLM setup)
LITELLM_API_KEY=your_litellm_api_key_here

# RabbitMQ credentials
RABBITMQ_PASSWORD=secure_password_here

# Redis credentials
REDIS_PASSWORD=secure_password_here
```

**Optional but recommended:**
```bash
# Direct Anthropic API access (fallback)
ANTHROPIC_API_KEY=your_anthropic_key_here

# MetaMCP API key
METAMCP_API_KEY=your_metamcp_key_here

# GitHub integration
GITHUB_TOKEN=your_github_token_here
```

### 4. Build and Start

```bash
# Build the Docker image
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f claude-flow
```

### 5. Verify Installation

```bash
# Check service health
curl http://localhost:8090/health

# Check Prometheus metrics
curl http://localhost:8091/metrics

# View RabbitMQ management UI
open http://localhost:15672
# Login: admin / (your RABBITMQ_PASSWORD)
```

## 📊 Service Endpoints

| Service | Port | Endpoint | Description |
|---------|------|----------|-------------|
| Claude-Flow API | 8090 | http://localhost:8090 | Main API server |
| Health Check | 8090 | http://localhost:8090/health | Health status |
| Prometheus Metrics | 8091 | http://localhost:8091/metrics | Performance metrics |
| RabbitMQ AMQP | 5672 | amqp://localhost:5672 | Message queue |
| RabbitMQ Management | 15672 | http://localhost:15672 | Queue management UI |
| Redis | 6379 | redis://localhost:6379 | In-memory database |

## 🔧 Configuration

### Claude-Flow Configuration

Edit `config/claude-flow-config.yml` to customize:

- **Swarm topology**: mesh, hierarchical, ring, star
- **Agent limits**: Max concurrent agents
- **Model routing**: LiteLLM model selection
- **Memory settings**: TTL and storage limits
- **Hooks**: Pre/post task automation

### Docker Compose Customization

Edit `docker-compose.yml` to modify:

- Resource limits (CPU, memory)
- Network configuration
- Volume mounts
- Environment variables
- Service dependencies

## 🔌 Integration Guide

### With LiteLLM

```yaml
# LiteLLM automatically routes requests to optimal models
# Configure in config/claude-flow-config.yml

litellm:
  baseUrl: "http://litellm:4000"
  defaultModel: "gpt-4"
  models:
    - name: "gpt-4"
      maxTokens: 8192
    - name: "claude-3-opus"
      maxTokens: 4096
```

### With MetaMCP

```yaml
# MetaMCP provides unified MCP server access
# Configure in config/claude-flow-config.yml

metamcp:
  url: "http://metamcp:12008"
  servers:
    - name: "filesystem"
      enabled: true
    - name: "github"
      enabled: true
    - name: "memory"
      enabled: true
```

### With Archon OS

```bash
# RabbitMQ bridges communication between orchestrators
# Messages are automatically routed via topic exchange

# From Claude-Flow to Archon OS:
Routing Key: archon.tasks.execute
Exchange: orchestrator-exchange

# From Archon OS to Claude-Flow:
Routing Key: claudeflow.tasks.execute
Exchange: orchestrator-exchange
```

## 📝 Usage Examples

### Initialize a Swarm

```bash
# Using Claude-Flow CLI
docker exec claude-flow-orchestrator \
  npx claude-flow@alpha swarm init \
  --topology mesh \
  --max-agents 10

# Using API
curl -X POST http://localhost:8090/api/swarm/init \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "topology": "mesh",
    "maxAgents": 10,
    "strategy": "balanced"
  }'
```

### Spawn an Agent

```bash
# Using CLI
docker exec claude-flow-orchestrator \
  npx claude-flow@alpha agent spawn \
  --type coder \
  --capabilities "code-generation,code-review"

# Using API
curl -X POST http://localhost:8090/api/agent/spawn \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "type": "coder",
    "capabilities": ["code-generation", "code-review"]
  }'
```

### Orchestrate a Task

```bash
# Using CLI with hooks
docker exec claude-flow-orchestrator bash -c '
  npx claude-flow@alpha hooks pre-task --description "Implement REST API"
  npx claude-flow@alpha task orchestrate \
    --task "Build a REST API with authentication" \
    --max-agents 5 \
    --strategy adaptive
  npx claude-flow@alpha hooks post-task --task-id "task-123"
'

# Using API
curl -X POST http://localhost:8090/api/task/orchestrate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "task": "Build a REST API with authentication",
    "maxAgents": 5,
    "strategy": "adaptive",
    "priority": "high"
  }'
```

### Check Swarm Status

```bash
# Using CLI
docker exec claude-flow-orchestrator \
  npx claude-flow@alpha swarm status --verbose

# Using API
curl http://localhost:8090/api/swarm/status \
  -H "X-API-Key: your_api_key"
```

## 🔍 Monitoring & Debugging

### View Logs

```bash
# All services
docker compose logs -f

# Claude-Flow only
docker compose logs -f claude-flow

# Last 100 lines
docker compose logs --tail=100 claude-flow

# Filter by severity
docker compose logs claude-flow | grep ERROR
```

### Prometheus Metrics

```bash
# View all metrics
curl http://localhost:8091/metrics

# Filter specific metrics
curl http://localhost:8091/metrics | grep claude_flow_
```

### RabbitMQ Queue Monitoring

```bash
# List queues
docker exec rabbitmq-orchestrator \
  rabbitmqctl list_queues name messages consumers

# View queue details
docker exec rabbitmq-orchestrator \
  rabbitmqctl list_queues -p / name messages_ready messages_unacknowledged
```

### Redis Memory Inspection

```bash
# Connect to Redis
docker exec -it redis-orchestrator redis-cli -a $REDIS_PASSWORD

# View keys
KEYS claudeflow:*

# Get session data
GET claudeflow:session:SESSION_ID

# View memory usage
INFO memory
```

## 🐛 Troubleshooting

### Service Not Starting

```bash
# Check service status
docker compose ps

# View detailed logs
docker compose logs claude-flow

# Check environment variables
docker compose exec claude-flow env | grep LITELLM
```

### Connection Issues

```bash
# Test RabbitMQ connection
docker compose exec claude-flow nc -zv rabbitmq 5672

# Test Redis connection
docker compose exec claude-flow nc -zv redis 6379

# Test LiteLLM connection
docker compose exec claude-flow curl -f http://litellm:4000/health
```

### Memory Issues

```bash
# Check memory usage
docker stats claude-flow-orchestrator

# View Redis memory
docker exec redis-orchestrator redis-cli -a $REDIS_PASSWORD INFO memory

# Clear old sessions
docker exec redis-orchestrator redis-cli -a $REDIS_PASSWORD \
  --scan --pattern "claudeflow:session:*" | \
  xargs docker exec redis-orchestrator redis-cli -a $REDIS_PASSWORD DEL
```

## 🔄 Maintenance

### Update Claude-Flow

```bash
# Rebuild with latest version
docker compose build --no-cache claude-flow

# Restart service
docker compose up -d claude-flow
```

### Backup Data

```bash
# Backup volumes
docker run --rm \
  -v claude-flow-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/claude-flow-data-$(date +%Y%m%d).tar.gz /data

# Backup Redis
docker exec redis-orchestrator redis-cli -a $REDIS_PASSWORD SAVE
docker cp redis-orchestrator:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb
```

### Restore Data

```bash
# Restore volume
docker run --rm \
  -v claude-flow-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/claude-flow-data-YYYYMMDD.tar.gz -C /

# Restore Redis
docker cp ./backups/redis-YYYYMMDD.rdb redis-orchestrator:/data/dump.rdb
docker compose restart redis
```

## 📈 Performance Tuning

### Resource Limits

Edit `docker-compose.yml`:

```yaml
services:
  claude-flow:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Connection Pooling

Edit `config/claude-flow-config.yml`:

```yaml
redis:
  pool:
    min: 5
    max: 20

metamcp:
  pool:
    minConnections: 5
    maxConnections: 20
```

## 🔒 Security Best Practices

1. **Change default passwords** in `.env`
2. **Use strong API keys** (32+ characters)
3. **Enable TLS/SSL** for production
4. **Restrict network access** using firewall rules
5. **Regular security updates** for base images
6. **Monitor access logs** for suspicious activity
7. **Use secrets management** (Docker secrets, Vault)

## 🤝 Integration with Archon OS

### Message Routing

```javascript
// Claude-Flow → Archon OS
{
  "routingKey": "archon.tasks.execute",
  "exchange": "orchestrator-exchange",
  "payload": {
    "taskId": "task-123",
    "type": "analysis",
    "data": {...}
  }
}

// Archon OS → Claude-Flow
{
  "routingKey": "claudeflow.tasks.execute",
  "exchange": "orchestrator-exchange",
  "payload": {
    "taskId": "task-456",
    "type": "code-generation",
    "data": {...}
  }
}
```

### Shared Workspace

```bash
# Both orchestrators share /workspace volume
# Files written by one are immediately visible to the other

docker compose exec claude-flow \
  ls -la /workspace
```

## 📚 Additional Resources

- [Claude-Flow Documentation](https://github.com/ruvnet/claude-flow)
- [LiteLLM Documentation](https://docs.litellm.ai/)
- [MetaMCP Documentation](https://github.com/metaMCP/metamcp)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

For issues or questions:
- GitHub Issues: https://github.com/ruvnet/claude-flow/issues
- Discord Community: https://discord.gg/claude-flow
- Email: support@claude-flow.io

## 📄 License

This infrastructure configuration is part of Project Nyra and follows the project's license terms.
