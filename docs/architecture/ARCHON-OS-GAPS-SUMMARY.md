# Archon OS Integration - Gaps & Action Items
## Project Nyra - System Architecture Analysis Summary

**Generated**: 2026-01-18
**Architect**: System Architecture Designer
**Priority**: HIGH
**Status**: Action Required

---

## Critical Gaps Identified

### 1. Port Configuration Mismatch (CRITICAL)

**Issue**: Documentation inconsistency between actual configuration and architecture docs

**Evidence**:
- **Actual Configuration** (`.env.example`, `docker-compose.yml`): Port **8092**
- **Architecture Docs** (`DUAL-ORCHESTRATOR-ARCHITECTURE.md`): Port **9001**

**Impact**:
- Integration failures between Claude Flow and Archon OS
- Developer confusion
- Incorrect environment variable configuration

**Files Affected**:
```
C:\Dev\Projects\Repos\Project-Nyra\docs\architecture\DUAL-ORCHESTRATOR-ARCHITECTURE.md
  - Line 119: ARCHON_OS_URL=http://localhost:9001
  - Line 154: archonOsUrl: 'http://localhost:9001'
  - Line 283: ARCHON_OS_URL=http://localhost:9001
  - Line 294: ARCHON_OS_URL=http://localhost:9001
  - Line 342: curl http://localhost:9001/health
```

**Fix Required**:
```bash
# Update all references from 9001 to 8092
sed -i 's/localhost:9001/localhost:8092/g' \
  docs/architecture/DUAL-ORCHESTRATOR-ARCHITECTURE.md
```

**Action**: Update documentation immediately before any integration work

---

### 2. Missing Source Code (CRITICAL)

**Issue**: Dockerfile references source code that doesn't exist

**Evidence**:
```dockerfile
# Line 75: infra/dual-orchestrator/archon-os/Dockerfile
COPY --chown=archon:archon src/ ${ARCHON_HOME}/src/
```

**Actual State**:
```
infra/dual-orchestrator/archon-os/
├── Dockerfile
├── docker-compose.yml
├── config/
├── init-scripts/
├── agent-templates/
├── requirements.txt
└── src/  ← MISSING
```

**Impact**:
- Docker build will fail
- Cannot deploy Archon OS
- No actual orchestration functionality

**Options**:

**Option A**: Add Python source code
```bash
mkdir -p infra/dual-orchestrator/archon-os/src/{api,agents,tasks,mcp,db}
# Implement FastAPI application
```

**Option B**: Use pre-built image
```dockerfile
# Replace FROM python:3.11-slim with:
FROM projectnyra/archon-os:latest
# Skip COPY src/ commands
```

**Option C**: Remove Archon OS from deployment
```bash
# If not actively used, remove to reduce complexity
git rm -r infra/dual-orchestrator/archon-os/
```

**Recommendation**: Choose Option A or C based on actual usage requirements

---

### 3. MCP Server Implementation Missing (HIGH)

**Issue**: Configuration references MCP server that doesn't exist

**Evidence**:
```yaml
# archon-config.yml lines 103-112
mcp:
  servers:
    - name: "archon-core"
      command: "python"
      args: ["-m", "src.mcp.server"]  # ← File doesn't exist
```

**Actual State**:
```
src/
└── mcp/
    └── server.py  ← MISSING
```

**Impact**:
- MCP tools unavailable (`archon_spawn_agent`, `archon_assign_task`, etc.)
- Claude Desktop integration broken
- Nexus Router MCP gateway missing Archon tools

**Fix Required**:

**Option A**: Implement MCP server
```python
# src/mcp/server.py
from mcp.server import Server
from mcp.server.stdio import stdio_server

app = Server("archon-os")

@app.tool()
async def archon_spawn_agent(name: str, agent_type: str):
    """Create a new agent"""
    # Implementation
    pass

if __name__ == "__main__":
    stdio_server(app)
```

**Option B**: Remove MCP configuration
```yaml
# Remove or comment out in archon-config.yml
# mcp:
#   servers:
#     - name: "archon-core"
```

**Recommendation**: Option A if MCP integration is required, Option B otherwise

---

### 4. Network Documentation Gaps (MEDIUM)

**Issue**: Missing detailed network communication documentation

**Gaps**:
- No sequence diagrams for API calls
- Cross-orchestrator communication not fully documented
- Failover strategy unclear
- Load balancing mechanism not specified

**Fix**: Added comprehensive diagrams in this analysis:
- `docs/architecture/diagrams/archon-os-architecture.mmd`
- `docs/architecture/diagrams/archon-os-network-topology.mmd`
- `docs/architecture/diagrams/archon-os-database-schema.mmd`

**Status**: ✅ RESOLVED by this analysis

---

### 5. Secret Management Issues (MEDIUM)

**Issue**: Hardcoded secrets and insecure defaults

**Evidence**:
```bash
# .env.example
POSTGRES_PASSWORD=archon_secure_pass_change_me
RABBITMQ_PASSWORD=archon_queue_pass_change_me
ARCHON_API_KEY=your-secure-api-key-here
```

**Impact**:
- Potential production security vulnerability
- Secrets in Git history (already flagged by GitHub)
- No secret rotation mechanism

**Fix Required**:

1. Migrate to Infisical:
```bash
# Store secrets securely
infisical secrets set POSTGRES_PASSWORD --env=production
infisical secrets set RABBITMQ_PASSWORD --env=production
infisical secrets set ARCHON_API_KEY --env=production

# Generate .env from Infisical
infisical secrets export --env=production > .env.local
```

2. Update docker-compose to use Infisical:
```bash
infisical run --env=production -- docker-compose up -d
```

3. Remove plaintext secrets:
```bash
# Update .env.example with placeholders
POSTGRES_PASSWORD=<infisical:postgres_password>
RABBITMQ_PASSWORD=<infisical:rabbitmq_password>
```

**Priority**: MEDIUM (HIGH if deploying to production)

---

### 6. API Documentation Missing (LOW)

**Issue**: No OpenAPI specification or request/response examples

**Impact**:
- Difficult for developers to integrate
- No contract testing
- Unclear API capabilities

**Fix**:

FastAPI auto-generates OpenAPI:
```bash
# Access OpenAPI JSON
curl http://localhost:8092/openapi.json > docs/api/archon-os-openapi.json

# View Swagger UI
open http://localhost:8092/docs

# View ReDoc
open http://localhost:8092/redoc
```

**Action**: Generate and commit OpenAPI spec to repository

---

## Dependency Requirements Summary

### Required Before Deployment

| Dependency | Type | Port | Critical? | Status |
|------------|------|------|-----------|--------|
| **PostgreSQL 16** | Database | 5432 | ✅ Yes | Available |
| **Redis 7** | Cache | 6379 | ✅ Yes | Available |
| **RabbitMQ 3.12** | Queue | 5672 | ✅ Yes | Available |
| **Docker Network** | Network | - | ✅ Yes | Must create `orchestrator-network` |
| **Python Source Code** | Application | - | ✅ Yes | ⚠️ MISSING |

### Optional Dependencies

| Dependency | Type | Port | Impact if Missing |
|------------|------|------|-------------------|
| **Claude Flow** | Orchestrator | 9000 | Hooks disabled, no swarm sync |
| **Nexus Router** | Gateway | 8000/4001 | Direct API calls only |
| **LiteLLM Proxy** | AI Gateway | 8000 | Direct Claude API calls |
| **Prometheus** | Monitoring | 9090 | No metrics collection |

---

## Port Allocation Reference

### Archon OS Ports

| Service | Internal | External | Protocol | Exposed? |
|---------|----------|----------|----------|----------|
| **API Server** | 8092 | 8092 | HTTP/REST | ✅ Yes |
| **Metrics** | 8093 | 8093 | HTTP | ✅ Yes |
| **PostgreSQL** | 5432 | - | TCP | ❌ No |
| **Redis** | 6379 | - | TCP | ❌ No |
| **RabbitMQ** | 5672 | - | AMQP | ❌ No |
| **RabbitMQ Mgmt** | 15672 | 15672 | HTTP | ✅ Yes |

### Comparison with Other Services

| Service | Port | Notes |
|---------|------|-------|
| **Claude Flow** | 9000 | Primary orchestrator |
| **Nexus Router** | 8000 | LLM gateway |
| **Nexus MCP** | 4001 | MCP gateway |
| **Archon OS** | 8092 | ⚠️ Was 9001 in docs |

**No port conflicts** after documentation fix

---

## Communication Protocol Summary

### 1. REST API Communication

**Client → Archon OS**:
```http
POST /api/v1/agents HTTP/1.1
Host: localhost:8092
X-API-Key: your-api-key
Content-Type: application/json

{
  "name": "researcher-1",
  "type": "researcher",
  "capabilities": ["research", "analysis"]
}
```

**Authentication**: API Key (X-API-Key header) or JWT token

### 2. MCP Protocol Communication

**Transport**: Server-Sent Events (SSE)
**Endpoint**: `http://localhost:8092/mcp`

**Tools Available** (when implemented):
- `archon_spawn_agent`
- `archon_assign_task`
- `archon_get_status`
- `archon_list_agents`
- `archon_create_swarm`
- `archon_execute_task`

### 3. Message Queue Communication

**Protocol**: AMQP (Advanced Message Queuing Protocol)
**Broker**: RabbitMQ
**Exchange**: `archon-exchange` (topic type)
**Queue**: `archon-tasks`

**Flow**:
```
API → Enqueue Task → RabbitMQ → Worker Pool → Execute → Update DB
```

### 4. Cross-Orchestrator Communication

**Archon OS ↔ Claude Flow**:
- **Protocol**: HTTP/REST
- **Hooks**: npx commands via shell
- **Memory**: Shared Redis cache

**Bidirectional Sync**:
```
Claude Flow                    Archon OS
    |                               |
    |------ Task Delegation ------->|
    |<----- Agent Status -----------|
    |                               |
    |------ Memory Update --------->|
    |<----- State Sync -------------|
```

---

## Immediate Action Plan (72 Hours)

### Day 1 (Today): Critical Fixes

1. **Fix Documentation** (30 minutes)
   ```bash
   # Update port references
   cd docs/architecture
   sed -i 's/:9001/:8092/g' DUAL-ORCHESTRATOR-ARCHITECTURE.md
   git add DUAL-ORCHESTRATOR-ARCHITECTURE.md
   git commit -m "fix: Update Archon OS port from 9001 to 8092"
   ```

2. **Assess Source Code Status** (1 hour)
   - Determine if Archon OS is actively used
   - If YES: Plan source code implementation
   - If NO: Remove from repository to reduce complexity

3. **Document Decision** (30 minutes)
   ```bash
   # Create Architecture Decision Record
   cat > docs/architecture/adr/ADR-XXX-archon-os-status.md <<EOF
   # ADR-XXX: Archon OS Deployment Status

   ## Status
   [Accepted/Rejected]

   ## Decision
   [Keep and implement / Remove from deployment]

   ## Rationale
   [Business justification]
   EOF
   ```

### Day 2: Implementation or Cleanup

**If Keeping Archon OS**:
1. Implement minimal FastAPI application (4 hours)
2. Implement MCP server (2 hours)
3. Test deployment (1 hour)

**If Removing Archon OS**:
1. Remove docker-compose configuration (30 min)
2. Update architecture docs (30 min)
3. Clean up references (30 min)

### Day 3: Validation & Documentation

1. Test integration with Claude Flow (2 hours)
2. Update environment variable guides (1 hour)
3. Create deployment runbook (1 hour)

---

## Success Criteria

### Deployment Readiness Checklist

- [ ] Port documentation consistent (9001 → 8092)
- [ ] Source code present or pre-built image specified
- [ ] MCP server implemented or removed
- [ ] Environment variables configured
- [ ] `orchestrator-network` created
- [ ] Health checks passing
- [ ] Integration with Claude Flow tested
- [ ] API documentation generated
- [ ] Secrets migrated to Infisical
- [ ] Architecture diagrams updated

### Validation Commands

```bash
# 1. Network exists
docker network inspect orchestrator-network

# 2. Services healthy
docker-compose ps
curl http://localhost:8092/health

# 3. Database accessible
docker exec archon-postgres pg_isready -U archon

# 4. Redis working
docker exec archon-redis redis-cli ping

# 5. RabbitMQ operational
docker exec archon-rabbitmq rabbitmq-diagnostics ping

# 6. Claude Flow integration
curl http://localhost:9000/health
curl http://localhost:8092/health

# 7. MCP tools available (if implemented)
curl http://localhost:8092/mcp
```

---

## Long-Term Recommendations

### 1. Implement Health Monitoring (Week 1)

**Grafana Dashboard**:
```yaml
# grafana/dashboards/archon-os.json
{
  "title": "Archon OS Monitoring",
  "panels": [
    {
      "title": "Active Agents",
      "targets": [{"expr": "archon_agents_active"}]
    },
    {
      "title": "Task Throughput",
      "targets": [{"expr": "rate(archon_tasks_completed[5m])"}]
    }
  ]
}
```

### 2. Add Automated Tests (Week 2)

**Integration Tests**:
```python
# tests/integration/test_archon_api.py
import pytest
import httpx

@pytest.mark.asyncio
async def test_create_agent():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8092/api/v1/agents",
            headers={"X-API-Key": "test-key"},
            json={"name": "test", "type": "researcher"}
        )
        assert response.status_code == 201
```

### 3. Implement Backup Strategy (Week 2)

**PostgreSQL Backup**:
```bash
#!/bin/bash
# scripts/backup-archon-db.sh
BACKUP_DIR="/backups/archon-os"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

docker exec archon-postgres pg_dump -U archon archon_os \
  | gzip > "${BACKUP_DIR}/archon_${TIMESTAMP}.sql.gz"

# Retain last 30 days
find "${BACKUP_DIR}" -name "archon_*.sql.gz" -mtime +30 -delete
```

**Cron Job**:
```cron
0 2 * * * /opt/nyra/scripts/backup-archon-db.sh
```

### 4. Add Disaster Recovery (Week 3)

**Recovery Procedure**:
```bash
# 1. Restore latest backup
gunzip < /backups/archon-os/archon_latest.sql.gz \
  | docker exec -i archon-postgres psql -U archon archon_os

# 2. Restart services
docker-compose restart

# 3. Verify health
curl http://localhost:8092/health
```

---

## Contact & Support

**Document Owner**: System Architecture Designer
**GitHub Issues**: https://github.com/ellisapotheosis/Project-Nyra/issues
**Architecture Reviews**: Create issue with label `architecture`

**Related Documents**:
- [Archon OS Integration Analysis](./ARCHON-OS-INTEGRATION-ANALYSIS.md)
- [Dual Orchestrator Architecture](./DUAL-ORCHESTRATOR-ARCHITECTURE.md)
- [Network Topology Diagram](./diagrams/archon-os-network-topology.mmd)
- [Database Schema Diagram](./diagrams/archon-os-database-schema.mmd)

---

**Last Updated**: 2026-01-18
**Next Review**: 2026-02-18 (30 days)
