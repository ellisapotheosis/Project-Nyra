-- ===== PROJECT NYRA DATABASE INITIALIZATION =====
-- Runs on first Postgres startup
-- Creates all required databases and extensions

-- Connect to postgres default database
\c postgres

-- ===== EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ===== SYSTEM OF RECORD DATABASE (TwentyCRM) =====
CREATE DATABASE twenty
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- ===== WORKFLOW AUTOMATION DATABASE (Activepieces) =====
CREATE DATABASE activepieces
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- ===== QUOTE ENGINE DATABASE =====
CREATE DATABASE quotes
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- ===== MEMORY & CONTEXT DATABASE (Mem0) =====
CREATE DATABASE mem0
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- ===== MODEL LOGGING DATABASE (LiteLLM) =====
CREATE DATABASE litellm
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- ===== GITEA DATABASE =====
CREATE DATABASE gitea
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- ===== CONFIGURE pgvector on each database =====
\c twenty
CREATE EXTENSION IF NOT EXISTS pgvector;
ALTER SCHEMA public OWNER TO postgres;

\c activepieces
CREATE EXTENSION IF NOT EXISTS pgvector;

\c quotes
CREATE EXTENSION IF NOT EXISTS pgvector;

\c mem0
CREATE EXTENSION IF NOT EXISTS pgvector;

\c litellm
CREATE EXTENSION IF NOT EXISTS pgvector;

-- ===== CREATE USERS & PERMISSIONS =====
\c postgres

-- App user (read/write to all)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = 'app_user') THEN
    CREATE USER app_user WITH PASSWORD 'change_me_secure_password';
  END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE twenty TO app_user;
GRANT CONNECT ON DATABASE activepieces TO app_user;
GRANT CONNECT ON DATABASE quotes TO app_user;
GRANT CONNECT ON DATABASE mem0 TO app_user;
GRANT CONNECT ON DATABASE litellm TO app_user;
GRANT CONNECT ON DATABASE gitea TO app_user;

-- ===== SET DEFAULT PRIVILEGES =====
\c twenty
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO app_user;

\c activepieces
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO app_user;

\c quotes
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO app_user;

-- ===== LOG INITIALIZATION =====
SELECT 'Project Nyra PostgreSQL initialization complete' as status;
SELECT current_database(), current_user, now();
