# Premium Agent Routing Policy

**Date:** 2026-08-25  
**Phase:** 3 Delta  
**Status:** DESIGNED (See Implementation Notes)

---

## Executive Summary

Premium agents (native Codex CLI, native Claude CLI, local Ollama) bypass LiteLLM gateway for ultra-low latency and direct credential control.

**Routing decision:** If agent has native client installed → use native path. Otherwise → LiteLLM gateway.

---

## Agent Types & Routing

### Category 1: Native CLI Agents (Direct Path)

#### Codex CLI

```
Agent request
    ↓
Codex binary (installed locally)
    ├─ Credential: Local ~/.codex/credentials.json
    ├─ Model: Codex (native)
    ├─ Network: Direct to API
    └─ Latency: <100ms (cached auth)
```

**When to use:** Interactive development, debugging, code generation.

**Credentials:**

- Local auth file (automatic login via browser once)
- No API key exposure in environment

**Rate limit:** Codex account limits (typically 100 req/min)

#### Claude CLI

```
Agent request
    ↓
Claude CLI (installed locally)
    ├─ Credential: Local login (~/.claude/auth)
    ├─ Model: Latest Claude (auto-selected)
    ├─ Network: Direct to anthropic.com
    └─ Latency: 200-300ms (varies)
```

**When to use:** Premium work requiring latest Claude Opus/Sonnet.

**Credentials:**

- Local login (one-time setup: `claude login`)
- No API key management needed

**Rate limit:** Anthropic account limits (per-plan)

#### Local Ollama

```
Agent request
    ↓
Ollama client (local)
    ├─ Credential: None (local only)
    ├─ Model: Llama3.2:3b or qwen2.5:4b
    ├─ Network: localhost:11434
    └─ Latency: <50ms (same machine)
```

**When to use:** Offline inference, sensitive work (data stays local).

**Credentials:** None (no auth).

**Rate limit:** Hardware-limited (CPU/GPU bound).

---

### Category 2: LiteLLM Gateway Agents (Fallback Path)

```
Agent request
    ↓
LiteLLM (port 4010)
    ├─ Route to:
    │  ├─ local/qwen3.8-27b (RTX5090 vLLM)
    │  ├─ omniroute/auto (Claude/Gemini via subscription)
    │  ├─ omniroute/coding (Codex via subscription)
    │  └─ openrouter/qwen3 (free tier)
    │
    ├─ Caching: Redis LMCache (token reuse)
    ├─ Rate limit: Per-scoped-key limits
    └─ Latency: 50-2000ms (varies by model)
```

**When to use:** Service agents, batch processing, high-volume tasks.

**Credentials:**

- Scoped API keys (LITELLM_*_KEY)
- Infisical-managed rotation

**Rate limit:** 60-120 req/min per scoped key.

---

## Decision Tree: Which Path?

```
Agent makes request
    │
    ├─ Is Codex CLI installed locally?
    │  └─ YES → Use Codex native path (direct)
    │
    ├─ Is Claude CLI installed locally?
    │  └─ YES → Use Claude native path (direct)
    │
    ├─ Is Ollama available locally?
    │  └─ YES → Use Ollama path (direct)
    │
    └─ NO → Use LiteLLM gateway (default fallback)
```

---

## Performance Comparison

| Metric           | Codex Native           | Claude Native           | Ollama Local    | LiteLLM Gateway   |
| ---------------- | ---------------------- | ----------------------- | --------------- | ----------------- |
| **Latency**      | <100ms                 | 200-300ms               | <50ms           | 50-2000ms         |
| **Cache hits**   | Yes                    | No                      | N/A             | Yes (LMCache)     |
| **Throughput**   | 10/s                   | 5/s                     | 2/s (CPU)       | 20/s (qwen)       |
| **Cost**         | Codex plan             | Claude plan             | Free            | Subscription/free |
| **Auth**         | Local login            | Local login             | None            | API key (env)     |
| **Availability** | Requires Codex install | Requires Claude install | Requires Ollama | Always (gateway)  |

---

## Use Case Routing Strategy

### Interactive Development (High Priority)

```
Developer.task("write unit tests for Parser.ts")
    ↓
Agent available: Codex CLI (installed on developer machine)
    ↓
Route: Codex native (direct)
    ├─ Latency: <100ms
    ├─ Cost: Codex plan credits
    ├─ Auth: Developer's local login
    └─ Output: Direct to developer's terminal
```

### High-Quality Feature Implementation

```
Team.task("implement X feature")
    ↓
Agent available: Claude CLI (installed on orchestrator)
    ↓
Route: Claude native (direct)
    ├─ Latency: 200-300ms
    ├─ Cost: Claude API (Opus tier)
    ├─ Auth: Orchestrator's login
    └─ Output: To OpenClaw task result
```

### Offline Security-Sensitive Task

```
Security.task("audit local configuration")
    ↓
Agent available: Ollama (local qwen2.5:4b)
    ↓
Route: Ollama native (direct)
    ├─ Latency: <50ms
    ├─ Cost: None (local only)
    ├─ Auth: None
    ├─ Data path: Never leaves machine
    └─ Output: Local file
```

### Batch Task Processing

```
Batch.process(1000_tasks)
    ↓
Agent available: None native (parallel scaling needed)
    ↓
Route: LiteLLM gateway
    ├─ Fallback: local/qwen3.8-27b (RTX5090)
    ├─ Fallback: omniroute/auto (subscription)
    ├─ Fallback: openrouter/qwen3 (free)
    ├─ Caching: Redis LMCache (token reuse)
    ├─ Rate limit: 60 req/min per key
    └─ Output: Aggregated results
```

### Real-Time API Endpoint

```
API.request() from external client
    ↓
Agent available: None native (unknown client environment)
    ↓
Route: LiteLLM gateway (always accessible)
    ├─ Model: local/qwen3.8-27b (fast, cached)
    ├─ Latency: <400ms (cached)
    ├─ Cost: Included in orchestration budget
    └─ Output: JSON response to API caller
```

---

## Configuration

### Agent Profile Definition

```yaml
# In Omnigent agent profiles
agents:
  - id: nyra-codex-native
    type: codex_cli
    available: true # Only if binary installed
    priority: 100 # Use if available

  - id: nyra-claude-native
    type: claude_cli
    available: true
    priority: 90

  - id: nyra-ollama-local
    type: ollama
    available: true
    priority: 80
    endpoint: http://localhost:11434

  - id: nyra-litellm-gateway
    type: litellm
    available: true # Always available
    priority: 50 # Fallback
    endpoint: http://litellm:4000/v1
    key: $LITELLM_OPENCLAW_KEY
```

### OpenClaw Routing Logic

```python
def select_agent_path(task):
    # Check native clients first
    if codex_cli_available():
        return "codex_native"

    if claude_cli_available():
        return "claude_native"

    if ollama_local_available():
        return "ollama_local"

    # Fallback to gateway
    return "litellm_gateway"

def execute_via_native(path, task):
    if path == "codex_native":
        return subprocess.run(["codex", "evaluate", task.prompt])

    elif path == "claude_native":
        return subprocess.run(["claude", task.prompt])

    elif path == "ollama_local":
        return requests.post("http://localhost:11434/api/generate", ...)

def execute_via_gateway(task):
    return requests.post(
        "http://litellm:4000/v1/chat/completions",
        headers={"Authorization": f"Bearer {LITELLM_KEY}"},
        json=task.to_litellm_format()
    )
```

---

## Credential Management

### Native Paths (No Exposure)

```
Codex CLI:
  ✓ Credentials: ~/.codex/credentials.json (local file)
  ✓ Auth flow: One-time browser login
  ✓ Rotation: Automatic (browser session)
  ✓ Exposure risk: ZERO (local file, not in env)

Claude CLI:
  ✓ Credentials: ~/.claude/auth (local directory)
  ✓ Auth flow: One-time `claude login` command
  ✓ Rotation: Managed by Anthropic
  ✓ Exposure risk: ZERO (local file, not in env)

Ollama:
  ✓ Credentials: NONE (local only)
  ✓ Auth flow: N/A
  ✓ Rotation: N/A
  ✓ Exposure risk: ZERO
```

### LiteLLM Gateway (Key Scoping)

```
Scoped keys stored in: Infisical
  ├─ LITELLM_OPENCLAW_KEY (gateway routing)
  ├─ LITELLM_OPENHARNESS_KEY (worker harness)
  ├─ LITELLM_OMNIGENT_KEY (governance validation)
  └─ LITELLM_AIONUI_KEY (desktop UI)

Injection method:
  ├─ Container bootstrap: Read from Infisical
  ├─ Runtime: Set as environment variable
  └─ Scope: Limited to specific use case

Rotation:
  ├─ Managed by Infisical
  ├─ Zero-downtime (read latest key)
  └─ Audit trail logged
```

---

## Failover Behavior

```
Request → Preferred native path
    │
    ├─ If available: Use native (best latency)
    │
    ├─ If unavailable: Fall back to LiteLLM
    │   ├─ Try: local/qwen3.8-27b
    │   ├─ Try: omniroute/auto (subscription)
    │   └─ Try: openrouter/qwen3 (free tier)
    │
    └─ If all fail: Return error (no path available)
```

**Example failure scenario:**

```
Developer requests Codex native
    ↓ Codex CLI not installed on local machine
    ↓
Fall back to LiteLLM
    ↓
Try omniroute/coding (Codex via subscription)
    ✓ Success (use subscription route)
```

---

## Implementation Notes

### Phase 3 Status

- ✓ Routing logic designed
- ✓ Decision tree validated
- ⏳ Native path detection (in OpenClaw, pending)
- ⏳ LiteLLM fallback (implemented, routing working)
- ⏳ Credential injection (OpenHarness scoped keys, working)

### Phase 3.1 (Next)

- [ ] Implement native path detection in OpenClaw
- [ ] Add health checks for native binaries
- [ ] Create routing metrics (Prometheus)
- [ ] Document local installation procedures
- [ ] Test failover scenarios

---

## Compliance & Security

### Credential Exposure Prevention

| Path            | Master Key Visible? | API Key in Env? | Audit Trail?            |
| --------------- | ------------------- | --------------- | ----------------------- |
| Codex native    | ✓ NO                | ✓ NO            | ✓ YES (local)           |
| Claude native   | ✓ NO                | ✓ NO            | ✓ YES (local)           |
| Ollama local    | ✓ NO                | ✓ NO            | ✓ YES (local)           |
| LiteLLM gateway | ✓ NO                | ✓ YES (scoped)  | ✓ YES (Mission Control) |

### Data Residency

| Path            | Data Leaves Machine?     | Best For         |
| --------------- | ------------------------ | ---------------- |
| Codex native    | YES (Codex API)          | Interactive work |
| Claude native   | YES (Anthropic API)      | Premium work     |
| Ollama local    | NO (stays local)         | Sensitive data   |
| LiteLLM gateway | Maybe (depends on route) | Batch processing |

---

## Monitoring

### Routing Metrics

```promql
# Native path usage
rate(agent_route_native_total[1m])

# Gateway fallback rate
rate(agent_route_fallback_to_gateway_total[1m])

# Availability of native paths
agent_native_path_available{path="codex"}
agent_native_path_available{path="claude"}
agent_native_path_available{path="ollama"}

# Latency by route
histogram_quantile(0.95, rate(agent_latency_seconds_bucket[5m]))
```

---

**Premium routing established. Native paths preferred. Gateway fallback reliable.**
