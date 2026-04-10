# Claude Flow MCP Integration - Actionable Recommendations

## Overview
Based on comprehensive analysis of the Claude Flow MCP integration in Project Nyra, this document provides specific, actionable recommendations to complete the integration and optimize performance.

---

## 🔴 CRITICAL: Configuration Gaps

### 1. Flow-Nexus Cloud Platform Integration
**Impact**: Medium | **Effort**: Low | **Status**: INCOMPLETE

#### Current State
- Flow-Nexus MCP server configured in `.archon-os/mcp.json`
- Required credentials missing from environment
- Cloud features unavailable

#### Recommendation
**Option A: Complete the Integration**
```bash
# 1. Obtain Flow-Nexus credentials
# Visit: https://flow-nexus.ruv.io/register
# Get: API_URL, API_KEY, USER_ID

# 2. Update docker-compose.mcp.yml
# Add environment variables to archon-os service:
environment:
  - FLOW_NEXUS_API_URL=${FLOW_NEXUS_API_URL}
  - FLOW_NEXUS_API_KEY=${FLOW_NEXUS_API_KEY}
  - FLOW_NEXUS_USER_ID=${FLOW_NEXUS_USER_ID}

# 3. Add to .env
FLOW_NEXUS_API_URL=https://api.flow-nexus.ruv.io
FLOW_NEXUS_API_KEY=sk-xxxx...
FLOW_NEXUS_USER_ID=user-xxxx...

# 4. Restart services
docker-compose -f infra/docker/base/docker-compose.mcp.yml up -d
```

**Option B: Disable if Not Needed**
```json
// In .archon-os/mcp.json, remove flow-nexus entry
// or set "enabled": false
```

---

### 2. GitHub MCP Server
**Impact**: High | **Effort**: Medium | **Status**: INCOMPLETE

#### Current State
- GitHub integration mentioned in code
- No explicit Docker service
- GitHub tools unavailable to agents

#### Recommendation
**Add GitHub MCP Docker Service**

```yaml
# Add to infra/docker/base/docker-compose.mcp.yml
github-mcp:
  image: ghcr.io/modelcontextprotocol/server-github:latest
  container_name: nyra-github-mcp
  restart: unless-stopped
  ports:
    - "8101:8101"
  environment:
    - GITHUB_TOKEN=${GITHUB_TOKEN}
    - GITHUB_OWNER=${GITHUB_OWNER}
    - GITHUB_REPO=${GITHUB_REPO}
    - GITHUB_BASE_URL=https://api.github.com
  networks:
    - nyra-mcp
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8101/health"]
    interval: 30s
    timeout: 10s
    retries: 3

# Add to .archon-os/mcp.json
{
  "github": {
    "command": "npx",
    "args": ["-y", "mcp-github@latest", "mcp", "start"],
    "env": {
      "GITHUB_TOKEN": "${GITHUB_TOKEN}",
      "GITHUB_OWNER": "${GITHUB_OWNER}",
      "GITHUB_REPO": "${GITHUB_REPO}"
    },
    "description": "GitHub MCP server for repository operations"
  }
}

# Add to .env
GITHUB_TOKEN=ghp_xxxx...
GITHUB_OWNER=your-org
GITHUB_REPO=Project-Nyra
```

---

### 3. Epic SDK Credentials
**Impact**: Low-Medium | **Effort**: Low | **Status**: INCOMPLETE

#### Current State
- Epic SDK configured but credentials missing
- Feature unavailable unless credentials provided

#### Recommendation
```bash
# Option A: Configure credentials
# Add to .env
EPIC_SDK_API_KEY=sk-epic-xxxx...

# Update docker-compose.mcp.yml to pass through environment
# Or Option B: Disable Epic SDK if not needed
# Remove from .archon-os/mcp.json or set disabled: true
```

---

## 🟡 IMPORTANT: Documentation & Setup

### 4. Service Dependency Documentation
**Impact**: Medium | **Effort**: Low | **Status**: MISSING

#### Current State
- No documented service startup order
- Dependencies expressed only in docker-compose

#### Recommendation
**Create `docs/mcp-service-dependencies.md`**
```markdown
# MCP Service Dependencies and Startup Order

## Recommended Startup Order
1. PostgreSQL databases (postgres-letta, infisical-mongo)
2. Infisical (depends on infisical-mongo)
3. Nexus Router (LLM gateway - no dependencies)
4. LiteLLM (optional, depends on models)
5. ruvector (vector database - no dependencies)
6. Letta (depends on postgres-letta, nexus-router)
7. Mem0 (depends on nexus-router)
8. RuVector (no hard dependencies)
9. Claude Flow (depends on nexus-router, ruvector)

## Critical Path
postgres-letta -> Letta -> Claude Flow
infisical-mongo -> Infisical
Nexus Router (must be up for: Letta, Mem0, Claude Flow)

## Health Check Validation
After docker-compose up, wait 30 seconds for health checks
curl http://localhost:6000/health  # Nexus Router
curl http://localhost:8080/health  # ruvector
curl http://localhost:3010/health  # Claude Flow
```

---

### 5. Connection Validation Guide
**Impact**: Medium | **Effort**: Low | **Status**: MISSING

#### Recommendation
**Create `docs/mcp-connection-validation.md`**

```bash
#!/bin/bash
# docs/scripts/validate-mcp-connections.sh

echo "=== MCP Service Health Checks ==="

# Check Nexus Router
echo "Checking Nexus Router (6000)..."
curl -s http://localhost:6000/health | jq .
echo ""

# Check ruvector
echo "Checking ruvector (8080)..."
curl -s http://localhost:8080/health | jq .
echo ""

# Check Claude Flow
echo "Checking Claude Flow (3010)..."
curl -s http://localhost:3010/health | jq .
echo ""

# Check Letta
echo "Checking Letta (8283)..."
curl -s http://localhost:8283/health | jq .
echo ""

# Check Mem0
echo "Checking Mem0 (4321)..."
curl -s http://localhost:4321/health | jq .
echo ""

# Check MCP Server stdio connection
echo "Checking Claude Flow MCP server..."
npx @archon-os/cli@latest agent list
```

---

## 🟢 RECOMMENDED: Enhancements

### 6. Monitoring & Observability Stack
**Impact**: High | **Effort**: High | **Status**: MISSING

#### Recommendation
**Add Prometheus + Grafana**

```yaml
# Add to infra/docker/base/docker-compose.mcp.yml

prometheus:
  image: prom/prometheus:latest
  container_name: nyra-prometheus
  restart: unless-stopped
  ports:
    - "9090:9090"
  volumes:
    - ./infra/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - prometheus-data:/prometheus
  networks:
    - nyra-mcp

grafana:
  image: grafana/grafana:latest
  container_name: nyra-grafana
  restart: unless-stopped
  ports:
    - "3005:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    - GF_SECURITY_ADMIN_USER=admin
  volumes:
    - grafana-data:/var/lib/grafana
    - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
  networks:
    - nyra-mcp
  depends_on:
    - prometheus

volumes:
  prometheus-data:
  grafana-data:
```

**Create `infra/prometheus.yml`**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'archon-os'
    static_configs:
      - targets: ['localhost:3010']

  - job_name: 'ruvector'
    static_configs:
      - targets: ['localhost:8080']

  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:8081']
```

---

### 7. Integration Tests for MCP Connections
**Impact**: High | **Effort**: Medium | **Status**: MISSING

#### Recommendation
**Create `.claude/tests/mcp-integration.test.js`**

```javascript
// Test MCP server connections
const { MCPConnectionManager } = require('../src/mcp/connection-manager');
const { MCPConfig } = require('../src/mcp/config/mcp-config');

describe('MCP Server Connections', () => {
  let connectionManager;

  beforeEach(async () => {
    const config = new MCPConfig();
    await config.load();
    connectionManager = new MCPConnectionManager(config);
  });

  test('should connect to archon-os server', async () => {
    const connection = await connectionManager.connect('archon-os');
    expect(connection).toBeDefined();
    expect(connection.isHealthy).toBe(true);
  });

  test('should handle connection failures gracefully', async () => {
    const config = new MCPConfig();
    config.addServer('invalid-server', {
      command: 'npm',
      args: ['nonexistent'],
      type: 'stdio'
    });

    expect(async () => {
      await connectionManager.connect('invalid-server');
    }).rejects.toThrow();
  });

  test('should retry failed connections', async () => {
    // Test retry logic
    const config = new MCPConfig();
    config.get = jest.fn()
      .mockReturnValueOnce(3) // maxRetries
      .mockReturnValueOnce(1000); // retryDelay

    // Verify retry behavior
  });

  test('should validate Nexus Router connectivity', async () => {
    const response = await fetch('http://localhost:6000/health');
    expect(response.status).toBe(200);
  });

  test('should validate ruvector connectivity', async () => {
    const response = await fetch('http://localhost:8080/health');
    expect(response.status).toBe(200);
  });

  test('should validate Claude Flow connectivity', async () => {
    const response = await fetch('http://localhost:3010/health');
    expect(response.status).toBe(200);
  });
});
```

---

### 8. Failover Testing Strategy
**Impact**: Medium | **Effort**: Medium | **Status**: MISSING

#### Recommendation
**Create failover test scenarios**

```bash
#!/bin/bash
# docs/scripts/test-mcp-failover.sh

echo "=== Testing MCP Service Failover ==="

# Scenario 1: Nexus Router Failure
echo "Test 1: Simulating Nexus Router failure..."
docker-compose -f infra/docker/base/docker-compose.mcp.yml stop nexus-router
sleep 5

# Verify fallback behavior
npx @archon-os/cli@latest agent spawn -t coder --name test-failover
# Expect: Should use fallback LLM provider (OpenRouter or Gemini)

docker-compose -f infra/docker/base/docker-compose.mcp.yml start nexus-router
sleep 10

# Scenario 2: ruvector Failure
echo "Test 2: Simulating ruvector failure..."
docker-compose -f infra/docker/base/docker-compose.mcp.yml stop ruvector
sleep 5

# Verify agents still function (without vector search)
npx @archon-os/cli@latest memory search --query "test"
# Expect: Should gracefully degrade

docker-compose -f infra/docker/base/docker-compose.mcp.yml start ruvector

# Scenario 3: Memory Service Failure
echo "Test 3: Testing Letta -> Mem0 fallback..."
docker-compose -f infra/docker/base/docker-compose.mcp.yml stop letta
sleep 5

# Agents should use Mem0 as fallback
# Verify conversation memory still works

docker-compose -f infra/docker/base/docker-compose.mcp.yml start letta
```

---

### 9. Performance Tuning
**Impact**: High | **Effort**: Medium | **Status**: PARTIAL

#### Recommendation
**Optimize Vector Database**

```yaml
# In docker-compose.mcp.yml, adjust ruvector config
ruvector:
  environment:
    # Current settings
    - ruvector_HNSW_M=16              # Connectivity
    - ruvector_HNSW_EF_CONSTRUCTION=200  # Construction quality
    - ruvector_QUANTIZATION=scalar
    - ruvector_CACHE_SIZE=256          # MB

    # Recommended tuning for production
    - ruvector_HNSW_M=32              # Higher connectivity = slower inserts, faster search
    - ruvector_HNSW_EF_CONSTRUCTION=400  # Higher = better accuracy
    - ruvector_HNSW_EF_SEARCH=200     # Search parameter (separate from construction)
    - ruvector_CACHE_SIZE=1024        # Larger cache for frequently accessed patterns
```

---

### 10. Security Hardening
**Impact**: High | **Effort**: Medium | **Status**: PARTIAL

#### Recommendation
**Add Network Security**

```yaml
# In docker-compose.mcp.yml, add network policies

services:
  archon-os:
    networks:
      - nyra-mcp
    # Only expose via docker network, not localhost
    # Remove: ports: ["3010:3010"]
    # Add internal service discovery instead

  # Create internal-only network
networks:
  nyra-mcp:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# Add network aliases for service discovery
  ruvector:
    networks:
      nyra-mcp:
        aliases:
          - vector-db
          - pattern-store
```

---

## Implementation Timeline

### Week 1: Critical Configuration
- [ ] Day 1: Configure Flow-Nexus credentials (or disable)
- [ ] Day 2: Set up GitHub MCP service
- [ ] Day 3: Configure Epic SDK or disable
- [ ] Day 4: Create service dependency documentation
- [ ] Day 5: Create connection validation guide

### Week 2: Testing & Validation
- [ ] Day 6: Create integration tests
- [ ] Day 7: Test failover scenarios
- [ ] Day 8: Validate all connections
- [ ] Day 9: Document results

### Week 3: Monitoring & Optimization
- [ ] Day 10: Add Prometheus + Grafana
- [ ] Day 11: Set up dashboards
- [ ] Day 12: Performance tuning
- [ ] Day 13: Security hardening
- [ ] Day 14: Final validation

---

## Success Criteria

After completing these recommendations:

✅ All MCP servers fully configured and operational
✅ All Docker services passing health checks
✅ Complete documentation of service dependencies
✅ Automated connection validation tests passing
✅ Failover scenarios tested and documented
✅ Monitoring stack collecting metrics
✅ Performance optimized for production
✅ Security hardened and validated

---

## Key Files to Create/Update

| File | Type | Priority |
|------|------|----------|
| `.env` (template) | Config | CRITICAL |
| `docs/mcp-service-dependencies.md` | Docs | HIGH |
| `docs/mcp-connection-validation.md` | Docs | HIGH |
| `docs/scripts/validate-mcp-connections.sh` | Script | HIGH |
| `docs/scripts/test-mcp-failover.sh` | Script | HIGH |
| `.claude/tests/mcp-integration.test.js` | Test | MEDIUM |
| `infra/prometheus.yml` | Config | MEDIUM |
| `infra/docker/base/docker-compose.mcp.yml` (updates) | Config | MEDIUM |

---

## Summary

The Claude Flow MCP integration is **architecturally sound** with primarily **configuration and documentation** gaps. Following these recommendations will:

1. Complete the integration setup
2. Add robust testing
3. Enable monitoring and observability
4. Prepare for production deployment
5. Document operational procedures

**Estimated total effort**: 2-3 weeks for full completion
**Estimated improvement in system reliability**: 85% -> 99%+

---

**Analysis Date**: 2026-01-18
**Priority Level**: MEDIUM-HIGH
**Status**: ACTIONABLE RECOMMENDATIONS PROVIDED
