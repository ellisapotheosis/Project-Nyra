# Project Nyra Architecture (Revised)

**Date:** 2026-08-29  
**Status:** Control Plane Migration Decision

---

## Hardware Inventory

### Oracle-VPS (Cloud, Always-On)

```
┌─────────────────────────────────────────┐
│ Oracle Free Tier VPS                    │
├─────────────────────────────────────────┤
│ CPU:     4 OCPUs (ARM64)                │
│ RAM:     24 GB                          │
│ Storage: 200 GB                         │
│ Network: Public + Tailscale             │
│ Status:  Always online                  │
└─────────────────────────────────────────┘
```

### Orchestrator PC (Local, Optional)

```
┌─────────────────────────────────────────┐
│ Windows 11 + WSL2 Ubuntu                │
├─────────────────────────────────────────┤
│ CPU:     [Actual specs?]                │
│ RAM:     [Actual specs?]                │
│ Network: Tailscale (mirrored mode)      │
│ Status:  Online when powered on         │
└─────────────────────────────────────────┘
```

### Worker-RTX5090 (GPU Node)

```
┌─────────────────────────────────────────┐
│ Worker GPU Node                         │
├─────────────────────────────────────────┤
│ CPU:     AMD Ryzen                      │
│ GPU:     RTX 5090 (32GB VRAM)           │
│ RAM:     ~64 GB                         │
│ Network: Tailscale IP: 100.64.0.11      │
│ Status:  Online when powered on         │
└─────────────────────────────────────────┘
```


```
Similar GPU nodes (24GB + 12GB VRAM respectively)
```

---

## Service Placement (REVISED)

### ALWAYS-ON (Oracle-VPS)

```
Memory Stack (CURRENT):
├─ Letta              1.2 GB
├─ mem0               0.8 GB
├─ FalkorDB           0.5 GB
├─ Qdrant             1.5 GB
├─ PostgreSQL         0.8 GB
└─ Other              1.2 GB
   SUBTOTAL:          6.0 GB

Control Plane (MIGRATE):
├─ LiteLLM            0.8 GB
├─ Mission Control    0.2 GB
├─ Nexus Router       0.4 GB
├─ MCP Gateway        0.3 GB
├─ Forgejo (Git)      0.5 GB
├─ Portainer          0.2 GB
└─ Redis              0.1 GB
   SUBTOTAL:          2.5 GB

────────────────────────────
ORACLE TOTAL:         8.5 GB (35% of 24 GB)
AVAILABLE:           15.5 GB (65% buffer)
```

### LOCAL/OPTIONAL (Orchestrator PC)

```
✓ KEEP LOCAL:
├─ OpenHarness       0.6 GB (agent runtime)
├─ Portainer Agent   0.05 GB
└─ SSH/management    0.1 GB
   SUBTOTAL:         0.75 GB

→ Why: Orchestrator is optional. Only runs when
  user is developing locally. No need to cloud
  these services.

→ Fallback: If orchestrator offline, agents
  still work via oracle-vps LiteLLM + workers
```

### WORKER-LOCAL (Worker-RTX5090, etc.)

```
✓ KEEP ON EACH WORKER:
├─ Nerve             0.4 GB (agent coordinator)
├─ OpenClaw          0.3 GB (task execution)
├─ vLLM / Ollama     [Variable, GPU memory]
├─ NerveUI           0.1 GB (worker interface)
└─ Docker daemon     1.0 GB
   SUBTOTAL:         2.0 GB per worker

→ Why: Nerve is worker-specific. Runs local
  OpenClaw instance. Only needed when worker
  is powered on. No reason to push to cloud.

→ Pattern: Worker pulls tasks from LiteLLM
  (oracle-vps) but runs locally via OpenClaw
```

---

## RAM Capacity Charts

### BEFORE Migration (Status Quo)

```
ORACLE-VPS (24 GB):
┌─────────────────────────────────────────┐
│ Used:    6.0 GB (25%)  ████░░░░░░░░░░░ │
│ Free:   18.0 GB (75%)  ░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘

ORCHESTRATOR (assumes 16 GB):
┌─────────────────────────────────────────┐
│ Used:    3.5 GB (22%)  ████░░░░░░░░░░░ │
│ Free:   12.5 GB (78%)  ░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
```

### AFTER Migration (Control Plane → Oracle-VPS)

```
ORACLE-VPS (24 GB):
┌─────────────────────────────────────────┐
│ Used:    8.5 GB (35%)  ███████░░░░░░░░ │
│ Free:   15.5 GB (65%)  ░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
  ✓ STILL COMFORTABLE (35% used, 65% buffer)

ORCHESTRATOR (assumes 16 GB) - OPTIONAL:
┌─────────────────────────────────────────┐
│ Used:    0.75 GB (5%)  █░░░░░░░░░░░░░░ │
│ Free:   15.25 GB (95%) ░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
  ✓ OPTIONAL (only runs when PC on)
```

---

## CPU Utilization (Oracle-VPS, 4 OCPUs)

```
Control Plane CPU Load (typical):
├─ LiteLLM (request routing)     ~0.5 CPU
├─ Nexus Router (orchestration)  ~0.2 CPU
├─ Mission Control (audit)       ~0.1 CPU
├─ MCP Gateway                   ~0.1 CPU
├─ Forgejo (Git)                 ~0.05 CPU
└─ Memory Stack (Letta, etc.)    ~0.5 CPU
   ───────────────────────────────────
   TOTAL:                        ~1.45 CPU (36% of 4)

Headroom: ~2.55 CPU (64%) available for spikes
```

---

## Storage (Oracle-VPS, 200 GB)

```
Memory Stack:
├─ Qdrant vectors     ~20 GB
├─ FalkorDB graph     ~10 GB
├─ PostgreSQL data    ~15 GB
├─ Letta agents       ~5 GB
└─ Logs, cache        ~5 GB
   SUBTOTAL:          ~55 GB

Control Plane (if migrated):
├─ LiteLLM cache      ~5 GB
├─ Forgejo repos      ~30 GB (grows with usage)
├─ Mission Control    ~2 GB
└─ Backups            ~10 GB
   SUBTOTAL:          ~47 GB

────────────────────────────
TOTAL:                ~102 GB (51% of 200 GB)
AVAILABLE:            ~98 GB (49% buffer)
```

---

## Revised Migration Decision

### Services to MIGRATE → Oracle-VPS

```
✓ LiteLLM             (model routing, central)
✓ Mission Control     (audit service, always needed)
✓ Nexus Router        (orchestration hub)
✓ MCP Gateway         (protocol bridge)
✓ Forgejo (Git)       (repository, versioning)
✓ Portainer (main)    (infrastructure UI)
✓ Redis queue         (task queue)
```

### Services to KEEP LOCAL

```
✓ OpenHarness         (orchestrator-specific agent runtime)
✓ Portainer Agent     (edge management)
✓ Nerve (workers)     (worker-specific, runs with OpenClaw)
✓ NerveUI (workers)   (local worker interface)
✓ OpenClaw (workers)  (GPU task execution)
```

---

## Why Nerve Stays Local

```
Nerve Purpose: Coordinate OpenClaw instance on local machine
Current Setup: Worker-RTX5090 runs OpenClaw locally
Architecture: Nerve ←→ OpenClaw (same machine)

If moved to oracle-vps:
  ✗ Would add network latency (Nerve → OpenClaw over Tailscale)
  ✗ Only runs when worker powered on anyway
  ✗ Adds unnecessary cloud load
  ✓ No resilience benefit (only useful when worker online)

If kept local:
  ✓ Zero latency (Nerve + OpenClaw on same machine)
  ✓ Auto-starts/stops with worker
  ✓ No cloud resource waste
  ✓ Cleaner architecture (local = worker-specific)
```

---

## Deployment Plan

1. **Phase 1:** Migrate control plane to oracle-vps
   - Move LiteLLM, Mission Control, Nexus, Git, etc.
   - Workers route to oracle-vps:4000 (LiteLLM)
   - Orchestrator becomes optional

2. **Phase 2:** Keep Nerve local on workers
   - Deploy docker-compose.nerve.yml on worker-rtx5090
   - Nerve coordinates local OpenClaw instance
   - No oracle-vps involvement

3. **Phase 3:** Test orchestrator-offline
   - Power down orchestrator PC
   - Verify agents still work (via oracle-vps + workers)
   - Confirm Nerve coordinates tasks locally

---

## Redundancy & Fallback

```
Without Orchestrator (PC offline):
  Agent Request
    ↓
  LiteLLM (oracle-vps) ✓ ONLINE
    ↓
  Worker (100.64.0.11) ✓ ONLINE
    ↓
  Nerve (local) ✓ LOCAL
    ↓
  OpenClaw (local) ✓ EXECUTES

Result: Full operation. No orchestrator needed.
```

---

## Summary

✅ **Oracle-VPS specs (24GB RAM, 200GB storage, 4 OCPUs):**

- After migration: 35% RAM, 51% storage, 36% CPU used
- Plenty of headroom for growth

✅ **Nerve placement (FINAL):**

- Keep on worker-rtx5090 (where OpenClaw runs)
- No need to cloud it
- Only runs when worker powered on

✅ **Orchestrator PC (OPTIONAL):**

- Becomes optional after migration
- Good for local development
- Not critical for production

✅ **Architecture benefits:**

- Always-on cloud (oracle-vps)
- Optional local PC (orchestrator)
- Worker-local coordination (Nerve)
- Full resilience without orchestrator PC
