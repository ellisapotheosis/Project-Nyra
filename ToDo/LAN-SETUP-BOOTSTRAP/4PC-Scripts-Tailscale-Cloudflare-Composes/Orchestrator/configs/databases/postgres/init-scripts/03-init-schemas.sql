-- ==============================================================================
-- PostgreSQL Initial Schema Creation
-- ==============================================================================
-- Creates initial tables and indexes for each database
-- This provides a baseline schema; actual migrations handled by services
-- ==============================================================================

\set ON_ERROR_STOP on
\set ECHO all

-- ==============================================================================
-- NYRA_MAIN SCHEMA
-- ==============================================================================

\c nyra_main

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Users table (minimal bootstrap)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✓ nyra_main schema initialized'

-- ==============================================================================
-- NYRA_AUTH SCHEMA
-- ==============================================================================

\c nyra_auth

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  key_hash VARCHAR(512) NOT NULL,
  name VARCHAR(255),
  scopes JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

\echo '✓ nyra_auth schema initialized'

-- ==============================================================================
-- NYRA_ANALYTICS SCHEMA
-- ==============================================================================

\c nyra_analytics

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Events table (time-series data)
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id UUID,
  properties JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_type_timestamp ON events(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);

-- Metrics aggregations
CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp ON metrics(metric_name, timestamp DESC);

\echo '✓ nyra_analytics schema initialized'

-- ==============================================================================
-- INFISICAL SCHEMA
-- ==============================================================================

\c infisical

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Note: Infisical will create its own tables on first run
-- This is just a placeholder to ensure the database is ready

\echo '✓ infisical schema initialized'

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

\c postgres

SELECT
  d.datname as database,
  COUNT(DISTINCT t.tablename) as table_count
FROM pg_database d
LEFT JOIN pg_tables t ON t.schemaname = 'public'
WHERE d.datname IN ('nyra_main', 'nyra_auth', 'nyra_analytics', 'infisical')
GROUP BY d.datname
ORDER BY d.datname;

\echo '✓ Schema initialization completed successfully'
