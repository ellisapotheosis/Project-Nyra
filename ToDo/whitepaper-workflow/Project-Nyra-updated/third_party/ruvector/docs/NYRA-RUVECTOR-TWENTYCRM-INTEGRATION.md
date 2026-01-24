# RuVector + TwentyCRM (Postgres) Integration Plan

## Recommended pattern: one Postgres cluster, two DBs
Run **one Postgres cluster** based on **RuVector-Postgres**, then create **separate databases**:

- `twenty`  -> TwentyCRM uses this DB only (no schema changes required)
- `nyra_ai` -> Nyra vectors + retrieval live here

Why this is the sweet spot:
- No schema coupling with Twenty migrations
- One Postgres process to tune for RAM/IO
- Easy ETL/CDC later (Twenty -> Nyra AI)

## What RuVector-Postgres adds
- `CREATE EXTENSION ruvector;`
- A `ruvector(DIM)` column type (example: `ruvector(384)` or `ruvector(1536)`)
- HNSW index method `ruhnsw` (plus operator classes like `ruvector_l2_ops`)
- A lot of extra SQL functions (attention, sparse vectors/BM25, etc.)

## Minimal schema for Nyra AI DB

In database `nyra_ai`:

```sql
CREATE EXTENSION IF NOT EXISTS ruvector;
CREATE SCHEMA IF NOT EXISTS nyra;

CREATE TABLE IF NOT EXISTS nyra.lead_chunks (
  id BIGSERIAL PRIMARY KEY,
  source_type TEXT NOT NULL,          -- email | api | leadmailbox | form | crm
  source_id TEXT NOT NULL,            -- message-id, vendor id, etc
  lead_id TEXT NULL,                  -- your canonical lead id
  chunk_text TEXT NOT NULL,
  embedding ruvector(384) NULL,       -- start at 384 (cheaper), upgrade later if needed
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_chunks_hnsw_idx
ON nyra.lead_chunks
USING ruhnsw (embedding ruvector_l2_ops);

CREATE INDEX IF NOT EXISTS lead_chunks_source_idx
ON nyra.lead_chunks (source_type, source_id);
```

Retrieval example:

```sql
SELECT id, source_type, source_id, lead_id,
       (embedding <-> $1::ruvector) AS distance,
       chunk_text, meta
FROM nyra.lead_chunks
WHERE source_type IN ('email','api','leadmailbox')
ORDER BY distance
LIMIT 10;
```

## Compose wiring strategies

### Option A (recommended): One RuVector Postgres for both apps
- Run `ruvnet/ruvector-postgres:latest` as your `postgres` container
- Create DBs `twenty` and `nyra_ai` via init SQL
- Point Twenty at `.../twenty`
- Point Nyra services at `.../nyra_ai`

### Option B: Keep Twenty's Postgres vanilla; add a second RuVector Postgres
- Zero changes to Twenty deployment
- Nyra queries its own RuVector DB
- Mirror Twenty entities into Nyra via ETL/CDC (later)

## Using @ruvector/postgres-cli (optional)
This is helpful for CI or manual init:
- `npm i -g @ruvector/postgres-cli`
- `ruvector-pg -c "postgresql://host:5432/nyra_ai" install`

## Next step after this plan
1) Implement canonical lead schema + ingestion pipeline
2) Implement embeddings pipeline (batched, rate-limited)
3) Add ETL from Twenty -> Nyra AI DB for contacts, notes, activities, deal changes
