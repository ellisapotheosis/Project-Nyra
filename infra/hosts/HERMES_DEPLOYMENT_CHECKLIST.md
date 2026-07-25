# Hermes Gateway — Deployment Readiness Checklist

**Status:** 🟡 Ready for deployment (awaiting Orchestrator SSH access)  
**Prepared By:** Claude Code  
**Date:** 2026-07-24

---

## Pre-Deployment Verification

### Orchestrator Health
- [ ] SSH access to orchestrator (`ssh ellisapotheosis@100.64.0.10`) — **BLOCKED (sshd timeout)**
- [ ] Docker daemon running on orchestrator — **Blocked pending SSH**
- [ ] LiteLLM proxy healthy on 127.0.0.1:4010 — **Blocked pending SSH**
- [ ] Nexus router healthy on 127.0.0.1:6000 — **Blocked pending SSH**
- [ ] Portainer accessible on 9000 — **Blocked pending SSH**

### Files Ready
- [x] `docker-compose.hermes-gateway.yml` — Service definition ✅
- [x] `hermes.env.example` — Configuration template ✅
- [x] `hermes/mcp-servers.yaml` — MCP routing ✅
- [x] `HERMES_GATEWAY_CONNECTION_GUIDE.md` — Full documentation ✅

### Tailscale Connectivity
- [ ] Verify Tailscale mesh active on worker-rtx5090
  ```bash
  tailscale status | grep orchestrator
  ```
- [ ] Test ping to orchestrator
  ```bash
  ping -c 1 orchestrator.trex-fiordland.ts.net
  ```

---

## BLOCKING ISSUE: Orchestrator SSH Down

**Error:** `ssh: connect to host 100.64.0.10 port 23: Connection timed out`

### Immediate Resolution Required

**On THIS PC (WSL2):**
```bash
# 1. Check if orchestrator is reachable at all
ping 100.64.0.10  # Should get ping response

# 2. Try SSH on alternate port if available
ssh -p 2222 ellisapotheosis@100.64.0.10  # Common fallback

# 3. Check Tailscale routes
tailscale netcheck

# 4. If Tailscale fails, manually restart on orchestrator physical machine
# (requires physical access or remote management)
```

**On Orchestrator (Physical Access Required):**
```bash
# Restart SSH daemon
sudo systemctl restart sshd

# Or (if systemd unavailable):
sudo service ssh restart

# Verify SSH is listening
sudo netstat -tlnp | grep sshd
# Should show: tcp  0  0 0.0.0.0:23  0.0.0.0:*  LISTEN
```

---

## Deployment Procedure (After SSH Restored)

### Step 1: SSH into Orchestrator
```bash
ssh ellisapotheosis@100.64.0.10
# Or via Tailscale:
ssh ellisapotheosis@orchestrator.trex-fiordland.ts.net
```

### Step 2: Navigate to Orchestrator Host Directory
```bash
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/orchestrator
```

### Step 3: Create Environment File
```bash
# Copy template to local env file
cp hermes.env.example .env.hermes.local

# Edit with actual API keys (obtain from Infisical)
nano .env.hermes.local
```

**Required Environment Variables to Fill In:**
```env
LITELLM_HERMES_KEY=<from Infisical: litellm/hermes-key>
NEXUS_API_KEY=<from Infisical: nexus/api-key>
GITEA_API_TOKEN=<from Infisical: gitea/api-token>
FIRECRAWL_API_KEY=<from Infisical: firecrawl/api-key>
TAVILY_API_KEY=<from Infisical: tavily/api-key>
INFISICAL_MCP_TOKEN=<from Infisical: mcp/infisical-token>
PAPERCLIP_API_KEY=<from Infisical: paperclip/api-key>
```

### Step 4: Start Hermes Gateway
```bash
# Start service with environment file
docker-compose -f docker-compose.hermes-gateway.yml \
  --env-file .env.hermes.local \
  up -d

# Monitor startup (should be healthy in ~30 seconds)
docker-compose -f docker-compose.hermes-gateway.yml logs -f hermes-gateway
```

**Expected Output:**
```
hermes-gateway | [INFO] Hermes Gateway starting...
hermes-gateway | [INFO] Connected to LiteLLM at http://127.0.0.1:4010/v1
hermes-gateway | [INFO] Nexus MCP aggregator discovered at http://127.0.0.1:6000
hermes-gateway | [INFO] Server listening on 0.0.0.0:8763
hermes-gateway | [INFO] Health check passing
```

### Step 5: Verify Health
```bash
# Test local health endpoint
curl http://127.0.0.1:8763/health

# Expected response:
# {"status":"healthy","service":"hermes","timestamp":"2026-07-24T..."}

# Test from another machine (worker-rtx5090):
curl http://orchestrator.trex-fiordland.ts.net:8763/health
```

### Step 6: Verify MCP Server Access
```bash
# Query gateway capabilities
curl http://127.0.0.1:8763/info

# Should return available MCP servers and tools
```

---

## Post-Deployment Verification

### From Orchestrator
```bash
# Check container status
docker ps | grep hermes

# Verify port bindings
netstat -tlnp | grep 8763
# Should show: tcp  0  0 0.0.0.0:8763  0.0.0.0:*  LISTEN

# Check logs for errors
docker logs nyra-hermes-gateway | grep -i error
```

### From Worker-RTX5090
```bash
# Test Hermes connectivity
curl -v http://orchestrator.trex-fiordland.ts.net:8763/health

# Should return HTTP 200 with health JSON

# Test with query (if agent supports it)
curl -X POST http://orchestrator.trex-fiordland.ts.net:8763/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, Hermes!",
    "context": {"worker": "rtx5090"}
  }'
```

### Monitoring
```bash
# Enable metrics collection
curl http://orchestrator.trex-fiordland.ts.net:8763/metrics

# Tail logs from Hermes
docker --context orchestrator logs -f hermes-gateway

# Monitor MCP server status
for mcp in mempalace openmemory git tavily firecrawl; do
  echo "Checking $mcp..."
  curl -s http://100.64.0.3:8765/health 2>&1 | head -1
done
```

---

## Rollback Procedure

If Hermes Gateway causes issues:

```bash
# On Orchestrator:
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/orchestrator

# Stop Hermes Gateway
docker-compose -f docker-compose.hermes-gateway.yml down

# Remove state volumes (optional, for clean restart)
docker volume rm nyra-hermes_state

# Verify cleanup
docker ps | grep hermes  # Should show nothing
```

---

## Troubleshooting Guide

### Issue: Container fails to start
```
docker-compose up fails with: "service ... not found"
```

**Solution:**
1. Verify docker-compose.hermes-gateway.yml exists
2. Check .env.hermes.local exists in same directory
3. Validate YAML syntax: `docker-compose -f docker-compose.hermes-gateway.yml config`

### Issue: Health check failing
```
curl: (7) Failed to connect to 127.0.0.1:8763
```

**Solution:**
1. Check if container is running: `docker ps | grep hermes`
2. Check port is bound: `netstat -tlnp | grep 8763`
3. View logs: `docker logs nyra-hermes-gateway`
4. Verify LiteLLM is healthy: `curl http://127.0.0.1:4010/health`

### Issue: MCP servers unreachable
```json
{"error": "mcp_server_unavailable", "server": "mempalace"}
```

**Solution:**
1. Verify MCP server is running on oracle-vps
2. Check network connectivity: `docker exec nyra-hermes-gateway curl http://100.64.0.3:8002/health`
3. Review `hermes/mcp-servers.yaml` configuration

### Issue: Slow response times
```
Query takes >60 seconds to complete
```

**Solution:**
1. Check LiteLLM health and performance
2. Increase ADAPTER_TIMEOUT_MS in .env.hermes.local (default: 900,000ms)
3. Monitor MCP server latency individually
4. Check network bandwidth between orchestrator and oracle-vps

---

## Performance Baselines

| Metric | Target | Current |
|--------|--------|---------|
| Health check response | <500ms | Pending |
| Query execution | <30s | Pending |
| MCP aggregation latency | <2s | Pending |
| Container startup time | <60s | Pending |
| Memory usage | <256MB | Pending |
| Network throughput | >100 Mbps | Pending |

---

## Connection Info Summary for Worker-RTX5090

**Copy this to your worker client configuration:**

```yaml
hermes:
  gateway_url: "http://orchestrator.trex-fiordland.ts.net:8763"
  agent_name: "hermes-orchestrator"
  endpoints:
    health: "/health"
    query: "/query"
    info: "/info"
    metrics: "/metrics"
  settings:
    timeout_ms: 30000
    retry_count: 3
    retry_delay_ms: 1000
  mcp_servers:
    - mempalace
    - openmemory
    - git
    - tavily
    - firecrawl
    - wcgw
    - sequential_thinking
```

---

## Next Steps (Priority Order)

1. **CRITICAL** — Fix Orchestrator SSH access (sshd restart required)
2. **HIGH** — Follow Step 1-6 deployment procedure above
3. **MEDIUM** — Verify worker-rtx5090 can reach Hermes Gateway
4. **MEDIUM** — Fix 70+ container naming violations (see INFRASTRUCTURE_REVIEW.md)
5. **LOW** — Optimize performance baselines based on production workload

---

## Files Checklist

| File | Location | Status |
|------|----------|--------|
| docker-compose.hermes-gateway.yml | `orchestrator/` | ✅ Ready |
| hermes.env.example | `orchestrator/` | ✅ Ready |
| hermes/mcp-servers.yaml | `orchestrator/hermes/` | ✅ Ready |
| HERMES_GATEWAY_CONNECTION_GUIDE.md | `infra/hosts/` | ✅ Ready |
| INFRASTRUCTURE_REVIEW.md | `infra/hosts/` | ✅ Ready |
| DEPLOYMENT_SUMMARY.md | `infra/hosts/` | ✅ Ready |

All files are committed and ready for deployment.

---

**Status:** 🟡 Blocked on Orchestrator SSH  
**Est. Deployment Time:** 5–10 minutes (after SSH restored)  
**Est. Full Verification:** 15–20 minutes

**Contact:** See project-memory.json for escalation details.
