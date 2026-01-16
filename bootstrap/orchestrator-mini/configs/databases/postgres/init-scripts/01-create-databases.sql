-- ==============================================================================
-- PostgreSQL Multi-Database Initialization Script
-- ==============================================================================
-- Creates multiple databases for Project Nyra microservices architecture
--
-- Databases:
--   - nyra_main: Core application data (users, properties, applications)
--   - nyra_auth: Authentication and authorization (sessions, tokens, permissions)
--   - nyra_analytics: Analytics and reporting data
--   - infisical: Secrets management backend for Infisical
--
-- This script is idempotent and can be run multiple times safely
-- ==============================================================================

-- Enable error handling
\set ON_ERROR_STOP on
\set ECHO all

-- ==============================================================================
-- CREATE DATABASES
-- ==============================================================================

-- Create nyra_main database (if not exists)
SELECT 'CREATE DATABASE nyra_main'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nyra_main')\gexec

-- Create nyra_auth database (if not exists)
SELECT 'CREATE DATABASE nyra_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nyra_auth')\gexec

-- Create nyra_analytics database (if not exists)
SELECT 'CREATE DATABASE nyra_analytics'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nyra_analytics')\gexec

-- Create infisical database (if not exists)
SELECT 'CREATE DATABASE infisical'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'infisical')\gexec

-- ==============================================================================
-- SET DATABASE PARAMETERS
-- ==============================================================================

-- nyra_main configuration
\c nyra_main
ALTER DATABASE nyra_main SET timezone TO 'UTC';
ALTER DATABASE nyra_main SET client_encoding TO 'UTF8';
ALTER DATABASE nyra_main SET default_transaction_isolation TO 'read committed';

-- nyra_auth configuration
\c nyra_auth
ALTER DATABASE nyra_auth SET timezone TO 'UTC';
ALTER DATABASE nyra_auth SET client_encoding TO 'UTF8';
ALTER DATABASE nyra_auth SET default_transaction_isolation TO 'read committed';

-- nyra_analytics configuration
\c nyra_analytics
ALTER DATABASE nyra_analytics SET timezone TO 'UTC';
ALTER DATABASE nyra_analytics SET client_encoding TO 'UTF8';

-- infisical configuration
\c infisical
ALTER DATABASE infisical SET timezone TO 'UTC';
ALTER DATABASE infisical SET client_encoding TO 'UTF8';
ALTER DATABASE infisical SET default_transaction_isolation TO 'read committed';

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

\c postgres
SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname IN ('nyra_main', 'nyra_auth', 'nyra_analytics', 'infisical')
ORDER BY datname;

\echo '✓ Database creation completed successfully'
