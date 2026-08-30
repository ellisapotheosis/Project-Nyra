# Remaining Tasks — Project Nyra Deployment

**Status:** Core deployment ✅ COMPLETE  
**Date:** 2026-08-30  
**Branch:** `nyra/phase2-mcp-memory`

---

## Critical Path: DONE ✅

✅ All 18 services operational  
✅ Documentation complete  
✅ Environment configured  
✅ Git history clean  
✅ Tests passing

---

## Immediate Recommended Tasks

### 1. **Create Pull Request** (Manual)

```bash
gh pr create \
  --title "feat(deployment): complete Phase 1-3 orchestration (18 critical services)" \
  --body "See docs/DEPLOYMENT_COMPLETE_2026-08-30.md for full summary"
```

**What it includes:**

- All 3 new commits (memory.yml fix, Phase 4 runbook, deployment docs)
- Supabase auth configuration
- LiteLLM multi-provider gateway
- Comprehensive deployment guide

**Reviewers should verify:**

- [ ] All 18 services listed in deployment docs are actually running
- [ ] Credentials in .env are secure and not exposed in git
- [ ] Docker Compose overlays reference correct networks
- [ ] Tailscale DNS routing tested from multiple peers

---

### 2. **Phase 4: Deploy GPU Workers** (Manual SSH Required)

**When:** After PR merge / verification  
**How:** `docs/PHASE_4_GPU_DEPLOYMENT.md`

```bash
# For each worker (3060, 3090ti, 5090):
ssh worker-rtx5090
cd /path/to/infra/hosts/worker-rtx5090
docker-compose -f docker-compose.yml -f docker-compose.litellm.yml up -d
docker-compose logs -f litellm  # Verify health
```

**Prerequisites:**

- [ ] SSH keys configured
- [ ] Worker .env files complete (2/3 already present)
- [ ] Tailscale connectivity verified
- [ ] Sufficient disk space for model caches

**Outcome:** Adds 3× liteLLM proxies + inference engines, enabling local model routing

---

### 3. **Integration Test: Create Agent → Query Memory** (Automated)

Verify end-to-end stack with real workflow:

```bash
# 1. Create agent in Letta
curl -X POST http://letta.projectnyra.com/v1/agents \
  -H "Authorization: Bearer $LETTA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-agent","model":"claude-3-sonnet","memory_type":"qdrant"}'

# 2. Authenticate with Supabase
RESPONSE=$(curl -X POST https://auth.projectnyra.com/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure"}')
JWT_TOKEN=$(echo $RESPONSE | jq -r '.session.access_token')

# 3. Store data with embedding
curl -X POST https://db.projectnyra.com/rest/v1/documents \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Data","embedding":[0.1,0.2,...]}'

# 4. Query with semantic search
curl -X POST https://db.projectnyra.com/rest/v1/rpc/search \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"query_embedding":[0.15,0.2,...]}'
```

**Success criteria:**

- [ ] Agent created with persistent ID
- [ ] JWT token valid & not expired
- [ ] Data stored in vector DB
- [ ] Semantic search returns results

---

## Optional: Phase 5-8 Enhancements

### Phase 5: Automation & Monitoring

**When:** Deploy if automation/observability needed  
**Services:** n8n, Prometheus, Grafana, Renovate  
**Status:** Compose files prepared; dependencies incomplete

```bash
# To enable:
# 1. Add redis-cache to docker-compose for n8n-worker
# 2. Configure Prometheus scrape targets
# 3. Deploy: docker-compose -f docker-compose.monitoring.yml up -d
```

### Phase 6: Observability (OpenLIT)

**When:** Production observability needed  
**Status:** Requires external API key (skipped for now)

### Phase 7: Optional Services

**When:** Extended capabilities needed  
**Services:**

- SearXNG (metasearch engine)
- OpenWebUI (model chatbox)
- HomeAssistant MCP (IoT)

### Phase 8: Full E2E Testing

**When:** Pre-production verification  
**Scope:**

- Multi-agent scenarios
- Concurrent memory ops
- Real-time subscription delivery
- Knowledge graph traversal
- Credential brokerage under load

---

## Ongoing Maintenance

### Daily

- Monitor Docker container health: `docker ps --format "table {{.Names}}\t{{.Status}}"`
- Check service logs for errors: `docker-compose logs -f <service>`

### Weekly

- Verify Tailscale mesh connectivity
- Audit credential access logs (Infisical)
- Check database growth (PostgreSQL)

### Monthly

- Update container images: `docker-compose pull && docker-compose up -d`
- Rotate credentials in Infisical
- Review git commits & deployment artifacts

---

## Known Limitations

| Limitation                      | Reason                         | Workaround                        |
| ------------------------------- | ------------------------------ | --------------------------------- |
| No Phase 4 auto-deploy          | Workers behind SSH wall        | Manual SSH (documented)           |
| n8n incomplete                  | redis-cache dependency missing | Add to compose + redeploy         |
| OpenLIT skipped                 | Requires external API key      | Set OPENLIT_API_KEY in .env       |
| OpenClaw remote gateway timeout | Orchestrator not accessible    | Configure local gateway or tunnel |

---

## Rollback Plan (If Needed)

If something breaks in production:

```bash
# 1. Revert to last good commit
git revert <commit-hash>
git push origin <branch>

# 2. Restore services from last backup
docker-compose -f docker-compose.yml -f docker-compose.supabase.yml down
# (volumes preserved, data intact)

# 3. Restart from committed state
docker-compose up -d
supabase start

# 4. Verify health
docker-compose ps
supabase status
```

---

## Sign-Off Checklist

- [ ] PR created & reviewed
- [ ] Phase 4 workers deployed (or scheduled)
- [ ] E2E integration test passed
- [ ] Deployment docs reviewed by team
- [ ] Credentials rotated if exposed
- [ ] Backups verified
- [ ] Monitoring alerts configured

**Next milestone:** Phase 4 completion → Full mesh inference routing
