-- ==============================================================================
-- PostgreSQL Extensions Installation
-- ==============================================================================
-- Installs useful PostgreSQL extensions for all databases
--
-- Extensions:
--   - uuid-ossp: UUID generation
--   - pgcrypto: Cryptographic functions
--   - pg_stat_statements: Query performance monitoring
--   - pg_trgm: Fuzzy text search
--
-- Note: Some extensions require superuser privileges
-- ==============================================================================

\set ON_ERROR_STOP on
\set ECHO all

-- ==============================================================================
-- INSTALL EXTENSIONS ON nyra_main
-- ==============================================================================

\c nyra_main

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

\echo '✓ Extensions installed on nyra_main'

-- ==============================================================================
-- INSTALL EXTENSIONS ON nyra_auth
-- ==============================================================================

\c nyra_auth

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\echo '✓ Extensions installed on nyra_auth'

-- ==============================================================================
-- INSTALL EXTENSIONS ON nyra_analytics
-- ==============================================================================

\c nyra_analytics

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

\echo '✓ Extensions installed on nyra_analytics'

-- ==============================================================================
-- INSTALL EXTENSIONS ON infisical
-- ==============================================================================

\c infisical

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\echo '✓ Extensions installed on infisical'

-- ==============================================================================
-- INSTALL MONITORING EXTENSIONS ON postgres
-- ==============================================================================

\c postgres

-- Query performance statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

\echo '✓ Monitoring extensions installed'

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

\c postgres

SELECT
  d.datname as database,
  string_agg(e.extname, ', ' ORDER BY e.extname) as extensions
FROM pg_database d
LEFT JOIN pg_extension e ON e.extnamespace IN (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
)
WHERE d.datname IN ('nyra_main', 'nyra_auth', 'nyra_analytics', 'infisical')
GROUP BY d.datname
ORDER BY d.datname;

\echo '✓ Extension installation completed successfully'
