# UI Surface & Ownership Matrix

**Date:** 2026-08-25  
**Phase:** 3 Delta  
**Status:** OPERATIONAL

---

## UI Surfaces (Live)

### 1. Nerve UI (Orchestrator Dashboard)

| Aspect          | Value                                       |
| --------------- | ------------------------------------------- |
| **Port**        | 8080 (worker-rtx5090)                       |
| **Role**        | Live OpenClaw operations monitor            |
| **Owner**       | OpenClaw (read-only from Nerve)             |
| **Access**      | `nerve.projectnyra.com` (Tailscale)         |
| **Features**    | Task queue, agent status, execution history |
| **Permissions** | Read-only (cannot mutate state)             |
| **Latency**     | Real-time via WebSocket                     |
| **Status**      | ✓ OPERATIONAL                               |

**Capabilities:**

- View current tasks in OpenClaw queue
- Monitor agent health status
- Track token usage per agent
- View execution timeline
- Filter by agent ID / task type
- Historical trend charts (TODO)

**Data sources:**

- OpenClaw task queue (live)
- Agent health checks (polling)
- LiteLLM model availability
- Letta agent state (read-only)

---

### 2. Mission Control Audit (Hardened Read-Only)

| Aspect             | Value                                                |
| ------------------ | ---------------------------------------------------- |
| **Port**           | 9090 (planned)                                       |
| **Role**           | Forensic audit trail, session replay                 |
| **Owner**          | Ops team (immutable logs)                            |
| **Access**         | `mission-control.projectnyra.com` (Tailscale)        |
| **Features**       | Tool call audit, execution timeline, state snapshots |
| **Permissions**    | Read-only (ENFORCED server-side)                     |
| **Data retention** | Permanent (no mutations)                             |
| **Status**         | ⏳ READY (custom image build pending)                |

**Capabilities:**

- Timeline of all tool calls
- Before/after snapshots (file writes)
- Test execution history
- Rollback analysis (what changed when)
- Audit compliance reports
- Session correlation metadata

**Server-side enforcement:**

```
POST /api/* → 403 Forbidden (all mutations blocked)
GET /api/*  → 200 OK (all reads allowed)
```

**Data immutability:**

- All writes append-only to audit.jsonl
- No DELETE or UPDATE endpoints
- Crypto signatures on log entries
- Tamper detection (hash chains)

---

### 3. AionUI (Windows Desktop)

| Aspect          | Value                                                   |
| --------------- | ------------------------------------------------------- |
| **Platform**    | Windows desktop native                                  |
| **Port**        | N/A (local app)                                         |
| **Role**        | Interactive agent coworking                             |
| **Owner**       | User (desktop machine)                                  |
| **Access**      | Local + Tailscale tunnel to `api.projectnyra.com`       |
| **Features**    | Agent chat, file browser, task creation, clipboard sync |
| **Permissions** | User-scoped (read/write user's files)                   |
| **Status**      | ⏳ READY (requires Windows RDP: OWNER_ACTION)           |

**Capabilities:**

- Chat with active agents
- Create new tasks
- Monitor running tasks
- File picker (select files to give agent)
- Clipboard integration
- Search past interactions

**Constraints:**

- Only Windows deployment (not WSL2 Ubuntu)
- Requires local API key (scoped: LITELLM_AIONUI_KEY)
- Limited to local/qwen3.8-27b model
- Single-user per desktop instance

---

### 4. Grafana (Infrastructure Metrics)

| Aspect           | Value                                        |
| ---------------- | -------------------------------------------- |
| **Port**         | 3000 (typical)                               |
| **Role**         | Observability dashboard                      |
| **Owner**        | Ops team                                     |
| **Access**       | `grafana.projectnyra.com` (Tailscale)        |
| **Features**     | CPU/GPU/memory, request latency, error rates |
| **Permissions**  | Read-only                                    |
| **Data sources** | Prometheus + custom exporters                |
| **Status**       | ✓ OPERATIONAL                                |

**Key dashboards:**

- vLLM utilization (GPU, VRAM, throughput)
- LiteLLM gateway metrics (latency, errors, model routing)
- OpenClaw task queue (pending, running, completed)
- Agent resource usage (CPU per harness)
- Network latency (inter-node)

---

### 5. Portainer (Container Management)

| Aspect          | Value                                             |
| --------------- | ------------------------------------------------- |
| **Port**        | 9000                                              |
| **Role**        | Container orchestration UI                        |
| **Owner**       | Ops team                                          |
| **Access**      | `portainer.projectnyra.com` (Tailscale)           |
| **Features**    | Container status, log viewing, restart management |
| **Permissions** | Full (restart, stop, view logs)                   |
| **Status**      | ✓ OPERATIONAL                                     |

**Capabilities:**

- View running containers per host
- Inspect container logs in real-time
- Restart/stop containers
- Resource usage per container
- Network connectivity checks
- Multi-host management (orchestrator, workers)

---

### 6. WaveTerm (Terminal Multiplexer)

| Aspect       | Value                       |
| ------------ | --------------------------- |
| **Location** | Orchestrator desktop        |
| **Role**     | Development & ops panes     |
| **Owner**    | Dev team (local)            |
| **Panes**    | 6-8 (see pane config below) |
| **Status**   | ✓ OPERATIONAL               |

**Current panes:**

1. LiteLLM logs (tail)
2. OpenClaw logs (tail)
3. vLLM status (watch)
4. Task queue (redis CLI)
5. Agent health check (curl loop)
6. Git status (watch)
7. Docker compose status (watch)

**New panes (Phase 3):** 8. Omnigent logs (tail) 9. OpenHarness queue (redis CLI) 10. ClawTeam coordination logs (tail)

---

### 7. Syncthing (File Sync UI)

| Aspect       | Value                                            |
| ------------ | ------------------------------------------------ |
| **Port**     | 8384                                             |
| **Role**     | Multi-node file sync                             |
| **Owner**    | Ops team                                         |
| **Access**   | `syncthing.projectnyra.com` (Tailscale)          |
| **Features** | File sync status, bandwidth, conflict resolution |
| **Status**   | ✓ OPERATIONAL                                    |

**Sync directories:**

- `/app/configs/` (all nodes)
- `/app/models/` (worker-specific mirrors)
- `/app/logs/` (centralized audit logs)

---

## UI Ownership Matrix

| Surface             | Read            | Write               | Approve       | Emergency     |
| ------------------- | --------------- | ------------------- | ------------- | ------------- |
| **Nerve**           | Any (Tailscale) | Nobody              | Nobody        | DevOps        |
| **Mission Control** | Any (Tailscale) | Nobody              | Nobody        | Nobody        |
| **AionUI**          | User (desktop)  | User (local)        | User (prompt) | User (Ctrl-C) |
| **Grafana**         | Any (Tailscale) | DevOps (dashboards) | DevOps        | DevOps        |
| **Portainer**       | DevOps          | DevOps              | Nobody        | DevOps        |
| **WaveTerm**        | Dev (local SSH) | Dev (local)         | Dev (local)   | Dev (local)   |
| **Syncthing**       | DevOps          | DevOps              | Nobody        | DevOps        |

---

## Isolation Boundaries

### Read-Only (No State Mutation)

- **Nerve:** Reads from OpenClaw only, no writes
- **Mission Control:** Append-only audit log, no deletes
- **Grafana:** Metric collection only, no config change

### User-Scoped (Single User Isolation)

- **AionUI:** Desktop user isolation via OS permissions
- **WaveTerm:** SSH access control via authorized_keys

### Team-Scoped (Shared Team Access)

- **Portainer:** Multi-user with Tailscale RBAC
- **Syncthing:** All team members read entire sync
- **Nerve:** All team members see all tasks (read-only)

### Admin-Only (DevOps Control)

- **Portainer:** Container lifecycle
- **Grafana:** Dashboard creation/modification
- **Syncthing:** Sync path configuration

---

## Credential & Key Exposure Prevention

### Secrets NOT in UI

- ✓ LiteLLM master key (Infisical only)
- ✓ Scoped API keys (env vars in containers)
- ✓ Database passwords (docker secrets)
- ✓ Anthropic API key (env var in AionUI process)

### Secrets Visible in UI

- ⚠ Container names (non-sensitive)
- ⚠ Model names (public list)
- ⚠ Task IDs (internal UUIDs)

### Audit Trail for Secrets

- Mission Control: Logs all API calls (keys redacted)
- Grafana: No credential storage
- Portainer: No credential display

---

## Error Handling & Status Display

### Nerve (Live Ops)

```
Agent Status:
  ✓ Running — task in progress
  ⏸ Paused — waiting for input
  ⚠ Degraded — slow response times
  ✗ Failed — error state
  ⏱ Pending — queued for execution
```

### Mission Control (Audit)

```
Tool Call Status:
  ✓ Success — tool returned result
  ⚠ Partial — tool returned error but continued
  ✗ Failed — tool raised exception
  ⏭ Skipped — tool not executed
```

### Grafana (Metrics)

```
Health:
  ✓ Healthy — all metrics within bounds
  ⚠ Degraded — one metric above threshold
  ✗ Unhealthy — multiple metrics critical
```

---

## Real-Time vs. Eventual Consistency

| Surface         | Consistency           | Latency | Update Method                |
| --------------- | --------------------- | ------- | ---------------------------- |
| Nerve           | Real-time             | <100ms  | WebSocket                    |
| Mission Control | Eventual              | <1s     | File poll                    |
| Grafana         | Eventual              | <30s    | Prometheus scrape            |
| Portainer       | Eventually consistent | <5s     | Container event subscription |
| AionUI          | Eventual              | 1-3s    | HTTP polling                 |

---

## Access Control (Tailscale Private DNS)

| Service         | Hostname                        | Network             | Auth          |
| --------------- | ------------------------------- | ------------------- | ------------- |
| Nerve           | nerve.projectnyra.com           | Private (Tailscale) | Tailscale ACL |
| Mission Control | mission-control.projectnyra.com | Private (Tailscale) | Tailscale ACL |
| Grafana         | grafana.projectnyra.com         | Private (Tailscale) | Tailscale ACL |
| Portainer       | portainer.projectnyra.com       | Private (Tailscale) | Tailscale ACL |
| Syncthing       | syncthing.projectnyra.com       | Private (Tailscale) | Tailscale ACL |

**Public surfaces:** 0 (all Tailscale-only)

---

## Phase 3 New Additions

| Surface              | Type      | Owner          | Status                  |
| -------------------- | --------- | -------------- | ----------------------- |
| Omnigent Monitor     | Logs only | Ops (WaveTerm) | ✓ Can be added to panes |
| OpenHarness Queue    | Redis CLI | Ops (WaveTerm) | ✓ Can be added to panes |
| ClawTeam Coordinator | Logs only | Ops (WaveTerm) | ✓ Can be added to panes |

**No new web UI added (intentional).** Nerve already covers live operations.

---

## Recommended User Workflows

### Developer (Local SSH)

```
WaveTerm (8 panes)
├─ LiteLLM logs
├─ OpenClaw logs
├─ Omnigent logs
├─ OpenHarness queue
├─ Task health check
├─ Docker compose status
├─ Git status
└─ Scratch shell
```

### DevOps (Tailscale)

```
Browser tabs:
├─ Portainer (container management)
├─ Grafana (metrics dashboard)
├─ Nerve (ops monitor)
└─ Mission Control (audit trail)
```

### Desktop User (Windows)

```
AionUI (native app)
├─ Chat with agent
├─ Create tasks
├─ Monitor progress
└─ File manager
```

### Compliance Officer (Audit)

```
Mission Control (Tailscale)
├─ Tool call audit trail
├─ File change snapshots
├─ Session timeline
└─ Export reports
```

---

**UI surfaces established. Read-only enforcement active. Secrets protected.**
