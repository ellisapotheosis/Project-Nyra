# Infrastructure as Code - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG (Infrastructure Mesh Topology)

```bash
# Infrastructure coordination (mesh topology for service discovery)
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy specialized
```

**Why Mesh for Infrastructure:**
- Service-to-service communication patterns
- Decentralized service discovery
- Parallel service deployments
- Load balancing across agents

---

## 🔄 AUTO-START SWARM PROTOCOL & ⏸️ SPAWN AND WAIT PATTERN

1. Tell user concurrent tasks
2. STOP - no more tool calls
3. WAIT - let agents work
4. RESPOND - synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

```bash
npx @claude-flow/cli@latest memory search --query '[keywords]' --namespace patterns
npx @claude-flow/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @claude-flow/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI COMMANDS & 🚀 AVAILABLE AGENTS & 🪝 V3 HOOKS SYSTEM

```bash
npx @claude-flow/cli@latest swarm init/status
npx @claude-flow/cli@latest memory store/search/retrieve
npx @claude-flow/cli@latest hooks pre-task/post-task/post-edit
```

**Infrastructure-Specific Agents**: `system-architect`, `cicd-engineer`, `devops-specialist`, `performance-engineer`, `security-architect`

---

## 📝 MEMORY COMMANDS REFERENCE

```bash
npx @claude-flow/cli@latest memory store --key "infra-pattern" --value "content" --namespace patterns
npx @claude-flow/cli@latest memory search --query "docker kubernetes deployment" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

**Profile**: docker-infra
**Generated**: 2026-01-22

## 🎯 Project Overview

Docker Compose files, service orchestration, PostgreSQL databases, and mesh networking. Microservices architecture with containerized deployment.

## 🏗️ Architecture

**Tech Stack**: Docker, Docker Compose, PostgreSQL (pgvector), Redis, Prometheus, Grafana, Loki
**Topology**: Mesh networking with service discovery
**Type**: Containerized Microservices Infrastructure

## 📋 Development Commands

```bash
# Full stack
docker-compose up -d

# Core services only
docker-compose -f docker/base/docker-compose.core.yml up -d

# MCP servers
docker-compose -f docker/base/docker-compose.mcp.yml up -d

# View logs
docker-compose logs -f [service_name]

# Validate configuration
docker-compose config

# Lint YAML
yamllint .
```

## 🧠 Claude Flow Integration

### Infrastructure Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `system-architect` | Design microservices topology, networking patterns | Planning new services, architecture changes |
| `cicd-engineer` | Deployment pipelines, container builds | CI/CD configuration, Docker image optimization |
| `devops-specialist` | Service operations, scaling, health monitoring | Deployments, scaling, troubleshooting |
| `performance-engineer` | Resource optimization, bottleneck analysis | Performance tuning, resource limits |
| `security-architect` | Network security, secrets management | Security scanning, access control |

### Recommended Workflows

- Microservice deployment coordination
- Infrastructure scaling and load balancing
- Health monitoring and auto-recovery
- Database migration and backup
- Service discovery and routing
- Performance optimization
- Security compliance checks

---

## 🛠️ Tech Stack Specific Guidelines

## Docker Infrastructure Guidelines

### Docker Compose Organization

The infrastructure uses modular compose files with includes for clean separation:

```yaml
# docker/docker-compose.yml - Main orchestrator
include:
  - path: ./base/docker-compose.core.yml    # PostgreSQL, Redis, Qdrant
  - path: ./base/docker-compose.mcp.yml     # MCP servers
  - path: ./apps/docker-compose.apps.yml    # Applications
  - path: ./orchestrator/docker-compose.orchestrator.yml  # Prometheus, Grafana
  - path: ./workers/docker-compose.worker-*.yml  # Optional workers
```

**Services**:
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
    networks:
      - nyra-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### Multi-Stage Builds
- Separate build and runtime stages
- Minimize final image size
- Use specific base image versions (e.g., `pgvector:pg16`)
- Cache dependencies effectively

### Container Best Practices
- One process per container
- Use .dockerignore to exclude unnecessary files
- Don't run as root (use USER directive)
- Implement health checks for all services
- Log to stdout/stderr (Docker collects via logging drivers)

### Networking Architecture

**Network Topology**: Mesh with service discovery

```
nyra-network (bridge, subnet: 172.28.0.0/16)
├── Core Services
│   ├── postgres (service discovery: postgres:5432)
│   ├── redis (service discovery: redis:6379)
│   └── qdrant (service discovery: qdrant:6333)
├── MCP Servers
│   ├── litellm (service discovery: litellm:4000)
│   ├── mem0 (service discovery: mem0_mcp:8081)
│   └── graphiti (service discovery: graphiti_mcp:9100)
├── Applications
│   ├── twenty (http://twenty:3000)
│   ├── n8n (http://n8n:5678)
│   └── dify (http://dify:8000)
└── Orchestrator
    ├── prometheus (http://prometheus:9090)
    ├── grafana (http://grafana:3000)
    └── loki (http://loki:3100)
```

**Service Discovery**: Use service names for internal communication
- Services communicate via Docker DNS: `service_name:port`
- Example: `postgresql://postgres:5432/db`
- No need for manual service registry

### Volume Management
- **Named volumes** for persistent data (PostgreSQL, Redis)
- **Bind mounts** for development config
- Backup strategies: regular pg_dump, Redis snapshots
- Proper permissions: use volumes with appropriate drivers

```yaml
volumes:
  postgres_data:
    name: nyra_postgres_data
    driver: local
  redis_data:
    name: nyra_redis_data
    driver: local
```

### Environment Configuration

```bash
# .env file (DO NOT commit)
POSTGRES_USER=nyra_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=nyra_db
POSTGRES_PORT=5432

# Multiple databases for different services
LETTA_DB=letta
TWENTY_DB=twenty
DIFY_DB=dify

# MCP Server Configuration
LITELLM_MASTER_KEY=sk-...
NEXUS_JWT_SECRET=secret_key_here
NEXUS_ADMIN_TOKEN=admin_token
```

**Secrets Management**:
- Use .env files for local development
- Docker secrets for production Swarm deployments
- Infisical/vault for enterprise deployments
- Never commit .env files

### Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

**Recommended limits by service type**:
- **Database** (PostgreSQL): 4 CPU, 4GB RAM
- **Cache** (Redis): 2 CPU, 2GB RAM
- **Applications**: 2 CPU, 2GB RAM
- **MCP Servers**: 1 CPU, 1GB RAM

---

## 📊 PostgreSQL Infrastructure

### Database Configuration

Project Nyra uses **pgvector** for AI/ML vector operations:

```yaml
postgres:
  image: pgvector/pgvector:pg16
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB:-nyra_db}
    POSTGRES_MULTIPLE_DATABASES: letta,twenty,dify,n8n,litellm,activepieces
```

### Multi-Database Setup

Each service uses its own database for isolation:

| Service | Database | Purpose |
|---------|----------|---------|
| Letta | `letta` | Memory management |
| Twenty | `twenty` | CRM operations |
| Dify | `dify` | AI workflow builder |
| n8n | `n8n` | Workflow automation |
| LiteLLM | `litellm` | LLM API gateway |
| ActivePieces | `activepieces` | Automation platform |

### Connection String Format
```
postgresql://user:password@postgres:5432/database_name
```

### PostgreSQL Best Practices

1. **Regular Backups**
```bash
docker exec nyra-postgres pg_dump -U postgres nyra_db > backup.sql
```

2. **Vector Index Optimization**
```sql
CREATE INDEX ON vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

3. **Performance Tuning**
- Set `shared_buffers` to 25% of system RAM
- Configure `work_mem` for complex queries
- Enable connection pooling with PgBouncer

4. **Security**
- Use strong passwords
- Restrict network access via firewall
- Rotate credentials regularly
- Enable SSL for remote connections

---

## 🌐 Microservices Communication Patterns

### Service Mesh Architecture

Services communicate through named Docker networks:

```
Application → Nexus Router → MCP Servers
              ↓
           LiteLLM → Claude/OpenAI APIs

Database Layer:
  PostgreSQL (transactional)
  Redis (cache/sessions)
  Qdrant (vector storage)
```

### Inter-Service Communication

1. **Direct Service-to-Service**
```javascript
// Within same network, use service name
const db = new Client({
  host: 'postgres',
  port: 5432,
  database: 'myapp_db'
});
```

2. **Through Router (Nexus)**
```
Service A → Nexus Router (port 7000) → Service B
```

3. **Message Queue Pattern** (Redis)
```yaml
services:
  producer:
    depends_on:
      - redis
  consumer:
    depends_on:
      - redis
```

### Health Checks and Dependencies

```yaml
services:
  app:
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

---

## 🔄 Load Balancing and Routing

### Service Discovery

Docker Compose provides automatic service discovery:
- Service name resolves to container IP
- Load balanced across replicas if scaled
- DNS updates automatically on container changes

### Nexus Router

For advanced routing and API gateway patterns:

```yaml
# nexus.yaml configuration
http:
  port: 7000

llm:
  providers:
    - name: litellm
      type: openai_compatible
      base_url: http://litellm:4000

mcp:
  servers:
    - name: activepieces
      url: http://activepieces:80/mcp
    - name: graphiti
      url: http://graphiti_mcp:9100
```

### Monitoring and Observability

**Prometheus Configuration**:
```yaml
# Scrape targets for monitoring
scrape_configs:
  - job_name: 'claude-flow'
    static_configs:
      - targets: ['claude-flow:9090']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

**Grafana Dashboards**:
- Container resource usage
- Service health status
- Database performance metrics
- Network traffic patterns

**Loki Log Aggregation**:
- Centralized logging for all containers
- Query logs by service, level, or timestamp
- Alert on error patterns

---

## 🚀 Infrastructure Workflows

### Spawning Infrastructure Agents

Use this pattern when deploying or modifying infrastructure:

```bash
# Initialize coordination
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy specialized

# Spawn parallel agents for infrastructure tasks
Task({
  prompt: "Analyze current infrastructure state and dependencies",
  subagent_type: "system-architect",
  description: "Infrastructure assessment"
})

Task({
  prompt: "Design service scaling strategy and resource allocation",
  subagent_type: "performance-engineer",
  description: "Performance planning"
})

Task({
  prompt: "Create deployment pipeline and CI/CD configuration",
  subagent_type: "cicd-engineer",
  description: "Deployment automation"
})

Task({
  prompt: "Audit infrastructure security and compliance",
  subagent_type: "security-architect",
  description: "Security review"
})
```

### Common Infrastructure Tasks

| Task | Agents | Memory Pattern |
|------|--------|----------------|
| Deploy new service | architect, cicd-engineer, devops-specialist | `infra-deployment` |
| Scale services | devops-specialist, performance-engineer | `infra-scaling` |
| Security audit | security-architect, devops-specialist | `infra-security` |
| Performance tune | performance-engineer, devops-specialist | `infra-optimization` |
| Database migration | devops-specialist, system-architect | `infra-db-migration` |

---

## 📝 Notes

- Auto-generated by Project Nyra Batch CLAUDE.md System
- For manual customization, edit this file directly
- To regenerate, run: `node scripts/batch-claude-md/batch-template-engine.js`
- Last enhanced: 2026-01-22
