# MEMORY_STACK_ROUTING.md

Last updated: 2026-05-26

## Overview

Project Nyra uses a layered memory architecture. Reads and writes follow a strict priority order.
No layer may hold conflicting borrower facts silently. All writes must include provenance metadata.

---

## Priority Routing (highest to lowest)

| Priority | Layer                    | Role                                                                     |
| -------- | ------------------------ | ------------------------------------------------------------------------ |
| 1        | Letta memory + Letta MCP | Always in agent context; core blocks: persona, human, cluster, approvals |
| 2        | mem0 + Qdrant + FalkorDB | Semantic and graph memory for persistent borrower/broker facts           |
| 3        | OpenMemory MCP           | Browser and diagnostic memory access; primarily read-heavy               |
| 4        | Mempalace                | Structured memory palace; session and workflow state                     |
| 5        | memorytensor / memOS     | Tensor-indexed memory and MemoryTensor/MemOS MCP                         |
| 6        | Extra memory MCP (TBD)   | Reserved for future integrations                                         |

**Read path**: query Letta core blocks first; if not found, cascade down the priority list.
**Write path**: always write to Letta memory (core or archival) plus the most appropriate
lower-priority layer. Never write to a lower-priority layer without also updating Letta.

---

## Backend Details

### mem0 + Qdrant

- Vector backend: Qdrant (768-dimensional nomic-embed-text embeddings)
- Graph backend: FalkorDB (custom community plugin — do NOT swap for another graph backend)
- Qdrant collection: `mem0-nyra-768` by default. Do not reuse older 1536-dimensional
  collections with the RTX3060 embedding lane.
- Used for: semantic search across borrower facts, broker preferences, deal history
- Write trigger: any `record_type=borrower_fact` or `record_type=workflow_state` from Letta

### Letta Postgres

- Dedicated instance: `letta-postgres`
- Stores: agent state, core memory blocks, archival memory, tool call history
- Not shared with any other service
- Letta MCP bridge: `nyra-memory-letta-mcp` on `127.0.0.1:8284`; it must point at
  the Oracle-local Letta API (`http://letta:8283/v1`), not the hosted Letta API.

### OpenMemory MCP

- Read-heavy; used for diagnostic and browser-accessible memory inspection
- Do not use as primary write target; it mirrors from Letta + mem0

### MemoryTensor / MemOS

- API: `nyra-memory-memos-api` on `127.0.0.1:8001`
- MCP: `nyra-memory-memos-mcp` on `127.0.0.1:8095` with SSE transport
- Current container health verifies the API and MCP listener. MemOS uses its own
  configuration model; mem0 remains the canonical Qdrant + FalkorDB writer.

### MemPalace

- Container: `nyra-memory-mempalace-mcp`
- The packaged runtime is stdio-oriented, so health is verified by container
  import/health status rather than by HTTP response semantics.

---

## Write Contract

Every memory write across all layers must include:

```json
{
  "source_event_id": "<uuid of the triggering event>",
  "record_type": "<borrower_fact | workflow_state | audit | cluster_state>",
  "confidence": 0.0,
  "ttl_days": null,
  "created_at": "<ISO-8601 timestamp>",
  "lead_id": "<optional>",
  "contact_id": "<optional>",
  "quote_id": "<optional>",
  "campaign_id": "<optional>",
  "payload": {}
}
```

- `confidence`: 0.0 (unverified) to 1.0 (confirmed by authoritative source)
- `ttl_days`: set for transient data (cluster_state = 1); omit for permanent borrower facts
- `lead_id` / `contact_id` / `quote_id` / `campaign_id`: required for borrower facts and
  workflow state when available

---

## Conflict Handling

Conflicting borrower facts must never be written silently:

1. Before writing a borrower fact, search for existing records with the same
   `(lead_id, field_name)` combination.
2. If a conflict is found: write the new record with `conflict_with=<prior_record_id>` and
   `confidence < 0.5`.
3. Flag the conflict in Letta's `approvals` core memory block for operator resolution.
4. Do not promote either record to `confidence >= 0.8` until an operator resolves the conflict.
5. Stale records (ttl_days elapsed): set `status=stale`; never delete.

---

## Isolation Rule

Separate assistants (Claude Code sessions, NerveUI sessions, Gastown workflows) must not create
isolated borrower memory silos. All borrower facts flow through Letta as the single source of
truth. Cross-session reads must go through `nyra_memory_search` to ensure consistency.

---

## Layer Health Checks

Memory layer health is monitored alongside worker health checks:

| Layer      | Health check method                                                                |
| ---------- | ---------------------------------------------------------------------------------- |
| Letta      | `GET http://oracle:8283/v1/health/`                                                |
| Letta MCP  | `GET http://oracle:8284/mcp` returns protocol status (`405` is acceptable for GET) |
| mem0       | `GET http://oracle:5001/health`                                                    |
| Qdrant     | host health endpoint or Docker health for `nyra-memory-qdrant-memory`              |
| FalkorDB   | TCP connection check or Docker health for `nyra-memory-falkordb`                   |
| OpenMemory | `GET http://oracle:8765/docs`                                                      |
| MemOS API  | `GET http://oracle:8001/health`                                                    |
| MemOS MCP  | TCP connection check on `oracle:8095`                                              |
| Mempalace  | Docker health for `nyra-memory-mempalace-mcp`                                      |

If Qdrant or FalkorDB is unreachable, mem0 writes are queued locally and retried on next cycle.
Letta writes always proceed regardless of lower-layer availability — Letta is the single source
of truth and must never be blocked by downstream layer failures.
