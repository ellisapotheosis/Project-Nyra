#!/bin/bash
# Docker Compose Configuration Fix Script
# Run this script to fix all configuration issues

set -e

PROJECT_ROOT="/home/ellisapotheosis/projects/project-nyra"

echo "🔧 Fixing Docker Compose Configuration Issues..."
echo ""

# Fix 1: Change ownership of postgres-init directory
echo "1️⃣  Fixing postgres-init directory permissions..."
if [ -d "$PROJECT_ROOT/scripts/postgres-init" ]; then
    sudo chown -R ellisapotheosis:ellisapotheosis "$PROJECT_ROOT/scripts/postgres-init"
    echo "   ✅ Ownership fixed"
else
    echo "   ⚠️  Directory doesn't exist, skipping"
fi

# Fix 2: Create postgres init script
echo ""
echo "2️⃣  Creating postgres init script..."
cat > "$PROJECT_ROOT/scripts/postgres-init/01-create-databases.sh" << 'EOF'
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
EOF
chmod +x "$PROJECT_ROOT/scripts/postgres-init/01-create-databases.sh"
echo "   ✅ Script created and made executable"

# Fix 3: Generate secrets
echo ""
echo "3️⃣  Generating secure secrets..."
if [ -x "$PROJECT_ROOT/scripts/generate-secrets.sh" ]; then
    "$PROJECT_ROOT/scripts/generate-secrets.sh"
else
    echo "   ⚠️  generate-secrets.sh not found or not executable"
fi

# Fix 4: Validate configuration
echo ""
echo "4️⃣  Validating Docker Compose configuration..."
cd "$PROJECT_ROOT/infra/docker-compose"
if docker compose config --quiet 2>&1 | grep -q "error"; then
    echo "   ❌ Configuration has errors"
    docker compose config
else
    echo "   ✅ Configuration is valid"
fi

echo ""
echo "✅ All fixes applied!"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit .env and add your API keys:"
echo "      - ANTHROPIC_API_KEY"
echo "      - GOOGLE_API_KEY"
echo "   2. Test base services: docker compose -f docker-compose.base.yml up -d"
echo "   3. Check logs: docker compose logs postgres redis"
echo ""
