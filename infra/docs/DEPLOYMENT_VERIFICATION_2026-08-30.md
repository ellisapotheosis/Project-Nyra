# Deployment Verification Checklist

**Date:** 2026-08-30  
**Status:** In Progress

---

## Phase 1: Control Plane on Oracle-VPS

### Services

- [ ] LiteLLM (port 4000) - Health: `curl http://100.64.0.3:4000/health`
- [ ] Mission Control (port 9090) - Health: `curl http://100.64.0.3:9090/health`
- [ ] Nexus Router (port 7000) - Health: `curl http://100.64.0.3:7000/health`
- [ ] MCP Gateway (port 3002) - Health: `curl http://100.64.0.3:3002/health`
- [ ] Forgejo (port 3000) - Health: `curl http://100.64.0.3:3000/api/v1/version`
- [ ] Portainer (port 9000) - Health: `curl http://100.64.0.3:9000/api/health`
- [ ] Redis (port 6379) - Health: `redis-cli -h 100.64.0.3 ping`

### Connectivity Tests

- [ ] Workers can reach LiteLLM: `curl http://100.64.0.3:4000/v1/models`
- [ ] Agents can request models: Test via LiteLLM API
- [ ] Mission Control logs requests: `curl http://100.64.0.3:9090/api/v1/audit/events`
- [ ] Nexus routes tasks: Check via API endpoint

### Performance Baseline

- [ ] LiteLLM request latency < 500ms
- [ ] OpenClaw task execution < 5s
- [ ] Model inference time logged in Mission Control

---

## Phase 2: Nerve on Worker-RTX5090

### Services

- [ ] Nerve (port 7000) - Health: `curl http://localhost:7000/health`
- [ ] OpenClaw (port 18789) - Health: `curl http://localhost:18789/health`
- [ ] NerveUI (port 5000) - Health: `curl http://localhost:5000/health`

### Functionality

- [ ] Nerve coordinates with local OpenClaw
- [ ] Can spawn agents locally
- [ ] Receives tasks from oracle-vps LiteLLM
- [ ] Returns results back to oracle-vps

### Integration

- [ ] Nerve routes requests to oracle-vps LiteLLM
- [ ] Models resolve via free tier routing (OpenRouter + OmniRoute)
- [ ] Task queue (Redis on oracle-vps) populated with worker tasks

---

## Phase 3: Test Orchestrator-Optional

### Scenario: Power Down Orchestrator PC

1. [ ] Shut down orchestrator machine
2. [ ] Verify agents still function
3. [ ] Test from worker-rtx5090:
   - [ ] Can request models via LiteLLM (oracle-vps)
   - [ ] Can execute tasks via OpenClaw (local)
   - [ ] Results logged in Mission Control
4. [ ] Confirm: No orchestrator dependency for agent execution

### Expected Result

```
Agent Request
  ↓
LiteLLM (oracle-vps:4000) ✓ ONLINE
  ↓
Worker-RTX5090 (100.64.0.11) ✓ ONLINE
  ↓
Nerve (local) ✓ RUNNING
  ↓
OpenClaw (local) ✓ EXECUTING
  ↓
Result logged to Mission Control (oracle-vps:9090) ✓
```

---

## Phase 4: ClawTeam Deployment

### Status

- [ ] ClawTeam image: `projectnyra/clawteam:latest` (built, fixed Dockerfile)
- [ ] Test ClawTeam: `docker run projectnyra/clawteam:latest clawteam --version`
- [ ] Deploy via compose: `docker-compose.clawteam.yml up -d`
- [ ] Health check: `curl http://clawteam.projectnyra.com:8080/health`

### Multi-Agent Coordination

- [ ] ClawTeam spawns N agents
- [ ] Agents coordinate via OpenClaw
- [ ] Results aggregated via Mission Control

---

## Phase 5: Free Model Routing

### OpenRouter Tests

- [ ] Route to: `openrouter/gemini-flash`
- [ ] Route to: `openrouter/cohere-code`
- [ ] Verify: Zero cost (free tier)

### OmniRoute Tests

- [ ] Fast queries → OpenRouter (free)
- [ ] Complex tasks → Local GPU (free)
- [ ] Budget enforcement: Token limits per agent
- [ ] Fallback: Works without OmniRoute (direct OpenRouter)

### Local GPU Tests

- [ ] `local/qwen3.8-27b` on worker-rtx5090
- [ ] `local/qwen-coder-32b` on worker-rtx3090ti
- [ ] `local/qwen2.5-4b` on worker-rtx3060

---

## Performance Targets

| Metric                | Target  | Status |
| --------------------- | ------- | ------ |
| LiteLLM latency       | < 500ms | ⏳     |
| Local inference       | < 5s    | ⏳     |
| Task routing          | < 100ms | ⏳     |
| Mission Control write | < 50ms  | ⏳     |
| Worker-to-Cloud RTT   | < 100ms | ⏳     |

---

## Rollback Plan

If any service fails:

1. **LiteLLM fails** → Route to worker-local models only
2. **Mission Control fails** → Continue operating, restart service
3. **Nerve fails** → OpenClaw can run standalone
4. **Oracle-VPS offline** → All inference local, no cloud coordination
5. **Worker offline** → Orchestrator can fallback to LiteLLM only

---

## Sign-Off

- [ ] All services deployed
- [ ] All health checks passing
- [ ] Orchestrator-optional test passed
- [ ] Performance targets met
- [ ] Free model routing working
- [ ] No orchestrator PC required for operations

---

**Status: Waiting for deployment agents to complete → Verification in progress**
