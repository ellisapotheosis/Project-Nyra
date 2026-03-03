# Archon OS - Advanced Multi-Agent Orchestration System

Archon OS is a powerful Docker-based orchestration platform designed for coordinating multiple AI agents in complex workflows. It integrates with Claude Flow, MCP (Model Context Protocol), and LiteLLM for enterprise-grade agent management.

## Overview

Archon OS provides:
- **Multi-agent coordination** with various topologies (mesh, hierarchical, ring, star)
- **MCP server integration** for standardized tool interfaces
- **LiteLLM proxy support** for unified model access
- **Claude Flow hooks** for automatic coordination and memory management
- **Distributed task execution** with RabbitMQ message queue
- **Persistent storage** with PostgreSQL and Redis
- **Health monitoring** and metrics collection
- **RESTful API** for programmatic control

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Archon OS Core                      │
│  ┌────────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ API Server │  │ MCP      │  │ Agent Management  │   │
│  │ (Port 8092)│  │ Server   │  │ & Coordination    │   │
│  └────────────┘  └──────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼─────┐
    │ PostgreSQL │ │   Redis    │ │ RabbitMQ │
    │  (State)   │ │  (Cache)   │ │ (Queue)  │
    └────────────┘ └────────────┘ └──────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum (16GB recommended)
- Network: `orchestrator-network` (created separately)

## Quick Start

### 1. Create External Network

```bash
docker network create orchestrator-network
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required configuration:**
```env
# API Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-api03-your-key
LITELLM_API_KEY=your-litellm-key

# Security
ARCHON_API_KEY=your-secure-api-key
JWT_SECRET=your-jwt-secret-min-32-chars

# Database
POSTGRES_PASSWORD=change-me-secure-password
RABBITMQ_PASSWORD=change-me-queue-password
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f archon-os

# Check health
curl http://localhost:8092/health
```

### 4. Verify Installation

```bash
# Check all services are running
docker-compose ps

# Test API
curl -H "X-API-Key: your-api-key" http://localhost:8092/api/v1/agents

# Access RabbitMQ management
open http://localhost:15672
# Login: archon / archon_queue_pass
```

## Agent Management

### Creating Agents

Archon OS uses agent templates defined in YAML. Example templates are provided in `agent-templates/`.

**Via API:**
```bash
curl -X POST http://localhost:8092/api/v1/agents \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-researcher",
    "type": "researcher",
    "capabilities": ["research", "analysis"]
  }'
```

**Via Claude Flow:**
```bash
# Initialize swarm with coordination topology
npx claude-flow@alpha hooks pre-task --description "Initialize research swarm"

# Spawn agents using Claude Code Task tool in parallel
# These agents automatically use hooks for coordination
```

### Agent Types

Archon OS includes pre-configured agent types:

1. **Researcher** - Research and analysis
   - Capabilities: research, analysis, documentation
   - Resources: 1 CPU, 2GB RAM

2. **Coder** - Code generation and modification
   - Capabilities: code_generation, refactoring, debugging
   - Resources: 2 CPU, 4GB RAM

3. **Reviewer** - Code review and QA
   - Capabilities: code_review, testing, security_audit
   - Resources: 1 CPU, 2GB RAM

4. **Architect** - System design
   - Capabilities: system_design, architecture, planning
   - Resources: 2 CPU, 4GB RAM

5. **Coordinator** - Multi-agent coordination
   - Capabilities: coordination, task_distribution, monitoring
   - Resources: 1 CPU, 2GB RAM

6. **Optimizer** - Performance optimization
   - Capabilities: optimization, profiling, benchmarking
   - Resources: 2 CPU, 4GB RAM

### Swarm Coordination

Archon OS supports multiple coordination topologies:

**Mesh Topology** (default):
```yaml
# All agents can communicate directly
topology: mesh
max_connections: 10
discovery: automatic
```

**Hierarchical Topology**:
```yaml
# Tree structure with coordinator at root
topology: hierarchical
max_depth: 3
branching_factor: 5
```

**Ring Topology**:
```yaml
# Circular communication pattern
topology: ring
buffer_size: 1000
```

**Star Topology**:
```yaml
# Central coordinator with worker agents
topology: star
coordinator: adaptive
```

## Claude Flow Integration

Archon OS automatically integrates with Claude Flow hooks for seamless coordination.

### Hook Workflow

**Every agent spawned via Task tool should:**

1. **Before work:**
```bash
npx claude-flow@alpha hooks pre-task --description "Task description"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

2. **During work:**
```bash
# After each file edit
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/agent/component"

# Notify progress
npx claude-flow@alpha hooks notify --message "Completed phase X"
```

3. **After work:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

### Memory Coordination

Agents share state via the memory system:

```bash
# Store data
npx claude-flow@alpha memory store swarm/researcher/findings "Research results..."

# Retrieve data
npx claude-flow@alpha memory retrieve swarm/researcher/findings

# List all swarm memory
npx claude-flow@alpha memory list --prefix swarm/
```

## MCP Server Integration

Archon OS exposes MCP-compatible endpoints for tool integration.

### Available MCP Tools

- `archon_spawn_agent` - Create new agent
- `archon_assign_task` - Assign task to agent
- `archon_get_status` - Get agent status
- `archon_list_agents` - List all agents
- `archon_create_swarm` - Initialize swarm
- `archon_execute_task` - Execute task with coordination

### Using MCP Tools

**From Claude Desktop:**
```json
{
  "mcpServers": {
    "archon-os": {
      "url": "http://localhost:8092/mcp",
      "transport": "sse",
      "headers": {
        "X-API-Key": "your-api-key"
      }
    }
  }
}
```

## API Reference

### Core Endpoints

**Health Check:**
```bash
GET /health
Response: {"status": "healthy", "version": "1.0.0"}
```

**List Agents:**
```bash
GET /api/v1/agents
Headers: X-API-Key: your-key
Response: [{"id": "...", "name": "...", "status": "..."}]
```

**Create Agent:**
```bash
POST /api/v1/agents
Headers: X-API-Key: your-key
Body: {"name": "...", "type": "...", "capabilities": [...]}
```

**Assign Task:**
```bash
POST /api/v1/tasks
Headers: X-API-Key: your-key
Body: {
  "agent_id": "...",
  "description": "...",
  "priority": 3,
  "timeout": 300
}
```

**Get Task Status:**
```bash
GET /api/v1/tasks/{task_id}
Headers: X-API-Key: your-key
```

### Swarm Endpoints

**Initialize Swarm:**
```bash
POST /api/v1/swarms
Body: {
  "name": "research-swarm",
  "topology": "mesh",
  "max_agents": 10
}
```

**Add Agent to Swarm:**
```bash
POST /api/v1/swarms/{swarm_id}/agents
Body: {"agent_id": "...", "role": "worker"}
```

### Metrics Endpoint

Prometheus metrics available at:
```bash
GET http://localhost:8093/metrics
```

## Advanced Configuration

### Scaling Workers

Adjust worker count in `docker-compose.yml`:

```yaml
archon-worker:
  deploy:
    replicas: 4  # Number of worker instances
```

Or scale at runtime:
```bash
docker-compose up -d --scale archon-worker=8
```

### Custom Agent Templates

Create custom agent templates in `agent-templates/`:

```yaml
# agent-templates/my-agent.yml
name: "my-custom-agent"
type: "custom"
version: "1.0.0"

capabilities:
  - custom_capability_1
  - custom_capability_2

resources:
  cpu: 2
  memory: "4GB"

configuration:
  model: "claude-3-5-sonnet-20241022"
  temperature: 0.7

system_prompt: |
  Your agent's behavior definition...
```

### Resource Limits

Configure in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
    reservations:
      cpus: '2'
      memory: 4G
```

## Monitoring

### Prometheus Metrics

Available metrics include:
- `archon_agents_total` - Total agents
- `archon_agents_active` - Active agents
- `archon_tasks_total` - Total tasks
- `archon_tasks_completed` - Completed tasks
- `archon_task_duration_seconds` - Task duration
- `archon_api_requests_total` - API requests
- `archon_errors_total` - Error count

### Logs

View logs with:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f archon-os

# Tail last 100 lines
docker-compose logs --tail=100 archon-os
```

### Health Checks

Monitor service health:
```bash
# Check all container health
docker ps --filter "name=archon" --format "table {{.Names}}\t{{.Status}}"

# API health endpoint
curl http://localhost:8092/health

# Database connection
docker exec archon-postgres pg_isready -U archon

# Redis connection
docker exec archon-redis redis-cli ping
```

## Troubleshooting

### Common Issues

**1. Port conflicts:**
```bash
# Check port usage
netstat -an | grep 8092

# Change ports in .env
ARCHON_API_PORT=9092
```

**2. Database connection errors:**
```bash
# Check PostgreSQL logs
docker-compose logs archon-postgres

# Verify database exists
docker exec archon-postgres psql -U archon -l

# Reset database
docker-compose down -v
docker-compose up -d
```

**3. Agent spawn failures:**
```bash
# Check worker logs
docker-compose logs archon-worker

# Verify RabbitMQ connection
docker exec archon-rabbitmq rabbitmq-diagnostics ping

# Check queue status
open http://localhost:15672
```

**4. Memory issues:**
```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# (Docker Desktop > Settings > Resources)

# Reduce worker count
docker-compose up -d --scale archon-worker=2
```

### Debug Mode

Enable debug logging:

```bash
# In .env
ARCHON_DEBUG=true
ARCHON_LOG_LEVEL=debug

# Restart services
docker-compose restart archon-os
```

## Security

### Production Recommendations

1. **Change all default passwords** in `.env`
2. **Use strong JWT secret** (min 32 characters)
3. **Enable authentication** (`ENABLE_AUTH=true`)
4. **Use HTTPS** with reverse proxy (nginx example provided)
5. **Restrict API access** with firewall rules
6. **Rotate API keys** regularly
7. **Keep images updated**

### Reverse Proxy Setup

Example nginx configuration in `nginx.conf.example`.

## Backup and Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker exec archon-postgres pg_dump -U archon archon_os > backup.sql

# Restore
docker exec -i archon-postgres psql -U archon archon_os < backup.sql
```

### State Backup

```bash
# Backup all volumes
docker run --rm \
  -v archon-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/archon-backup.tar.gz /data
```

## Performance Tuning

### Database Optimization

Adjust in `docker-compose.yml`:
```yaml
environment:
  DATABASE_POOL_SIZE: 50  # Increase for high concurrency
  DATABASE_MAX_OVERFLOW: 100
```

### Redis Optimization

```yaml
command: >
  redis-server
  --maxmemory 4gb  # Adjust based on available RAM
  --maxmemory-policy allkeys-lru
```

### Worker Tuning

```yaml
environment:
  WORKER_PROCESSES: 8  # Match CPU cores
  MAX_AGENTS: 100  # Increase for more agents
```

## Integration Examples

### Full-Stack Development Workflow

```bash
# 1. Initialize coordination
npx claude-flow@alpha hooks pre-task --description "Full-stack development"

# 2. Spawn agents via Claude Code Task tool (single message, parallel execution)
# Backend Developer - Build REST API
# Frontend Developer - Create React UI
# Database Architect - Design schema
# Test Engineer - Write tests
# DevOps Engineer - Setup CI/CD
# Security Auditor - Review security

# 3. Agents coordinate via memory
# Backend stores API contracts: swarm/backend/api
# Frontend retrieves contracts: swarm/backend/api
# Tester retrieves all specs for testing

# 4. Collect results
npx claude-flow@alpha hooks session-end --export-metrics true
```

### Research and Analysis Pipeline

```bash
# Spawn research swarm
Task("Data Gatherer", "Collect data sources", "researcher")
Task("Analyst", "Analyze patterns", "researcher")
Task("Reporter", "Generate report", "coder")

# Results stored in memory automatically
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

- GitHub Issues: [Project Nyra Issues](https://github.com/yourusername/project-nyra/issues)
- Documentation: [Archon OS Docs](https://docs.archon-os.io)
- Claude Flow: [Claude Flow Documentation](https://github.com/ruvnet/claude-flow)

## Version History

- **1.0.0** (2025-12-31) - Initial release
  - Multi-agent orchestration
  - MCP server integration
  - Claude Flow hooks
  - LiteLLM proxy support
  - Distributed task execution

---

**Archon OS** - Advanced Multi-Agent Orchestration for Modern AI Systems
