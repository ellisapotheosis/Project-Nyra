# Project Nyra – Data Model Overview

This document describes the key tables and data structures used in Project Nyra.  It covers both the existing TwentyCRM database (`twenty`) and the new AI memory database (`nyra_ai`).  Where appropriate, we provide example schemas and notes about indexing.

## 1. TwentyCRM Database (`twenty`)

TwentyCRM provides a rich schema for managing customer relationships.  Here we list only the most relevant tables for AI integration.  Consult the TwentyCRM documentation for full details.

| Table | Description |
|------|-------------|
| `contacts` | Primary entity for individuals; fields include `id`, `first_name`, `last_name`, `email`, `phone`, `company_id`, `created_at`, etc. |
| `companies` | Company or organisation; fields include `id`, `name`, `industry`, `size`, `website`, `created_at`. |
| `deals` | Sales opportunities; fields include `id`, `title`, `value`, `stage`, `owner_id`, `contact_id`, `expected_close_date`, `close_reason`, etc. |
| `tasks` | To‑dos associated with contacts or deals; fields include `id`, `title`, `due_date`, `status`, `owner_id`, `related_entity_type`, `related_entity_id`. |
| `notes` | Free‑form notes attached to contacts, deals or companies; fields include `id`, `content`, `owner_id`, `created_at`, `entity_type`, `entity_id`. |
| `workflows` | Definitions for trigger‑action workflows; tables such as `workflow_triggers`, `workflow_actions`, `workflow_runs` track trigger conditions and executed actions.  Our AI actions register here. |

These tables remain unchanged by the AI integration.  We interact with them via TwentyCRM’s service layer, ensuring that permission checks and business logic are honoured.

## 2. Nyra AI Database (`nyra_ai`)

The AI components introduce a new Postgres database to hold embeddings, metadata and audit logs.  The following tables are proposed.  Primary keys are `SERIAL` or `UUID` as appropriate.

### 2.1 `vectors`

Stores vector embeddings and associated metadata.  A **RuVector** extension provides the `ruvector(DIM)` data type and HNSW index.

```sql
CREATE EXTENSION IF NOT EXISTS ruvector;

CREATE TABLE IF NOT EXISTS vectors (
  id            SERIAL PRIMARY KEY,
  embedding     ruvector(1536) NOT NULL,
  type          TEXT NOT NULL,         -- e.g. 'lead_enrichment', 'deal_analysis'
  description   TEXT NOT NULL,
  reference_id  TEXT,                 -- ID in the source system (e.g. deal id)
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an HNSW index on the embedding column for ANN search
CREATE INDEX IF NOT EXISTS idx_vectors_embedding ON vectors USING ruhnsw (embedding);
```

**Fields explained:**

- `embedding` – high‑dimensional vector representation of the text or event.
- `type` – category of the entry (used for filtering).  Examples: `lead_enrichment`, `next_action`, `lost_deal`, `reply_draft`.
- `description` – short text summarising the content of the embedding.  This is stored in plain text for explanation and debugging.
- `reference_id` – pointer back to the CRM record or event that generated the vector.
- `metadata` – JSON object containing extra attributes (confidence scores, user feedback, outcome, etc.).
- `created_at` – timestamp for retention policies.

### 2.2 `ai_audit_log`

Logs all AI‑initiated actions and suggestions for transparency and troubleshooting.

```sql
CREATE TABLE IF NOT EXISTS ai_audit_log (
  id           BIGSERIAL PRIMARY KEY,
  user_id      TEXT NOT NULL,
  action_type  TEXT NOT NULL,          -- e.g. 'suggestion_generated', 'suggestion_accepted'
  context      JSONB NOT NULL,         -- snapshot of the input context
  suggestion   JSONB,                  -- AI suggestion or output
  model_used   TEXT NOT NULL,          -- e.g. 'claude-sonnet-4-5'
  duration_ms  INTEGER NOT NULL,       -- latency of the AI call
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_log_user ON ai_audit_log(user_id);
```

### 2.3 `suggestions`

Temporary storage for suggestions awaiting user action.  Once accepted or dismissed, the status is updated.

```sql
CREATE TABLE IF NOT EXISTS suggestions (
  id            BIGSERIAL PRIMARY KEY,
  entity_type   TEXT NOT NULL,         -- 'lead', 'deal', etc.
  entity_id     TEXT NOT NULL,
  suggestion_type TEXT NOT NULL,       -- 'next_action', 'enrichment', etc.
  content       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'dismissed'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_entity ON suggestions(entity_type, entity_id);
```

### 2.4 `jobs`

Job queue metadata for BullMQ.  While BullMQ uses Redis for queuing, we persist job results and statuses in Postgres for auditing.

```sql
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name     TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'queued',  -- 'queued', 'running', 'completed', 'failed'
  result       JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.5 `lead_events` (for ingestion)

An optional table for capturing raw lead ingestion events (emails, API payloads).  Keeping raw events ensures reproducibility and allows for reprocessing if parsing improves.

```sql
CREATE TABLE IF NOT EXISTS lead_events (
  id           BIGSERIAL PRIMARY KEY,
  source       TEXT NOT NULL,          -- 'lendingtree', 'freerateupdate', 'email', 'api'
  raw_payload  JSONB NOT NULL,
  parsed_lead  JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_events_source ON lead_events(source);
```

## 3. Configuration Files

Apart from the database schema, several configuration files control the behaviour of the AI system:

* `config/claude-flow/orchestrator/claude-flow.config.json` – defines MCP endpoints, model aliases and tool hooks for the orchestrator.  Updated to set `workspaceRoot` to `/opt/repos/project-nyra` instead of `/opt/nyra/project-nyra`.
* `.env` – environment variables for database connections, API keys, memory limits, etc.  Each machine (orchestrator and workers) has its own `.env` based off `infra/.env.example`.
* `infra/litellm/litellm.yaml` – model routing configuration for LiteLLM, mapping profiles like `nyra-fast`, `nyra-balanced`, etc.  Contains API keys and cost/quality weights.
* `bootstrap/configs/hardware-detection.json` – generated by the bootstrap GUI; lists detected hardware and assigned role (orchestrator vs worker).  Used by the Wake script and other bootstrap tools.

## 4. Data Retention and Policies

* **Memory retention** – embeddings older than a configurable threshold (e.g. 18 months) are pruned or archived.  A background job runs nightly to remove old entries from `vectors`.
* **Suggestion cleanup** – suggestions older than 90 days or with status `dismissed` are purged.
* **Audit logs** – stored indefinitely for compliance, but may be anonymised after 5 years.  Access restricted to administrators.

## Conclusion

The data model distinguishes clearly between CRM data and AI data.  We respect the boundaries of TwentyCRM by not modifying its schema, instead adding a parallel `nyra_ai` database with tables optimised for AI workloads.  The use of RuVector for vector storage leverages Postgres’s extension mechanism, allowing vector search without an additional specialised database.  With proper indexing and retention policies, this model scales while maintaining performance and privacy.