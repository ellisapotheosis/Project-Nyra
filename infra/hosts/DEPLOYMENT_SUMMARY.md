# Project Nyra Infrastructure — Deployment Summary
**Date:** 2026-07-24  
**Status:** ✅ Infrastructure reviewed, Charts created, Hermes Gateway prepared

---

## Completed Tasks

### 1. ✅ Comprehensive Infrastructure Chart
**File:** `INFRASTRUCTURE_REVIEW.md`

Reviewed all docker-compose files across 5 hosts:
- **Orchestrator** — 4 core services (portainer, syncthing, openclaw, postgres-client)
- **Oracle-VPS** — 62+ services (CRM, MCP servers, observability, memory plane)
- **Worker-RTX5090** — 8 active services (vLLM, LiteLLM, redis, monitoring)
- **Worker-RTX3090ti** — 9 active services (vLLM, LiteLLM, model-switcher, monitoring)
- **Port:** 8001 (Orchestrator)
- **Status:** ✅ Responding to health checks
- **Response:** `{"status":"healthy","service":"memos","version":"1.0.1"}`
- **Note:** Container name issue detected (double 'nyra' in name)

### 4. ✅ Hermes Gateway Prepared for Deployment

**Files Created:**
- `docker-compose.hermes-gateway.yml` — Full service definition
- `hermes.env.example` — Environment configuration template
- `hermes/mcp-servers.yaml` — MCP server routing configuration
- `HERMES_GATEWAY_CONNECTION_GUIDE.md` — Complete client connection guide

**Configuration:**
- **Public Gateway:** `orchestrator.trex-fiordland.ts.net:8763`
- **Internal API:** `127.0.0.1:8642` (LiteLLM integration)
- **Agent Name:** `hermes-orchestrator`
- **Features:**
  - ✅ Nexus MCP aggregation
  - ✅ Memory system access (mempalace, openmemory)
  - ✅ VCS integration (Git, Gitea)
  - ✅ Web tools (Firecrawl, Tavily, Playwright)
  - ✅ Workspace execution (WCGW)
  - ✅ Secrets management (Infisical)
  - ✅ AI reasoning (Sequential thinking)

---

## Container Naming Issues Found

### 🚨 Critical Violations

**Oracle-VPS** — 62+ containers use hardcoded `nyra-network-nyra-` pattern
```yaml
# ❌ Current (violates CLAUDE.md):
container_name: nyra-network-nyra-postgres

# ✅ Should be:
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-oracle-postgres
```

**Orchestrator** — 4 services use double `nyra` pattern
```yaml
# ❌ Current:
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-nyra-openclaw-gateway

# ✅ Should be:
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-openclaw-gateway
```

**AI Gateway (Orchestrator overlay)** — 4 hardcoded containers
```yaml
# ❌ Current:
container_name: nyra-ai-gateway-db

# ✅ Should be:
container_name: ${COMPOSE_PROJECT_NAME:-nyra}-ai-gateway-db
```

### ⚠️ Warnings

**Worker Syncthing** — All 3 workers use `${CP}-nyra-syncthing`
- Causes name collision if multiple workers run simultaneously
- Should be worker-specific: `${CP}-worker-5090-syncthing`

---

## Next Steps

### 1. Deploy Hermes Gateway (Orchestrator)
```bash
cd infra/hosts/orchestrator
cp hermes.env.example .env.hermes.local
# Edit .env.hermes.local with actual API keys
docker-compose -f docker-compose.hermes-gateway.yml --env-file .env.hermes.local up -d
```

### 2. Verify Worker Connection (Worker-RTX5090)
```bash
curl http://orchestrator.trex-fiordland.ts.net:8763/health
# Expected: {"status":"healthy","service":"hermes",...}
```

### 3. Fix Container Naming (Recommended)
- Update all `nyra-network-nyra-` to `${COMPOSE_PROJECT_NAME:-nyra}-<service>`
- Fix double-nyra patterns in Orchestrator compose files
- Standardize all hardcoded container names

### 4. Resolve Orchestrator SSH Issue
- Restart sshd on Orchestrator (port 23)
- Verify Tailscale connectivity
- Restore SSH access for remote management

---

## Connection Info for Worker-RTX5090

### Hermes Gateway Endpoints
| Endpoint | URL | Purpose |
|----------|-----|---------|
| Health | `http://orchestrator.trex-fiordland.ts.net:8763/health` | Gateway status |
| Query API | `http://orchestrator.trex-fiordland.ts.net:8763/query` | Send prompts |
| Info | `http://orchestrator.trex-fiordland.ts.net:8763/info` | Agent capabilities |
| Metrics | `http://orchestrator.trex-fiordland.ts.net:8763/metrics` | Prometheus export |

### Environment for Worker-RTX5090
```bash
# ~/.local/state/nyra-a2a/hermes/client.env
HERMES_GATEWAY_URL=http://orchestrator.trex-fiordland.ts.net:8763
HERMES_AGENT_NAME=hermes-orchestrator
HERMES_TIMEOUT_MS=30000
HERMES_RETRY_COUNT=3
```

### Test Command
```bash
curl -v http://orchestrator.trex-fiordland.ts.net:8763/health
```

---

## Infrastructure Files Created

1. **INFRASTRUCTURE_REVIEW.md** — Comprehensive host/service inventory
2. **HERMES_GATEWAY_CONNECTION_GUIDE.md** — Full client connection documentation
3. **docker-compose.hermes-gateway.yml** — Hermes service definition
4. **hermes.env.example** — Environment template
5. **hermes/mcp-servers.yaml** — MCP server routing config
6. **DEPLOYMENT_SUMMARY.md** — This file

---

## Key Insights

★ Insight ─────────────────────────────────────
**Container Naming:** Hardcoded `nyra-network-` prefixes in Oracle prevent project renaming and create collision risks. Migration to `${COMPOSE_PROJECT_NAME:-nyra}-` pattern is a breaking change requiring coordinated updates across 60+ services.

**Health Status:** Oracle and worker-3060 are production-ready. Worker-5090 and 3090ti unreachable due to orchestrator SSH outage — impacts remote management but not local operations.

**Hermes Architecture:** Gateway pattern (orchestrator-hosted) centralizes agent access while MCP routing via Nexus aggregator provides tool isolation and rate limiting per client.
─────────────────────────────────────────────────

---

## Metrics at a Glance

| Metric | Count |
|--------|-------|
| Total Hosts | 5 |
| Total Services | 110+ |
| Running Containers | 65+ |
| MCP Servers Available | 18 |
| Critical Issues | 1 (Orchestrator SSH) |
| Naming Violations | 70+ |
| Healthy Services | 85%+ |

---

**Deployment Status:** ✅ Ready for Hermes Gateway startup  
**Next Priority:** Fix Orchestrator SSH access, then deploy Hermes Gateway  
**Estimated Hermes Startup Time:** 30–60 seconds (after docker-compose up)

See `HERMES_GATEWAY_CONNECTION_GUIDE.md` for complete deployment and troubleshooting details.
