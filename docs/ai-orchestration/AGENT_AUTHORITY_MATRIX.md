# Agent Authority & Interop Matrix

**Date:** 2026-08-25  
**Phase:** 3 Delta  
**Status:** OPERATIONAL

---

## Authority Hierarchy (Canonical)

```
┌─────────────────────────────────────────────────────────┐
│ OpenClaw (port 8001)                                    │
│ ├─ Operational Authority                                │
│ ├─ Task routing, agent lifecycle, handoff coordination  │
│ └─ Source of truth: task state, execution order         │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Letta (port 8283)                                       │
│ ├─ Memory Authority                                     │
│ ├─ Stateful agent profiles, long-term context           │
│ └─ Source of truth: agent state, conversation history   │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Omnigent (port 8003)                                    │
│ ├─ Policy Authority                                     │
│ ├─ Rate limiting, model validation, safety constraints  │
│ └─ Source of truth: policy rules, approval gates        │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ OpenHarness (port 8002)                                 │
│ ├─ Execution Authority                                  │
│ ├─ Agent spawning, task queue, subprocess management    │
│ └─ Source of truth: harness health, queue state         │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ ClawTeam (port 8085)                                    │
│ ├─ Coordination Authority                               │
│ ├─ Multi-agent orchestration, parallel execution        │
│ └─ Source of truth: team tasks, agent assignments       │
└─────────────────────────────────────────────────────────┘
```

---

## Service Capabilities & Boundaries

### OpenClaw Gateway

| Aspect                   | Authority            | Behavior                         |
| ------------------------ | -------------------- | -------------------------------- |
| **Task routing**         | ✓ Sole authority     | Decides which agent handles task |
| **Model selection**      | Suggests to Omnigent | Omnigent approves final model    |
| **Agent lifecycle**      | ✓ Sole authority     | Spawn, pause, terminate agents   |
| **Handoff coordination** | ✓ Sole authority     | Routes context between agents    |
| **Rate limiting**        | Defers to Omnigent   | Respects Omnigent decisions      |

### Letta (Memory Plane)

| Aspect                       | Authority                                        | Behavior                   |
| ---------------------------- | ------------------------------------------------ | -------------------------- |
| **Agent state**              | ✓ Sole authority                                 | Persists agent profiles    |
| **Conversation history**     | ✓ Sole authority                                 | Stores long-term memory    |
| **Context injection**        | ✓ Sole authority                                 | Provides context to agents |
| **State mutations**          | ✓ Sole authority (read-only from other services) | Only Letta modifies state  |
| **Cross-session continuity** | ✓ Sole authority                                 | Enables stateful agents    |

### Omnigent (Governance)

| Aspect                   | Authority        | Behavior                     |
| ------------------------ | ---------------- | ---------------------------- |
| **Policy enforcement**   | ✓ Sole authority | Approves/rejects requests    |
| **Rate limiting**        | ✓ Sole authority | Enforces RPM/TPM limits      |
| **Token budgets**        | ✓ Sole authority | Validates max_tokens         |
| **Model access control** | ✓ Sole authority | Restricts model availability |
| **Safety gates**         | ✓ Sole authority | Reviews dangerous operations |
| **Appeals/overrides**    | ✓ Sole authority | May skip checks with reason  |

### OpenHarness

| Aspect                   | Authority        | Behavior                    |
| ------------------------ | ---------------- | --------------------------- |
| **Process spawning**     | ✓ Sole authority | Creates agent subprocesses  |
| **Task queue**           | ✓ Sole authority | Manages Redis queue         |
| **Credential injection** | ✓ Sole authority | Injects scoped API keys     |
| **Subprocess isolation** | ✓ Sole authority | Enforces process boundaries |
| **Failure recovery**     | ✓ Sole authority | Retry/backoff logic         |

### ClawTeam (Coordination)

| Aspect                 | Authority          | Behavior                      |
| ---------------------- | ------------------ | ----------------------------- |
| **Team composition**   | ✓ Sole authority   | Defines agent team            |
| **Parallel execution** | ✓ Sole authority   | Orchestrates concurrent work  |
| **Result aggregation** | ✓ Sole authority   | Combines agent outputs        |
| **Deadlock detection** | ✓ Sole authority   | Manages circular dependencies |
| **Handoff routing**    | Defers to OpenClaw | OpenClaw executes handoff     |

---

## Decision Flows

### 1. Task Execution Flow

```
User/API
    ↓
OpenClaw (route task)
    ↓ [asks for approval]
Omnigent (validate policy)
    ↓ [approved or rejected]
OpenClaw (spawn harness)
    ↓
OpenHarness (create process)
    ↓ [injects scoped key]
LiteLLM (model gateway)
    ↓
vLLM or subscription provider
    ↓ [response]
Letta (store state)
    ↓
OpenClaw (return to caller)
```

### 2. State Mutation Flow

```
Agent (requests state change)
    ↓
Letta (receives update)
    ↓ [validates schema]
Letta (persists)
    ↓
Agent (ack)
    ↓ [state available to future requests]
Letta (broadcasts change)
```

### 3. Multi-Agent Team Flow

```
ClawTeam (receive team task)
    ↓ [decompose into subtasks]
ClawTeam (create subtask queue)
    ↓ [for each subtask]
OpenClaw (route to agent)
    ↓
OpenHarness (spawn agent N)
    ↓ [parallel execution]
ClawTeam (aggregate results)
    ↓ [combine outputs]
ClawTeam (structured handoff)
    ↓
OpenClaw (next step)
```

---

## Conflict Resolution Rules

**When multiple services disagree:**

| Scenario                                        | Authority                              | Reason                      |
| ----------------------------------------------- | -------------------------------------- | --------------------------- |
| OpenClaw wants to run; Omnigent says no         | **Omnigent wins**                      | Safety first                |
| Letta has old state; OpenClaw requests newer    | **Letta wins**                         | Source of truth for memory  |
| OpenHarness queue full; OpenClaw wants to spawn | **OpenHarness wins**                   | Can't exceed process limits |
| ClawTeam deadlock detected; task stalls         | **ClawTeam breaks deadlock**           | Autonomous recovery         |
| Service offline; failover needed                | **Service below in hierarchy handles** | Graceful degradation        |

**Why this order?**

1. Safety (Omnigent) prevents harm
2. Memory (Letta) ensures continuity
3. Execution (OpenHarness) ensures feasibility
4. Coordination (ClawTeam) ensures team work
5. Routing (OpenClaw) ensures direction

---

## Service Interop Contracts

### OpenClaw ↔ Omnigent

```json
Request: {
  "agent_id": "string",
  "model": "string",
  "max_tokens": "number",
  "operations": ["read_file", "write_file"]
}

Response: {
  "approved": boolean,
  "reason": "string",
  "effective_max_tokens": "number",
  "allowed_operations": ["string"]
}
```

### OpenClaw ↔ Letta

```json
Request: {
  "agent_id": "string",
  "action": "get_state|update_state|append_history",
  "payload": "object"
}

Response: {
  "agent_id": "string",
  "state": "object",
  "history": "array",
  "version": "number"
}
```

### OpenClaw ↔ OpenHarness

```json
Request: {
  "task_id": "string",
  "agent_id": "string",
  "model": "string",
  "litellm_key": "sk-...",
  "command": "spawn|stop|status"
}

Response: {
  "process_id": "string",
  "status": "running|stopped|error",
  "return_code": "number"
}
```

### ClawTeam ↔ OpenClaw

```json
Request: {
  "team_task_id": "string",
  "subtasks": [
    {
      "id": "string",
      "description": "string",
      "agent_type": "string"
    }
  ]
}

Response: {
  "results": [
    {
      "subtask_id": "string",
      "agent_id": "string",
      "output": "object",
      "status": "success|failed"
    }
  ]
}
```

---

## Scoped API Keys Strategy

**Purpose:** Prevent master key exposure, enable service isolation

**Implementation:**

| Service     | Key                     | Scope                 | Models                           | Rate Limit  |
| ----------- | ----------------------- | --------------------- | -------------------------------- | ----------- |
| OpenHarness | LITELLM_OPENHARNESS_KEY | Worker harness        | All (local/omniroute/openrouter) | 60 req/min  |
| Omnigent    | LITELLM_OMNIGENT_KEY    | Policy validation     | All (needs full visibility)      | 120 req/min |
| AionUI      | LITELLM_AIONUI_KEY      | Desktop UI            | local/qwen3.8-27b only           | 20 req/min  |
| OpenClaw    | LITELLM_OPENCLAW_KEY    | Gateway orchestration | All (routing)                    | 100 req/min |

**Key injection:**

- OpenHarness: Receives key from Infisical bootstrap
- Services: Read from `$LITELLM_<SERVICE>_KEY` at startup
- Rotation: Infisical manages key lifecycle
- Audit: All key usage logged by LiteLLM

---

## Non-Reintroduced Components

**Explicitly BLOCKED per mandate:**

| Component            | Reason                                    | Alternative                                  |
| -------------------- | ----------------------------------------- | -------------------------------------------- |
| LLxprt               | Deprecated, vendor-specific               | Omniroute (subscription) + OpenRouter (free) |
| Jefe                 | Architectural overlap with OpenClaw       | OpenClaw handles all orchestration           |
| MCPlex               | Replaced by unified approach              | OpenClaw + LiteLLM + individual MCPs         |
| Mempalace            | Replaced by Letta + Mem0                  | Letta (state) + Mem0 (semantic)              |
| Grafbase Router      | Replaced by Nexus Router                  | LiteLLM gateway (model level)                |
| AgentsMesh           | Generic orchestration (use OpenClaw)      | OpenClaw (operational authority)             |
| Wardn                | Container hardening (use Docker security) | Docker security options + network policies   |
| Generic Orchestrator | Avoid duplication (OpenClaw is canonical) | OpenClaw (single source of truth)            |

---

## Deprecation Timeline

**Phase 3 (current):**

- LLxprt: Removed
- ClawTeam: Alpha (defer production)

**Phase 3.1:**

- ClawTeam: Stable release expected
- Mission Control Audit: Custom image ready

**Phase 4:**

- Windows integration: AionUI full desktop
- Advanced policies: Omnigent rule engine

---

## Known Limitations

1. **ClawTeam Alpha:** Marked "Coming Soon" by upstream. Functional but not production-recommended for mission-critical team work.

2. **OpenHarness Subagent Creds:** Upstream issue where OpenHarness requests ANTHROPIC_API_KEY instead of inheriting from profile. Workaround: Set as env var.

3. **Windows Paths:** Team execution on Windows may have path/spawn issues. Recommendation: Use WSL2 Ubuntu for team work.

4. **LMCache Reuse:** Token cache only persists within single request cycle. Recommendation: Use Letta for cross-session memory.

5. **Omnigent Visibility:** All models must be visible to Omnigent for validation. Recommendation: Scoped keys use model-level restrictions only, not at gateway.

---

**Authority established. Ready for production use.**
