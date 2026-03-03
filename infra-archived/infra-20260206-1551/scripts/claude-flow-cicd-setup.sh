#!/bin/bash
# ==============================================================================
# Claude Flow CI/CD Container Setup Script
# ==============================================================================
# Quick setup script for Claude Flow CI/CD container
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/infra/configs/claude-flow-cicd"

echo "🚀 Claude Flow CI/CD Container Setup"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Create .env.cicd if it doesn't exist
if [ ! -f "$CONFIG_DIR/.env.cicd" ]; then
    echo "📝 Creating .env.cicd from template..."
    cp "$CONFIG_DIR/.env.cicd.example" "$CONFIG_DIR/.env.cicd"
    echo "⚠️  Please edit $CONFIG_DIR/.env.cicd with your actual values"
    echo ""

    # Generate secrets
    echo "🔐 Generating secrets..."
    JWT_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)

    # Update .env.cicd with generated secrets
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$CONFIG_DIR/.env.cicd"
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" "$CONFIG_DIR/.env.cicd"
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" "$CONFIG_DIR/.env.cicd"

    echo "✅ Generated JWT_SECRET, ENCRYPTION_KEY, and SESSION_SECRET"
    echo ""
else
    echo "✅ .env.cicd already exists"
fi

# Setup Git credentials
if [ ! -f "$CONFIG_DIR/git-credentials" ]; then
    echo "📝 Creating git-credentials template..."
    cp "$CONFIG_DIR/git-credentials.example" "$CONFIG_DIR/git-credentials"
    chmod 600 "$CONFIG_DIR/git-credentials"
    echo "⚠️  Please edit $CONFIG_DIR/git-credentials with your Git credentials"
    echo ""
else
    echo "✅ git-credentials already exists"
fi

# Create external network if it doesn't exist
if ! docker network inspect nyra-network > /dev/null 2>&1; then
    echo "🌐 Creating nyra-network..."
    docker network create nyra-network
    echo "✅ Network created"
else
    echo "✅ nyra-network already exists"
fi

# Create external volumes if they don't exist
for volume in nyra_postgres_data nyra_redis_data; do
    if ! docker volume inspect "$volume" > /dev/null 2>&1; then
        echo "💾 Creating volume: $volume..."
        docker volume create "$volume"
    else
        echo "✅ Volume $volume already exists"
    fi
done

echo ""
echo "🎯 Setup complete! Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   vim $CONFIG_DIR/.env.cicd"
echo ""
echo "2. Add API keys (required):"
echo "   - ANTHROPIC_API_KEY"
echo "   - OPENAI_API_KEY (optional)"
echo "   - GOOGLE_API_KEY (optional)"
echo "   - OPENROUTER_API_KEY (optional)"
echo ""
echo "3. Configure Git credentials:"
echo "   vim $CONFIG_DIR/git-credentials"
echo ""
echo "4. Start the container:"
echo "   cd $PROJECT_ROOT"
echo "   docker compose -f infra/docker-compose.claude-flow-cicd.yml up -d"
echo ""
echo "5. View logs:"
echo "   docker compose -f infra/docker-compose.claude-flow-cicd.yml logs -f"
echo ""
echo "6. Access shell:"
echo "   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd bash"
echo ""
