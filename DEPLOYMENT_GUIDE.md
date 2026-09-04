# Project Nyra — Full Stack Deployment Guide

> ## SUPERSEDED FOR THE CONTROL PLANE
>
> **The canonical deployment procedure is now
> [docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md](./docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md).**
>
> This guide predates the 2026-09-04 LiteLLM-native control-plane migration and
> is retained for the application-service phases only. Everything below that
> describes **Nexus Router** as the MCP aggregation layer is **obsolete**:
>
> * Nexus is retired. LiteLLM is the canonical model gateway *and* the canonical
>   MCP aggregation layer. See
>   [docs/architecture/NYRA_MCP_ARCHITECTURE.md](./docs/architecture/NYRA_MCP_ARCHITECTURE.md).
> * MCP servers are registered declaratively in
>   `infra/configs/litellm/config.yaml`, not "registered with Nexus Router" at
>   runtime. Do not run the `nexus-router:7001` commands in Phase 3 — that
>   endpoint does not exist in the current architecture.
> * There are exactly **two** GPU workers; a third (an RTX 3060) was retired and
>   sold.
> * Deployment uses the root `compose.yaml` host profiles via
>   `scripts/deploy/deploy-{oracle,worker-5090,worker-3090ti,all}.sh`.
> * Internal traffic uses `100.64.0.0/10` Tailnet addresses, never public
>   `projectnyra.com` hostnames.
>
> Where this guide and the runbook conflict, **the runbook wins**.

## Autonomous Execution Plan

**Status:** Phase 0 (Audit) Complete  
**Next:** Phase 1 (Agent-Vault) — CRITICAL PATH  
**Target:** All 60+ services deployed and verified

---

## Prerequisites

### 1. SSH Access to Oracle-VPS (BLOCKER — FIXING NOW)

**Current Issue:** SSH to oracle-vps (100.64.0.31) times out on port 22

**Fix:**

```bash
# On oracle-vps host (local terminal or Portainer console):
sudo systemctl status ssh
sudo systemctl restart ssh

# Verify sshd is listening:
sudo ss -tlnp | grep sshd
# Should show: tcp 0 0 0.0.0.0:22

# Add THIS PC's SSH key to authorized_keys:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
# Add your public key here
EOF
chmod 600 ~/.ssh/authorized_keys

# Test connection from this PC:
ssh -v ubuntu@100.64.0.31
```

### 2. Environment Variables

Copy template + fill secrets:

```bash
cd infra/hosts/oracle-vps
cp example.env .env
# Edit .env with actual values:
# - INFISICAL_TOKEN
# - POSTGRES_PASSWORD
# - All API keys (Tavily, Firecrawl, Canva, etc.)
```

### 3. Portainer Agent Connectivity

Verify all 4 nodes registered:

```bash
# From localhost:
curl -X GET "http://orchestrator:9001/api/endpoints" \
  -H "X-API-Key: ${PORTAINER_API_KEY}"
```

Expected: 5 endpoints (oracle-vps + orchestrator + 3 workers)

---

## Deployment Phases

### PHASE 0: Infrastructure Verification ✅

- [x] Audit existing compose files
- [x] Verify local container infrastructure
- [ ] Fix SSH to oracle-vps
- [ ] Verify Caddy reverse proxy operational
- [ ] Test Portainer agent connectivity

**Action:**

```bash
# SSH fix (see Prerequisites #1)
ssh ubuntu@100.64.0.31 "docker ps -a | wc -l"
# Should return number of running containers

# Verify Caddy:
curl -k https://100.64.0.31/health

# Verify Portainer dashboard accessible
open https://100.64.0.3:9443  # Tailscale IP
```

---

### PHASE 1: Agent-Vault (CRITICAL) ⏳

**Deploy to:** oracle-vps (behind mcp-gateway + Cloudflare Access)

```bash
cd infra/hosts/oracle-vps

# 1. Prepare environment
cat > .env.agent-vault << 'EOF'
AGENT_VAULT_MASTER_PASSWORD=<generate-strong-password>
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=<from-infisical>
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=<from-infisical>
AGENT_VAULT_ADDR=http://127.0.0.1:14321
AGENT_VAULT_SMTP_HOST=<your-smtp>
EOF

# 2. Deploy
make up
docker compose -f docker-compose.agent-vault.yml up -d agent-vault

# 3. Verify
curl -s http://127.0.0.1:14321/health | jq .
# Expected: {"status":"healthy"}

# 4. Test MCP connection
curl -X POST http://localhost:8888/mcp/agent-vault/initialize \
  -H "Authorization: Bearer ${CF_ACCESS_TOKEN}"
```

**Status Indicator:** Agent-Vault running + Infisical connected → **GREEN**

---

### PHASE 2: Foundation Services ⏳

**Deploy to:** oracle-vps

#### 2a. Supabase (DB + Auth)

```bash
docker compose -f docker-compose.supabase.yml up -d

# Verify
curl -s http://127.0.0.1:9999/health | jq .
psql -h 127.0.0.1 -U supabase -d postgres -c "SELECT version();"
```

#### 2b. Memory Stack (Letta + Mem0 + FalkorDB + Qdrant)

```bash
docker compose -f docker-compose.memory.yml up -d

# Verify
curl -s http://127.0.0.1:8283/v1/health
curl -s http://127.0.0.1:5001/health
curl -s http://127.0.0.1:6333/health
```

#### 2c. Forgejo (Git Server)

```bash
docker compose -f docker-compose.forgejo.yml up -d

# Verify
curl -s http://127.0.0.1:3000/api/v1/version
```

**Status Indicator:** All 3 healthy → **GREEN**

---

### PHASE 3: MCP Servers (Aggregation via Nexus Router) ⏳

**Deploy to:** oracle-vps (behind nexus-router)

```bash
docker compose -f docker-compose.mcp-servers.yml up -d

# Verify each server health:
for port in 8772 8773 8774 8775 8769 8770 8771 8778; do
  echo "Port $port:"
  curl -sf http://127.0.0.1:$port/health && echo "✅" || echo "❌"
done

# Register with Nexus Router
curl -X POST http://127.0.0.1:8888/register \
  -H "Content-Type: application/json" \
  -d '{
    "servers": [
      {"name": "firecrawl", "url": "http://127.0.0.1:8772"},
      {"name": "git", "url": "http://127.0.0.1:8773"},
      {"name": "next-devtools", "url": "http://127.0.0.1:8774"},
      {"name": "tavily", "url": "http://127.0.0.1:8775"},
      {"name": "shadcn", "url": "http://127.0.0.1:8769"},
      {"name": "sequential-thinking", "url": "http://127.0.0.1:8770"},
      {"name": "playwright", "url": "http://127.0.0.1:8771"},
      {"name": "codebase-index", "url": "http://127.0.0.1:8778"}
    ]
  }'
```

**Status Indicator:** Nexus router sees all 8+ servers → **GREEN**

---

### PHASE 4: Worker-Specific Services ⏳

**Deploy to:** Each worker (3060, 3090ti, 5090)

```bash
# For each worker:
for worker in "worker-rtx3090ti" "worker-rtx5090"; do
  ssh ${worker} "cd /infra/hosts/${worker} && docker compose up -d litellm"
done

# Verify LiteLLM on each worker
for ip in 100.64.0.20 100.64.0.21 100.64.0.22; do
  echo "Worker $ip:"
  curl -sf http://${ip}:4000/health && echo "✅" || echo "❌"
done
```

**Status Indicator:** All 3 workers report liteLLM health → **GREEN**

---

### PHASE 5: Automation & Orchestration ⏳

**Deploy to:** oracle-vps

```bash
# n8n workflow engine
docker compose -f docker-compose.n8n-full.yml up -d

# Verify
curl -s http://127.0.0.1:5678/api/v1/health | jq .

# Twenty CRM (already in main compose)
docker compose -f docker-compose.yml ps | grep twenty

# ActivePieces (already deployed)
docker compose -f docker-compose.activepieces-mcp.yml ps
```

**Status Indicator:** n8n + Twenty + ActivePieces running → **GREEN**

---

### PHASE 6: Monitoring & Observability ⏳

**Deploy to:** oracle-vps + workers

```bash
# Oracle observability stack
docker compose -f docker-compose.monitoring.yml up -d

# Verify
curl -s http://127.0.0.1:9090/-/healthy  # Prometheus
curl -s http://127.0.0.1:3001/api/health  # Grafana
curl -s http://127.0.0.1:3002  # Uptime-kuma
curl -s http://127.0.0.1:8080/healthz  # cAdvisor

# Deploy monitoring agents on workers
for worker in "worker-rtx3090ti" "worker-rtx5090"; do
  ssh ${worker} "docker run -d \
    --name=node-exporter \
    -p 9100:9100 \
    prom/node-exporter:latest"
done
```

**Status Indicator:** Grafana sees all nodes + metrics flowing → **GREEN**

---

### PHASE 7: Optional Premium Services ⏳

```bash
# SearXNG (private search)
docker run -d --name searxng -p 8888:8080 searxng/searxng:latest

# OpenWebUI (LLM interface)
docker run -d --name openwebui -p 8001:8080 \
  -v openwebui_data:/app/backend/data \
  ghcr.io/open-webui/open-webui:latest

# HomeAssistant (if home automation needed)
docker run -d --name homeassistant -p 8123:8123 \
  -v homeassistant_data:/config \
  ghcr.io/home-assistant/home-assistant:latest
```

---

### PHASE 8: Verification & Cutover

#### End-to-End Test

```bash
# 1. Agent-Vault → Infisical
curl -X GET http://127.0.0.1:14321/vaults \
  -H "Authorization: Bearer ${AGENT_VAULT_TOKEN}"

# 2. Nexus Router → MCP Servers
curl -X POST http://nexus-router:7001/mcp/call \
  -H "Authorization: Bearer ${MCP_GATEWAY_TOKEN}" \
  -d '{"server": "firecrawl", "method": "scrape", "url": "https://projectnyra.com"}'

# 3. Claude Code → MCP Gateway
# From Claude Code: try any MCP server in nexus-router list

# 4. Memory Test
curl -X POST http://127.0.0.1:5001/memory/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "data": "test memory"}'

# 5. Workflow Test
# Trigger n8n workflow that uses Letta + Tavily + Firecrawl
curl -X POST http://127.0.0.1:5678/webhook/test-workflow
```

#### Load Test

```bash
# Simulate 10 concurrent Claude Code sessions
for i in {1..10}; do
  curl -X GET \
    --header "Authorization: Bearer ${LITELLM_KEY}" \
    http://orchestrator-litellm:4000/v1/models &
done
wait

# Monitor on Grafana
open https://grafana-oracle.projectnyra.com
```

#### Failover Test

```bash
# Kill primary vLLM worker
docker stop worker-rtx5090-vllm

# Verify routing switches to 3090ti
curl -X POST http://litellm:4000/v1/chat/completions \
  -H "Authorization: Bearer ${LITELLM_KEY}" \
  -d '{"model": "vllm-7b", "messages": [...]}'
# Should succeed with fallback

# Restart
docker start worker-rtx5090-vllm
```

---

## Rollback Plan

If Phase X fails, rollback to Phase X-1:

```bash
# Stop current phase
docker compose -f docker-compose.<phase>.yml down

# Verify previous phase still healthy
docker compose -f docker-compose.<previous>.yml ps

# Investigate error in logs
docker compose logs --tail=100 <failed-service>

# Fix + retry
# (Investigate root cause, update configs, redeploy)
```

---

## Troubleshooting

| Issue                           | Diagnosis                                | Fix                                                  |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| SSH timeout                     | `telnet 100.64.0.31 22` fails            | See Prerequisites #1                                 |
| Caddy not responding            | `curl -k https://100.64.0.31/` times out | Check docker-compose.cloudflared.yml + Caddy logs    |
| MCP servers not registering     | `curl http://nexus-router:7001/status`   | Verify network connectivity, check nexus-router logs |
| Agent-Vault auth fails          | `curl http://agent-vault:14321/health`   | Check Infisical credentials in .env                  |
| Memory stack health checks fail | `docker logs <service>`                  | Verify qdrant + falkordb ports + networking          |
| Grafana dashboards empty        | Check Prometheus targets                 | Verify scrape_configs + target IPs in prometheus.yml |

---

## Post-Deployment Checklist

- [ ] All 60+ services deployed
- [ ] Health checks passing (green on Portainer)
- [ ] Reverse proxy (Caddy) operational
- [ ] Cloudflare tunnels active
- [ ] Infisical integration working
- [ ] MCP servers aggregated via nexus-router
- [ ] Claude Code + Codex can connect to MCP servers
- [ ] Memory system (Letta + Mem0) operational
- [ ] LiteLLM routing working on all workers
- [ ] Monitoring dashboards populated
- [ ] Alerts configured + tested
- [ ] Backup strategy active
- [ ] Documentation complete

---

## Next Steps After Deployment

1. **Configure Claude Code/Codex MCP Servers** (already done earlier)

   ```bash
   claude mcp add --scope user --transport http claude-design https://api.anthropic.com/v1/design/mcp
   ```

2. **Test Agent Workflows**
   - Create Letta agent
   - Enable memory via Mem0
   - Connect to MCP servers
   - Run multi-step workflow

3. **Customize Grafana Dashboards**
   - Add panels for LLM metrics
   - Create alerts for critical services
   - Set up on-call schedules

4. **Enable Automated Backups**
   - Postgres snapshots (daily)
   - Redis persistence
   - Agent state backups

---

**Deployment Owner:** ellisapotheosis  
**Start Date:** 2026-08-25  
**Target Completion:** 2026-08-28  
**Status:** IN PROGRESS
