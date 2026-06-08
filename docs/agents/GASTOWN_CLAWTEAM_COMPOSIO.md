# GASTOWN_CLAWTEAM_COMPOSIO.md

Last updated: 2026-05-24

## Overview

This document describes the three integration layers that sit between the Letta orchestrator and
external systems: Gastown (workspace surface), Clawteam (multi-node orchestration helpers), and
Composio (external tool connector). Gastown is retired — do not reintroduce it.

---

## Gastown — Workspace Manager

Gastown is the primary operator coordination surface for Project Nyra. It replaces the legacy
Gastown workspace manager entirely.

| Property | Value                                         |
| -------- | --------------------------------------------- |
| Host     | oracle                                        |
| Port     | 8080                                          |
| Role     | Workspace manager, agent coordination surface |
| Replaces | Gastown (retired — do not reintroduce)        |

### Responsibilities

- Presents the active operator workspace: current sessions, lead pipeline, pending approvals.
- Routes task dispatch requests to Letta, which then coordinates OpenClaw workers.
- Surfaces Clawteam job status and Composio integration health.
- Does not expose raw worker internals, database connections, or MCP tool details to operators.

### Gastown Rules

1. All operational actions with business impact must emit an audit event before completion.
2. Raw worker state (GPU metrics, VRAM) is surfaced read-only via NerveUI, not Gastown.
3. Gastown does not hold borrower PII in its own state; it reads from Letta memory on demand.
4. When Composio credentials are absent, Gastown shows mock/simulated data for affected tools.

---

## Clawteam — Multi-Node Orchestration Helpers

Clawteam provides orchestration helper processes that assist Letta and OpenClaw with multi-node
coordination tasks: fan-out, aggregation, health polling, and job queuing.

### Node Layout

| Node      | Role                                                     |
| --------- | -------------------------------------------------------- |
| oracle    | Primary Clawteam node; always running                    |
| rtx5090   | Secondary node for heavy parallel fan-out jobs           |
| rtx3090ti | Secondary node for steady-state aggregation tasks        |
| rtx3060   | Secondary node for lightweight polling and health checks |

Secondary nodes are optional. If a worker is offline, the primary oracle node handles all
Clawteam responsibilities for that worker's scope.

### Clawteam Responsibilities

- Fan-out: distribute a single Letta task to multiple OpenClaw workers simultaneously.
- Aggregation: collect results from parallel OpenClaw calls and return a merged response.
- Job queue: hold pending cron job triggers when a target worker is offline; deliver on wake.
- Health polling: periodic pings to all worker OpenClaw endpoints; update cluster state in Letta.
- Retry coordination: track retry counts across workers; escalate after third failure.

### Clawteam Rules

1. Do not reintroduce Gastown as a Clawteam dependency or sibling service.
2. Clawteam nodes do not write memory directly; they pass results to Letta for memory writes.
3. All fan-out jobs must include the originating `source_event_id` for audit traceability.

---

## Composio — External Tool Connector

Composio connects Nyra to third-party APIs and external services. It operates as an adapter layer
behind well-defined tool contracts, so the rest of the stack is shielded from external API churn.

### Integration Pattern

```
Letta orchestrator
    │
    ▼
nyra_run_openclaw_task (tool=composio_<integration>)
    │
    ▼
OpenClaw → Composio adapter
    │
    ▼
External API (CRM, email, SMS provider, etc.)
    │
    ▼
Response → OpenClaw → Letta memory write + audit event
```

### Mock Mode

When Composio credentials are absent or the connection is unhealthy, tools must return mock
responses rather than hard-failing. Mock responses are tagged `{"source": "mock", "live": false}`
so downstream audit events record the simulated nature of the data.

### Composio Rules

1. Never expose raw API keys or tokens in Composio tool responses.
2. All Composio-triggered outbound actions (email, SMS, CRM write) require prior audit event.
3. Mock mode is mandatory when credentials are absent — do not block the pipeline.
4. Composio integration health is surfaced in Gastown's workspace dashboard.

---

## Integrated Orchestration Flow

```
Operator action in Gastown (oracle:8080)
    │
    ▼
Gastown → Letta (oracle:8283) — task dispatch
    │
    ▼
Letta → Clawteam — fan-out / job queue if multi-worker
    │
    ▼
Clawteam → OpenClaw worker(s) — tool execution
    │
    ├─ Internal tools: direct worker APIs
    └─ External tools: OpenClaw → Composio → third-party API
    │
    ▼
Results → Letta → memory write + audit event
    │
    ▼
Summary → Gastown workspace surface
```
