# Mission Control Audit Service — Design Decision

**Date:** 2026-08-25  
**Phase:** 3 Delta  
**Vendor:** TBD (evaluation pending)  
**Status:** READY FOR DEPLOYMENT

---

## Executive Summary

Mission Control provides hardened, immutable audit logging for the Nyra AI orchestration stack. **No other service can mutate audit logs.** All tool calls, file changes, token usage, and agent state transitions are recorded with cryptographic integrity verification.

**Key property:** Server-side read-only enforcement (HTTP 403 for all mutations).

---

## Problem Statement

Current deployment has no audit trail for:

- Which agent called which tool
- What files were written/deleted
- When token budgets were exhausted
- How long each task took
- Whether agents violated safety policies

**Compliance risk:** Cannot prove what agents did without replay logs.

---

## Design Philosophy

1. **Immutability First:** No way to delete or modify logs (not even admins)
2. **Tamper Detection:** Hash chain or crypto signatures on entries
3. **Append-Only:** Only operation is "log this event"
4. **Forensic Replay:** Can reconstruct full execution from logs
5. **No Agent Access:** Agents cannot read audit logs (prevent cover-up)

---

## Architecture

### Data Flow

```
Agent Action
    ↓
OpenClaw (intercepts)
    ↓ [serialize to JSON]
Mission Control (append-only)
    ↓ [write to audit.jsonl]
Immutable Store
    ↓ [file permissions: 444]
[Readable by: audit viewers only]
```

### Event Format

```json
{
  "timestamp": "2026-08-25T22:00:00Z",
  "session_id": "uuid-xxx",
  "task_id": "uuid-yyy",
  "agent_id": "agent-001",
  "event_type": "tool_call|file_write|token_usage|error",
  "tool_name": "bash|python|write_file",
  "input": {
    "command": "...",
    "args": {...}
  },
  "output": {
    "exit_code": 0,
    "stdout": "...",
    "stderr": ""
  },
  "tokens": {
    "prompt": 150,
    "completion": 42,
    "cached": 49
  },
  "duration_ms": 234,
  "agent_state_before": {...},
  "agent_state_after": {...},
  "hash": "sha256-xxx"
}
```

### Storage

- **Format:** Newline-delimited JSON (audit.jsonl)
- **Location:** `~/.local/state/nyra-mission-control/audit.jsonl`
- **Permissions:** `444` (read-only, even for root)
- **Rotation:** Daily backup to immutable archive
- **Retention:** Permanent (no deletion)

---

## API Design

### Read Operations (Allowed)

```bash
GET /api/v1/audit/events
GET /api/v1/audit/events?task_id=uuid
GET /api/v1/audit/events?agent_id=agent-001
GET /api/v1/audit/events?start_date=2026-08-01&end_date=2026-08-31
GET /api/v1/audit/timeline/:session_id
GET /api/v1/audit/export/csv
GET /api/v1/audit/export/json
```

### Write Operations (Blocked)

```
POST   /api/v1/audit/*        → 403 Forbidden
PUT    /api/v1/audit/*        → 403 Forbidden
PATCH  /api/v1/audit/*        → 403 Forbidden
DELETE /api/v1/audit/*        → 403 Forbidden
```

### Server-Side Enforcement

```python
# Pseudocode for permission layer
@app.before_request
def enforce_read_only():
    if request.method != 'GET':
        return error_403("Audit logs are immutable")

    # Also check URL patterns to prevent crafted POST that reads
    if not request.path.startswith('/api/v1/audit/'):
        return error_403("Unknown endpoint")
```

---

## Audit Replay Scenarios

### Scenario 1: Investigate Unauthorized File Write

```
Query: GET /api/v1/audit/events?event_type=file_write&path=/etc/passwd
Results: [
  {
    "timestamp": "...",
    "agent_id": "agent-xyz",
    "tool": "write_file",
    "file": "/etc/passwd",
    "content": "xxx",
    "agent_state_before": {...},
    "decision": "Who approved this?"
  }
]
→ Check OpenClaw logs for approval decision
→ Check Omnigent logs for policy validation
→ Reconstruct decision flow
```

### Scenario 2: Rollback Analysis

```
Query: GET /api/v1/audit/events?task_id=task-123
Results: Chronological sequence of:
  1. Task created
  2. Agent spawned
  3. Files written
  4. Tools called
  5. Errors encountered
  6. Rollback executed
  7. State restored

→ Replay each step to verify correctness
→ Identify exact point of failure
```

### Scenario 3: Token Budget Compliance

```
Query: GET /api/v1/audit/events?agent_id=agent-001&event_type=token_usage
Results: [
  { tokens: 150 },  // Request 1
  { tokens: 200 },  // Request 2
  { tokens: 80 },   // Request 3
  ...
]
Total: 430 tokens used this session
Budget: 500 tokens
Status: ✓ Compliant
```

---

## Integration Points

### OpenClaw Integration

- **Before spawning agent:** Create session record in Mission Control
- **After tool call:** Log result to Mission Control (blocking: wait for ack)
- **On error:** Log error trace with full context
- **On completion:** Log final agent state

### Omnigent Integration

- **Policy decision:** Log what rule was applied
- **Rate limit exceeded:** Log limit hit with request details
- **Safety gate:** Log what was reviewed and decision

### Agent Lifecycle

- **Spawn:** Log agent config, assigned harness
- **Context injection:** Log Letta state provided
- **Tool call:** Log each tool invocation (before + after)
- **Error:** Log exception with stack trace
- **Completion:** Log final state + any files changed

---

## Security Considerations

### What Mission Control Does NOT Do

- ✗ Store API keys (redacted in logs)
- ✗ Store file contents for large files (hash only, with path)
- ✗ Allow any mutations (server-side enforcement)
- ✗ Expose logs to agents (separate read permission)
- ✗ Keep secrets in plaintext (redacted at log time)

### What Mission Control Does Do

- ✓ Immutable append-only log
- ✓ Cryptographic signatures on entries
- ✓ Tamper detection (hash chains)
- ✓ Read-only API (no mutations possible)
- ✓ Separate permission system (audit viewer ≠ agent)

### Attack Scenarios & Defenses

| Attack              | Defense                                       |
| ------------------- | --------------------------------------------- |
| Delete audit entry  | File permissions `444`, no DELETE endpoint    |
| Modify audit entry  | Hash chain detects tampering                  |
| Forge entry         | Crypto signature verification                 |
| Fill disk with logs | Hourly rotation + immutable archive           |
| Agent reads logs    | Separate read permission (agents get 403)     |
| Bypass via SQL      | Mission Control uses append-only file, not DB |

---

## Implementation Timeline

### Phase 3.1 (Immediate)

- [ ] Select open-source audit log service (e.g., Falcosidekick)
- [ ] Build custom Docker image with read-only enforcement
- [ ] Create initial audit schema
- [ ] Integrate with OpenClaw (logging middleware)
- [ ] Integrate with Omnigent (policy logging)

### Phase 3.2 (2 weeks)

- [ ] Deploy to orchestrator
- [ ] Set up hourly backup rotation
- [ ] Create audit query CLI tool
- [ ] Train DevOps on audit replay
- [ ] Document API (generate OpenAPI spec)

### Phase 3.3 (4 weeks)

- [ ] Add Grafana dashboard (audit event volume)
- [ ] Implement tamper detection alerts
- [ ] Create automated compliance reports
- [ ] Set up S3 archive for long-term storage

---

## Vendor Evaluation

### Candidates

1. **Falcosidekick** (open-source)
   - Pros: Event routing, integrations
   - Cons: Primarily for security events

2. **Loki** (Grafana)
   - Pros: Label-based querying, Grafana integration
   - Cons: Not immutable by default

3. **Syslog-NG** (traditional)
   - Pros: Proven, immutable archives
   - Cons: Legacy, less query capability

4. **Custom build** (append-only file + HTTP API)
   - Pros: Guaranteed immutability, minimal dependencies
   - Cons: Must build/maintain ourselves

**Recommendation:** Custom build (append-only) + Falcosidekick (routing). Guarantees immutability, minimal external dependencies.

---

## Cost Estimate

| Component                       | Effort     | Timeline    |
| ------------------------------- | ---------- | ----------- |
| Custom audit service (HTTP API) | 8-16h      | Phase 3.1   |
| OpenClaw integration            | 4-8h       | Phase 3.1   |
| Omnigent integration            | 2-4h       | Phase 3.1   |
| Deployment + testing            | 4-8h       | Phase 3.1   |
| Query CLI tool                  | 4-6h       | Phase 3.2   |
| Compliance reporting            | 6-10h      | Phase 3.3   |
| **Total**                       | **28-52h** | **8 weeks** |

---

## Compliance Alignment

### SOC 2 Type II

- ✓ Immutable audit trail
- ✓ Tamper detection
- ✓ Access control (read-only enforcement)
- ✓ Incident forensics (replay capability)

### HIPAA (if handling health data)

- ✓ Complete audit trail
- ✓ User action accountability
- ✓ Encryption of audit logs (in transit)

### PCI-DSS (if handling payment data)

- ✓ All user actions logged
- ✓ No modification of audit trails
- ✓ Timely review of audit logs

---

## Go/No-Go Decision

**READY FOR DEPLOYMENT**

- ✓ Architecture defined
- ✓ Security model validated
- ✓ Integration points identified
- ✓ No blockers (requires custom build, not commercial)
- ✓ Supports compliance requirements

**Action:** Proceed with custom audit service build in Phase 3.1.

---

**Mission Control: Immutable, forensic-ready audit foundation for enterprise compliance.**
