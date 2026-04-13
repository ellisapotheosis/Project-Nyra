-- RuVector Postgres initialization for Nyra AI DB

-- Install the RuVector extension (explicit version optional)
CREATE EXTENSION IF NOT EXISTS ruvector;

-- Create namespace for Nyra embeddings
CREATE SCHEMA IF NOT EXISTS nyra;

-- Table for storing semantic chunks of leads/documents
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

-- HNSW index for vector similarity (L2 distance)
CREATE INDEX IF NOT EXISTS lead_chunks_hnsw_idx
ON nyra.lead_chunks
USING ruhnsw (embedding ruvector_l2_ops);

-- Secondary index for fast lookups by source
CREATE INDEX IF NOT EXISTS lead_chunks_source_idx
ON nyra.lead_chunks (source_type, source_id);