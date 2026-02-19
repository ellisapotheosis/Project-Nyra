#!/bin/bash
set -e

# Create multiple databases for different services
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Create databases
    CREATE DATABASE letta;
    CREATE DATABASE twenty;
    CREATE DATABASE dify;
    CREATE DATABASE n8n;
    CREATE DATABASE litellm;
    CREATE DATABASE activepieces;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE letta TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE twenty TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE dify TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE n8n TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE litellm TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE activepieces TO $POSTGRES_USER;

    -- Enable extensions
    \c letta
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    \c twenty
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \c dify
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \c nyra_db
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOSQL

echo "✅ All databases created successfully!"
