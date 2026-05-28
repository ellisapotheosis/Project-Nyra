# OPENCLAW_CRON_JOBS.md

Last updated: 2026-05-24

## Overview

OpenClaw cron jobs are the preferred mechanism for recurring automated tasks in Project Nyra.
Fall back to n8n only when a task cannot be expressed as an OpenClaw cron job (e.g. complex visual
workflow orchestration requiring a GUI). Every cron job must enforce consent, STOP/DNC, quiet
hours, approval, and audit gates before any outbound action.

---

## Canonical Cron Job Contracts

### 1. campaign-monitor

| Field        | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Schedule     | Every 5 minutes                                                       |
| Action       | Poll active enrollments; check STOP/DNC list; update enrollment state |
| Audit event  | `cron.campaign_monitor.run` with counts: checked, paused, continued   |
| Memory write | `record_type=workflow_state` for any enrollment state change          |
| Failure mode | Log error + audit; do not silently skip enrollments                   |

Steps:

1. Fetch all enrollments with `status=active`.
2. For each enrollment, check lead's STOP/DNC status.
3. If STOP or DNC detected: pause enrollment, write audit event, write memory.
4. If quiet hours active for lead's timezone: defer next step; do not advance sequence.
5. Write `cron.campaign_monitor.run` audit event with summary counts.

---

### 2. reply-poller

| Field        | Value                                                                   |
| ------------ | ----------------------------------------------------------------------- |
| Schedule     | Every 2 minutes                                                         |
| Action       | Ingest new SMS/email replies; classify intent; route to correct handler |
| Audit event  | `cron.reply_poller.ingest` per reply with `intent` classification       |
| Memory write | `record_type=borrower_fact` if reply contains new borrower information  |
| Failure mode | Unclassified replies queued for operator review via NerveUI             |

Intent classifications: `opt_out`, `interested`, `not_interested`, `question`,
`callback_request`, `unclassified`. STOP/opt-out replies trigger immediate enrollment pause
before any other action. Idempotency key: message ID from inbound provider.

---

### 3. health-checker

| Field        | Value                                                                   |
| ------------ | ----------------------------------------------------------------------- |
| Schedule     | Every 60 seconds                                                        |
| Action       | Ping each worker's OpenClaw endpoint; update cluster state in Letta     |
| Audit event  | `cron.health_checker.run`; `worker.status_change` on each transition    |
| Memory write | `record_type=cluster_state` with `ttl_days=1`                           |
| Failure mode | After 3 consecutive failures for a worker: alert Clawteam; mark offline |

Endpoints checked:

- orchestrator OpenClaw Gateway
- rtx5090 (100.64.0.7) OpenClaw
- rtx3090ti (100.64.0.6) OpenClaw
- rtx3060 (100.64.0.5) OpenClaw

---

### 4. memory-compaction

| Field        | Value                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Schedule     | Daily at 03:00 UTC                                                       |
| Action       | Identify stale, expired, and conflicting memory records; flag them       |
| Audit event  | `cron.memory_compaction.run` with counts: stale_flagged, conflicts_found |
| Memory write | Update `status=stale` on expired records; do not delete                  |
| Failure mode | Log error; retry next scheduled run; never partially compact             |

Rules:

- Records with `ttl_days` elapsed: set `status=stale`.
- Records with `conflict_with` populated and unresolved: escalate to operator via approvals block.
- Do not delete any memory record; mark as stale only.
- Conflicting borrower facts require operator resolution before either record is trusted.

---

### 5. quote-followup

| Field        | Value                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Schedule     | Every 30 minutes                                                         |
| Action       | Find quotes with no response after threshold; trigger follow-up sequence |
| Audit event  | `cron.quote_followup.triggered` with `quote_id` and `elapsed_hours`      |
| Memory write | `record_type=workflow_state` with follow-up attempt count                |
| Failure mode | Skip if STOP/DNC or quiet hours active; log and continue to next lead    |

Follow-up threshold: 24 hours after quote sent with no borrower reply. Maximum 2 automated
follow-ups per quote event. Third follow-up requires human approval via Letta approval gate.
Idempotency key: `quote_id` + attempt number.

---

### 6. missed-call-ping

| Field        | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| Schedule     | Every 15 minutes                                                     |
| Action       | Detect missed inbound calls; trigger missed-call follow-up sequence  |
| Audit event  | `cron.missed_call_ping.triggered` per lead with `call_id`            |
| Memory write | `record_type=workflow_state` for each sequence trigger               |
| Failure mode | Skip if STOP/DNC or quiet hours active; write audit with skip reason |

One ping per missed call event. Idempotency key: `call_id`. If a ping was already sent for
this `call_id`, skip silently without writing a new audit event.

---

## Shared Requirements for All Cron Jobs

1. **Consent gate**: check STOP/DNC list before any outbound action.
2. **Quiet hours gate**: check lead timezone; defer if outside allowed contact hours.
3. **Audit event**: write before and after every outbound action.
4. **Memory write**: include `source_event_id`, `confidence`, `record_type`.
5. **Idempotency**: use event/call/quote IDs as idempotency keys to prevent duplicate sends.
6. **n8n fallback**: only if the job genuinely cannot be expressed as an OpenClaw cron job.
7. **No silent failures**: every error must produce an audit event with failure reason.
