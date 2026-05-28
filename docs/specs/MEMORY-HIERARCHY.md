# Project Nyra Memory Hierarchy Spec

This document defines the architecture and routing rules for Project Nyra's multi-layered memory system.

## 1. Hierarchy Layers

### Layer 1: The Source of Truth (CRM & Event Ledger)

- **Primary Data**: Lead profiles, Application status, Communication logs, Audit trails.
- **Store**: TwentyCRM (Postgres), Supabase `audit_events`.
- **Precedence**: Absolute. Memory stores must sync from here.

### Layer 2: Behavioral & Semantic Memory (Mem0 + Qdrant)

- **Purpose**: Capturing user preferences, recurring patterns, and semantic search.
- **Provider**: Mem0.
- **Backend**: Qdrant (Vector Database).
- **Scope**: User-specific and Lead-specific insights.

### Layer 3: Agent Orchestration State (Letta)

- **Purpose**: Short-term conversational context, agent "recollections", and task state.
- **Provider**: Letta (formerly MemGPT).
- **Backend**: Letta Postgres.
- **Scope**: Active sessions and complex multi-step reasoning.

### Layer 4: Global Knowledge Base (Mempalace / Graphiti)

- **Purpose**: Static product knowledge, compliance rules, lender guidelines.
- **Provider**: Graphiti / FalkorDB.
- **Scope**: Cross-entity relationships and complex entity graphs.

## 2. Context Retrieval API Contract

The `assistant-service` acts as the gateway to the memory stack.

### `POST /api/assistant/context/retrieve`

**Input:**

```json
{
  "leadId": "uuid",
  "query": "What was the borrower's main concern in the last call?",
  "depth": "semantic" | "orchestration" | "full"
}
```

**Output:**

```json
{
  "summary": "The borrower was concerned about the APR being higher than the quote.",
  "sourceEvents": ["comm_123", "audit_456"],
  "semanticMatches": [
    { "text": "...", "confidence": 0.92 }
  ],
  "orchestrationState": { ... }
}
```

## 3. PII Retention & Safety Rules

- **PII Scrubbing**: Semantic memory (Mem0) should prioritize scrubbing of specific account numbers or SSNs before embedding, replacing them with tokens.
- **DNC/STOP Hook**: Any STOP/DNC event in the CRM must immediately invalidate/lock the corresponding Lead memory in all layers.
- **Retention**:
  - Orchestration state (Letta): 30 days.
  - Semantic insights (Mem0): 7 years (compliance).
  - Temporary session cache (Redis): 24 hours.

## 4. Cache Invalidation Plan

- **Trigger**: CRM webhook on `lead.updated` or `application.status_changed`.
- **Action**: Purge/Update Mem0 entries for the specific `leadId`.
- **Auditing**: Every memory retrieval used in a decision must be logged in the `audit_events` metadata.
