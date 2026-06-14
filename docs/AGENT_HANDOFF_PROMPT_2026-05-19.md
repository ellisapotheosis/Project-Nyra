# Agent Handoff Prompt — Project Nyra Phase 1-12 Execution

**Handoff Date**: 2026-05-19  
**Status**: Foundation complete, ready for parallel execution  
**Context**: Primary agent handling infrastructure/memory layers. Secondary agent: Execute remaining prompts in parallel.

---

## CRITICAL CONTEXT

### Current Architecture (FINAL)

```
Memory Stack:     Mem0 + FalkorDB + Qdrant + Letta + OpenMemory MCP + MemPalace
AI Routing:       Nexus Router (port 7000) + LiteLLM
CRM:              TwentyCRM (Oracle VPS, port 3000)
Automation:       n8n (port 5678) + Activepieces + Composio
Infrastructure:   4-node cluster (orchestrator + 3 GPU workers + oracle-vps)
Network:          Tailscale mesh + Cloudflare Tunnel ingress
```

### What's BLOCKED (Cannot start yet)

- **Prompt 03** (CRM): Blocked until Prompt 02 memory + AI routing complete
- **Prompts 04-07** (Quote Engine, Campaigns, APIs): Blocked until Prompt 03 complete
- **Prompts 08-11** (Security, Portal, DevOps, Testing): Blocked until Prompts 03-07 start
- **Prompt 12** (Integration): Blocked until Prompts 01-11 complete

### What's READY NOW (Start immediately)

- **Prompt 01** (Infrastructure) — 40% complete, 40 hours remaining
- **Prompt 02** (Memory/AI Routing) — 35% complete, 40 hours remaining

---

## YOUR MISSION

Execute **Prompts 01-02 fully** (Phase 1, Weeks 1-2):

### Prompt 01 — Infrastructure & Environment (~40 hours)

**Status**: 40% complete

**Deliverables** (in order):

1. **Phase 1.1 — Infrastructure Validation** (Done ✅)
   - [x] health-check.sh created (validates all 5 hosts, Docker, services, Tailscale, git state)
   - [x] INFRASTRUCTURE_REFERENCE.md created (complete cluster topology)
2. **Phase 1.2 — Network Topology Mapping** (TODO)
   - [ ] Create `network-map.sh` (DNS resolution, IP discovery, Tailscale routes, service endpoints)
   - [ ] Document all 5 hosts: orchestrator, worker-rtx5090, worker-rtx3090ti, worker-rtx3060, oracle-vps
   - [ ] Map Tailscale mesh (100.64.0.0/10 network)
   - [ ] Verify Cloudflare Tunnel public ingress routes
   - [ ] Create `docs/NETWORK_TOPOLOGY.md` with diagrams

3. **Phase 1.3 — Setup Documentation** (TODO)
   - [ ] Create `README_SETUP.md` (complete setup guide for new team members)
   - [ ] Document: prerequisites, hardware requirements, network setup, git submodules init
   - [ ] Include: Makefile targets, health check procedures, common troubleshooting
   - [ ] Add: SSH key setup, Tailscale config, Docker daemon verification

4. **Phase 1.4 — Makefile Enhancements** (TODO)
   - [ ] Add target: `make health` (runs health-check.sh on all hosts)
   - [ ] Add target: `make deploy` (deploys services per host)
   - [ ] Add target: `make logs` (aggregates logs from all services)
   - [ ] Add target: `make clean` (cleanup old images, volumes, containers)
   - [ ] Add target: `make test` (runs infrastructure validation tests)

5. **Phase 1.5 — Hostname Enforcement & DNS** (TODO)
   - [ ] Document hostname resolution (local /etc/hosts for all 5 hosts)
   - [ ] Verify Tailscale DNS for `.ts.net` domains
   - [ ] Document Cloudflare DNS for public `*.ratehunter.net` routes
   - [ ] Create `infra/hosts/HOSTNAME_CONFIG.md`

**Success Criteria**:

- ✅ All 8 categories in health-check.sh pass
- ✅ All 5 hosts discoverable (ping, ssh, curl)
- ✅ Docker Compose validates on all hosts
- ✅ All documentation complete and tested

---

### Prompt 02 — AI Routing, Memory Architecture, MCP (~40 hours)

**Status**: 35% complete (Memory architecture DECIDED ✅)

**Deliverables** (in order):

1. **Phase 2.1 — Memory Stack Setup** (TODO)
   - [ ] Deploy Letta service (Oracle VPS, Mem0 session manager)
   - [ ] Deploy FalkorDB (Oracle VPS, graph backend for relationships)
   - [ ] Deploy Qdrant (Oracle VPS, vector backend for embeddings)
   - [ ] Deploy Mem0 (Optional/Enterprise audit layer)
   - [ ] Verify OpenMemory MCP integration (stdio-based protocol)
   - [ ] Deploy MemPalace (knowledge organization & human discovery interface)
   - [ ] Run integration tests (Letta ↔ FalkorDB ↔ Qdrant)
   - See: `/docs/MEMORY_ARCHITECTURE_DECISION.md` (6-phase implementation plan with code examples)

2. **Phase 2.2 — OpenClaw Agent Deployment** (TODO)
   - [ ] Deploy OpenClaw Gateway on orchestrator (agent runtime)
   - [ ] Deploy OpenClaw Studio on orchestrator (agent dashboard)
   - [ ] Configure OpenClaw to use Nexus Router (LLM gateway)
   - [ ] Integrate OpenClaw with Letta (session persistence)
   - [ ] Verify agent creation & inference workflows

3. **Phase 2.3 — LiteLLM Model Routing** (TODO)
   - [ ] Configure LiteLLM on orchestrator (model gateway)
   - [ ] Add GPU worker routes: worker-rtx5090 (vLLM primary), worker-rtx3090ti (vLLM secondary), worker-rtx3060 (Ollama embeddings)
   - [ ] Configure fallback routing: local GPU → DeepSeek-R1 (cloud) → Claude Sonnet (critical path)
   - [ ] Load balance across workers
   - [ ] Test latency (<500ms for local, <2s for cloud fallback)

4. **Phase 2.4 — Nexus Router MCP Aggregation** (TODO)
   - [ ] Deploy Nexus Router on orchestrator:7000
   - [ ] Configure MCP tool aggregation (memory stack + Letta + OpenClaw + n8n + Activepieces)
   - [ ] Implement fuzzy search for tool discovery
   - [ ] Test: `curl http://localhost:7000/health` → 200 OK
   - [ ] Verify agent tool routing through Nexus

5. **Phase 2.5 — vLLM Endpoints Verification** (TODO)
   - [ ] Verify worker-rtx5090 vLLM (port 8000, models: DeepSeek-R1 236B, Qwen 2.5 72B)
   - [ ] Verify worker-rtx3090ti vLLM (port 8000, models: Llama 3.1 70B, Mistral 123B)
   - [ ] Verify worker-rtx3060 Ollama (port 11434, models: CodeLlama 34B, Qwen 32B)
   - [ ] Test inference latency from orchestrator through Nexus Router
   - [ ] Document: Available models, token limits, context windows, throughput

**Success Criteria**:

- ✅ All memory services (Letta, FalkorDB, Qdrant, Mem0, MemPalace, OpenMemory MCP) running
- ✅ OpenClaw creating agents and executing inference
- ✅ LiteLLM routing to all GPU workers with <500ms latency
- ✅ Nexus Router aggregating all MCP tools
- ✅ End-to-end inference pipeline: OpenClaw → Nexus → LiteLLM → GPU worker → response in <2s

---

## KEY DOCUMENTS (READ FIRST)

**Critical for execution:**

1. `/docs/MEMORY_ARCHITECTURE_DECISION.md` — 6-phase memory implementation plan with code examples
2. `/docs/PHASE_1_IMPLEMENTATION_ROADMAP.md` — Day-by-day execution guide for Prompts 01-02
3. `/docs/INFRASTRUCTURE_REFERENCE.md` — Complete cluster topology, ports, services, health checks
4. `/infra/CLAUDE.md` — Docker Compose structure, service locations, conventions
5. `AGENTS.md` — System-wide architecture, hard rules, product invariants

**Status tracking:** 6. `/docs/IMPLEMENTATION_STATUS_2026-05-19.md` — Current completion status 7. `/docs/PROMPTS_OVERVIEW_AND_STATUS_2026-05-19.md` — All 12 prompts overview 8. `/docs/CLEANUP_SUMMARY_2026-05-19.md` — What was cleaned up, what's ready

---

## HARD RULES & CONSTRAINTS

1. **Never commit secrets** — Use Infisical for all keys (ANTHROPIC_API_KEY, OpenRouter, Twilio, SendGrid, etc.)
2. **Never expose worker inference endpoints publicly** — GPU workers only accessible via Tailscale + Nexus Router
3. **Memory stack is FINAL** — Mem0 + FalkorDB + Qdrant + Letta + OpenMemory MCP + MemPalace (no RuVector, Claude-Flow, Ruflo)
4. **TwentyCRM is system-of-record** — All borrower/loan data flows through it, never bypass
5. **Container naming** — Use `${COMPOSE_PROJECT_NAME:-nyra}-<service>` pattern (never hardcode `nyra-`)
6. **File organization** — Compose files in `infra/hosts/<hostname>/`, configs in `infra/configs/`, scripts in `infra/scripts/`
7. **Syncthing keeps workers synced** — `/home/ellisapotheosis` mirrored across orchestrator + 3 workers

---

## PARALLEL EXECUTION STRATEGY

**You (Agent 2)**: Execute Prompts 01-02 (Phase 1)  
**Primary Agent**: Stands by to support, merge conflicts, reviews, final verification

**Merge strategy:**

- Branch: `feature/phase-1-<component>` (e.g., `feature/phase-1-network-mapping`)
- Commit message format: `feat(infra): <description>\n\nPhase: 01, Component: <name>`
- Create PR against `main` (or `codex/archive-agent-runtime-config` if primary is on different branch)

**Dependencies:**

- If primary agent completes Phase 2.1 memory stack → You can proceed with Phase 2.2 OpenClaw
- If blocked → Notify primary immediately, don't wait

---

## INFRASTRUCTURE INVENTORY

### Hosts

| Host             | Role                     | Compose                                           | GPU         | SSH Port |
| ---------------- | ------------------------ | ------------------------------------------------- | ----------- | -------- |
| orchestrator     | Control plane            | `infra/hosts/orchestrator/docker-compose.yml`     | N/A         | 22       |
| worker-rtx5090   | vLLM primary (32GB)      | `infra/hosts/worker-rtx5090/docker-compose.yml`   | RTX 5090    | 22       |
| worker-rtx3090ti | vLLM secondary (24GB)    | `infra/hosts/worker-rtx3090ti/docker-compose.yml` | RTX 3090 Ti | 22       |
| worker-rtx3060   | Ollama embeddings (12GB) | `infra/hosts/worker-rtx3060/docker-compose.yml`   | RTX 3060    | 22       |
| oracle-vps       | Cloud backend            | `infra/hosts/oracle-vps/docker-compose.yml`       | N/A         | 22       |

### Tailscale Network

- Network: `100.64.0.0/10`
- All hosts on mesh network (can reach each other via `<hostname>.ts.net`)
- DNS: `*.ts.net` resolved locally

### Services & Ports

| Service      | Host             | Port     | Purpose           |
| ------------ | ---------------- | -------- | ----------------- |
| Nexus Router | orchestrator     | 7000     | LLM + MCP routing |
| LiteLLM      | orchestrator     | 8000     | Model gateway     |
| Prometheus   | orchestrator     | 9090     | Metrics           |
| Grafana      | orchestrator     | 3000     | Dashboards        |
| n8n          | orchestrator     | 5678     | Automation        |
| vLLM         | worker-rtx5090   | 8000     | Inference         |
| vLLM         | worker-rtx3090ti | 8000     | Inference         |
| Ollama       | worker-rtx3060   | 11434    | Embeddings        |
| TwentyCRM    | oracle-vps       | 3000     | CRM               |
| Letta        | oracle-vps       | (custom) | Session memory    |
| FalkorDB     | oracle-vps       | (custom) | Graph DB          |
| Qdrant       | oracle-vps       | (custom) | Vector DB         |

---

## TESTING & VALIDATION

**After Phase 1.1 (Infrastructure):**

```bash
./infra/scripts/health-check.sh
# Expected: Exit code 0, all 8 categories pass
```

**After Phase 1.2 (Network):**

```bash
./infra/scripts/network-map.sh
# Expected: All 5 hosts discoverable, Tailscale routes active, DNS resolution working
```

**After Phase 2.1 (Memory):**

```bash
# Test Letta connection
curl http://oracle-vps:8000/health

# Test FalkorDB
curl http://oracle-vps:6363/health

# Test Qdrant
curl http://oracle-vps:6333/health
```

**After Phase 2.5 (Full pipeline):**

```bash
# Test end-to-end inference
curl -X POST http://localhost:7000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}]}'
# Expected: Response in <2 seconds
```

---

## QUESTIONS & ESCALATION

**If you get stuck:**

1. Check `/docs/INFRASTRUCTURE_REFERENCE.md` for service details
2. Run `./infra/scripts/health-check.sh` to diagnose issues
3. Check Docker logs: `docker logs <service-name>`
4. Check SSH: `ssh worker-rtx5090 docker ps` (verify services on workers)
5. Escalate to primary agent if infrastructure is down

**Common issues:**

- Host unreachable → Check Tailscale connection (`tailscale status`)
- Service unhealthy → Check logs and Docker compose syntax
- Port conflict → Check if service is running on another host
- Sync issues → Verify Syncthing is running on all hosts

---

## DELIVERABLES CHECKLIST

### Prompt 01 (Infrastructure)

- [ ] Phase 1.1: Infrastructure validation (health-check.sh, INFRASTRUCTURE_REFERENCE.md) ✅ DONE
- [ ] Phase 1.2: Network topology mapping (network-map.sh, NETWORK_TOPOLOGY.md)
- [ ] Phase 1.3: Setup documentation (README_SETUP.md)
- [ ] Phase 1.4: Makefile enhancements (health, deploy, logs targets)
- [ ] Phase 1.5: Hostname enforcement (HOSTNAME_CONFIG.md)

### Prompt 02 (Memory & AI Routing)

- [ ] Phase 2.1: Memory stack setup (Letta, FalkorDB, Qdrant, Mem0, MemPalace, OpenMemory MCP)
- [ ] Phase 2.2: OpenClaw deployment (Gateway + Studio)
- [ ] Phase 2.3: LiteLLM routing (worker routes, fallback config)
- [ ] Phase 2.4: Nexus Router MCP aggregation (tool routing, fuzzy search)
- [ ] Phase 2.5: vLLM endpoints verification (latency testing, model availability)

---

## SUCCESS METRICS

**Phase 1 Complete When:**

- ✅ `./infra/scripts/health-check.sh` returns exit code 0
- ✅ All 5 hosts reachable via Tailscale
- ✅ Docker Compose validates on all hosts
- ✅ Documentation complete (README_SETUP.md, NETWORK_TOPOLOGY.md, HOSTNAME_CONFIG.md)
- ✅ Makefile targets working (make health, make deploy, make logs)

**Phase 2 Complete When:**

- ✅ All memory services running (Letta, FalkorDB, Qdrant, Mem0, MemPalace)
- ✅ OpenClaw creating agents and executing commands
- ✅ LiteLLM routing to all GPU workers
- ✅ Nexus Router aggregating MCP tools
- ✅ End-to-end inference latency <2 seconds

**Estimated Timeline**: 2 weeks (80 hours combined Prompts 01-02)

---

## AFTER PHASE 1-2 COMPLETE

Once you complete Prompts 01-02:

1. Create comprehensive test suite (`tests/infra/test_cluster_health.py`, `tests/infra/test_memory_integration.py`)
2. Document all learnings in `/docs/IMPLEMENTATION_NOTES.md`
3. Update `IMPLEMENTATION_STATUS_2026-05-19.md` with final completion status
4. Create PR for Phase 1 completion (all Phase 1.1-1.5 + Phase 2.1-2.5)
5. Primary agent will then unblock Prompts 03-07 (CRM, Quote Engine, Campaigns, APIs)

---

**Ready?** Start with `/docs/PHASE_1_IMPLEMENTATION_ROADMAP.md` for the day-by-day breakdown.

Good luck! 🚀
