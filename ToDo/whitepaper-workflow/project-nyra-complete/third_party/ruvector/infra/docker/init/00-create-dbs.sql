-- Creates DBs for Twenty + Nyra AI, and enables RuVector extension in nyra_ai
-- NOTE: This runs only on first database initialization (empty volume).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'twenty') THEN
    CREATE DATABASE twenty;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nyra_ai') THEN
    CREATE DATABASE nyra_ai;
  END IF;
END $$;

\connect nyra_ai

CREATE EXTENSION IF NOT EXISTS ruvector;
CREATE SCHEMA IF NOT EXISTS nyra;

CREATE TABLE IF NOT EXISTS nyra.lead_chunks (
  id BIGSERIAL PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  lead_id TEXT NULL,
  chunk_text TEXT NOT NULL,
  embedding ruvector(384) NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_chunks_hnsw_idx
ON nyra.lead_chunks
USING ruhnsw (embedding ruvector_l2_ops);

CREATE INDEX IF NOT EXISTS lead_chunks_source_idx
ON nyra.lead_chunks (source_type, source_id);
