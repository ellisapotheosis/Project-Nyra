#!/bin/bash
# ============================================================================
# PostgreSQL Multi-Database Initialization Script
# ============================================================================
# Creates separate databases for each microservice
# Executed automatically when PostgreSQL container starts for the first time
# ============================================================================

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases for microservices
    CREATE DATABASE IF NOT EXISTS letta;
    CREATE DATABASE IF NOT EXISTS twenty;
    CREATE DATABASE IF NOT EXISTS n8n;
    CREATE DATABASE IF NOT EXISTS litellm;
    CREATE DATABASE IF NOT EXISTS activepieces;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE letta TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE twenty TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE n8n TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE litellm TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE activepieces TO $POSTGRES_USER;
EOSQL

echo "✓ Multi-database initialization complete"
