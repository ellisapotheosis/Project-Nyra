# OPENCLAW_NERVE_WORKER_MODEL.md

Last updated: 2026-05-24

## Overview

OpenClaw is the supervised assistant execution surface for Project Nyra. One OpenClaw instance
runs per GPU worker. NerveUI is the per-worker operator control panel — it is not the broker
product UI. The OpenClaw Gateway on the orchestrator handles routing and load distribution.

---

## Topology

```
orchestrator
  └─ OpenClaw Gateway (primary routing + fallback)
  └─ NerveUI (fleet overview)

worker-rtx5090   (100.64.0.7)
  └─ OpenClaw instance
  └─ NerveUI instance

worker-rtx3090ti (100.64.0.6)
  └─ OpenClaw instance
  └─ NerveUI instance

worker-rtx3060   (100.64.0.5)
  └─ OpenClaw instance
  └─ NerveUI instance
```

The Gateway on the orchestrator is the canonical entry point. If a secondary backup gateway is
needed and an rtx4060 is provisioned in future, it may host one — but no such node exists today.
Do not assume a backup gateway is present.

---

## Worker Assignment Strategy

| Worker    | Tailscale IP | Primary use                                                            |
| --------- | ------------ | ---------------------------------------------------------------------- |
| rtx5090   | 100.64.0.7   | Burst/heavy: large LLM inference, complex multi-step pipelines         |
| rtx3090ti | 100.64.0.6   | Steady-state: assistant tasks, document generation, quote processing   |
| rtx3060   | 100.64.0.5   | Lightweight/fallback: embeddings, extraction, summarization, voice STT |

The Letta orchestrator selects a worker based on `nyra_cluster_power_status` before dispatching.
If the preferred worker is offline and the power-management-api is live, Letta may issue a WoL
wake command and wait up to 60 seconds before rerouting to a fallback worker.

---

## OpenClaw Session Lifecycle

```
1. create_session
     ├─ assign session_id (UUID)
     └─ attach lead/broker context from Letta memory

2. attach_lead_context
     ├─ pull borrower facts from mem0+Qdrant (nyra_memory_search top_k=10)
     ├─ load relevant archival memory blocks
     └─ set active_deal_id in session state

3. route_to_worker
     ├─ query cluster power status
     ├─ select worker by task type (see assignment table above)
     └─ open Tailscale-routed connection to worker OpenClaw instance

4. call_tools
     ├─ every tool call is audited via nyra_write_audit_event
     ├─ consent / STOP / DNC / quiet-hours check before any outbound action
     └─ memory search before any write to detect conflicts

5. request_human_approval  (if required)
     ├─ borrower-facing outbound: always required
     ├─ CRM mutations: required if not initiated by session owner
     └─ timeout = 5 min; rejected or expired → abort + write audit event

6. write_audit_event
     └─ mandatory on success, failure, and rejection

7. write_memory
     └─ source_event_id + confidence + record_type required (see memory write contract)

8. close / fail / retry
     ├─ close: session marked complete; resources released
     ├─ fail: error logged; session marked failed; Letta notified
     └─ retry: max 3 attempts; escalate to operator after third failure
```

---

## NerveUI Capabilities Per Worker

NerveUI is the operator-facing control panel deployed alongside each OpenClaw instance.
It is not exposed to brokers or borrowers.

| Feature           | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| Session browser   | List, inspect, and replay active and historical sessions        |
| Workspace browser | File and artifact access for the current worker session context |
| Log viewer        | Streaming logs for OpenClaw and connected services              |
| Voice control     | Trigger and monitor voice jobs assigned to this worker          |
| Approval queue    | Inline approval/rejection for pending human gate requests       |
| Health panel      | GPU utilization, VRAM usage, service status                     |

NerveUI does not expose raw database connections, MCP internals, or Letta memory directly.
All data is surfaced through OpenClaw session APIs.

---

## Failure Handling

| Condition                               | Response                                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| Worker unreachable                      | Gateway reroutes to next available worker; logs failure event |
| Session stuck > 10 min without progress | Letta sends alert; operator must resolve via NerveUI          |
| Approval timeout (5 min)                | Session aborted; audit event with `reason=approval_timeout`   |
| Third consecutive retry failure         | Escalate to operator; no further automatic retry              |
| All workers offline                     | Queue job in Clawteam; deliver when first worker comes online |

All failures write a `record_type=workflow_state` memory entry with `status=failed` and
`source_event_id` pointing to the original task event.
