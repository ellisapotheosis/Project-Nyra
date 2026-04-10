-- Nyra / archon-os RuVector bootstrap
-- IMPORTANT: RuVector requires explicit version when creating extension.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE EXTENSION IF NOT EXISTS ruvector VERSION '0.1.0';

CREATE SCHEMA IF NOT EXISTS claude_flow;

CREATE TABLE IF NOT EXISTS claude_flow.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding ruvector(384),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for cosine distance
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
  ON claude_flow.embeddings
  USING hnsw (embedding ruvector_cosine_ops)
  WITH (m = 16, ef_construction = 100);

-- Quick check function
CREATE OR REPLACE FUNCTION claude_flow.ruvector_info()
RETURNS TABLE(version TEXT)
LANGUAGE SQL
AS $$
  SELECT ruvector_version();
$$;
