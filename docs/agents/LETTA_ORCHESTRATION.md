# LETTA_ORCHESTRATION.md

Last updated: 2026-05-24

## Overview

Letta is the memory orchestrator and primary coordination layer for all OpenClaw agents in
Project Nyra. Every task requiring persistent memory, multi-step reasoning, or cross-agent
coordination routes through Letta first. Letta runs on oracle:8283 backed by a dedicated
letta-postgres instance.

---

## Agent: nyra-stack-orchestrator

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| Agent ID         | agent-516e2d8a-742e-4970-8d1b-2870b56ba804 |
| Name             | nyra-stack-orchestrator                    |
| Endpoint         | oracle:8283                                |
| LLM backend      | local/llama3.2-3b via LiteLLM              |
| Postgres backend | letta-postgres (dedicated instance)        |
| Default context  | 8 192 tokens; expand for heavy tasks       |

### Core Memory Blocks

| Block       | Purpose                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `persona`   | Agent role definition, tone guardrails, mortgage compliance reminders  |
| `human`     | Broker/borrower identity snapshot: name, license, active deal pipeline |
| `cluster`   | GPU worker availability, power state, and pending cron job queue       |
| `approvals` | Pending and recently completed human approval gate entries             |

### Tool Inventory

| Tool name                   | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `nyra_wake_gpu_worker`      | WoL via power-management-api at orchestrator:8765   |
| `nyra_sleep_gpu_worker`     | SSH suspend via power-management-api                |
| `nyra_cluster_power_status` | Returns live power/health for all workers           |
| `nyra_run_openclaw_task`    | Dispatches a task to the selected OpenClaw instance |
| `nyra_write_audit_event`    | Writes structured audit record to persistent store  |
| `nyra_memory_search`        | Semantic search across mem0+Qdrant                  |
| `nyra_request_approval`     | Posts approval request to human approval gate       |
| `nyra_poll_approval`        | Polls for approval response; timeout = 5 min        |

---

## Agent Task Lifecycle

```
receive_task
    │
    ▼
read_memory_context          ← archival search top_k=10 + core block refresh
    │
    ▼
select_worker_and_tool       ← check cluster power status
                               prefer rtx5090 for burst/heavy
                               rtx3090ti for steady-state
                               rtx3060 for lightweight/fallback
    │
    ▼
is_high_risk?
  YES ──► nyra_request_approval ──► nyra_poll_approval (5 min timeout)
            │ approved                │ rejected / timeout
            ▼                         ▼
        continue                  abort + write audit
  NO  ──► continue
    │
    ▼
execute_tool_call            ← nyra_run_openclaw_task or direct Letta tool
    │
    ▼
write_audit_event            ← mandatory on success AND failure
    │
    ▼
write_memory                 ← include source_event_id, confidence, TTL
    │
    ▼
return_summary
```

High-risk actions include: any outbound borrower communication, CRM mutations, loan status
changes, and any action that modifies a lead record that was not created in this session.

---

## Memory Write Contract

Every memory write from nyra-stack-orchestrator must include:

```json
{
  "source_event_id": "<uuid of the triggering event>",
  "record_type": "<borrower_fact | workflow_state | audit | cluster_state>",
  "confidence": 0.85,
  "ttl_days": null,
  "created_at": "<ISO-8601>",
  "payload": {}
}
```

- `confidence`: 0.0 (unverified) to 1.0 (confirmed by authoritative source)
- `ttl_days`: set for transient state (cluster power status = 1 day); omit for permanent facts
- Conflicting borrower facts: write new record with `conflict_with=<prior_id>` and
  `confidence < 0.5`; do not silently overwrite
- Lead/contact/quote/campaign IDs must be included in payload when available

---

## Archival Memory Runbook

1. Before every new task: `nyra_memory_search(query, top_k=10)`
2. After task completion: archive workflow state with `record_type=workflow_state`
3. Stale records (ttl_days elapsed): mark `status=stale`; never delete
4. Conflicting facts: write new record with `conflict_with=<prior_id>`; notify orchestrator
5. Audit events are append-only; never mutated or deleted

---

## Pending: Power Management API

The `nyra_wake_gpu_worker`, `nyra_sleep_gpu_worker`, and `nyra_cluster_power_status` tools depend
on the FastAPI power-management service at `orchestrator:8765`.

**Status: PENDING DEPLOYMENT**

Until live, these tools return `503 not_deployed`. Issue WoL commands manually from orchestrator:

```bash
wakeonlan -i 192.168.1.255 A8:A1:59:D4:3B:88   # rtx5090
wakeonlan -i 192.168.1.255 B4:2E:99:F0:1A:7C   # rtx3090ti
wakeonlan -i 192.168.1.255 04:7C:16:AA:D8:34   # rtx3060
```

Sleep: `ssh <worker> sudo systemctl suspend`
