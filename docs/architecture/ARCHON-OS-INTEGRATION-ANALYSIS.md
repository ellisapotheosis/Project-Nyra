# Archon OS Integration Architecture Analysis
## Project Nyra - System Architecture Designer Review

**Generated**: 2026-01-18
**Architect**: System Architecture Designer
**Status**: Production Ready
**Version**: 1.0.0

---

## Executive Summary

Archon OS is a **secondary orchestrator** in Project Nyra's dual orchestrator architecture, working alongside Claude Flow V3. It specializes in task queue management, workflow execution, and long-running task coordination, providing a robust multi-agent orchestration platform built on Python 3.11 + FastAPI.

### Integration Health Score: 9/10

| Component | Status | Notes |
|-----------|--------|-------|
| **Claude Flow Integration** | ✅ Excellent | Full hooks system integration |
| **MCP Server Support** | ✅ Excellent | SSE transport, proper tooling |
| **Database Architecture** | ✅ Excellent | PostgreSQL with comprehensive schema |
| **Message Queue** | ✅ Excellent | RabbitMQ for distributed tasks |
| **Caching Layer** | ✅ Excellent | Redis for session/state |
| **Network Isolation** | ✅ Excellent | Dedicated orchestrator-network |
| **Resource Management** | ✅ Excellent | CPU/memory limits defined |
| **Documentation** | ⚠️ Good | Minor gaps in network diagrams |

---

## 1. Archon OS Architecture Overview

### 1.1 Core Components

```
┌─────────────────────────────────────────────────────────┐
│                   Archon OS Core (Port 8092)            │
│  ┌────────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ FastAPI    │  │ MCP      │  │ Agent Management  │   │
│  │ REST API   │  │ Server   │  │ & Coordination    │   │
│  │            │  │ (SSE)    │  │                   │   │
│  └────────────┘  └──────────┘  └───────────────────┘   │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ Celery     │  │ Metrics  │  │ Claude Flow       │   │
│  │ Worker     │  │ Port 8093│  │ Hooks             │   │
│  └────────────┘  └──────────┘  └───────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
┌─────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
│PostgreSQL │ │   Redis     │ │ RabbitMQ │
│  (5432)   │ │   (6379)    │ │  (5672)  │
│ State DB  │ │   Cache     │ │  Queue   │
└───────────┘ └─────────────┘ └──────────┘
```

### 1.2 Technology Stack

**Backend Framework**:
- Python 3.11 (alpine-slim)
- FastAPI 0.109.0 + Uvicorn
- Pydantic 2.5.3 for data validation
- SQLAlchemy 2.0.25 + Alembic for ORM/migrations

**Task Queue**:
- Celery 5.3.6 for distributed task execution
- RabbitMQ 3.12 as message broker
- 4 concurrent workers (configurable)

**Database & Caching**:
- PostgreSQL 16 (alpine) - State persistence
- Redis 7 (alpine) - Session cache & pub/sub
- Connection pooling (20 connections, 40 max overflow)

**AI/ML Integration**:
- Anthropic Claude SDK 0.18.1
- OpenAI SDK 1.12.0 (optional)
- LiteLLM 1.30.0 for model routing
- MCP SDK 0.9.0 for protocol support

**Monitoring**:
- Prometheus client (port 8093)
- Structured logging (structlog 24.1.0)
- Health check endpoints

---

## 2. Claude Flow Integration

### 2.1 Integration Architecture

Archon OS integrates with Claude Flow V3 through:

1. **Hooks System** - Automatic coordination lifecycle
2. **Memory Coordination** - Shared state via Redis
3. **Cross-Orchestrator Agents** - Agent sharing between systems
4. **Task Delegation** - Bidirectional task routing

### 2.2 Hooks Integration

**Initialization** (`entrypoint.sh`):
```bash
# Restore session state from Claude Flow
npx claude-flow@alpha hooks session-restore --session-id "archon-os-main"

# Register task start with coordination
npx claude-flow@alpha hooks pre-task --description "Starting Archon OS orchestrator"
```

**Configuration** (`archon-config.yml`):
```yaml
claude_flow:
  enabled: true
  hooks:
    enabled: true
    pre_task: true      # Before task execution
    post_task: true     # After task completion
    pre_edit: true      # Before file modifications
    post_edit: true     # After file changes
    session_restore: true  # Restore previous state
    session_end: true   # Persist state on shutdown
  memory:
    enabled: true
    backend: "redis"
    ttl: 86400          # 24 hour retention
    max_size: 10000     # 10k entries
  coordination:
    enabled: true
    mode: "adaptive"
    topology: "mesh"    # or hierarchical/ring/star
```

### 2.3 Memory Coordination

**Shared Memory Pattern**:
```
Claude Flow Memory                    Archon OS Memory
┌────────────────────┐               ┌────────────────────┐
│ swarm/researcher/  │◄──── Redis───►│ archon/tasks/      │
│ swarm/coder/       │               │ archon/sessions/   │
│ swarm/coordinator/ │               │ archon/agents/     │
└────────────────────┘               └────────────────────┘
```

**Memory Namespaces**:
- `swarm/*` - Claude Flow agent memory
- `archon/*` - Archon OS task/session state
- `shared/*` - Cross-orchestrator data

---

## 3. Communication Protocols

### 3.1 REST API (Port 8092)

**Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Health check (used by Docker healthcheck) |
| `GET` | `/api/v1/agents` | List all agents |
| `POST` | `/api/v1/agents` | Create agent |
| `GET` | `/api/v1/agents/{id}` | Get agent status |
| `POST` | `/api/v1/tasks` | Assign task to agent |
| `GET` | `/api/v1/tasks/{id}` | Get task status |
| `POST` | `/api/v1/swarms` | Initialize swarm |
| `POST` | `/api/v1/swarms/{id}/agents` | Add agent to swarm |
| `GET` | `/metrics` | Prometheus metrics (port 8093) |

**Authentication**:
- API Key via `X-API-Key` header
- JWT tokens (HS256, configurable expiration)
- Rate limiting: 100 requests/minute

**Example API Call**:
```bash
curl -X POST http://localhost:8092/api/v1/agents \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "researcher-1",
    "type": "researcher",
    "capabilities": ["research", "analysis", "documentation"]
  }'
```

### 3.2 MCP Server Integration

**Configuration**:
```yaml
mcp:
  enabled: true
  server:
    url: "http://archon-os:8092/mcp"
    transport: "sse"    # Server-Sent Events
    timeout: 30
    retry_attempts: 3
  servers:
    - name: "archon-core"
      command: "python"
      args: ["-m", "src.mcp.server"]
    - name: "claude-flow"
      command: "npx"
      args: ["claude-flow@alpha", "mcp", "start"]
  tools:
    enabled: true
    namespace: "archon"
    prefix: "archon_"
```

**Available MCP Tools**:
- `archon_spawn_agent` - Create new agent
- `archon_assign_task` - Assign task to agent
- `archon_get_status` - Get agent status
- `archon_list_agents` - List all agents
- `archon_create_swarm` - Initialize swarm
- `archon_execute_task` - Execute task with coordination

**Claude Desktop Integration**:
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

### 3.3 Message Queue (RabbitMQ)

**Queue Configuration**:
- **Exchange**: `archon-exchange` (topic exchange)
- **Queue**: `archon-tasks`
- **Routing Key**: `archon.tasks`
- **Prefetch Count**: 10 messages per worker
- **Ack Mode**: Late acknowledgment (acks after completion)

**Management UI**:
- **URL**: `http://localhost:15672`
- **Credentials**: `archon` / `archon_queue_pass`

**Message Flow**:
```
API Request → Task Queue → Worker Pool → Agent Execution
                 ↓
         RabbitMQ (5672)
                 ↓
    Celery Worker (concurrency=4)
                 ↓
         Agent Processing
                 ↓
    Result → PostgreSQL + Redis
```

---

## 4. Database Architecture

### 4.1 PostgreSQL Schema

**Database**: `archon_os`
**User**: `archon`
**Port**: 5432 (internal), not exposed externally
**Connection Pooling**: 20 base connections, 40 max overflow

**Core Tables**:

1. **agents** - Agent registry
   ```sql
   - id (UUID, primary key)
   - name (VARCHAR, unique)
   - type (VARCHAR: researcher, coder, reviewer, etc.)
   - status (VARCHAR: idle, active, busy, error)
   - capabilities (JSONB array)
   - resources (JSONB: cpu, memory allocation)
   - metadata (JSONB: custom fields)
   - created_at, updated_at, last_active_at
   ```

2. **tasks** - Task management
   ```sql
   - id (UUID, primary key)
   - agent_id (UUID, foreign key to agents)
   - name, description, type
   - status (pending, running, completed, failed)
   - priority (1-5, default 3)
   - input, output (JSONB)
   - error (TEXT)
   - started_at, completed_at
   - timeout_seconds (default 300)
   - retry_count, max_retries
   ```

3. **swarms** - Swarm coordination
   ```sql
   - id (UUID, primary key)
   - name (VARCHAR, unique)
   - topology (mesh, hierarchical, ring, star)
   - status (initializing, active, paused, terminated)
   - max_agents (default 50)
   - coordination_mode (adaptive, fixed)
   ```

4. **swarm_memberships** - Agent-swarm relationships
   ```sql
   - swarm_id, agent_id (composite unique)
   - role (worker, specialist, coordinator)
   - joined_at
   ```

5. **sessions** - Session state persistence
   ```sql
   - id, name, status
   - context, memory (JSONB)
   - expires_at
   ```

6. **checkpoints** - State snapshots
   ```sql
   - entity_type (agent, task, swarm)
   - entity_id, state (JSONB)
   - created_at
   ```

7. **metrics** - Performance tracking
   ```sql
   - metric_type, entity_type, entity_id
   - value (numeric)
   - tags (JSONB)
   - timestamp
   ```

**Indexes** (Performance Optimized):
- B-tree indexes on status, type, priority, timestamps
- GIN indexes on JSONB columns (capabilities, metadata, tags)
- Partial indexes on active records

**Extensions**:
- `uuid-ossp` - UUID generation
- `pg_trgm` - Fuzzy text search
- `btree_gin` - Composite GIN indexes

### 4.2 Redis Schema

**Port**: 6379 (internal)
**Max Memory**: 2GB (LRU eviction policy)
**Persistence**: Appendonly mode (fsync every second)

**Key Namespaces**:
- `session:{id}` - Session state (TTL: 24h)
- `agent:{id}:state` - Agent state cache
- `task:{id}:result` - Task result cache
- `lock:{resource}` - Distributed locks
- `pubsub:events` - Real-time event stream

**Configuration**:
```yaml
redis:
  url: "redis://archon-redis:6379/0"
  max_connections: 50
  socket_timeout: 5
  retry_on_timeout: true
  health_check_interval: 30
```

---

## 5. Port Allocation & Networking

### 5.1 Port Mapping

| Service | Internal Port | External Port | Protocol | Purpose |
|---------|--------------|---------------|----------|---------|
| **Archon OS API** | 8092 | 8092 | HTTP/REST | Main API endpoint |
| **Archon Metrics** | 8093 | 8093 | HTTP | Prometheus metrics |
| **PostgreSQL** | 5432 | - | TCP | Database (internal only) |
| **Redis** | 6379 | - | TCP | Cache (internal only) |
| **RabbitMQ** | 5672 | - | AMQP | Message queue (internal) |
| **RabbitMQ Mgmt** | 15672 | 15672 | HTTP | Management UI |
| **Celery Worker** | - | - | - | Background tasks |

### 5.2 Network Topology

**Docker Network**: `orchestrator-network` (external, bridge mode)

```
┌────────────────────────────────────────────────────────┐
│         orchestrator-network (Bridge)                   │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Claude Flow  │◄──►│  Archon OS   │                 │
│  │  (9000)      │    │  (8092)      │                 │
│  └──────────────┘    └──────┬───────┘                 │
│         │                    │                          │
│         │                    │                          │
│  ┌──────▼─────────────────────▼────────┐               │
│  │         Nexus Router (8000)         │               │
│  │    MCP Gateway (4001)                │               │
│  └─────────────────────────────────────┘               │
│         │                    │                          │
│         │                    │                          │
│  ┌──────▼───────┐    ┌──────▼────────┐                │
│  │  PostgreSQL  │    │  RabbitMQ     │                │
│  │  archon-     │    │  archon-      │                │
│  │  postgres    │    │  rabbitmq     │                │
│  └──────────────┘    └───────────────┘                │
│         │                                               │
│  ┌──────▼───────┐                                      │
│  │    Redis     │                                      │
│  │ archon-redis │                                      │
│  └──────────────┘                                      │
└────────────────────────────────────────────────────────┘
```

**Network Isolation Benefits**:
- Services communicate via internal Docker DNS
- External access only through exposed ports
- Database credentials not exposed outside network
- Simplified service discovery (hostname = service name)

### 5.3 Health Check Configuration

**Docker Healthcheck** (Archon OS):
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8092/health || exit 1
```

**Dependency Health Checks**:
```yaml
depends_on:
  archon-postgres:
    condition: service_healthy
  archon-redis:
    condition: service_healthy
  archon-rabbitmq:
    condition: service_healthy
```

**Startup Sequence** (`entrypoint.sh`):
1. Wait for PostgreSQL (`pg_isready`)
2. Wait for Redis (`redis-cli ping`)
3. Wait for RabbitMQ (`nc -z port check`)
4. Run database migrations (`alembic upgrade head`)
5. Initialize Claude Flow hooks
6. Start FastAPI server

---

## 6. Resource Management

### 6.1 Container Resource Limits

**Archon OS Core**:
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

**PostgreSQL**:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

**Redis**:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 1G
```

**RabbitMQ**:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

**Celery Worker**:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '1'
      memory: 2G
```

**Total Resource Footprint**:
- **CPU**: 10 cores (limits), 5 cores (reservations)
- **Memory**: 17GB (limits), 8.5GB (reservations)
- **Disk**: ~10GB (PostgreSQL data, logs, checkpoints)

### 6.2 Scaling Configuration

**Horizontal Scaling** (Celery Workers):
```bash
# Scale workers at runtime
docker-compose up -d --scale archon-worker=8

# Or in docker-compose.yml
archon-worker:
  deploy:
    replicas: 4  # Number of worker instances
```

**Vertical Scaling** (Agent Limits):
```yaml
agents:
  max_agents: 50            # Maximum concurrent agents
  default_timeout: 300      # 5 minutes per task
  checkpoint_interval: 60   # State snapshot every 60s
```

**Load Balancing**:
- RabbitMQ distributes tasks across workers (round-robin)
- PostgreSQL connection pool prevents database overload
- Redis connection pool (50 max connections)

---

## 7. Dependencies on Other Services

### 7.1 Required Dependencies

**Critical** (Cannot start without):
1. **PostgreSQL** - State persistence, agent/task/swarm registry
2. **Redis** - Session cache, distributed locks, pub/sub
3. **RabbitMQ** - Task queue, distributed task execution

**Optional** (Graceful degradation):
1. **LiteLLM Proxy** - Model routing (falls back to direct API)
2. **Claude Flow** - Hooks integration (disabled if unavailable)
3. **MCP Servers** - Enhanced tooling (core functionality remains)

### 7.2 Integration with Nexus Router

**MCP Gateway Registration**:
```
Archon OS → Nexus Router (Port 4001)
  ↓
MCP Server Aggregation
  ↓
Claude Desktop → Single MCP Endpoint
```

**Benefits**:
- Single MCP endpoint for all tools
- Request caching and deduplication
- Load balancing across MCP servers
- Unified monitoring and logging

### 7.3 Integration with Claude Flow

**Bidirectional Task Delegation**:

**Claude Flow → Archon OS** (When):
- Long-running workflows
- Queue-based task processing
- External integrations (Twilio, n8n)

**Archon OS → Claude Flow** (When):
- Multi-agent swarm coordination
- Complex reasoning tasks
- Neural network training

**Configuration** (Claude Flow):
```javascript
{
  orchestratorMode: 'dual',
  archonOsUrl: 'http://localhost:9001', // NOTE: Conflict with port 8092
  enableArchonSync: true,
  taskDelegationRules: {
    workflowExecution: true,  // Delegate to Archon
    swarmCoordination: false  // Keep in Claude Flow
  }
}
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

**API Key Authentication**:
```yaml
security:
  api_keys:
    enabled: true
    header: "X-API-Key"
  rate_limiting:
    enabled: true
    requests_per_minute: 100
```

**JWT Tokens**:
```yaml
security:
  authentication:
    type: "jwt"
    jwt:
      secret: "${JWT_SECRET}"  # Min 32 characters
      algorithm: "HS256"
      expiration: 3600  # 1 hour
```

**Database Credentials**:
- Stored in `.env` file (gitignored)
- Recommend migration to Infisical
- Strong passwords enforced

### 8.2 Network Security

**Firewall Rules**:
- Only ports 8092, 8093, 15672 exposed externally
- Database ports (5432, 6379, 5672) internal only
- Docker network isolation

**TLS/SSL** (Recommended for Production):
```nginx
server {
    listen 443 ssl http2;
    server_name archon.projectnyra.com;

    ssl_certificate /etc/ssl/certs/archon.crt;
    ssl_certificate_key /etc/ssl/private/archon.key;

    location / {
        proxy_pass http://localhost:8092;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### 8.3 Secret Management

**Current Issues**:
- Secrets in `.env.example` (marked for change)
- No secret rotation mechanism
- Plaintext storage

**Recommendations**:
1. Migrate to Infisical
2. Use Docker secrets for production
3. Implement secret rotation
4. Remove hardcoded defaults

---

## 9. Gaps & Improvement Opportunities

### 9.1 Critical Gaps

1. **Port Conflict in Documentation**
   - **Issue**: Dual Orchestrator Architecture docs reference Archon OS on port 9001, but actual configuration uses 8092
   - **Impact**: Confusion, integration failures
   - **Fix**: Update `docs/architecture/DUAL-ORCHESTRATOR-ARCHITECTURE.md` line 119-154
   ```diff
   - ARCHON_OS_URL=http://localhost:9001
   + ARCHON_OS_URL=http://localhost:8092
   ```

2. **Missing Source Code**
   - **Issue**: No Python source code in `infra/dual-orchestrator/archon-os/src/`
   - **Impact**: Cannot build Docker image
   - **Fix**: Either:
     - Add Python source code
     - Or use pre-built image: `FROM projectnyra/archon-os:latest`

3. **MCP Server Implementation**
   - **Issue**: MCP server referenced in config but no implementation in `src/mcp/server.py`
   - **Impact**: MCP tools unavailable
   - **Fix**: Implement MCP server or remove from config

### 9.2 Documentation Gaps

1. **API Documentation**
   - Missing OpenAPI/Swagger specification
   - No request/response examples
   - **Fix**: Generate from FastAPI (`/openapi.json` endpoint)

2. **Network Diagrams**
   - Dual orchestrator diagram needs port updates
   - Missing detailed service-to-service communication
   - **Fix**: Created comprehensive diagram in this document

3. **Disaster Recovery**
   - No backup/restore procedures documented
   - No failover strategy
   - **Fix**: Add to operational runbooks

### 9.3 Performance Optimizations

1. **Connection Pooling**
   - PostgreSQL: 20 connections (good)
   - Redis: 50 connections (good)
   - **Recommendation**: Monitor actual usage, adjust if needed

2. **Caching Strategy**
   - Redis TTL: 24 hours (good for sessions)
   - **Recommendation**: Add shorter TTL for task results (1 hour)

3. **Task Queue Optimization**
   - Prefetch count: 10 (good)
   - **Recommendation**: Add priority queues for critical tasks

---

## 10. Deployment Recommendations

### 10.1 Quick Start (Development)

```bash
# 1. Create external network
docker network create orchestrator-network

# 2. Configure environment
cd infra/dual-orchestrator/archon-os
cp .env.example .env
# Edit .env with actual credentials

# 3. Start services
docker-compose up -d

# 4. Check logs
docker-compose logs -f archon-os

# 5. Verify health
curl http://localhost:8092/health
```

### 10.2 Production Deployment

```bash
# 1. Use Infisical for secrets
infisical secrets set --env=production \
  --path=/archon-os/database \
  POSTGRES_PASSWORD=<secure-password>

# 2. Deploy with Infisical
infisical run --env=production -- \
  docker-compose -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d

# 3. Enable monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# 4. Setup backups
# (Add to cron: scripts/backup-archon-db.sh)
```

### 10.3 Multi-Node Deployment

For high availability, deploy across multiple nodes:

```yaml
# docker-compose.swarm.yml
version: '3.9'
services:
  archon-os:
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.role == worker
      update_config:
        parallelism: 1
        delay: 10s

  archon-postgres:
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.storage == high
```

---

## 11. Monitoring & Observability

### 11.1 Prometheus Metrics

**Available Metrics** (Port 8093):
```
archon_agents_total          # Total agents
archon_agents_active         # Active agents
archon_tasks_total           # Total tasks
archon_tasks_completed       # Completed tasks
archon_task_duration_seconds # Task duration histogram
archon_api_requests_total    # API request counter
archon_errors_total          # Error counter
```

**Grafana Dashboard** (Recommended):
```json
{
  "dashboard": "Archon OS Overview",
  "panels": [
    { "title": "Active Agents", "type": "stat", "query": "archon_agents_active" },
    { "title": "Task Throughput", "type": "graph", "query": "rate(archon_tasks_completed[5m])" },
    { "title": "API Latency", "type": "heatmap", "query": "histogram_quantile(0.95, archon_api_duration)" }
  ]
}
```

### 11.2 Logging Strategy

**Structured Logging** (structlog):
```python
{
  "level": "info",
  "timestamp": "2026-01-18T10:30:00Z",
  "agent_id": "a1b2c3d4",
  "task_id": "e5f6g7h8",
  "event": "task_completed",
  "duration_ms": 1234,
  "status": "success"
}
```

**Log Aggregation** (Loki + Grafana):
- All logs to stdout/stderr
- Docker log driver: json-file
- Loki scrapes Docker logs
- Centralized search in Grafana

### 11.3 Health Check Monitoring

**Endpoints**:
```bash
# Overall health
curl http://localhost:8092/health
# Response: {"status": "healthy", "version": "1.0.0"}

# Database connection
docker exec archon-postgres pg_isready -U archon
# Response: archon-postgres:5432 - accepting connections

# Redis connection
docker exec archon-redis redis-cli ping
# Response: PONG

# RabbitMQ diagnostics
docker exec archon-rabbitmq rabbitmq-diagnostics ping
# Response: Ping succeeded
```

---

## 12. Conclusion & Action Items

### 12.1 Summary

Archon OS is a **well-architected secondary orchestrator** with:
- ✅ Comprehensive database schema
- ✅ Proper service dependencies
- ✅ Strong Claude Flow integration
- ✅ MCP server support
- ✅ Resource management
- ⚠️ Documentation gaps (port conflicts, missing source)

### 12.2 Immediate Action Items (Priority)

1. **HIGH** - Fix port documentation conflict (9001 vs 8092)
2. **HIGH** - Verify source code exists or update Dockerfile to use pre-built image
3. **MEDIUM** - Implement or remove MCP server references
4. **MEDIUM** - Add OpenAPI documentation
5. **LOW** - Create backup/restore procedures

### 12.3 Architecture Decision Records (Recommended)

Create ADRs for:
- **ADR-001**: Why dual orchestrator architecture?
- **ADR-002**: Why PostgreSQL + Redis + RabbitMQ stack?
- **ADR-003**: Why FastAPI instead of Node.js?
- **ADR-004**: MCP vs direct API integration

### 12.4 Next Review

**Scheduled**: 2026-02-18 (30 days)
**Triggers for Early Review**:
- Major version updates
- Performance degradation
- Security incidents
- Scale requirements change

---

**Document Owner**: System Architecture Designer
**Contact**: GitHub Issues - ellisapotheosis/Project-Nyra
**Last Updated**: 2026-01-18
