-- ==============================================================================
-- PostgreSQL User Creation and Permissions Script
-- ==============================================================================
-- Creates service-specific users with appropriate permissions
-- Follows principle of least privilege
--
-- Users:
--   - nyra_app_user: Application services (read/write on nyra_main)
--   - nyra_auth_user: Auth service (read/write on nyra_auth)
--   - nyra_analytics_user: Analytics service (read/write on nyra_analytics)
--   - nyra_readonly_user: Read-only access for reports and dashboards
--   - infisical_user: Infisical secrets management
--
-- Note: Passwords should be set via environment variables or Infisical
-- ==============================================================================

\set ON_ERROR_STOP on
\set ECHO all

-- Connect as superuser
\c postgres

-- ==============================================================================
-- CREATE USERS (if not exists)
-- ==============================================================================

DO $$
BEGIN
  -- Main application user
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'nyra_app_user') THEN
    CREATE USER nyra_app_user WITH PASSWORD :'NYRA_APP_PASSWORD';
    RAISE NOTICE 'Created user: nyra_app_user';
  END IF;

  -- Auth service user
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'nyra_auth_user') THEN
    CREATE USER nyra_auth_user WITH PASSWORD :'NYRA_AUTH_PASSWORD';
    RAISE NOTICE 'Created user: nyra_auth_user';
  END IF;

  -- Analytics service user
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'nyra_analytics_user') THEN
    CREATE USER nyra_analytics_user WITH PASSWORD :'NYRA_ANALYTICS_PASSWORD';
    RAISE NOTICE 'Created user: nyra_analytics_user';
  END IF;

  -- Read-only user
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'nyra_readonly_user') THEN
    CREATE USER nyra_readonly_user WITH PASSWORD :'NYRA_READONLY_PASSWORD';
    RAISE NOTICE 'Created user: nyra_readonly_user';
  END IF;

  -- Infisical user
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'infisical_user') THEN
    CREATE USER infisical_user WITH PASSWORD :'INFISICAL_DB_PASSWORD';
    RAISE NOTICE 'Created user: infisical_user';
  END IF;
END
$$;

-- ==============================================================================
-- GRANT DATABASE ACCESS
-- ==============================================================================

-- nyra_main database
\c nyra_main
GRANT CONNECT ON DATABASE nyra_main TO nyra_app_user;
GRANT ALL PRIVILEGES ON DATABASE nyra_main TO nyra_app_user;
GRANT CONNECT ON DATABASE nyra_main TO nyra_readonly_user;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO nyra_app_user;
GRANT CREATE ON SCHEMA public TO nyra_app_user;
GRANT USAGE ON SCHEMA public TO nyra_readonly_user;

-- Grant table permissions (including future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nyra_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nyra_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO nyra_readonly_user;

-- nyra_auth database
\c nyra_auth
GRANT CONNECT ON DATABASE nyra_auth TO nyra_auth_user;
GRANT ALL PRIVILEGES ON DATABASE nyra_auth TO nyra_auth_user;
GRANT USAGE ON SCHEMA public TO nyra_auth_user;
GRANT CREATE ON SCHEMA public TO nyra_auth_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nyra_auth_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nyra_auth_user;

-- nyra_analytics database
\c nyra_analytics
GRANT CONNECT ON DATABASE nyra_analytics TO nyra_analytics_user;
GRANT ALL PRIVILEGES ON DATABASE nyra_analytics TO nyra_analytics_user;
GRANT CONNECT ON DATABASE nyra_analytics TO nyra_readonly_user;
GRANT USAGE ON SCHEMA public TO nyra_analytics_user;
GRANT CREATE ON SCHEMA public TO nyra_analytics_user;
GRANT USAGE ON SCHEMA public TO nyra_readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nyra_analytics_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nyra_analytics_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO nyra_readonly_user;

-- infisical database
\c infisical
GRANT CONNECT ON DATABASE infisical TO infisical_user;
GRANT ALL PRIVILEGES ON DATABASE infisical TO infisical_user;
GRANT USAGE ON SCHEMA public TO infisical_user;
GRANT CREATE ON SCHEMA public TO infisical_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO infisical_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO infisical_user;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

\c postgres
SELECT usename, usecreatedb, usesuper
FROM pg_user
WHERE usename IN ('nyra_app_user', 'nyra_auth_user', 'nyra_analytics_user', 'nyra_readonly_user', 'infisical_user')
ORDER BY usename;

\echo '✓ User creation and permissions completed successfully'
