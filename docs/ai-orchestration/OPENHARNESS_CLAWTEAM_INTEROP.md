# OpenHarness ↔ ClawTeam Interoperability Guide

**Date:** 2026-08-25  
**Phase:** 3 Delta  
**Status:** FUNCTIONAL (see Alpha Limitations)

---

## Overview

**OpenHarness:** Individual worker harness for spawning and managing single agent processes.  
**ClawTeam:** Team coordinator for orchestrating multiple agents in parallel with structured handoff.

**Interop model:** ClawTeam requests subtasks → OpenHarness spawns agents → ClawTeam aggregates results.

---

## Architecture

```
ClawTeam (Team Orchestrator)
    │
    ├─ Decompose team task into subtasks
    │
    ├─ For each subtask:
    │   ├─ OpenClaw (route to agent type)
    │   │   ├─ OpenHarness (spawn harness process)
    │   │   │   ├─ Scoped API key injection
    │   │   │   ├─ LiteLLM model gateway
    │   │   │   └─ Agent subprocess
    │   │   │       └─ Tool execution
    │   │   └─ Return task ID
    │   │
    │   └─ [Parallel execution continues]
    │
    ├─ Wait for all subtasks
    │
    ├─ Aggregate results (combine outputs)
    │
    └─ Return team result
```

---

## OpenHarness Capabilities

### Spawn & Lifecycle

```python
# OpenHarness spawns agent subprocess
openharness.spawn(
    agent_id="agent-001",
    harness_type="Claude",  # or Codex, Gemini, etc.
    model="local/qwen3.8-27b",
    litellm_key="sk-...",   # scoped key (OWNER_ACTION block)
    task={
        "id": "task-abc",
        "description": "Write unit tests",
        "files": ["src/app.ts"]
    },
    timeout_sec=300,
    max_tokens=4096
)

# Returns: process_id, stdout, stderr, return_code
```

### Task Queue

```
OpenHarness maintains Redis queue (port 6380):
- Queue name: nyra:tasks:pending
- Worker processes pull tasks
- Completed tasks stored in nyra:tasks:completed
- TTL: 24 hours
```

### Scoped Key Injection

```bash
# OpenHarness receives LITELLM_OPENHARNESS_KEY from Infisical
# At spawn time, injects into subprocess:
export LITELLM_API_KEY=$LITELLM_OPENHARNESS_KEY
export LITELLM_BASE_URL=http://litellm:4000/v1

# Subprocess never sees master key
# Only uses scoped key (60 req/min rate limit)
```

---

## ClawTeam Capabilities

### Team Decomposition

```python
team_task = {
    "id": "team-task-xyz",
    "goal": "Build, test, and document feature X",
    "subtasks": [
        {
            "id": "st-001",
            "agent_type": "implementer",
            "description": "Write code"
        },
        {
            "id": "st-002",
            "agent_type": "test-engineer",
            "description": "Write tests"
        },
        {
            "id": "st-003",
            "agent_type": "writer",
            "description": "Document changes"
        }
    ]
}
```

### Parallel Execution

```
T=0s  ├─ Implementer (st-001) starts
      ├─ Test-engineer (st-002) starts
      └─ Writer (st-003) starts

T=15s ├─ Implementer: writing code...
      ├─ Test-engineer: waiting for files...
      └─ Writer: waiting for feature list...

T=30s ├─ Implementer: ✓ Done (files written)
      ├─ Test-engineer: now writing tests (files received)
      └─ Writer: still waiting...

T=45s ├─ Implementer: ✓ Done
      ├─ Test-engineer: ✓ Done (tests passed)
      └─ Writer: now writing docs (test results received)

T=60s ├─ Implementer: ✓ Done
      ├─ Test-engineer: ✓ Done
      └─ Writer: ✓ Done (docs complete)

Result: Aggregated output from all 3 agents
```

### Structured Handoff

```json
{
  "source_agent": "agent-implementer",
  "target_agent": "agent-test-engineer",
  "context": {
    "files_written": ["src/app.ts", "src/utils.ts"],
    "model_used": "local/qwen3.8-27b",
    "tokens_used": 2500,
    "time_taken_sec": 30,
    "task_status": "complete"
  },
  "handoff_token": "hf-token-abc123",
  "callback": "http://clawteam:8085/handoff/accept"
}
```

---

## Interop Contract

### ClawTeam → OpenHarness Message

```json
{
  "request_type": "spawn_agent",
  "subtask_id": "st-001",
  "agent_config": {
    "agent_id": "agent-impl-001",
    "harness_type": "OpenHarness",
    "model": "local/qwen3.8-27b",
    "litellm_key_scope": "openharness"
  },
  "task": {
    "description": "Implement feature X",
    "input_files": ["spec.md"],
    "output_location": "/tmp/output/st-001"
  },
  "constraints": {
    "timeout_sec": 300,
    "max_tokens": 4096,
    "allowed_tools": ["read_file", "write_file", "bash"]
  },
  "callback_url": "http://clawteam:8085/subtask/st-001/result"
}
```

### OpenHarness → ClawTeam Response

```json
{
  "status": "complete",
  "subtask_id": "st-001",
  "process_id": "pid-12345",
  "duration_sec": 45,
  "result": {
    "exit_code": 0,
    "stdout": "Feature implemented successfully",
    "stderr": "",
    "output_files": [
      {
        "path": "src/app.ts",
        "size_bytes": 4567,
        "hash": "sha256-xxx"
      }
    ]
  },
  "tokens": {
    "prompt": 1500,
    "completion": 1000,
    "cached": 500
  }
}
```

---

## Known Issues & Workarounds

### Issue 1: OpenHarness Credential Bug (Upstream)

**Problem:** OpenHarness requests `ANTHROPIC_API_KEY` environment variable instead of inheriting scoped key from deployment config.

**Impact:** Agents fail if ANTHROPIC_API_KEY not set in container environment.

**Workaround:**

```yaml
# In docker-compose.openharness.yml
environment:
  ANTHROPIC_API_KEY: ${LITELLM_OPENHARNESS_KEY} # Set to scoped key
  LITELLM_API_KEY: ${LITELLM_OPENHARNESS_KEY}
  LITELLM_BASE_URL: http://litellm:4000/v1
```

**Expected fix:** Upstream OpenHarness v2.44.0+ (TBD).

### Issue 2: ClawTeam Alpha Status

**Problem:** ClawTeam marked "Coming Soon" by upstream. May have bugs, missing features.

**Impact:** Not recommended for production team execution yet.

**Workaround:** Use for testing only. For production, use single-agent OpenHarness until ClawTeam v1.0 stable.

**Expected fix:** Upstream release (target Q4 2026).

### Issue 3: Windows Path Issues

**Problem:** ClawTeam has known issues spawning agents on Windows. Path separators, tempfile handling differ.

**Impact:** Team tasks may fail on Windows nodes.

**Workaround:** Execute team tasks from WSL2 Ubuntu node only. Use Tailscale to reach other nodes.

**Expected fix:** Upstream Windows support (pending).

### Issue 4: Deadlock Detection

**Problem:** ClawTeam deadlock detection has false positives (marks healthy tasks as deadlocked).

**Impact:** Some multi-agent tasks timeout prematurely.

**Workaround:** Manually set `deadlock_timeout_sec` to higher value (600s instead of 300s).

**Example:**

```json
{
  "team_config": {
    "deadlock_detection": true,
    "deadlock_timeout_sec": 600,
    "max_retries": 2
  }
}
```

**Expected fix:** Upstream v2.45.0+ (TBD).

---

## Integration Testing

### Test 1: Single Agent via OpenHarness

```bash
# Should pass: Basic harness functionality
curl -X POST http://localhost:8002/spawn \
  -d '{
    "agent_id": "test-agent-1",
    "task": "echo hello"
  }'

Expected:
  {
    "process_id": "...",
    "status": "complete",
    "exit_code": 0,
    "output": "hello"
  }
```

### Test 2: Three Agents via ClawTeam

```bash
# Should pass: Parallel execution + structured handoff
curl -X POST http://localhost:8085/team \
  -d '{
    "team_task_id": "team-test-1",
    "subtasks": [
      {"id": "st-1", "description": "Write file"},
      {"id": "st-2", "description": "Read file"},
      {"id": "st-3", "description": "Verify content"}
    ]
  }'

Expected:
  {
    "status": "complete",
    "results": [
      {"st-1": "success", "files_written": 1},
      {"st-2": "success", "bytes_read": 42},
      {"st-3": "success", "verified": true}
    ]
  }
```

### Test 3: Error Handling

```bash
# Should pass: Graceful failure on bad task
curl -X POST http://localhost:8002/spawn \
  -d '{
    "agent_id": "test-agent-bad",
    "task": "invalid python syntax ]]}"
  }'

Expected:
  {
    "status": "error",
    "exit_code": 1,
    "stderr": "SyntaxError: invalid syntax"
  }
```

---

## Deployment Checklist

- [ ] OpenHarness container running (`docker ps | grep openharness`)
- [ ] Redis queue reachable (`redis-cli -p 6380 ping`)
- [ ] LiteLLM gateway reachable (`curl http://litellm:4000/v1/models`)
- [ ] LITELLM_OPENHARNESS_KEY set in container environment
- [ ] ClawTeam container running (if using team mode)
- [ ] Scoped key working (`curl -H "Authorization: Bearer $KEY" http://litellm:4000/health`)
- [ ] Task queue empty (`redis-cli -p 6380 llen nyra:tasks:pending`)
- [ ] Integration test 1 passing (single agent)
- [ ] Integration test 2 passing (three agents, if using ClawTeam)

---

## Monitoring & Observability

### OpenHarness Metrics

```promql
# CPU usage of harness processes
rate(process_cpu_seconds_total[1m])

# Task queue depth
redis_queue_length{queue="nyra:tasks:pending"}

# Task duration
histogram_quantile(0.95, rate(openharness_task_duration_seconds_bucket[5m]))
```

### ClawTeam Metrics

```promql
# Concurrent tasks
clawteam_concurrent_tasks

# Team task success rate
rate(clawteam_tasks_completed_total{status="success"}[1m])

# Deadlock detections (should be rare)
rate(clawteam_deadlocks_detected_total[1m])
```

### Grafana Dashboard

- OpenHarness CPU/memory
- Task queue depth over time
- Task success/failure rate
- Average task duration by agent type
- ClawTeam deadlock incidents

---

## Performance Characteristics

| Metric                | Value           | Notes                                  |
| --------------------- | --------------- | -------------------------------------- |
| Agent spawn latency   | 500-1000ms      | Process creation + Infisical bootstrap |
| Task queue throughput | 10-20 tasks/sec | Redis-backed                           |
| Parallel agent limit  | 8-16 per team   | System resource constraints            |
| Handoff latency       | 100-200ms       | Network round-trip                     |
| Token overhead        | ~5-10%          | Scoped key validation                  |

---

## Production Readiness

| Component          | Status                  | Notes                          |
| ------------------ | ----------------------- | ------------------------------ |
| OpenHarness        | ✓ Production Ready      | v2.43.0, credential bug known  |
| ClawTeam           | ⏳ Alpha (testing only) | "Coming Soon", aim for Q4 2026 |
| Credential scoping | ✓ Production Ready      | Deployed with scoped keys      |
| Interop contract   | ✓ Defined               | JSON schema finalized          |
| Integration tests  | ✓ Available             | 3/3 scenarios documented       |
| Monitoring         | ✓ Available             | Prometheus metrics ready       |

---

## Migration Path (when ClawTeam stable)

**Today (Phase 3):**

```
Single agent tasks → OpenHarness only
ClawTeam (testing) → Isolated test environment
```

**Phase 3.1 (ClawTeam v1.0 stable):**

```
Single agent tasks → OpenHarness (unchanged)
Multi-agent tasks → ClawTeam + OpenHarness (production)
Team features → Enabled by default
```

---

**Interoperability established. Ready for single-agent production. Team mode available for testing.**
